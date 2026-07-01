import os
import shutil
import tempfile
from django.test import SimpleTestCase
from unittest.mock import patch
from rag_model.vector_store import VectorStore


class VectorStoreTests(SimpleTestCase):
    def setUp(self):
        # Create a temporary directory for vector index files
        self.test_dir = tempfile.mkdtemp()

    def tearDown(self):
        # Clean up the directory after tests
        shutil.rmtree(self.test_dir)

    def test_numpy_fallback_search(self):
        # Mock _HAS_FAISS to False to force raw NumPy matrix search logic
        with patch('rag_model.vector_store._HAS_FAISS', False):
            store = VectorStore(index_dir=self.test_dir, dim=4)
            
            # Add simple document vectors
            embeddings = [
                [1.0, 0.0, 0.0, 0.0],  # Document A
                [0.0, 1.0, 0.0, 0.0],  # Document B
                [0.0, 0.0, 1.0, 0.0],  # Document C
            ]
            metadatas = [
                {'text': 'Doc A', 'source': 'sourceA'},
                {'text': 'Doc B', 'source': 'sourceB'},
                {'text': 'Doc C', 'source': 'sourceC'}
            ]
            
            store.add_documents(embeddings, metadatas)
            
            # Query vector that is closest to Document B
            query_emb = [0.1, 0.9, 0.0, 0.0]
            results = store.search(query_emb, top_k=2)
            
            self.assertEqual(len(results), 2)
            # The top match should be B due to high inner product (cosine similarity)
            self.assertEqual(results[0]['meta']['source'], 'sourceB')
            # The second match should be A (since query has 0.1 and A has 1.0 in index 0)
            self.assertEqual(results[1]['meta']['source'], 'sourceA')
            
            # Test clearing
            store.clear()
            self.assertEqual(len(store._metadatas), 0)
            self.assertIsNone(store._index)
