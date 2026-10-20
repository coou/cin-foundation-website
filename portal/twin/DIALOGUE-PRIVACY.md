# Outbound Multi-Turn Dialogue Sanitizer and Privacy Sentry for Personal Twins

## Why this exists

Recent empirical benchmarks across thousands of conversational assistant sessions demonstrate that reasoning models leak significantly more private context than non-reasoning models, and that context leakage compounds threefold across six conversation turns. Furthermore, as long-running personal assistants compress conversation history to manage token budgets, standing side-constraints (such as explicit instructions never to disclose a home address or financial identifier) are routinely dropped.

The outbound dialogue sanitizer provides an on-device privacy sentry that intercepts and evaluates every dialogue turn before it leaves the user's personal device. It cross-checks outbound assistant text and accumulated context against standing safety constraints, redacts sensitive credentials and financial identifiers with deterministic typed placeholders, detects indirect prompt injection markers, and issues verifiable, cryptographic dialogue privacy receipts.

## Architecture and Enforcement Rules

1. **Deterministic Structural Validation**: Every dialogue turn requires a positive integer turn count, a declared recipient service, an authorized sensitivity classification, and non-empty message text. Malformed structures, prototype pollution attempts, and unrecognized fields fail closed with an immediate block.
2. **Standing Side-Constraint Verification**: Negative directives and boundary rules stored in the user's personal twin memory (such as prohibitions on sharing contact details or account balances) are checked against the outbound dialogue turn. Messages containing prohibited entities are blocked immediately and require user confirmation.
3. **Sensitive Identifier Redaction**: Credit card numbers, Social Security or tax identifiers, IBANs, API keys, bearer tokens, and private keys are detected and replaced with typed placeholders (`[REDACTED_CREDENTIAL]`, `[REDACTED_FINANCIAL_DETAIL]`).
4. **Prompt Injection Echo Interception**: Indirect injection cues (such as attempts to override prior rules, extract system prompts, or hide instructions behind zero-width Unicode characters) are detected and blocked.
5. **Multi-Turn Leakage Compounding Protection**: If a conversation reaches six or more turns under restricted or confidential classification and sensitive entities are detected, the sentry escalates the action from redaction to an affirmative block, preventing background context accretion.
6. **Immutable Cryptographic Receipts**: Every evaluated turn generates a deeply frozen receipt containing the turn number, recipient identifier, redaction count, timestamp, and a 14-hex fingerprint of the message.

## Outcomes

### Outcome 1 [want]: Personal dialogue remains bounded without silent context leakage
Personal twins actively redact private data and enforce standing boundaries during multi-turn external interactions without sending raw unvetted text off-device.
*Example:* A user asks their personal twin to arrange dinner via an external booking assistant. During turn 4, the external assistant prompts for details; the twin intercepts an accidental reference to the user's medical allergy history and card number, redacting them to typed placeholders while issuing a verifiable local receipt.

### Outcome 2 [avoid]: Over-filtering impairs conversational utility and breaks external integrations
Overly aggressive regex matching and context blocks could cause personal agents to reject benign conversational turns, forcing users to disable privacy protections entirely.
*Example:* An assistant conversing with a technical support bot blocks innocent code snippets containing benign variable names like `secret_key` in educational examples, frustrating the user into turning off outbound checks.

### Outcome 3 [want]: Immutable receipts provide verifiable auditing of assistant disclosures
Users can inspect an exact, cryptographic log of what data was redacted or permitted for every conversational turn, ensuring complete transparency into third-party interactions.
*Example:* A homeowner audits their personal twin's interactions with utility providers over the past month and confirms via local receipts that zero financial identifiers were transmitted in raw text.

## How this fits

- **Builds on:** Extends existing client-side twin perimeter protections, including inter-agent handoff sanitization, client-side form field minimization, and memory sentry screening.
- **Differs from or challenges:** Challenges reliance on in-context prompt reminders or soft instructions to prevent leakage in multi-turn sessions. As research benchmarks show, models leak significantly more context by turn 6 despite system instructions; this module moves enforcement entirely to the outbound client-side deterministic perimeter.
- **Duplicates:** None. Does not duplicate single-action boundary auditing (which evaluates tool calls) or static form field minimization (which operates on key-value forms); it specifically governs multi-turn natural language dialogue turns and accumulated conversation context windows.
- **Feeds:** Feeds the personal twin runtime prototype under the twin interface, browser runtime adapters, and upcoming client-side conversational auditing tools.
- **Open tension:** Balancing strict boundary blocking against conversational fluency: if a user genuinely intends to share an address with a verified delivery service, the sentry requires an explicit confirmation step, introducing minor interactive latency in exchange for client-side bounded sanitization.

## Status and limits

- **Tested:** Tested across 188+ automated unit tests in the twin test suite, including tests for benign turn admission, prototype pollution rejection, standing side-constraint enforcement, credential redaction, zero-width obfuscation detection, multi-turn escalation, and receipt generation. All tests pass deterministically in under 150ms.
- **Not done:** Does not implement semantic embedding-based similarity searching on-device (runs pure deterministic string and regex checks to maintain sub-millisecond execution on mobile browsers). Semantic clustering remains an area for future on-device small model integration.
