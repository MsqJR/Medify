from unittest.mock import patch, MagicMock
from django.test import SimpleTestCase
import requests
from pharmacies.google_sheet import (
    extract_spreadsheet_id,
    extract_gid,
    build_google_sheet_csv_export_url,
    fetch_google_sheet_csv,
    GoogleSheetAccessError,
)


class GoogleSheetsUtilityTests(SimpleTestCase):
    def test_extract_spreadsheet_id(self):
        # 1. Standard spreadsheets URL
        url_std = "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKv1a6pbtWT5yIA91HRz6uoST0/edit#gid=0"
        self.assertEqual(extract_spreadsheet_id(url_std), "1BxiMVs0XRA5nFMdKv1a6pbtWT5yIA91HRz6uoST0")

        # 2. Drive file URL
        url_drive = "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKv1a6pbtWT5yIA91HRz6uoST0/view"
        self.assertEqual(extract_spreadsheet_id(url_drive), "1BxiMVs0XRA5nFMdKv1a6pbtWT5yIA91HRz6uoST0")

        # 3. Direct ID URL query parameter format
        url_query = "https://docs.google.com/open?id=1BxiMVs0XRA5nFMdKv1a6pbtWT5yIA91HRz6uoST0"
        self.assertEqual(extract_spreadsheet_id(url_query), "1BxiMVs0XRA5nFMdKv1a6pbtWT5yIA91HRz6uoST0")

        # 4. Invalid URLs
        self.assertIsNone(extract_spreadsheet_id("https://google.com"))
        self.assertIsNone(extract_spreadsheet_id(""))

    def test_extract_gid(self):
        url_gid_hash = "https://docs.google.com/spreadsheets/d/abc/edit#gid=13498"
        self.assertEqual(extract_gid(url_gid_hash), "13498")

        url_gid_query = "https://docs.google.com/spreadsheets/d/abc/export?format=csv&gid=47582"
        self.assertEqual(extract_gid(url_gid_query), "47582")

        url_no_gid = "https://docs.google.com/spreadsheets/d/abc/edit"
        self.assertEqual(extract_gid(url_no_gid), "0")

    def test_build_google_sheet_csv_export_url(self):
        url = "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKv1a6pbtWT5yIA91HRz6uoST0/edit#gid=12"
        expected = "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKv1a6pbtWT5yIA91HRz6uoST0/export?format=csv&gid=12"
        self.assertEqual(build_google_sheet_csv_export_url(url), expected)

        with self.assertRaises(GoogleSheetAccessError):
            build_google_sheet_csv_export_url("https://google.com")

    @patch('requests.get')
    def test_fetch_google_sheet_csv_success(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.headers = {'Content-Type': 'text/csv'}
        mock_response.text = "Product Name,Price\nVitamin A,10.0"
        mock_get.return_value = mock_response

        url = "https://docs.google.com/spreadsheets/d/abc/edit"
        result = fetch_google_sheet_csv(url)
        self.assertEqual(result, "Product Name,Price\nVitamin A,10.0")

    @patch('requests.get')
    def test_fetch_google_sheet_csv_permission_error(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.headers = {'Content-Type': 'text/html'}
        mock_response.text = "<html>Login to Google</html>"
        mock_get.return_value = mock_response

        url = "https://docs.google.com/spreadsheets/d/abc/edit"
        with self.assertRaises(GoogleSheetAccessError) as ctx:
            fetch_google_sheet_csv(url)
        self.assertIn('Share it as "Anyone with the link can view"', str(ctx.exception))
