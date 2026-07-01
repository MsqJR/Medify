from unittest.mock import patch
from django.core.cache import cache
from rest_framework import status
from rest_framework.test import APITestCase
from core.models import User, WebsiteSetup, TemplateAISettings, ChatConversation, ChatMessage


class ChatbotAPITests(APITestCase):
    def setUp(self):
        cache.clear()
        self.owner = User.objects.create_user(
            username='hospital-owner',
            email='owner@example.com',
            password='password123',
            business_type='hospital',
            name='Hospital Owner'
        )
        self.website_setup = WebsiteSetup.objects.create(
            user=self.owner,
            subdomain='myhospital'
        )
        self.ai_settings, _ = TemplateAISettings.objects.get_or_create(
            website_setup=self.website_setup,
            defaults={
                'enabled': True,
                'rate_limit_window_seconds': 60,
                'per_ip_rate_limit': 2,
                'disclaimer': 'Custom Hospital Disclaimer',
            }
        )
        self.endpoint = '/api/chatbot/'

    def test_chatbot_requires_subdomain_for_public_request(self):
        response = self.client.post(self.endpoint, {'message': 'Hello'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('subdomain is required', response.data['detail'])

    def test_chatbot_disabled_response(self):
        self.ai_settings.enabled = False
        self.ai_settings.save()

        response = self.client.post(self.endpoint, {
            'subdomain': 'myhospital',
            'message': 'Hello'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['detail'], 'Chatbot is disabled for this website.')

    @patch('core.services.subscription.has_feature_access')
    def test_chatbot_plan_gating_hospital_denied(self, mock_access):
        mock_access.return_value = False
        
        response = self.client.post(self.endpoint, {
            'subdomain': 'myhospital',
            'message': 'I feel sick'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['code'], 'FEATURE_LOCKED')

    @patch('core.views.chatbot.MedicalChatbotService.generate_response')
    @patch('core.services.subscription.has_feature_access')
    def test_chatbot_rate_limiting(self, mock_access, mock_generate):
        mock_access.return_value = True
        
        class MockChatbotResponse:
            answer = "General triage advice"
            urgency = "routine"
            seek_emergency_care = False
            possible_conditions = []
            recommended_specialties = []
            follow_up_questions = []
            guidance = []
            disclaimer = "Custom Hospital Disclaimer"
            confidence_note = "1.0"
        
        mock_generate.return_value = MockChatbotResponse()

        # Limit is 2 requests per window (set in setUp)
        # Request 1 - Success
        res1 = self.client.post(self.endpoint, {
            'subdomain': 'myhospital',
            'message': 'Msg 1'
        }, format='json')
        self.assertEqual(res1.status_code, status.HTTP_200_OK)

        # Request 2 - Success
        res2 = self.client.post(self.endpoint, {
            'subdomain': 'myhospital',
            'message': 'Msg 2'
        }, format='json')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)

        # Request 3 - Fails with 429
        res3 = self.client.post(self.endpoint, {
            'subdomain': 'myhospital',
            'message': 'Msg 3'
        }, format='json')
        self.assertEqual(res3.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertIn('Rate limit exceeded', res3.data['detail'])

    @patch('core.views.chatbot.ask_rag')
    def test_pharmacy_visitor_chatbot_via_rag(self, mock_ask_rag):
        # Setup a pharmacy subdomain
        pharmacy_owner = User.objects.create_user(
            username='pharmacy-owner',
            email='pharmacy@example.com',
            password='password123',
            business_type='pharmacy',
            name='Pharmacy Owner'
        )
        pharmacy_setup = WebsiteSetup.objects.create(
            user=pharmacy_owner,
            subdomain='mypharmacy'
        )
        TemplateAISettings.objects.create(
            website_setup=pharmacy_setup,
            enabled=True
        )

        mock_ask_rag.return_value = {
            'answer': 'Grounded RAG advice from sources.',
            'confidence_score': 0.85,
            'sources': [{'source': 'sheet_row_1', 'similarity': 0.9}]
        }

        response = self.client.post(self.endpoint, {
            'subdomain': 'mypharmacy',
            'message': 'Do you sell Aspirin?'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['assistant']['content'], 'Grounded RAG advice from sources.')
        self.assertEqual(response.data['assistant']['urgency'], 'routine')
        
        # Verify message database insertions
        conv = ChatConversation.objects.get(id=response.data['conversation_id'])
        self.assertEqual(conv.messages.count(), 2)
        user_msg = conv.messages.filter(role='user').first()
        asst_msg = conv.messages.filter(role='assistant').first()
        self.assertEqual(user_msg.content, 'Do you sell Aspirin?')
        self.assertEqual(asst_msg.content, 'Grounded RAG advice from sources.')
