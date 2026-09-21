import unittest
from preview import render


class PreviewTests(unittest.TestCase):
    def test_name(self):
        self.assertEqual(render("Ada"), "Hello, Ada")

    def test_string_boundaries(self):
        for name in ("", "世界", "  Ada\n", "🙂"):
            with self.subTest(name=name):
                self.assertEqual(render(name), "Hello, " + name)

    def test_string_subclass(self):
        class Name(str):
            pass
        self.assertEqual(render(Name("Ada")), "Hello, Ada")

    def test_non_strings_rejected(self):
        for name in (None, 0, 1.5, True, b"Ada", [], {}, object()):
            with self.subTest(type=type(name).__name__):
                with self.assertRaises(TypeError):
                    render(name)
