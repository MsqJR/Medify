import os
import json
import tempfile
from django.test import SimpleTestCase, override_settings
from unittest.mock import patch
from rag_model.services.vector_store import VectorStoreSingleton


@override_settings(RAG_EMBEDDING_DIMENSION=3)
class VectorStoreSingletonTests(SimpleTestCase):
    def setUp(self):
        VectorStoreSingleton.reset()
        self.temp_dir = tempfile.mkdtemp()

    def tearDown(self):
        VectorStoreSingleton.reset()

    def _make_store(self):
        store = VectorStoreSingleton()
        store.index_path = os.path.join(self.temp_dir, 'faiss.index')
        store.metadata_path = os.path.join(self.temp_dir, 'meta.json')
        return store

    def test_singleton_returns_same_instance(self):
        a = self._make_store()
        b = VectorStoreSingleton()
        self.assertIs(a, b)

    def test_add_chunks_and_search(self):
        store = self._make_store()
        chunks = [
            {'text': 'Aspirin is used for pain relief', 'drug': 'Aspirin'},
            {'text': 'Paracetamol reduces fever', 'drug': 'Paracetamol'},
            {'text': 'Ibuprofen is an anti-inflammatory', 'drug': 'Ibuprofen'},
        ]
        with patch('rag_model.services.vector_store.embed_texts') as mock_embed:
            mock_embed.return_value = [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]
            store.add_chunks(chunks)

        with patch('rag_model.services.vector_store.embed_query') as mock_query:
            mock_query.return_value = [0.0, 1.0, 0.0]
            results = store.search('Paracetamol uses', top_k=2)

        self.assertEqual(len(results), 2)
        self.assertEqual(results[0][0]['drug'], 'Paracetamol')

    def test_search_returns_empty_when_no_chunks(self):
        store = self._make_store()
        store.index = None
        store.metadata = []
        results = store.search('anything', top_k=5)
        self.assertEqual(results, [])

    def test_save_and_load_persists_data(self):
        store = self._make_store()
        chunks = [{'text': 'Test document', 'drug': 'Test'}]
        with patch('rag_model.services.vector_store.embed_texts') as mock_embed:
            mock_embed.return_value = [[0.5, 0.5]]
            store.add_chunks(chunks)
        store.save_index()
        self.assertTrue(os.path.exists(store.index_path))
        self.assertTrue(os.path.exists(store.metadata_path))
        with open(store.metadata_path) as f:
            data = json.load(f)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['text'], 'Test document')

    def test_reset_clears_singleton(self):
        store = self._make_store()
        VectorStoreSingleton.reset()
        store2 = self._make_store()
        self.assertIsNot(store, store2)
