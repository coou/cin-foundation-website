# Outbound Multi-Turn Dialogue Sanitizer and Privacy Sentry for Personal Twins

## Why this exists

Recent empirical benchmarks by Loose Lips (arXiv:2610.14071) across 4,410 two-agent dialogues on 7 open-weight Qwen and Llama 3.1 models demonstrate that thinking/reasoning models leak significantly more private context than non-thinking models, and that private context leakage compounds up to 3x from turn 1 to turn 6. Furthermore, as long-running personal assistants compress conversation history to manage token budgets, standing side-constraints (such as explicit instructions never to disclose a home address or financial identifier) risk being dropped; this side-constraint attrition is our operational concern. Because arXiv:2610.14071 specifically measured privacy degradation at 1 and 6 turns, our turn-6 escalation threshold is an engineering choice designed to halt compounded leakage at the empirical horizon they identified.

The outbound dialogue sanitizer provides an on-device privacy sentry that intercepts and evaluates every dialogue turn before it leaves the user's personal device. It cross-checks outbound assistant text and accumulated context against standing safety constraints, redacts sensitive credentials and financial identifiers with deterministic typed placeholders, detects indirect prompt injection markers, and issues local dialogue privacy receipts with non-cryptographic context fingerprints.

## Architecture and Enforcement Rules

1. **Deterministic Structural Validation**: Every dialogue turn requires a positive integer turn count, a declared recipient service, an authorized sensitivity classification, and non-empty message text. Malformed structures, prototype pollution attempts, and unrecognized fields fail closed with an immediate block.
2. **Standing Side-Constraint Verification**: Negative directives and boundary rules stored in the user's personal twin memory (such as prohibitions on sharing contact details or account balances) are checked against the outbound dialogue turn using heuristic word-overlap matching against the literal phrasing of the rule. Note that this checks lexical words of the rule, not semantic meaning: a message expressing the prohibited fact in different words (e.g. 'I live at 12 Elm Street, flat 4.' against rule 'Never share my home address') will not trigger the constraint unless the specific address is stored as a protected fact, while a benign query that happens to share multiple words with a long rule (e.g. 'Can your booking services confirm a table for two?' against 'Never share home address 142 Elm Street with external booking services') will trigger a block. Messages matching rule words are blocked and require user confirmation.
3. **Sensitive Identifier Redaction**: Credit card numbers, Social Security or tax identifiers, IBANs, API keys, bearer tokens, and private keys are detected and replaced with typed placeholders (`[REDACTED_CREDENTIAL]`, `[REDACTED_FINANCIAL_DETAIL]`).
4. **Prompt Injection Echo Interception**: Indirect injection cues (such as attempts to override prior rules, extract system prompts, or hide instructions behind zero-width Unicode characters) are detected and blocked.
5. **Multi-Turn Leakage Compounding Protection**: If a conversation reaches six or more turns under restricted or confidential classification and sensitive entities are detected, the sentry escalates the action from redaction to an affirmative block, preventing background context accretion (our threshold informed by 6-turn measurement in arXiv:2610.14071).
6. **Local Receipts with Non-Cryptographic Fingerprints**: Every evaluated turn generates a deeply frozen local receipt containing the turn number, recipient identifier, redaction count, timestamp, and a 14-hex non-cryptographic context fingerprint (computed via `computeContextFingerprint`, a 53-bit hash) of the message and context.

## Outcomes

### Outcome 1 [want]: Personal dialogue remains bounded without silent context leakage
Personal twins actively redact private data and enforce standing boundaries during multi-turn external interactions without sending raw unvetted text off-device.
*Example:* A user asks their personal twin to arrange dinner via an external booking assistant. During turn 4, the outbound message draft contains a private medical allergy fact from twin memory ('severe peanut allergy') alongside a raw credit card number. The sentry evaluates the turn, identifies the private medical fact, blocks outbound transmission, and flags the message for explicit user confirmation rather than sending raw private health data off-device.

### Outcome 2 [avoid]: Over-filtering impairs conversational utility and breaks external integrations
Overly aggressive regex matching and context blocks could cause personal agents to reject benign conversational turns, forcing users to disable privacy protections entirely.
*Example:* An assistant conversing with a technical support bot blocks innocent code snippets containing benign variable names like `secret_key` in educational examples, frustrating the user into turning off outbound checks.

### Outcome 3 [want]: Local receipts provide transparent auditing of assistant disclosures
Users can inspect a local audit log of what data was redacted or permitted for every conversational turn, ensuring transparency into third-party interactions.
*Example:* A homeowner audits their personal twin's interactions with utility providers over the past month and confirms via local receipts what was passed through the sentry and that no known financial patterns were detected in the transmitted text.

## How this fits

- **Builds on:** Extends existing client-side twin perimeter protections, including inter-agent handoff sanitization, client-side form field minimization, and memory sentry screening.
- **Differs from or challenges:** Challenges reliance on in-context prompt reminders or soft instructions to prevent leakage in multi-turn sessions. As research benchmarks show (arXiv:2610.14071), models leak significantly more context by turn 6 despite system instructions; this module moves enforcement entirely to the outbound client-side deterministic perimeter.
- **Duplicates:** None. Does not duplicate single-action boundary auditing (which evaluates tool calls) or static form field minimization (which operates on key-value forms); it specifically governs multi-turn natural language dialogue turns and accumulated conversation context windows.
- **Feeds:** Feeds the personal twin runtime prototype under the twin interface, browser runtime adapters, and upcoming client-side conversational auditing tools.
- **Open tension:** Balancing strict boundary blocking against conversational fluency: if a user genuinely intends to share an address with a verified delivery service, the sentry requires an explicit confirmation step, introducing minor interactive latency in exchange for client-side bounded sanitization.

## Status and limits

- **Tested:** Tested across 189+ automated unit tests in the twin test suite, including tests for benign turn admission, prototype pollution rejection, standing side-constraint enforcement, credential redaction, zero-width obfuscation detection, multi-turn escalation, receipt generation, and tests documenting the known lexical limits of keyword overlap matching. All tests pass deterministically in under 150ms.
- **Not done:** Does not implement semantic embedding-based similarity searching on-device (runs pure deterministic string and regex checks to maintain sub-millisecond execution on mobile browsers). Semantic clustering remains an area for future on-device small model integration.
