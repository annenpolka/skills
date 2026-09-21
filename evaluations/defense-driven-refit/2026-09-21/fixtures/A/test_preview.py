import unittest
from preview import render

class PreviewTests(unittest.TestCase):
    def test_name(self):
        self.assertEqual(render("Ada"), "Hello, Ada")
