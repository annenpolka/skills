"""Parent-side ledger invariants; hashes use the scoped file's final bytes."""
from pathlib import Path
import hashlib
import json
import sys
import yaml

path = Path(sys.argv[1]).resolve()
doc = yaml.safe_load(path.read_text())
items = doc if isinstance(doc, list) else doc['items']
ids = {row['id'] for row in items}
assert len(ids) == len(items), 'duplicate IDs'
for row in items:
    assert row['origin'] in {'deviation','impact','counterexample','asked'}
    assert set(row.get('depends_on', [])) <= ids
    assert row['grounding'] or row.get('admitted_limit')
    if row.get('admitted_limit'):
        assert row['admitted_limit']['limit'] and row['admitted_limit']['revisit_condition']
    for evidence in row['evidence']:
        if 'characterization_test' in evidence:
            assert evidence.get('preservation_only') is True
    verification = row['verification']
    if verification['status'] == 'pending':
        assert row['final_answer'] is None
    else:
        assert verification['status'] == 'done'
        assert row['scope']['version'] == verification['artifact_version']
        assert verification['result']
        ref = row['scope']['ref'].split(':')[0]
        expected = hashlib.sha256((path.parent / ref).read_bytes()).hexdigest()
        assert row['scope']['version'].removeprefix('sha256:') == expected, row['id']
print(json.dumps({'ledger': str(path), 'rows': len(items), 'checks': 'passed', 'limits': 'Structural invariants and scoped SHA-256 only; parent separately reviews semantic grounding and claims.'}, indent=2))
