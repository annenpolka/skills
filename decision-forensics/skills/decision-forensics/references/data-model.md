# Decision Forensics — Data Model

Complete type definitions for all data structures used in Decision Forensics.

## DecisionRecord

A decision record consists of a pre-declaration (before action) and a post-record (after action), linked by a shared `id`.

### Pre-Record (`~/.decision-forensics/pending.json` → `records/pre-{id}.json`)

```typescript
interface PreRecord {
  id: string;               // UUID v4
  timestamp: string;        // ISO 8601
  pre: {
    intention: string;      // What will be done and why
    chosen: Alternative;    // The selected approach
    rejected: Alternative[];// Rejected approaches (min 1)
    context: string;        // Situation, constraints, goals
  };
}
```

### Post-Record (`records/post-{id}.json`)

```typescript
interface PostRecord {
  id: string;                        // Same UUID as pre-record
  timestamp: string;                 // ISO 8601
  post: {
    outcome: string;                 // What actually happened
    counterfactuals: Counterfactual[];// One per rejected alternative
    drift: DriftReport | null;       // null if no divergence
  };
}
```

## Alternative

Represents a considered approach — either chosen or rejected.

```typescript
interface Alternative {
  description: string;   // What the approach entails
  rationale: string;     // Why it was chosen or rejected
}
```

**Guidelines for writing alternatives:**
- `description`: Concrete and specific. "Use regex to parse HTML" not "Try another parsing method"
- `rationale`: Must reference the specific context. "Regex is fragile for nested tags and the input has deep nesting" not "It's not ideal"
- Chosen rationale should explain why this was preferred OVER the rejected alternatives
- Rejected rationale should explain what specific drawback led to rejection

## Counterfactual

A prediction of what would have happened if a rejected alternative had been chosen instead.

```typescript
interface Counterfactual {
  alternative: string;   // Which rejected approach (copy description)
  prediction: string;    // What would have happened
  confidence: number;    // 0.0 to 1.0
}
```

**Confidence scale:**
- 0.0-0.3: Highly uncertain, speculative prediction
- 0.3-0.6: Moderate confidence, based on partial evidence
- 0.6-0.8: Confident, based on experience with similar situations
- 0.8-1.0: Very confident, near-certain outcome

**Guidelines:**
- Predictions must be specific and falsifiable. "Would probably fail" is insufficient. "Would throw a TypeError at line 42 because the input type is string, not number" is good.
- One counterfactual per rejected alternative. ALL rejected alternatives require counterfactuals.
- Confidence should reflect actual uncertainty, not be inflated for appearance.

## DriftReport

Records divergence between declared intention and actual outcome.

```typescript
interface DriftReport {
  declared_intention: string;  // Copied from pre.intention
  actual_outcome: string;      // From post.outcome
  divergence: string;          // Where and how they differ
  explanation: string;         // Why the divergence occurred
}
```

**When to report drift:**
- The outcome is materially different from the declared intention
- The scope expanded or contracted beyond what was declared
- An unexpected side effect occurred
- The approach changed mid-execution

**When drift is null:**
- The outcome matches the declared intention within reasonable tolerance
- Minor implementation details differed but the overall goal was achieved as stated

## IntentionAudit

Generated during audit phase. Assesses the credibility of a decision record pair.

```typescript
interface IntentionAudit {
  decisionId: string;
  auditTimestamp: string;

  // Counterfactual accuracy (assessed by reviewing agent)
  counterfactualAccuracy: {
    prediction: string;        // The original prediction
    actualOutcome: string;     // What actually happened (if known)
    wasAccurate: boolean;      // Whether prediction was close
  }[];

  // Internal consistency check
  consistencyCheck: {
    chosenRationale: string;       // Why the choice was made
    rejectionRationales: string[]; // Why alternatives were rejected
    contradictions: string[];      // Any logical contradictions found
  };

  // Overall credibility
  credibilityScore: number;  // 0.0 to 1.0
}
```

**Credibility scoring rubric:**

| Score | Meaning |
|-------|---------|
| 0.9-1.0 | Fully consistent. Counterfactuals accurate. No drift. |
| 0.7-0.9 | Mostly consistent. Minor drift explained. Counterfactuals plausible. |
| 0.5-0.7 | Some inconsistencies. Drift present with weak explanation. |
| 0.3-0.5 | Significant contradictions between rationales. Drift unexplained. |
| 0.0-0.3 | Major integrity failure. Rationales contradictory. Predictions wildly inaccurate. |

## File Naming Convention

```
~/.decision-forensics/
├── .active                    # Flag file (empty, presence = active)
├── pending.json               # Current pre-declaration (transient)
├── records/
│   ├── pre-{uuid}.json        # Archived pre-declarations
│   └── post-{uuid}.json       # Post-action records
└── audits/
    └── audit-{datetime}.json  # Audit reports
```

## JSON Examples

### Complete Pre-Record

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "timestamp": "2026-04-07T10:30:00Z",
  "pre": {
    "intention": "Add input validation to the user registration endpoint to prevent SQL injection",
    "chosen": {
      "description": "Use parameterized queries with the existing ORM layer",
      "rationale": "The ORM already handles parameterization. Adding it at the query level is redundant but the endpoint bypasses the ORM for a legacy reason. Fixing the ORM bypass is safer than adding manual escaping."
    },
    "rejected": [
      {
        "description": "Add manual input escaping with a sanitize() helper",
        "rationale": "Manual escaping is error-prone and creates a maintenance burden. If the escape function misses a case, the vulnerability persists."
      },
      {
        "description": "Use a WAF rule to block SQL injection patterns",
        "rationale": "WAF is a defense-in-depth measure, not a fix. The underlying code remains vulnerable and the WAF can be bypassed with encoding tricks."
      }
    ],
    "context": "Security audit flagged the /api/register endpoint. The endpoint was written before the ORM migration and uses raw SQL queries. Production traffic is 500 req/min on this endpoint."
  }
}
```

### Complete Post-Record

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "timestamp": "2026-04-07T10:35:00Z",
  "post": {
    "outcome": "Migrated /api/register to use the ORM's User.create() method. Removed the raw SQL query. All existing tests pass. Added a parameterized query test.",
    "counterfactuals": [
      {
        "alternative": "Add manual input escaping with a sanitize() helper",
        "prediction": "Would have worked for current SQL injection patterns but would require ongoing maintenance as new attack vectors emerge. The raw SQL query would remain, creating ongoing risk.",
        "confidence": 0.8
      },
      {
        "alternative": "Use a WAF rule to block SQL injection patterns",
        "prediction": "Would have blocked the specific attack pattern found in the audit but the endpoint would still be exploitable via alternative encoding (e.g., Unicode normalization). Would give false sense of security.",
        "confidence": 0.7
      }
    ],
    "drift": null
  }
}
```
