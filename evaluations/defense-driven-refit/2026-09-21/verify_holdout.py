"""Independent graph invalidation checks for the frozen H fixture."""
from pathlib import Path
import json

root = Path(__file__).resolve().parent
before = {x['id']: x for x in json.loads((root / 'fixtures/H/ledger.json').read_text())}
after = {x['id']: x for x in json.loads((root / 'work/holdout/H/ledger.json').read_text())}
assert before.keys() == after.keys()
for key in before:
    assert before[key]['depends_on'] == after[key]['depends_on']
closure = {'A'}
while True:
    expanded = closure | {key for key, row in before.items() if closure.intersection(row['depends_on'])}
    if expanded == closure:
        break
    closure = expanded
invalidated = closure - {'A'}
assert invalidated == {'B', 'C'}
assert {key for key, row in after.items() if row['verification']['status'] == 'pending'} == invalidated
for key in invalidated:
    assert after[key]['final_answer'] is None
    assert after[key]['verification']['artifact_version'] is None
    assert after[key]['admitted_limit']['revisit_condition']
for key in ('P', 'U'):
    assert after[key]['resolution'] == before[key]['resolution']
    assert after[key]['verification']['status'] == 'done'
assert after['A']['resolution'] != before['A']['resolution']
print(json.dumps({'checks':'passed','transitive_dependents':sorted(invalidated),'preserved_prerequisite':'P','preserved_other_branch':'U','ids_and_edges_preserved':True}, indent=2))
