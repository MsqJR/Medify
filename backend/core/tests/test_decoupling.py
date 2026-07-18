from unittest.mock import patch

from django.test import TestCase

from core.models import User, WebsiteSetup
from core.signals import workspace_initialized
from core.services.registration import initialize_user_workspace


class WorkspaceSignalTests(TestCase):
    def setUp(self):
        self.hospital_user = User.objects.create_user(
            username='hospital-signal',
            email='hospital-signal@example.com',
            password='password123',
            business_type='hospital',
            name='Hospital Owner',
        )
        self.pharmacy_user = User.objects.create_user(
            username='pharmacy-signal',
            email='pharmacy-signal@example.com',
            password='password123',
            business_type='pharmacy',
            name='Pharmacy Owner',
        )
        self.hospital_website = WebsiteSetup.objects.create(
            user=self.hospital_user,
            subdomain='hospital-signal',
        )
        self.pharmacy_website = WebsiteSetup.objects.create(
            user=self.pharmacy_user,
            subdomain='pharmacy-signal',
        )

    def test_workspace_initialized_signal_dispatched_on_registration(self):
        with patch.object(workspace_initialized, 'send') as mock_send:
            initialize_user_workspace(self.hospital_user, self.hospital_website)
            mock_send.assert_called_once_with(
                sender=initialize_user_workspace,
                user=self.hospital_user,
                website_setup=self.hospital_website,
            )

    @patch('hospitals.models.profile.HospitalProfile.objects.get_or_create')
    @patch('hospitals.services.template_service.generate_default_hospital_template')
    def test_hospital_receiver_creates_profile_and_templates(self, mock_template, mock_profile):
        from hospitals.signals import handle_hospital_workspace_init

        handle_hospital_workspace_init(
            sender=initialize_user_workspace,
            user=self.hospital_user,
            website_setup=self.hospital_website,
        )

        mock_profile.assert_called_once_with(
            website_setup=self.hospital_website,
            defaults={'name': "Hospital Owner's Hospital"},
        )
        mock_template.assert_called_once_with(self.hospital_website)

    @patch('hospitals.models.profile.HospitalProfile.objects.get_or_create')
    @patch('hospitals.services.template_service.generate_default_hospital_template')
    def test_hospital_receiver_skips_for_non_hospital(self, mock_template, mock_profile):
        from hospitals.signals import handle_hospital_workspace_init

        handle_hospital_workspace_init(
            sender=initialize_user_workspace,
            user=self.pharmacy_user,
            website_setup=self.pharmacy_website,
        )

        mock_profile.assert_not_called()
        mock_template.assert_not_called()

    @patch('pharmacies.models.Pharmacy.objects.get_or_create')
    def test_pharmacy_receiver_creates_profile(self, mock_profile):
        from pharmacies.signals import handle_pharmacy_workspace_init

        handle_pharmacy_workspace_init(
            sender=initialize_user_workspace,
            user=self.pharmacy_user,
            website_setup=self.pharmacy_website,
        )

        mock_profile.assert_called_once_with(
            website_setup=self.pharmacy_website,
            user=self.pharmacy_user,
            defaults={'name': "Pharmacy Owner's Pharmacy"},
        )

    @patch('pharmacies.models.Pharmacy.objects.get_or_create')
    def test_pharmacy_receiver_skips_for_non_pharmacy(self, mock_profile):
        from pharmacies.signals import handle_pharmacy_workspace_init

        handle_pharmacy_workspace_init(
            sender=initialize_user_workspace,
            user=self.hospital_user,
            website_setup=self.hospital_website,
        )

        mock_profile.assert_not_called()

    def test_end_to_end_signal_triggers_receivers(self):
        with patch('hospitals.models.profile.HospitalProfile.objects.get_or_create') as mock_hosp_profile, \
             patch('hospitals.services.template_service.generate_default_hospital_template') as mock_template, \
             patch('pharmacies.models.Pharmacy.objects.get_or_create') as mock_pharm_profile:

            initialize_user_workspace(self.hospital_user, self.hospital_website)

            mock_hosp_profile.assert_called_once()
            mock_template.assert_called_once()
            mock_pharm_profile.assert_not_called()

    def test_pharmacy_end_to_end_signal_flow(self):
        with patch('hospitals.models.profile.HospitalProfile.objects.get_or_create') as mock_hosp_profile, \
             patch('hospitals.services.template_service.generate_default_hospital_template') as mock_template, \
             patch('pharmacies.models.Pharmacy.objects.get_or_create') as mock_pharm_profile:

            initialize_user_workspace(self.pharmacy_user, self.pharmacy_website)

            mock_pharm_profile.assert_called_once()
            mock_hosp_profile.assert_not_called()
            mock_template.assert_not_called()


from core.services.chatbot import ChatbotCoordinatorService


class ChatbotCoordinatorTests(TestCase):
    def setUp(self):
        self.hospital_user = User.objects.create_user(
            username='coord-hospital',
            email='coord-hospital@example.com',
            password='password123',
            business_type='hospital',
            name='Coord Hospital',
        )
        self.pharmacy_user = User.objects.create_user(
            username='coord-pharmacy',
            email='coord-pharmacy@example.com',
            password='password123',
            business_type='pharmacy',
            name='Coord Pharmacy',
        )
        self.hospital_website = WebsiteSetup.objects.create(
            user=self.hospital_user,
            subdomain='coord-hospital',
        )
        self.pharmacy_website = WebsiteSetup.objects.create(
            user=self.pharmacy_user,
            subdomain='coord-pharmacy',
        )

    @patch('core.services.chatbot.MedicalChatbotService.generate_response')
    def test_coordinator_routes_hospital_to_medical_triage(self, mock_medical):
        mock_medical.return_value = None

        ChatbotCoordinatorService.generate_response(
            website_setup=self.hospital_website,
            history=[],
            user_message='I have a fever',
        )

        mock_medical.assert_called_once()

    @patch('core.services.chatbot.MedicalChatbotService.generate_response')
    def test_coordinator_does_not_route_hospital_to_rag(self, mock_medical):
        mock_medical.return_value = None

        ChatbotCoordinatorService.generate_response(
            website_setup=self.hospital_website,
            history=[],
            user_message='I have a fever',
        )

        mock_medical.assert_called_once()

    @patch('rag_model.services.rag_service.ask_rag')
    @patch('core.services.chatbot.MedicalChatbotService.generate_response')
    def test_coordinator_routes_pharmacy_to_rag(self, mock_medical, mock_rag):
        mock_rag.return_value = {'answer': 'RAG answer'}

        ChatbotCoordinatorService.generate_response(
            website_setup=self.pharmacy_website,
            history=[],
            user_message='What is aspirin?',
        )

        mock_rag.assert_called_once_with('What is aspirin?')
        mock_medical.assert_not_called()

    @patch('rag_model.services.rag_service.ask_rag')
    def test_coordinator_returns_chatbot_response_for_pharmacy(self, mock_rag):
        mock_rag.return_value = {
            'answer': 'Aspirin is used for pain relief',
            'confidence_score': 0.95,
        }

        result = ChatbotCoordinatorService.generate_response(
            website_setup=self.pharmacy_website,
            history=[],
            user_message='What is aspirin?',
        )

        self.assertIsNotNone(result)
        self.assertEqual(result.answer, 'Aspirin is used for pain relief')

    @patch('core.services.chatbot.MedicalChatbotService.generate_fallback_response')
    def test_coordinator_fallback_for_unrecognized_business_type(self, mock_fallback):
        unrecognized_user = User.objects.create_user(
            username='unknown',
            email='unknown@example.com',
            password='password123',
            business_type='unknown',
            name='Unknown',
        )
        unrecognized_website = WebsiteSetup.objects.create(
            user=unrecognized_user,
            subdomain='unknown',
        )

        ChatbotCoordinatorService.generate_response(
            website_setup=unrecognized_website,
            history=[],
            user_message='Hello',
        )

        mock_fallback.assert_called_once()

    @patch('core.services.chatbot.MedicalChatbotService.generate_fallback_response')
    def test_coordinator_fallback_on_rag_error(self, mock_fallback):
        mock_fallback.return_value = None

        ChatbotCoordinatorService.generate_response(
            website_setup=self.hospital_website,
            history=[],
            user_message='Hello',
        )

        mock_fallback.assert_not_called()
