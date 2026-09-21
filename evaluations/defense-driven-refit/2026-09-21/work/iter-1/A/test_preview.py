import unittest
from preview import render


class PreviewTests(unittest.TestCase):
    def test_name(self):
        self.assertEqual(render("Ada"), "Hello, Ada")

    def test_string_boundary(self):
        for name in ("", "田中", " a\n", "0"):
            with self.subTest(name=name):
                self.assertEqual(render(name), "Hello, " + name)

    def test_rejects_non_strings(self):
        for name in (None, 42, True, 1.2, b"Ada", [], {}, object()):
            with self.subTest(name=repr(name)):
                with self.assertRaises(TypeError):
                    render(name)
