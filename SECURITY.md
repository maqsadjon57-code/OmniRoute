# Security Policy

## Supported versions

| Version | Supported |
| --- | --- |
| latest main | ✅ |
| 0.1.x | ✅ |

## Reporting a vulnerability

Please email **security@omniroute.dev** instead of opening a public issue.

Include:
- Affected version / commit
- Repro steps
- Impact
- Suggested fix (optional)

We acknowledge within **72 hours** and credit valid reporters when a fix ships.

## Security features

- AES-256-GCM encryption of provider secrets.
- JWT sessions via jose with httpOnly cookies.
- API key scopes (`read`, `write`, `admin`), IP allowlists, rate limits.
- Prompt-injection and secret-masking guardrails.
- SQLite WAL + parameterized queries (no SQL injection).
