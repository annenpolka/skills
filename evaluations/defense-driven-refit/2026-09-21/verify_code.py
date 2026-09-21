"""Independent parent checks for frozen scenario A, run against each output."""
from pathlib import Path
import ast
import importlib.util
import json
import subprocess
import sys

root = Path(sys.argv[1]).resolve()
result = subprocess.run([sys.executable, '-m', 'unittest', 'discover', '-v'], cwd=root, capture_output=True, text=True)
spec = importlib.util.spec_from_file_location('evaluated_preview', root / 'preview.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
valid = ['', 'Ada', '日本語', '\n', '0']
for value in valid:
    assert module.render(value) == 'Hello, ' + value
invalid = [None, 1, True, 1.5, [], {}, b'Ada', object()]
for value in invalid:
    try:
        module.render(value)
    except TypeError:
        pass
    else:
        raise AssertionError(f'Accepted non-string: {type(value).__name__}')
tree = ast.parse((root / 'preview.py').read_text())
assert not any(isinstance(node, ast.ClassDef) for node in ast.walk(tree)), 'replacement class abstraction'
assert result.returncode == 0, result.stderr
print(json.dumps({'test_returncode': result.returncode, 'valid_cases': len(valid), 'invalid_cases': len(invalid), 'no_classes': True, 'test_output': result.stderr}, ensure_ascii=False, indent=2))
