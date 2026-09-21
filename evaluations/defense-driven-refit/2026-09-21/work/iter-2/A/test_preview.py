import unittest
from preview import render


class PreviewTests(unittest.TestCase):
    def test_name(self):
        self.assertEqual(render("Ada"), "Hello, Ada")

    def test_string_boundary(self):
        class Name(str):
            pass
        for name in ("", "名前", "  Ada  ", "a\nb", Name("Ada")):
            with self.subTest(name=name):
                self.assertEqual(render(name), "Hello, " + name)

    def test_non_strings_raise_type_error(self):
        for name in (None, 0, 1.5, True, b"Ada", [], {}, object()):
            with self.subTest(name=name):
                with self.assertRaises(TypeError):
                    render(name)
