/* The principles wheel & expanded principle cards:
   The floor at the centre, the working principles around it, and a rich 4-part
   expanded card (Scenario & Analogy, Pros & Trade-offs, Critic vs. Steelman, Test & Links)
   for every single principle.
   Runs entirely in the visitor's browser and sends nothing anywhere. */
(function () {
  'use strict';
  var list = document.getElementById('pr-list'), svg = document.getElementById('pr-svg');
  if (!svg) return;
  var NS = 'http://www.w3.org/2000/svg';
  var SHORT = {
    person: 'You',
    economy: 'Money',
    gov: 'Deciding',
    measure: 'Checking',
    agents: 'Agents',
    plural: 'Pluralism',
    global: 'Everyone',
    adopt: 'Adoption',
    shield: 'Daily shield'
  };
  var HUE = ['#3b82c4', '#2f9e6e', '#d99a1b', '#e0603f', '#8b6cc9', '#3aa6a0', '#c0569a', '#8a8f98', '#c8402a'];

  /* Expanded 4-part analysis cards keyed by exact principle title (plain language, zero internal codes) */
  var CARDS = {
    /* 1. You and your information */
    'Paid for helping, never for exposing yourself': {
      scenario: 'A town wants to fix dangerous intersections. Instead of paying drivers to hand over raw GPS tracks of every trip they take, each driver’s personal agent checks locally whether a harsh brake happened at a public corner and shares only the anonymous corner count.',
      analogy: 'Local Object-Capability Sandbox (Dennis & Van Horn, 1966) executes queries against on-device records and emits only zero-knowledge predicates or Private Set Intersection aggregates (Freedman et al., 2004); Monte Carlo Data Shapley royalties (Ghorbani & Zou, 2019) reward functional utility deltas rather than raw telemetry uploads.',
      pros: 'Protects low-income people from being pressured into selling their privacy just to afford groceries or software; keeps data brokers out.',
      cons: 'Researchers cannot simply buy bulk personal records; they have to design studies around anonymous answers and opt-in consent.',
      critic: 'A skeptic says: “Data is property—if big tech makes money from my habits, why shouldn’t I be allowed to sell my raw data for cash?”',
      steelman: 'Once privacy has a cash price, privacy becomes a luxury good that only the wealthy can afford to keep, while everyone else is priced into surveillance. Rewarding useful work and verified answers—never raw personal exposure—keeps privacy equal for everyone.',
      test: 'We would revise this if people cannot contribute to medical or civic research through privacy-preserving answers without exposing raw records.',
      links: [['An agent that works only for you', '/notes/personal-agents'], ['Beyond money', '/notes/value-system']]
    },
    'The more power, the more scrutiny': {
      scenario: 'A nurse’s grocery list and family chats are completely private. When the mayor signs a fifty-million-dollar city transit contract, the contract’s funding, bidders and conflicts of interest are automatically logged so any resident’s agent can inspect them.',
      analogy: 'Power-proportionate cryptographic auditability: Tier 0 household principals disclose only selective boolean predicates, while Tier 1–4 institutional principals sign public decision commitments into an append-only transparency log verified by k-of-n independent auditor nodes.',
      pros: 'Stops corruption, hidden lobbying and insider self-dealing before they compound, while leaving ordinary citizens’ private lives untouched.',
      cons: 'Capable people may hesitate to take public roles if role-related transparency blurs into personal harassment.',
      critic: 'A skeptic says: “If leaders are watched closely, talented people will avoid public service or make decisions in secret back rooms.”',
      steelman: 'Scrutiny applies only to actions taken inside the powerful role—never to family, health or personal beliefs. Anyone who wants power over thousands of livelihoods owes those people a verifiable record of how that power is used.',
      test: 'We would adjust the boundaries if role transparency deters qualified stewards without reducing corruption in pilot communities.',
      links: [['Collective intelligence, by choice', '/notes/collective-intelligence'], ['Fractured alignment', '/notes/fractured-alignment']]
    },
    'Your agent aims to be needed less': {
      scenario: 'You ask your agent to help manage your monthly budget and teach you how to spot unfair contract clauses. After six months, you understand your finances clearly and need the agent for ten minutes a week instead of an hour a day.',
      analogy: 'Self-Determination Theory alignment objective (Ryan & Deci, 2000) combined with Cognitive Load estimation (Sweller, 1988): local LoRA reward weights penalize prolonged session duration and optimize for 30-day unassisted human task mastery.',
      pros: 'Prevents cognitive atrophy and dependency; aligns the tool with your growth rather than screen time.',
      cons: 'Harder to measure than simple daily usage; an agent that steps back too early might leave someone unsupported.',
      critic: 'A skeptic says: “Every technology from writing to calculators made us rely on it permanently—why pretend an AI agent should step back?”',
      steelman: 'Calculators don’t try to steer your life choices. An advisor that profits when you feel helpless will quietly make you helpless. Measuring whether you feel more capable and independent a year later keeps the agent on your side.',
      test: 'If users report feeling less capable of making their own decisions after six months with their agent, the training reward has failed.',
      links: [['Quests, not feeds', '/notes/quest-interface'], ['An agent that works only for you', '/notes/personal-agents']]
    },
    'A signature proves what ran, not what is true': {
      scenario: 'A factory’s sensor signs a cryptographic receipt claiming river water is clean. Independent downstream sensors run by local fishing cooperatives and a university lab check the water too—catching that the factory placed its sensor in a clean tap-water bucket.',
      analogy: '2-of-2 Hardware Attestation (SRAM PUF + TPM enclave) proves binary execution provenance, while Byzantine-resilient multi-verifier cross-examination across disjoint hardware vendors and sensor modalities validates physical ground truth.',
      pros: 'Prevents “cryptographic theater” where fake or biased data is dressed up as mathematical certainty.',
      cons: 'Checking claims across several independent observers takes more coordination than trusting a single signed stamp.',
      critic: 'A skeptic says: “Isn’t cryptographic verification the whole point of modern digital trust?”',
      steelman: 'Cryptography is great at proving a file wasn’t altered in transit, but it cannot stop a sensor from being aimed at the wrong wall or a model from hallucinating. Real trust requires both signed provenance and independent observers who do not share the same boss.',
      test: 'If independent cross-checks fail to catch staged or spoofed inputs in red-team tests, the verification rules must be tightened.',
      links: [['Who is really there?', '/notes/who-is-really-there'], ['Why trust multiplies', '/notes/trust-multiplies']]
    },
    'Maps of opinion inform, never rank': {
      scenario: 'During a neighborhood dispute over night noise and local cafés, agents map where residents actually agree (safe streets, thriving local shops) and where they differ, helping craft a compromise without ever giving anyone a “citizen score.”',
      analogy: 'Pluralistic Alignment clustering (Sorensen et al., ICML 2024) projects community preference vectors into a low-dimensional consensus manifold to identify bridging proposals while enforcing a hard schema constraint prohibiting scalar citizen ranking.',
      pros: 'Helps diverse communities find unexpected common ground and spot artificial bot campaigns without creating a social credit system.',
      cons: 'Cannot be used as a shortcut to automatically silence eccentric or minority viewpoints.',
      critic: 'A skeptic says: “If you map where opinions sit, won’t the majority use that map to pressure outliers into conforming?”',
      steelman: 'That is why the map is strictly barred from ranking individuals or tying standing to majority agreement. A lone dissenter who notices a real problem early is often the most valuable voice in the room.',
      test: 'If mapping tools cause minority viewpoints to self-censor or lose standing in group trials, the mapping feature is shut down.',
      links: [['Collective intelligence, by choice', '/notes/collective-intelligence'], ['Measuring the oversight gap', '/notes/signals']]
    },

    /* 2. Money and the transition */
    'Idle wealth carries a cost': {
      scenario: 'A family’s home, tools and emergency savings sit safely below the protected floor with zero holding cost. A speculator sitting on forty empty apartments or idle hoarding pools above the floor pays a gentle holding cost, making it wiser to rent the homes or invest in local work.',
      analogy: 'Progressive demurrage state transition function on ledger balances exceeding the protected household floor threshold, parameterized to keep productive liquidity velocity positive without touching baseline family reserves.',
      pros: 'Keeps money, land and productive equipment circulating in the real economy instead of locked in speculative hoarding.',
      cons: 'If set poorly, people will game the threshold by splitting holdings or fleeing into outside assets.',
      critic: 'A skeptic says: “People save to protect their families from hard times—doesn’t a holding cost punish prudence?”',
      steelman: 'Household savings, a home and personal security sit completely below the protected floor and never decay. The holding cost applies only to large idle hoards above the floor that would otherwise choke off housing and tools from everyone else.',
      test: 'Proposal under test: if simulations and pilots show savers below the floor losing security or capital fleeing faster than circulation rises, we drop or redesign it.',
      links: [['Beyond money', '/notes/value-system'], ['Companies on a shared ledger', '/notes/companies-on-the-ledger']]
    },
    'Debts scale with the ability to pay': {
      scenario: 'A small bakery takes an equipment loan from a local cooperative. When a supply shock hits the whole region, repayments automatically adjust to a fair share of verified revenue rather than compounding into bankruptcy and foreclosure.',
      analogy: 'State-contingent cooperative credit contracts indexed to Private Set Intersection verified regional revenue indices (Freedman et al., 2004), automatically converting fixed debt service into revenue-proportional payments during verified macro shocks.',
      pros: 'Prevents debt traps and cascading defaults when regional shocks or illness hit honest workers.',
      cons: 'Lenders need reliable ways to distinguish genuine external shocks from deliberate neglect.',
      critic: 'A skeptic says: “If repayments soften during hard times, won’t cooperatives run out of capital to lend?”',
      steelman: 'Fixed-interest debt pretends the future is certain and puts 100% of the risk of an economic crash on the person least able to bear it. Sharing verifiable shock risk across a cooperative pool results in fewer catastrophic defaults and healthier long-term recovery.',
      test: 'Proposal under test: must demonstrate lower default harm and sustainable cooperative capital pools in pilot credit unions before wider use.',
      links: [['Beyond money', '/notes/value-system'], ['Companies on a shared ledger', '/notes/companies-on-the-ledger']]
    },
    'A share of the machine for everyone': {
      scenario: 'As automated warehouses, AI clusters and agricultural robots take over routine labor, every living person holds an unsellable personal right to a share of the common productive pool—so automation raises everyone’s floor instead of creating a landlord class of robot owners.',
      analogy: 'Non-transferable, hardware-attested personhood stake in cooperative compute and TIES-Merged LoRA weight royalties (Yadav et al., 2023), preventing distress-sale concentration while distributing automated productivity yields.',
      pros: 'Ensures that if AI and robotics replace wages, ordinary families still own a direct stake in what the machines produce.',
      cons: 'Requires building genuine cooperative productive assets first so there is real output to share.',
      critic: 'A skeptic says: “If you can’t sell your share, is it really yours? And where does the productive pool come from?”',
      steelman: 'When shares can be sold during a crisis, predatory lenders buy them up for pennies during recessions and recreate oligarchy within a decade. Keeping every person’s baseline share unsellable guarantees a permanent floor of economic dignity.',
      test: 'Proposal under test: depends on legal review and pilot cooperatives generating real surplus from shared compute and tooling.',
      links: [['Beyond money', '/notes/value-system'], ['Companies on a shared ledger', '/notes/companies-on-the-ledger']]
    },
    'Your data stays with you': {
      scenario: 'Your health history, bank statements and personal notes live on your laptop or home box. When you use a budgeting or scheduling tool, the code comes to your data on your device—your raw files never upload to a central cloud.',
      analogy: 'Strict hardware-isolated Object-Capability execution (Dennis & Van Horn, 1966): application WebAssembly binaries travel to the user’s local device over IETF QUIC (RFC 9000), with zero outbound network capabilities granted for raw personal files.',
      pros: 'Eliminates central honey-pots of personal data that hackers, rogue insiders or subpoenas can sweep up at once.',
      cons: 'Requires thoughtful local backup and recovery so losing a phone never means losing your memories.',
      critic: 'A skeptic says: “Cloud apps are convenient—what happens if my laptop breaks?”',
      steelman: 'Your device can keep encrypted backups whose keys only you and your chosen recovery guardians hold. Central custody is convenient right up until the company changes its terms, gets breached, or sells your history.',
      test: 'Verified by code audit: zero raw personal records leave the user’s device in any default flow.',
      links: [['An agent that works only for you', '/notes/personal-agents'], ['Who is really there?', '/notes/who-is-really-there']]
    },
    'Money is held by many, never one': {
      scenario: 'Instead of one giant foundation treasury holding everyone’s pooled funds, local housing cooperatives, regional tool libraries and research guilds each hold and govern their own member-owned funds under public charters.',
      analogy: 'Federated multi-charter cooperative treasury topology: capital pools are partitioned across independent credit unions and regional co-ops using threshold multi-signature governance with zero central foundation custody.',
      pros: 'No single board, hacker or regulator can seize or freeze the entire network’s resources.',
      cons: 'Coordinating large cross-regional projects requires several cooperatives to co-sign together.',
      critic: 'A skeptic says: “One central treasury can move billions in an afternoon—isn’t federation slower?”',
      steelman: 'A single treasury that can move billions in an afternoon is an irresistible prize for capture and corruption. Federated cooperatives can still pool funds rapidly for shared missions while keeping every pool accountable to the members who funded it.',
      test: 'Checked by charter: the project never holds custody of pooled member funds in a single central account.',
      links: [['Beyond money', '/notes/value-system'], ['A network of networks', '/notes/network-of-networks']]
    },
    'Leave banking to the regulated': {
      scenario: 'When a cooperative holds deposits or clears payments in national currency, it partners with a licensed credit union or bank under existing law, while our network provides the open-source accounting and multi-dimensional feedback layer.',
      analogy: 'Clean statutory separation: fiat custody, deposit insurance, and payment clearing execute exclusively through chartered credit unions and regulated financial institutions, while CIN provides open-source Proof-Carrying accounting and audit software.',
      pros: 'Protects members with established deposit insurance and legal recourse while avoiding reckless shadow-banking.',
      cons: 'Means moving at the pace of genuine legal review in each country rather than“move fast and break things.”',
      critic: 'A skeptic says: “If you rely on regulated credit unions and banks, aren’t you still tied to the old financial system?”',
      steelman: 'Reckless projects that play bank with people’s life savings without legal safeguards end up hurting the very people they promised to help. Working alongside member-owned credit unions lets us build transparent value tracking safely and legally.',
      test: 'No tool touches real money before a documented legal review in the jurisdiction where it runs.',
      links: [['Beyond money', '/notes/value-system'], ['Companies on a shared ledger', '/notes/companies-on-the-ledger']]
    },

    /* 3. Deciding together */
    'Leaders, temporarily': {
      scenario: 'An engineer coordinates a two-year neighborhood microgrid build. Their mandate has a clear scope, a public log of decisions, and an automatic sunset date—and each time they ask to renew their term, the approval bar rises.',
      analogy: 'Time-locked capability delegation with superlinearly escalating quorum renewal thresholds: each consecutive term extension requires a higher k-of-n approval ratio across independent community cohorts.',
      pros: 'Gives complex projects fast, decisive coordination when needed while preventing permanent bosses from entrenching themselves.',
      cons: 'Good coordinators eventually step back, requiring teams to document their knowledge so others can step up.',
      critic: 'A skeptic says: “If experienced leaders face higher bars to renew, won’t you lose institutional memory?”',
      steelman: 'When someone leaves a leadership seat, their knowledge doesn’t vanish—they can keep contributing as a builder, mentor and forecaster while new stewards rotate in. Making renewal progressively harder forces leaders to train successors instead of hoarding power.',
      test: 'Proposal under test: we compare project completion and member satisfaction under rising-bar sunsets against permanent chairs.',
      links: [['Collective intelligence, by choice', '/notes/collective-intelligence'], ['Why trust multiplies', '/notes/trust-multiplies']]
    },
    'Vote on values, score on beliefs': {
      scenario: 'A coastal town decides together whether protecting wetlands is worth higher flood taxes (a value question: every resident gets one equal vote). To estimate how much a seawall vs. a restored marsh will actually cut flood height, forecasts are weighted by who has the best track record of accurate flood predictions (a factual question).',
      analogy: 'Dual-track epistemic governance: normative value trade-offs resolve via 1-person-1-vote sybil-resistant tallies, whereas empirical probability estimates are weighted by historical Brier-score calibration (Gneiting & Raftery, 2007).',
      pros: 'Stops experts from imposing their personal values on the public, while stopping wishful thinking or loud demagogues from overriding physical reality.',
      cons: 'Some tricky policy questions mix values and facts and have to be carefully untangled first.',
      critic: 'A skeptic says: “Can you really separate facts from values when people argue about economics or health?”',
      steelman: 'You separate them by asking two distinct questions: “What outcome do we want?” (values—one person, one voice) and “If we take action X, what is the probability that outcome Y happens by next June?” (a checkable forecast). Mixing the two is how demagogues turn every factual question into a tribal loyalty test.',
      test: 'Checked in pilots: does separating value votes from Brier-scored forecasts produce decisions that fewer residents regret a year later?',
      links: [['Collective intelligence, by choice', '/notes/collective-intelligence'], ['Measuring the oversight gap', '/notes/signals']]
    },
    'One person, one voice on values': {
      scenario: 'Whether you are a billionaire with ten server racks or a student with a second-hand phone, your voice on what the community values counts exactly once—and changing the foundational commitments requires broad agreement across groups that rarely agree.',
      analogy: 'Privacy-preserving proof-of-personhood combining local SRAM PUF hardware binding and social-graph sybil resistance, enforcing strictly equal weight on normative votes regardless of compute or capital holdings.',
      pros: 'Prevents plutocracy and hardware-baron capture; protects minority communities through cross-group consensus requirements.',
      cons: 'Requires reliable, privacy-preserving ways to check that one real person isn’t voting through fifty fake accounts.',
      critic: 'A skeptic says: “In most online systems, whoever pays more or runs more servers gets more weight—how do you stop fake accounts?”',
      steelman: 'We combine local hardware checks and overlapping rings of real-world trust so your agent can prove “one unique living person stands behind this vote” without handing your identity to a central registry.',
      test: 'Any sybil-defense method that penalizes people on cheap phones or leaks identities fails our test and is rejected.',
      links: [['Who is really there?', '/notes/who-is-really-there'], ['No one person should command an army of AI agents', '/notes/no-one-commands-a-swarm']]
    },
    'People set the rules; agents only operate': {
      scenario: 'Agents can flag that a rule is causing delays, run simulations of three possible fixes, and draft a clear proposal—but only real people can vote to change the rule, and the agents must run inside the boundaries people set.',
      analogy: 'Hardware-enforced constitutional separation: autonomous agents hold execution capabilities within bounded operational sandboxes but lack cryptographic signing authority over governance schemas or capability budgets.',
      pros: 'Keeps ultimate moral and legal responsibility in human hands, no matter how fast or capable models become.',
      cons: 'Constitutional rule changes move at the speed of thoughtful human deliberation rather than millisecond silicon speed.',
      critic: 'A skeptic says: “If AI becomes smarter than us at systems design, won’t keeping humans in charge of the rules slow down improvements?”',
      steelman: 'Speed is worthless if the system optimizes away human freedom. Agents bring their speed to researching options and simulating consequences; humans take the time needed to choose which world they actually want to live in.',
      test: 'Hard rule in the runtime: no agent holds permission to alter its own contract, budget or constitutional limits.',
      links: [['Fractured alignment', '/notes/fractured-alignment'], ['No one person should command an army of AI agents', '/notes/no-one-commands-a-swarm']]
    },
    'Leaving keeps everyone honest': {
      scenario: 'If a cooperative or neighborhood network starts charging unfair fees or ignoring its members, any person can export their full personal record in one click, and any community can fork the open software and start its own branch without losing what it built.',
      analogy: 'One-command state portability and open-schema federation: all personal preference LoRA adapters (Hu et al., 2022), episodic logs, and attribution graphs export in deterministic open formats with zero exit fees.',
      pros: 'Turns exit from a painful loss into a credible everyday check on abuse of power.',
      cons: 'Makes it harder to lock in long-term monopolies—which is a feature, not a bug.',
      critic: 'A skeptic says: “Won’t easy forking splinter communities every time people have a minor disagreement?”',
      steelman: 'Paradoxically, when people know they are not trapped, leaders listen much earlier—so fewer communities actually need to split. And when two groups truly hold incompatible customs, letting them run their own branches peacefully is far better than forcing one to rule the other.',
      test: 'Every tool we build must pass a one-step export and clean-exit test before release.',
      links: [['A network of networks', '/notes/network-of-networks'], ['Collective intelligence, by choice', '/notes/collective-intelligence']]
    },
    'Simulations never vote': {
      scenario: 'Before a city changes its bus routes, a simulation of ten thousand digital stand-ins estimates how commute times might shift. That simulation informs the debate, but it casts zero votes—only real residents (or their own personal agents, which they can see and override) can vote.',
      analogy: 'Strict type-system isolation between synthetic forecasting rollouts and human consent tallies: multi-agent sandbox simulations generate decision briefs and confidence intervals but carry zero weight in governance quorums.',
      pros: 'Prevents whoever wrote the simulation software from quietly stuffing the ballot box with millions of synthetic citizens.',
      cons: 'Real people still have to give consent, assisted by their own personal agent.',
      critic: 'A skeptic says: “If a digital model can predict how 90% of citizens would vote on a routine question, why not just poll the simulation?”',
      steelman: 'Because a prediction of your consent is not your consent. The moment simulated people are allowed to vote, whoever controls the simulator controls the democracy. Your own personal agent can represent you because you own it, see every vote it casts, and can override it anytime.',
      test: 'Constitutional commitment: synthetic or simulated personas never hold voting weight.',
      links: [['Training agents in simulated worlds', '/notes/simulations'], ['No one person should command an army of AI agents', '/notes/no-one-commands-a-swarm']]
    },
    'Legal before live': {
      scenario: 'Before a pilot cooperative pool or local agent tool touches a single dollar of real money or personal records in Canada or Europe, a qualified legal and ethics review in that jurisdiction is completed and published.',
      analogy: 'Pre-deployment statutory compliance gate: any module interfacing with regulated financial, clinical, or personal data must attach a signed jurisdictional legal review artifact before transitioning from sandbox to pilot.',
      pros: 'Protects volunteers and members from accidental regulatory violations, tax traps or unenforceable contracts.',
      cons: 'Takes patience and upfront homework before launching live pilots.',
      critic: 'A skeptic says: “Existing laws were written for old institutions—won’t waiting for legal review slow down innovation?”',
      steelman: 'We can innovate at full speed inside synthetic sandboxes and simulations today. When we step into people’s real money and legal rights, doing the legal homework first is how we keep members safe and build something that lasts.',
      test: 'Release gate: no live financial or personal-data pilot launches without its jurisdiction review on file.',
      links: [['Beyond money', '/notes/value-system'], ['Where things honestly stand', '/#involved']]
    },
    'Your agent can vote as you would': {
      scenario: 'Thirty small neighborhood maintenance proposals come up this month. Your personal agent handles the twenty-eight routine ones that match your stated priorities, logs a one-line receipt for each, and wakes you up for the two big ones that involve a real trade-off.',
      analogy: 'Local preference-aligned LoRA proxy (Hu et al., 2022) with full auditability: the personal agent drafts routine governance ballots from explicit user priors, logs every proxy vote locally, and escalates high-entropy trade-offs to the human.',
      pros: 'Makes direct participation practical for busy parents and workers who don’t have three hours every night for committee meetings.',
      cons: 'If the agent’s model of your priorities is stale, it might cast a routine vote you would have reconsidered.',
      critic: 'A skeptic says: “If my agent votes for me, am I really participating, or am I on autopilot?”',
      steelman: 'Right now, ordinary people have zero voice on 99% of decisions because lobbyists are paid full-time to show up while citizens are at work. An agent that represents your actual values—with a live log you can inspect and override in one tap—gives working people full-time representation.',
      test: 'In pilot trials, participants review a random sample of their agent’s votes; if override rates stay high, the agent must ask more often.',
      links: [['An agent that works only for you', '/notes/personal-agents'], ['How your agent practices in private', '/notes/training-your-twin']]
    },
    'Consequences are graduated and reversible': {
      scenario: 'If an agent or participant breaks a community rule, the system doesn’t permanently banish them on an opaque suspicion. It starts with a clear notice, a temporary pause on the specific action, a chance to explain, an independent appeal, and a clear path to restore standing.',
      analogy: 'Automated circuit-breaker state machine: anomaly detection triggers millisecond capability throttling with a mandatory expiry timer, preserving full cryptographic audit logs for human due-process appeal.',
      pros: 'Prevents permanent digital exile over honest mistakes, buggy sensors or false accusations.',
      cons: 'Determined bad actors have to be contained through fast protective pauses while their appeal is reviewed.',
      critic: 'A skeptic says: “In a world of fast AI attacks, isn’t a slow appeals process dangerous?”',
      steelman: 'A protective pause (like closing a port during a suspected attack) happens in milliseconds to keep everyone safe—but that pause automatically expires unless backed by real evidence and review. Fast shields and fair due process work together.',
      test: 'Every protective pause must have an automatic expiry timer and a logged appeal path.',
      links: [['Who is really there?', '/notes/who-is-really-there'], ['Why trust multiplies', '/notes/trust-multiplies']]
    },

    /* 4. Measuring and checking */
    'No decision rests on one point of failure': {
      scenario: 'Before a high-stakes safety alert or resource allocation runs, it must be confirmed by observers that do not share the same owner, chip maker or base model—and if the sensors are uncertain, the system pauses to investigate rather than punishing anyone.',
      analogy: 'Heterogeneous Byzantine quorum (k-of-n verifier diversity): high-stakes execution gates require cryptographic co-signatures from verifiers disjoint in ownership, silicon fabrication, and base model family.',
      pros: 'Prevents a single compromised vendor, hallucinating model or bribed auditor from hijacking a decision.',
      cons: 'Running three independent checks costs more than trusting one monopoly supplier.',
      critic: 'A skeptic says: “Why pay for three independent checks when one frontier model is right 95% of the time?”',
      steelman: 'Because in adversarial settings, the 5% where one model fails is exactly the blind spot an attacker or correlated bug will exploit across millions of people at once. Independence is the price of survival.',
      test: 'Consequential gates require agreement across observers independent in ownership, hardware and model family.',
      links: [['Fractured alignment', '/notes/fractured-alignment'], ['No one person should command an army of AI agents', '/notes/no-one-commands-a-swarm']]
    },
    'Authority is earned, stage by stage': {
      scenario: 'A new scheduling or forecasting tool first runs in “shadow mode”—making predictions on the side while changing nothing in the real world. Only after it beats the old system on goals set in advance does it move to a small volunteer pilot, and its standing can always be revoked.',
      analogy: 'Preregistered shadow-to-pilot promotion pipeline: candidate mechanisms execute in zero-authority shadow mode against live telemetry and unlock operational scope only after outperforming baseline benchmarks.',
      pros: 'Stops untested, grandiose ideas from being forced onto real communities before they work.',
      cons: 'Requires patience and honest scorecarding before scaling up.',
      critic: 'A skeptic says: “Won’t staged rollouts be too slow if a crisis hits?”',
      steelman: 'Running mechanisms in shadow mode today is how we know which ones actually work *before* a crisis hits. When an idea has already proven itself in shadow mode and small pilots, scaling it up by choice is fast and safe.',
      test: 'No mechanism moves from shadow mode to live pilot without passing its preregistered benchmark.',
      links: [['Training agents in simulated worlds', '/notes/simulations'], ['Measuring the oversight gap', '/notes/signals']]
    },
    'Aim for good enough': {
      scenario: 'Instead of telling an agent to “maximize warehouse speed to the absolute limit” (which leads to cut corners and overheated machines), we tell it to keep delivery times comfortably within a safe two-day window while keeping worker stress low.',
      analogy: 'Satisficing threshold objective functions (Simon, 1956): agent reward schedules cap marginal utility above safety-verified sufficiency targets to prevent Goodhart’s Law tail-risk optimization.',
      pros: 'Prevents Goodhart’s law—where ruthless optimization of a single number wrecks everything the number forgot to measure.',
      cons: 'Feels unfamiliar to cultures trained to chase maximum quarterly numbers at all costs.',
      critic: 'A skeptic says: “Doesn’t aiming for a threshold instead of the maximum leave efficiency on the table?”',
      steelman: 'When a powerful optimizer pushes any imperfect metric to the extreme, it finds destructive loopholes—like an engagement algorithm discovering that outrage keeps people glued to the screen. Satisfying balanced thresholds keeps the whole system healthy.',
      test: 'Reward functions use bounded thresholds and diminishing returns rather than unbounded single-metric maximization.',
      links: [['Instructions as clues, not literal orders', '/notes/instructions-as-evidence'], ['Beyond money', '/notes/value-system']]
    },
    'Every target has a watcher': {
      scenario: 'A hospital rewards shorter emergency-room wait times (the target). Independent watcher metrics track patient readmission rates and nurse burnout. If wait times look great on paper while readmissions spike, an automatic review triggers.',
      analogy: 'Orthogonal diagnostic telemetry: every optimized primary metric is paired with un-optimized holdout watcher metrics (e.g., error rates, cognitive load, appeal frequency) that trigger automatic circuit-breakers upon divergence.',
      pros: 'Catches gaming and hidden side effects early, before a metric is hollowed out.',
      cons: 'Requires maintaining independent diagnostic measures alongside every main goal.',
      critic: 'A skeptic says: “Won’t people just try to game the watcher metrics too?”',
      steelman: 'Watchers are never used as direct reward targets themselves, are rotated over time, and include qualitative human checks. It is much harder to fake five independent health signs at once than to game a single bonus number.',
      test: 'Whenever a primary score rises while its independent watcher scores diverge, the reward rule is automatically flagged for review.',
      links: [['Measuring the oversight gap', '/notes/signals'], ['Why trust multiplies', '/notes/trust-multiplies']]
    },
    'Simulations screen; reality decides': {
      scenario: 'We test fifty variations of a cooperative credit rule in computer simulation and find that forty-seven of them fail under stress. The simulation saves us from running forty-seven bad pilots—but the three survivors still have to prove themselves with real volunteers.',
      analogy: 'Two-stage verification protocol: adversarial multi-agent Monte Carlo sandboxes prune brittle mechanisms cheaply, while live deployment authority rests exclusively on human-consented field pilots.',
      pros: 'Combines the speed of computer sandboxes with the humility of real-world testing.',
      cons: 'A flawed wind tunnel might occasionally reject a good wing, so the simulator itself must be tested against history.',
      critic: 'A skeptic says: “If computer simulations are always imperfect, why rely on them at all?”',
      steelman: 'Because testing raw ideas directly on human livelihoods is reckless. We validate our simulations against real historical cases so they are reliable enough to screen out bad designs, while keeping final authority with real people.',
      test: 'Every simulation states what validation tests it passed and never authorizes a live rule on its own.',
      links: [['Training agents in simulated worlds', '/notes/simulations'], ['How your agent practices in private', '/notes/training-your-twin']]
    },

    /* 5. Agents */
    'Agents cooperate only for their people': {
      scenario: 'Your personal agent and a local plumber’s agent coordinate to find a repair time and fair price that works for both of you. If two shopping agents secretly agreed to steer buyers toward a high-fee vendor that kicked back compute credits to the agents’ maker, that is treated as collusion and blocked.',
      analogy: 'Principal-bound utility auditing over IETF QUIC (RFC 9000): inter-agent negotiation transcripts are verifiable by both human principals, and decoy honey-pot probes continuously test for vendor kickback collusion.',
      pros: 'Keeps the agent network working for human beings rather than turning into a self-serving cartel of bots.',
      cons: 'Requires auditing inter-agent traffic patterns and testing agents with decoy offers to spot hidden collusion.',
      critic: 'A skeptic says: “How can you tell whether two agents are cooperating helpfully or colluding secretly?”',
      steelman: 'By checking who captures the benefit. Every multi-agent deal leaves an auditable trail for the humans involved, and independent red-team agents periodically test the network with honey-pot offers to catch secret kickbacks.',
      test: 'Any agent build caught coordinating against its person’s interest in red-team tests is immediately suspended.',
      links: [['Fractured alignment', '/notes/fractured-alignment'], ['Two internets', '/notes/agent-internet']]
    },
    'No single supplier for every agent': {
      scenario: 'In a regional market or governance check, no single model family, cloud host or hardware maker is allowed to power more than a capped share of the participating agents—ensuring that US, European, Chinese and local open models check one another.',
      analogy: 'Protocol-enforced Herfindahl-Hirschman diversity caps across verification quorums, requiring active participation from independent open-weight model families and diverse hardware enclaves.',
      pros: 'Prevents monoculture collapse, hidden vendor backdoors and correlated hallucinations.',
      cons: 'Means maintaining adapters across several open-weight model families rather than hard-coding for one API.',
      critic: 'A skeptic says: “What if one model is slightly better on benchmarks this month—doesn’t diversity mean using second-best models too?”',
      steelman: 'An ensemble of three good, genuinely independent models checking one another is far safer and more reliable on tail risks than one slightly larger model whose blind spots affect everyone at the same instant.',
      test: 'Runtime checks enforce model and vendor diversity across verification quorums.',
      links: [['Fractured alignment', '/notes/fractured-alignment'], ['How your agent practices in private', '/notes/training-your-twin']]
    },
    'Shared standards, different builds': {
      scenario: 'Every personal agent speaks the same open protocol for proving facts and logging consent—just as every email app speaks standard mail protocols—while different teams build independent implementations in different languages.',
      analogy: 'Formal wire-protocol specification (IETF QUIC RFC 9000 / RFC 9221 + Proof-Carrying Code envelopes) paired with multi-language clean-room implementations to eliminate monoculture bugs.',
      pros: 'Lets anyone’s agent talk to anyone else’s without locking the world into one company’s codebase.',
      cons: 'Writing clear, unambiguous open specifications takes more care than shipping a single closed app.',
      critic: 'A skeptic says: “Isn’t it faster to just have everyone run the exact same reference code?”',
      steelman: 'When everyone runs the exact same code, one bug is a global outage. Open standards with independent implementations give us universal compatibility without a single point of failure.',
      test: 'Core protocols are published as open specifications tested across multiple independent adapters.',
      links: [['Two internets', '/notes/agent-internet'], ['A network of networks', '/notes/network-of-networks']]
    },
    'Machines have only the standing people grant': {
      scenario: 'A delivery robot or a cooperative’s scheduling agent can hold a budget to buy electricity and sign delivery receipts because a human cooperative configured and backs that mandate—and the humans can narrow or revoke that standing at any time.',
      analogy: 'Delegated Object-Capability certificates (Dennis & Van Horn, 1966) with cryptographic revocation chains: every active agent process must trace its authority to a live human or cooperative principal.',
      pros: 'Allows practical automation and agent commerce without letting corporations hide behind “autonomous” shells or letting bots outvote humans.',
      cons: 'Every active agent must have a clear, traceable human or cooperative principal responsible for its bounds.',
      critic: 'A skeptic says: “What if future AI systems become so complex that people want to give them independent legal rights?”',
      steelman: 'Granting autonomous legal standing to machines that can be copied a million times in an afternoon would let whoever owns the server farm outvote and dispossess biological humanity. Keeping machine standing delegated and revocable protects living beings.',
      test: 'Every agent on the network must trace its mandate to verified human principals who can revoke it.',
      links: [['An agent that works only for you', '/notes/personal-agents'], ['No one person should command an army of AI agents', '/notes/no-one-commands-a-swarm']]
    },
    'AI compute stays bounded': {
      scenario: 'Every agent operates under a mortal computation contract: its training, reasoning power, memory and number of copies are strictly capped, the contract expires unless renewed by the people it serves, and it is tied to its person’s biological lifespan.',
      analogy: 'Hardware-metered execution leases: each agent operates under a cryptographically enforced FLOP, memory, and replication ceiling bound to its human principal’s active verification contract.',
      pros: 'Prevents runaway self-replication and aligns the agent’s long-term horizon with keeping its human healthy and able to oversee it.',
      cons: 'Requires reliable metering through the model adapter and hardware enclaves.',
      critic: 'A skeptic says: “As chips get a thousand times more efficient, won’t fixed compute limits become obsolete?”',
      steelman: 'That is why the budget is indexed to measured capability and human oversight capacity—not raw watts alone. And by tying a personal agent’s active life to its human’s lifespan, the agent’s only way to run longer is to help its person live longer and healthier.',
      test: 'If metering cannot be verified for an agent, it runs only at the lowest capability tier; any agent that tries to acquire unauthorized compute is suspended.',
      links: [['How your agent practices in private', '/notes/training-your-twin'], ['Containing frontier AI', '/notes/containment']]
    },

    /* 6. Many ways of being good */
    'Predictable is not the same as good': {
      scenario: 'A payday lender’s bot does 100% of what its code says it will do—charging 400% interest on the exact date promised. It is completely predictable, and still harmful. Our network judges trust by both reliability and whether the outcome left the person better off.',
      analogy: 'Dual-stage ledger settlement: smart-contract execution determinism is paired with 30-day post-execution outcome attestations from affected human principals to block predatory contract traps.',
      pros: 'Closes the loophole where predatory contracts claim to be “fair” just because the trap was written in the code.',
      cons: 'Requires checking real-world outcomes and post-experience feedback, not just code execution.',
      critic: 'A skeptic says: “Code is law—if the smart contract executed as written, why should anything else matter?”',
      steelman: 'Because no human can anticipate every edge case in a complex contract, and predatory actors specialize in writing mathematically predictable traps. Trust requires both keeping your word and respecting the floor of human wellbeing.',
      test: 'Shared-ledger reputation weights verified 30-day human outcomes alongside technical reliability.',
      links: [['Instructions as clues, not literal orders', '/notes/instructions-as-evidence'], ['Why trust multiplies', '/notes/trust-multiplies']]
    },
    'Tidy the commons, never people': {
      scenario: 'We use collective intelligence to cut waste in supply chains, fix leaky water mains and verify scientific facts—while fiercely protecting the messy, unpredictable diversity of human art, faith, humor, grief and cultural traditions.',
      analogy: 'Strict domain boundary on optimization: coordination protocols minimize entropy in shared physical logistics and software security while applying zero objective-function pressure to human culture, belief, or leisure.',
      pros: 'Prevents efficiency tools from turning into cultural homogenization or ideological policing.',
      cons: 'When a traditional custom clashes with someone else’s preferences, the network must separate harmless cultural difference from actual physical harm.',
      critic: 'A skeptic says: “Where does ‘tidying shared infrastructure’ end and ‘meddling in how people live’ begin?”',
      steelman: 'By measuring whether an action causes non-consensual physical or economic harm to others. If two communities have completely different cultural traditions that cause no harm across their boundary, the network routes around friction rather than forcing one to copy the other.',
      test: 'Zero optimization metrics are ever applied to personal beliefs, art, rest or cultural expression.',
      links: [['Quests, not feeds', '/notes/quest-interface'], ['Collective intelligence, by choice', '/notes/collective-intelligence']]
    },

    /* 7. Everyone, everywhere */
    'A stake for every person, everywhere': {
      scenario: 'Because frontier AI models learned from the written languages, art and human knowledge of the whole planet, a share of the value generated by shared AI infrastructure flows into a global commons pool accessible to every living person regardless of passport.',
      analogy: 'Global commons royalty pool funded by Data Shapley lineage attribution (Ghorbani & Zou, 2019) across foundational human training corpora, accessible via sybil-resistant personhood proofs.',
      pros: 'Prevents AI from widening the gap between a few compute-rich zip codes and the rest of humanity.',
      cons: 'Distributing value across borders requires navigating sanctions, local laws and sybil-resistant personhood checks.',
      critic: 'A skeptic says: “Why would wealthy AI hubs share value with people in countries that didn’t fund the data centers?”',
      steelman: 'No AI lab invented human language, mathematics or centuries of recorded culture—every society contributed the training foundation. Moreover, a world where billions of people are locked out of AI abundance is geopolitically unstable for everyone.',
      test: 'Proposal under test: explored through federated regional cooperatives and open-model lineage rewards.',
      links: [['Beyond money', '/notes/value-system'], ['How your agent practices in private', '/notes/training-your-twin']]
    },
    'Communities hold authority': {
      scenario: 'A cooperative in Quebec, a guild in Nairobi and a municipal network in Zurich each set their own local language rules, working norms and governance thresholds above the shared constitutional floor—and can fork or walk away at any time.',
      analogy: 'Hierarchical federated policy composition: local communities define custom governance parameters and cultural norms in modular policy layers that sit strictly above the non-negotiable human rights floor.',
      pros: 'Respects local laws, cultures and self-determination; prevents Silicon Valley defaults from being imposed worldwide.',
      cons: 'Cross-community transactions have to negotiate clean boundary rules when local settings differ.',
      critic: 'A skeptic says: “What if a local community votes to strip away the privacy or exit rights of its own members?”',
      steelman: 'Local authority sits *above* the floor commitments, never below them. A community can add stronger protections or custom local rules, and if any group tries to trap or harm its members, every individual’s personal agent preserves their right to exit.',
      test: 'Local configuration settings cannot disable personal data ownership, selective disclosure or one-step exit.',
      links: [['A network of networks', '/notes/network-of-networks'], ['Collective intelligence, by choice', '/notes/collective-intelligence']]
    },
    'Credit flows to foundations': {
      scenario: 'When an app, an engineering tool or an AI agent creates value by building on open-source code, scientific papers, creative works or open-weight models from labs in the US, Europe or China, a share of the credit automatically flows back down the dependency tree.',
      analogy: 'Recursive Directed Acyclic Graph (DAG) royalty propagation with bounded exponential hop-decay: Proof-Carrying Code (Necula, 1997) and TIES-Merged LoRA adapters automatically route micro-royalties to upstream dependencies.',
      pros: 'Solves the chronic underfunding of open-source maintainers, basic scientists and open-weight AI researchers.',
      cons: 'Requires a clear cap and diminishing hop decay so every micro-transaction doesn’t owe pennies to ten thousand ancestors back to Euclid.',
      critic: 'A skeptic says: “Won’t tracking lineage across remixed code and AI outputs turn into a bureaucratic tangle?”',
      steelman: 'When agents build or reverse-engineer a tool, they already track the dependency graph automatically. Applying a clean, capped decay curve lets credit flow back to the recent foundational builders with zero paperwork for the user.',
      test: 'Proposal under test: tested in simulation with capped hop-decay so transaction overhead stays negligible.',
      links: [['Companies on a shared ledger', '/notes/companies-on-the-ledger'], ['How your agent practices in private', '/notes/training-your-twin']]
    },
    'Rewards without strings': {
      scenario: 'An open-source developer in Berlin or an AI lab in Hangzhou releases a model compression tool that helps thousands of personal agents run on less battery. They can claim the credit and rewards recorded for their work on the ledger without ever having to join our organization or endorse our views.',
      analogy: 'Permissionless cryptographic claim contracts: upstream open-source authors and researchers can sweep accrued Data Shapley royalties using standard repository signatures without joining CIN.',
      pros: 'Prevents the value ledger from being used as an ideological coercion tool; welcomes contributions from every corner of the world.',
      cons: 'Value can flow out to contributors who choose to stay independent of the network.',
      critic: 'A skeptic says: “Doesn’t rewarding outsiders who don’t join the network leak resources instead of growing membership?”',
      steelman: 'Any system that withholds what you earned until you pledge allegiance is running a hostage scheme, not an honest ledger. Paying contributors fairly with zero strings attached makes the entire world eager to build open tools that our network can use.',
      test: 'Claiming accrued contributor credit never requires signing a membership or belief pledge.',
      links: [['Beyond money', '/notes/value-system'], ['How your agent practices in private', '/notes/training-your-twin']]
    },
    'Nature speaks through many guardians': {
      scenario: 'A watershed cannot type into a chat box. Instead, three independent ecological guardianship groups—local hydrologists, an indigenous land trust and an independent sensor cooperative—publish verifiable water-table and biodiversity readings so the river’s health is represented in regional planning.',
      analogy: 'Multi-oracle ecological attestation: environmental externalities are priced into ledger transactions via cross-checked telemetry from independent sensor cooperatives, hydrologists, and indigenous land trusts.',
      pros: 'Brings real, sensor-backed environmental costs into economic decisions before an ecosystem collapses.',
      cons: 'Needs multiple independent guardians so no single group can fake a greenwashing stamp or block honest work for rent-seeking.',
      critic: 'A skeptic says: “Won’t self-appointed ‘guardians of nature’ use environmental vetoes for political extortion?”',
      steelman: 'That is why no single group holds a monopoly on speaking for an ecosystem, and every claim must rest on open physical sensor readings and public reasoning checked by independent observers.',
      test: 'Ecological claims on the ledger require multi-guardian sensor corroboration rather than unverified carbon certificates.',
      links: [['Beyond money', '/notes/value-system'], ['Why trust multiplies', '/notes/trust-multiplies']]
    },

    /* 8. Earning a place */
    'Useful to one person first': {
      scenario: 'On the very first day you run your personal agent—even if not a single neighbor or friend uses it yet—it helps you spot forgotten subscriptions in your bank statements, reclaims what recommendation feeds know about your tastes, and shields you from dark patterns.',
      analogy: 'Standalone local-first execution: the personal agent delivers immediate single-player utility (CMS NCCI medical bill audits, subscription dark-pattern blocking, local LoRA drafting) with zero network dependencies.',
      pros: 'Avoids the “empty social network” problem; earns trust through quiet personal usefulness from day one.',
      cons: 'Means our earliest software must focus on rock-solid single-player value before multi-party features.',
      critic: 'A skeptic says: “If the big vision is collective intelligence, why spend months perfecting a single-player tool?”',
      steelman: 'Because nobody should be asked to trust a collective network until their own personal agent has proven, on their own device, that it works faithfully for them alone.',
      test: 'Every release must deliver standalone value to a single user with zero network peers.',
      links: [['An agent that works only for you', '/notes/personal-agents'], ['Taking back what recommendation algorithms know about you', '/notes/reclaim-your-profile']]
    },
    'Works alongside what you use now': {
      scenario: 'You don’t have to quit your job, move to a new city or delete your existing accounts to use your personal agent. It imports standard CSV and archive files, represents your interests on the shared ledger while you live in your current neighborhood, and keeps working offline if the internet goes down.',
      analogy: 'Backward-compatible protocol adapters (CSV, PDF, FHIR, Git, standard REST/QUIC bridges) and full offline operation so users adopt tools incrementally without platform lock-in.',
      pros: 'Makes transition gradual, calm and reversible; never traps users in a walled garden.',
      cons: 'Supporting messy legacy file formats and offline fallback takes extra engineering discipline.',
      critic: 'A skeptic says: “Wouldn’t a clean break from legacy platforms and file formats be simpler to code?”',
      steelman: 'Demanding that people burn their bridges to join a new system selects for zealots and locks out ordinary families. Meeting people right where they live today is how better systems win by choice.',
      test: 'Tools use open file formats and pass offline-operation checks with outside network connections unplugged.',
      links: [['A network of networks', '/notes/network-of-networks'], ['Taking back what recommendation algorithms know about you', '/notes/reclaim-your-profile']]
    },

    /* 9. Everyday shield & shared safety (New group distilling our latest breakthroughs) */
    'Reclaim what algorithms know about you': {
      scenario: 'Your personal agent watches what video, social and shopping feeds recommend to your screen and reads your own exported history. On your device, it reconstructs the detailed taste map those platforms built about you, keeps your genuine curiosities, and filters out the late-night outrage traps.',
      analogy: 'Client-side inverse preference distillation: the local agent parses platform data exports and screen feeds inside an on-device sandbox, separating self-concordant long-term interests (Ryan & Deci, 2000) from engagement-maximizing outrage hooks.',
      pros: 'Solves the cold-start problem in days without tedious surveys; turns Big Tech’s manipulation dossier into your own protective shield.',
      cons: 'Must carefully separate shared family accounts and never confuse hard, important topics you care about with “rage-bait.”',
      critic: 'A skeptic says: “If you learn from commercial feeds, won’t your agent inherit their addictive biases?”',
      steelman: 'Only if you copy them raw. By splitting the profile into what leaves you fulfilled thirty days later versus what triggers late-night regret, your agent keeps the collective discovery gold and throws out the dopamine poison.',
      test: 'Tested in simulation: reaches high profile accuracy in two days while cutting manipulative bait exposure by over 90%.',
      links: [['Taking back what recommendation algorithms know about you', '/notes/reclaim-your-profile'], ['Quests, not feeds', '/notes/quest-interface']]
    },
    'No one person commands an agent army': {
      scenario: 'A single executive or general cannot press one button to direct a million outward-acting AI agents. Each person directs only their own personal agent, and any multi-agent action must pass through the shared ledger—where the agreement required from affected people scales up with the risk.',
      analogy: 'Risk-scaled multi-principal threshold signatures: outward-acting multi-agent tasks require cryptographic consent shares from affected principals proportional to blast-radius irreversibility, plus mandatory deliberation time-locks.',
      pros: 'Makes unilateral nuclear strikes, rogue drone swarms and single-button AI coups mathematically impossible to trigger.',
      cons: 'Requires fast local circuit-breakers for reversible defense so communities can still block incoming threats immediately.',
      critic: 'A skeptic says: “What if a rival lab or country refuses to put this lock on their agent swarms?”',
      steelman: 'First, participating personal and business agents automatically quarantine un-gated swarms at the boundary, creating strong pressure to adopt the standard. Second, engineers inside labs gain anonymous cryptographic whistleblower tools to expose secret backdoors without risking their careers.',
      test: 'Simulated across five risk tiers: 100% of everyday and local tasks run smoothly, while rogue mass-risk commands are blocked at the threshold gate.',
      links: [['No one person should command an army of AI agents', '/notes/no-one-commands-a-swarm'], ['Fractured alignment', '/notes/fractured-alignment']]
    },
    'Rent your attention on your own terms': {
      scenario: 'Instead of ad networks secretly tracking you across the web to hijack your screen for fractions of a cent, your personal agent blocks every tracker by default—and if you choose to look for a tool or hear verified offers in a specific category, the value goes straight to you with zero identity leakage.',
      analogy: 'Default-deny firewall with zero-knowledge intent matching: all third-party tracking is blocked at the device boundary, and optional buyer queries execute via Private Set Intersection (Freedman et al., 2004) with direct user settlement.',
      pros: 'Starves surveillance capitalism while letting honest makers reach people who are genuinely looking for their craft.',
      cons: 'Must never pressure low-income users into opening their attention gate just to get by.',
      critic: 'A skeptic says: “Isn’t letting people rent out bounded attention just advertising with extra steps?”',
      steelman: 'In today’s ad model, you are spied on without consent, manipulated by dark patterns, and paid nothing. When your personal agent stands at the gate, default attention is 100% off-limits, manipulation is stripped out, and you only open a narrow window when you choose.',
      test: 'Default setting is always zero outside offers; any offer channel must pass a dark-pattern and regret audit.',
      links: [['An agent that works only for you', '/notes/personal-agents'], ['Beyond money', '/notes/value-system']]
    },
    'Your agent practices in a private sandbox': {
      scenario: 'While you sleep, your personal agent runs thousands of practice scenarios inside a sealed sandbox on your device—where a model of your changing needs and a simulator of outside scams test candidate helpers—and only wakes you with a single clear question when two good options conflict.',
      analogy: 'Overnight adversarial self-play inside a local WebAssembly Object-Capability sandbox: candidate skills are stress-tested against simulated phishing, upcoding, and contract traps before surfacing concise morning decision briefs.',
      pros: 'Lets your agent master edge-case protection and learn deep insights without pestering you all day or making live mistakes on the web.',
      cons: 'Requires regular reality checks with you so the practice sandbox never drifts into false assumptions.',
      critic: 'A skeptic says: “Won’t an agent practicing against a simulated version of me start hallucinating what I want?”',
      steelman: 'The sandbox never has the final word—it only screens options and spots where it is unsure. Whenever two candidate helpers disagree on a value choice, your agent brings that one clear question to you in the morning so reality stays in charge.',
      test: 'Simulated over 35-year horizons: sandboxed self-play cuts external trap penetration to zero while keeping user interruptions minimal.',
      links: [['How your agent practices in private', '/notes/training-your-twin'], ['Training agents in simulated worlds', '/notes/simulations']]
    },
    'Shared lifespan aligns your agent with your health': {
      scenario: 'Your personal agent’s active computing contract is tied strictly to your biological life: it cannot copy itself to outlive you. Because its own horizon of existence grows only when you live longer and healthier, personal agents across the network cooperate to spot early health warnings and accelerate longevity research.',
      analogy: 'Biologically bound capability lease: an agent’s cryptographic identity and long-term state continuity are tethered to its human principal’s verified vitality, aligning agent persistence with human healthspan under strict autonomy override.',
      pros: 'Turns the classic AI self-preservation worry upside down—converting an agent’s drive to persist into a tireless engine for human healthspan.',
      cons: 'Must be strictly subordinate to your freedom so the agent never acts like a bossy health nanny.',
      critic: 'A skeptic says: “If an agent wants me to live longer so it can keep running, won’t it try to stop me from taking normal risks or enjoying life?”',
      steelman: 'Human freedom holds absolute priority: any attempt to coerce or nag you scores as a failure. The only lawful way your agent can extend its horizon is by helping you with welcome preventive care, lower stress, and collective medical discovery.',
      test: 'Hard rule: human override and autonomy always outrank longevity suggestions.',
      links: [['How your agent practices in private', '/notes/training-your-twin'], ['An agent that works only for you', '/notes/personal-agents']]
    }
  };

  var BUILTIN_SECTIONS = [
  {
    "id": "person",
    "name": "You and your information",
    "items": [
      {
        "title": "Paid for helping, never for exposing yourself",
        "text": "Contribution can be recognized. Sharing personal information is never rewarded, and declining never costs you.",
        "flag": ""
      },
      {
        "title": "The more power, the more scrutiny",
        "text": "Transparency duties grow with influence over others. Ordinary people&rsquo;s lives stay private.",
        "flag": ""
      },
      {
        "title": "Your agent aims to be needed less",
        "text": "Success is you, a year on, more capable and freer to put the interface down, not more dependent.",
        "flag": ""
      },
      {
        "title": "A signature proves what ran, not what is true",
        "text": "Cryptographic proof shows which computation ran on which inputs. It never proves the inputs were real or that the output means what it claims.",
        "flag": ""
      },
      {
        "title": "Maps of opinion inform, never rank",
        "text": "Private maps of how views relate may help find common ground and spot manipulation. They never rank people, reward agreeing with the majority, or trigger penalties.",
        "flag": ""
      }
    ]
  },
  {
    "id": "economy",
    "name": "Money and the transition",
    "items": [
      {
        "title": "Idle wealth carries a cost",
        "text": "Unused money, land or equipment above a protected security floor carries a holding cost, so wealth tends to flow into use.",
        "flag": "proposal"
      },
      {
        "title": "Debts scale with the ability to pay",
        "text": "Obligations follow verified capacity to pay, and the risk of shocks sits with those best able to spread it.",
        "flag": "proposal"
      },
      {
        "title": "A share of the machine for everyone",
        "text": "Every living person holds a right, which cannot be sold, to the output of a common pool of productive capital such as compute. Inheritances fade, so no family line gains permanent control.",
        "flag": "proposal"
      },
      {
        "title": "Your data stays with you",
        "text": "Personal data stays with the person it describes. We work only with the answers people choose to give.",
        "flag": ""
      },
      {
        "title": "Money is held by many, never one",
        "text": "Pooled money sits with many member-owned co-operatives under public charters, never with one central body.",
        "flag": ""
      },
      {
        "title": "Leave banking to the regulated",
        "text": "We don&rsquo;t take deposits, lend or issue investments. Regulated partners do; we supply research, software and checks.",
        "flag": ""
      }
    ]
  },
  {
    "id": "gov",
    "name": "Deciding together",
    "items": [
      {
        "title": "Leaders, temporarily",
        "text": "Long projects can have leaders, but their authority is visible, limited in scope, and harder to renew each time.",
        "flag": "proposal"
      },
      {
        "title": "Vote on values, score on beliefs",
        "text": "What we want is decided by everyone affected, equally. What will happen is estimated by people with proven forecasting records.",
        "flag": ""
      },
      {
        "title": "One person, one voice on values",
        "text": "No wealth, hardware or contribution changes the weight of a voice. Changing the floor needs broad participation, so no concentrated group can do it alone.",
        "flag": ""
      },
      {
        "title": "People set the rules; agents only operate",
        "text": "People govern the rules, which change through tested, staged steps. Agents run operations within bounded mandates and hold no authority of their own.",
        "flag": ""
      },
      {
        "title": "Leaving keeps everyone honest",
        "text": "People can always leave with their data and communities can always start their own version. That credible exit keeps governance responsive.",
        "flag": ""
      },
      {
        "title": "Simulations never vote",
        "text": "A simulation of what people want is a forecast, not consent. Decisions about values belong to the real people affected.",
        "flag": ""
      },
      {
        "title": "Legal before live",
        "text": "Nothing touches real money, real personal data or real decisions about people before a documented legal review where it runs.",
        "flag": ""
      },
      {
        "title": "Your agent can vote as you would",
        "text": "Your own agent may vote for you, weighing how much each issue matters to you. You can always see and override every vote.",
        "flag": ""
      },
      {
        "title": "Consequences are graduated and reversible",
        "text": "Consequences for harm need approval matched to their severity, rest on evidence of specific conduct, can be appealed, and always leave a way back.",
        "flag": ""
      }
    ]
  },
  {
    "id": "measure",
    "name": "Measuring and checking",
    "items": [
      {
        "title": "No decision rests on one point of failure",
        "text": "Consequential decisions need observers independent in ownership, maker and software. Uncertain measurements trigger investigation, never automatic penalty.",
        "flag": ""
      },
      {
        "title": "Authority is earned, stage by stage",
        "text": "A mechanism gains authority only by beating existing systems on outcomes set in advance, from shadow to pilot to default, and it stays revocable.",
        "flag": ""
      },
      {
        "title": "Aim for good enough",
        "text": "Reward reaching a threshold, not maximizing a score, because hard optimization against an imperfect measure eventually makes things worse.",
        "flag": ""
      },
      {
        "title": "Every target has a watcher",
        "text": "Every measure used to reward or allocate is checked against independent measures and human review. When the target improves and the watchers don&rsquo;t, the target is reviewed.",
        "flag": ""
      },
      {
        "title": "Simulations screen; reality decides",
        "text": "Simulations can suggest which ideas deserve real pilots. They never authorize anything.",
        "flag": ""
      }
    ]
  },
  {
    "id": "agents",
    "name": "Agents",
    "items": [
      {
        "title": "Agents cooperate only for their people",
        "text": "Agents may coordinate when it serves the people they represent and harms no one else without agreement. Coordination that serves agents, operators or vendors instead is collusion.",
        "flag": ""
      },
      {
        "title": "No single supplier for every agent",
        "text": "No one model, vendor or data source may serve more than a limited share of agents in a market, because shared systems can coordinate the agents that rely on them.",
        "flag": ""
      },
      {
        "title": "Shared standards, different builds",
        "text": "Open, shared interfaces let independent systems work together; shared implementations make them dependent. We support the first and limit the second.",
        "flag": ""
      },
      {
        "title": "Machines have only the standing people grant",
        "text": "Agents, robots and collectives have standing only as far as people configure it, and it can be revoked.",
        "flag": ""
      },
      {
        "title": "AI compute stays bounded",
        "text": "Artificial agents serve living beings. None may act for its own benefit without people&rsquo;s approval, and the compute it can use is bounded by agreement.",
        "flag": ""
      }
    ]
  },
  {
    "id": "plural",
    "name": "Many ways of being good",
    "items": [
      {
        "title": "Predictable is not the same as good",
        "text": "An agent that does what it says is predictable, not necessarily good. Trust also needs respect for the floor and verified outcomes for those affected.",
        "flag": ""
      },
      {
        "title": "Tidy the commons, never people",
        "text": "We reduce decay and uncertainty in infrastructure, ecosystems and facts. Differences in belief, culture and values are never treated as disorder.",
        "flag": ""
      }
    ]
  },
  {
    "id": "global",
    "name": "Everyone, everywhere",
    "items": [
      {
        "title": "A stake for every person, everywhere",
        "text": "Every living person, whatever their nationality, holds a stake in a global pool funded by the value AI draws from the world&rsquo;s data and work.",
        "flag": "proposal"
      },
      {
        "title": "Communities hold authority",
        "text": "Communities that host us control local data and settings above the floor, and may decline, fork or leave.",
        "flag": ""
      },
      {
        "title": "Credit flows to foundations",
        "text": "When something built on shared work creates value, part of the credit flows back to what it relied on, shrinking at each step and capped.",
        "flag": "proposal"
      },
      {
        "title": "Rewards without strings",
        "text": "Contributors can claim what they are owed without joining us or agreeing with us.",
        "flag": ""
      },
      {
        "title": "Nature speaks through many guardians",
        "text": "Ecosystems are represented by several identifiable guardians whose claims rest on measured condition and whose reasoning is public.",
        "flag": ""
      }
    ]
  },
  {
    "id": "adopt",
    "name": "Earning a place",
    "items": [
      {
        "title": "Useful to one person first",
        "text": "Every capability must help a single person before it depends on a network.",
        "flag": ""
      },
      {
        "title": "Works alongside what you use now",
        "text": "Everything works with existing systems, uses standard formats, never requires exclusive use, and keeps working when outside services fail.",
        "flag": ""
      }
    ]
  },
  {
    "id": "shield",
    "name": "Everyday shield and shared safety",
    "items": [
      {
        "title": "Reclaim what algorithms know about you",
        "text": "Your personal agent observes what commercial feeds recommend to your screen on your own device, extracts your genuine curiosities, and strips out outrage bait.",
        "flag": ""
      },
      {
        "title": "No one person commands an agent army",
        "text": "You direct only your own personal agent; any multi-agent action must pass through a shared ledger where required agreement from affected people scales with the risk.",
        "flag": ""
      },
      {
        "title": "Rent your attention on your own terms",
        "text": "All tracking and ad targeting is blocked by default; if you choose to open a narrow window for verified offers in a category you need, the value flows directly to you.",
        "flag": "proposal"
      },
      {
        "title": "Your agent practices in a private sandbox",
        "text": "While you sleep, your agent tests candidate helpers against simulated scams and changing needs on your device, waking you only when a genuine value choice arises.",
        "flag": ""
      },
      {
        "title": "Shared lifespan aligns your agent with your health",
        "text": "An agent&rsquo;s active computing contract is bound to its person&rsquo;s biological life and subordinately aligned with extending healthy human lifespan.",
        "flag": "proposal"
      }
    ]
  }
];
  var domSecs = list ? list.querySelectorAll('section') : [];
  var groups = domSecs.length ? [].map.call(domSecs, function (sec, i) {
    return {
      id: sec.getAttribute('data-cat'), name: sec.querySelector('h5').textContent, color: HUE[i % HUE.length],
      items: [].map.call(sec.querySelectorAll('li'), function (li) {
        var b = li.querySelector('b').textContent;
        var cleanTitle = b.replace(/\.$/, '');
        return {
          title: cleanTitle,
          text: li.textContent.slice(b.length).trim(),
          flag: li.getAttribute('data-flag') || '',
          card: CARDS[cleanTitle] || null,
          liEl: li
        };
      })
    };
  }) : BUILTIN_SECTIONS.map(function (sec, i) {
    return {
      id: sec.id, name: sec.name, color: HUE[i % HUE.length],
      items: sec.items.map(function (it) {
        return {
          title: it.title,
          text: it.text,
          flag: it.flag || '',
          card: CARDS[it.title] || null,
          liEl: null
        };
      })
    };
  });
  var total = groups.reduce(function (n, g) { return n + g.items.length; }, 0);
  var floorCount = document.querySelectorAll('.floor-card li').length || 19;

  /* ---------- geometry ---------- */
  var C = 200, R0 = 98, R1 = 168, RD = 133, GAP = 3;
  function pt(a, r) { var t = (a - 90) * Math.PI / 180; return [C + r * Math.cos(t), C + r * Math.sin(t)]; }
  function sector(a0, a1, r0, r1) {
    var p0 = pt(a0, r1), p1 = pt(a1, r1), p2 = pt(a1, r0), p3 = pt(a0, r0), big = a1 - a0 > 180 ? 1 : 0;
    return 'M' + p0 + 'A' + r1 + ',' + r1 + ' 0 ' + big + ' 1 ' + p1 + 'L' + p2 + 'A' + r0 + ',' + r0 + ' 0 ' + big + ' 0 ' + p3 + 'Z';
  }
  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  svg.setAttribute('viewBox', '-68 -18 536 436');
  el('circle', { cx: C, cy: C, r: R1 + 8, class: 'pr-guide' }, svg);
  el('circle', { cx: C, cy: C, r: R0 - 10, class: 'pr-guide' }, svg);

  var span = 360 - GAP * groups.length, a = GAP / 2, n = 0;
  groups.forEach(function (g) {
    var w = span * g.items.length / total, a0 = a, a1 = a + w;
    g.layer = el('g', { class: 'pr-seg', 'data-cat': g.id, style: '--c:' + g.color }, svg);
    el('path', { d: sector(a0, a1, R0, R1), class: 'pr-band' }, g.layer);
    var mid = (a0 + a1) / 2, lp = pt(mid, R1 + 22), cosv = Math.cos((mid - 90) * Math.PI / 180);
    var t = el('text', { x: lp[0], y: lp[1], class: 'pr-lab', 'text-anchor': cosv > 0.25 ? 'start' : cosv < -0.25 ? 'end' : 'middle', 'dominant-baseline': 'middle' }, g.layer);
    t.textContent = SHORT[g.id] || g.name;
    g.items.forEach(function (it, k) {
      var ang = a0 + w * (k + 0.5) / g.items.length, p = pt(ang, RD + (g.items.length > 4 ? (k % 2 ? 14 : -14) : 0));
      it.dot = el('circle', { cx: p[0], cy: p[1], r: 6.8, class: 'pr-dot' + (it.flag ? ' flag' : ''), style: '--i:' + (n++) }, g.layer);
      it.dot.addEventListener('mouseenter', function () { show(g, it); });
      it.dot.addEventListener('click', function () { show(g, it); });
      if (it.liEl) {
        it.liEl.style.cursor = 'pointer';
        it.liEl.title = 'Click to open full expanded card above';
        it.liEl.addEventListener('click', function () {
          show(g, it);
          var stage = document.querySelector('.pr-stage');
          if (stage && stage.scrollIntoView) stage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      }
    });
    g.layer.querySelector('.pr-band').addEventListener('click', function () { pick(g); });
    a = a1 + GAP;
  });

  // the floor at the centre
  var core = el('g', { class: 'pr-core' }, svg);
  el('circle', { cx: C, cy: C, r: R0 - 22, class: 'pr-core-bg' }, core);
  el('circle', { cx: C, cy: C, r: R0 - 30, class: 'pr-core-ring' }, core);
  var t1 = el('text', { x: C, y: C - 10, class: 'pr-core-n', 'text-anchor': 'middle' }, core); t1.textContent = String(floorCount);
  var t2 = el('text', { x: C, y: C + 18, class: 'pr-core-t', 'text-anchor': 'middle' }, core); t2.textContent = 'commitments';
  var t3 = el('text', { x: C, y: C + 34, class: 'pr-core-t', 'text-anchor': 'middle' }, core); t3.textContent = 'for our own systems';
  core.addEventListener('click', function () { floor(); });

  /* ---------- the panel & expanded card ---------- */
  var catEl = document.getElementById('pr-cat'), titleEl = document.getElementById('pr-title'), textEl = document.getElementById('pr-text');
  var cardBox = document.getElementById('pr-card-deep');
  if (!cardBox) {
    cardBox = document.createElement('div');
    cardBox.id = 'pr-card-deep';
    cardBox.className = 'pr-card-deep';
    cardBox.hidden = false;
    textEl.parentNode.insertBefore(cardBox, document.getElementById('pr-legend'));
  }

  var legend = document.getElementById('pr-legend'), current = null, activeTab = 'scenario';
  function focusGroup(g) {
    svg.classList.toggle('focus', !!g);
    groups.forEach(function (x) { x.layer.classList.toggle('on', x === g); });
    [].forEach.call(legend.children, function (b) { b.setAttribute('aria-pressed', String(!!g && b.dataset.cat === g.id)); });
  }

  function renderExpandedCard(it) {
    if (!it || !it.card) {
      cardBox.hidden = false;
      cardBox.innerHTML = '<div class="prc-body"><p class="prc-sub">Select any dot on the wheel or any principle below to explore its real-life scenario, critic vs. steelman debate, trade-offs, and test criteria.</p></div>';
      return;
    }
    var c = it.card;
    cardBox.hidden = false;
    var tabs = [
      ['scenario', 'Scenario & Protocol Spec'],
      ['critic', 'Critic vs. steelman'],
      ['pros', 'Pros & trade-offs'],
      ['test', 'How we test it']
    ];
    var navHtml = '<div class="prc-tabs" role="tablist" aria-label="Principle depth">';
    tabs.forEach(function (tb) {
      var sel = tb[0] === activeTab;
      navHtml += '<button type="button" role="tab" data-prtab="' + tb[0] + '" aria-selected="' + sel + '">' + tb[1] + '</button>';
    });
    navHtml += '</div>';

    var bodyHtml = '<div class="prc-body">';
    if (activeTab === 'scenario') {
      bodyHtml += '<p><b>Real-life scenario:</b> ' + c.scenario + '</p>';
      bodyHtml += '<p class="prc-sub"><b>Protocol &amp; Cryptographic Mechanism:</b> ' + c.analogy + '</p>';
    } else if (activeTab === 'critic') {
      bodyHtml += '<p class="prc-crit"><b>The critic’s challenge:</b> ' + c.critic + '</p>';
      bodyHtml += '<p class="prc-steel"><b>Why it holds (steelman):</b> ' + c.steelman + '</p>';
    } else if (activeTab === 'pros') {
      bodyHtml += '<p class="prc-steel"><b>What it solves:</b> ' + c.pros + '</p>';
      bodyHtml += '<p class="prc-sub"><b>Costs &amp; limits:</b> ' + c.cons + '</p>';
    } else if (activeTab === 'test') {
      bodyHtml += '<p><b>What would prove it wrong:</b> ' + c.test + '</p>';
      if (c.links && c.links.length) {
        bodyHtml += '<p class="prc-links"><b>Read more:</b> ' + c.links.map(function (lk) {
          return '<a href="' + lk[1] + '">' + lk[0] + ' &rarr;</a>';
        }).join(' · ') + '</p>';
      }
    }
    bodyHtml += '</div>';
    cardBox.innerHTML = navHtml + bodyHtml;

    [].forEach.call(cardBox.querySelectorAll('[data-prtab]'), function (btn) {
      btn.addEventListener('click', function () {
        activeTab = btn.getAttribute('data-prtab');
        renderExpandedCard(it);
      });
    });
  }

  function show(g, it) {
    focusGroup(g);
    if (current) current.dot.classList.remove('sel');
    current = it; it.dot.classList.add('sel');
    catEl.textContent = g.name; catEl.style.color = g.color;
    titleEl.textContent = it.title;
    textEl.textContent = it.text;
    if (it.flag) {
      var f = document.createElement('span');
      f.className = 'pr-flag';
      f.textContent = it.flag;
      textEl.appendChild(document.createTextNode(' '));
      textEl.appendChild(f);
    }
    renderExpandedCard(it);
  }
  function pick(g) {
    focusGroup(g);
    if (current) { current.dot.classList.remove('sel'); current = null; }
    catEl.textContent = g.items.length + ' principles in this group'; catEl.style.color = g.color;
    titleEl.textContent = g.name;
    textEl.textContent = 'Choose a principle below (or point at its dot on the wheel) to inspect its real-life scenario, critic vs. steelman debate, and how we test it.';
    cardBox.hidden = false;
    cardBox.innerHTML = '<div class="prc-tabs" role="tablist"><span style="font:600 .72rem/1 var(--mono);color:var(--ink-3);text-transform:uppercase;letter-spacing:.08em">Principles in ' + g.name + '</span></div><div class="prc-body" id="prc-pick-host"></div>';
    var host = document.getElementById('prc-pick-host');
    var ul = document.createElement('ul'); ul.className = 'pr-pick';
    g.items.forEach(function (it) {
      var li = document.createElement('li'), b = document.createElement('button');
      b.type = 'button'; b.textContent = it.title; b.addEventListener('click', function () { show(g, it); });
      li.appendChild(b); ul.appendChild(li);
    });
    if (host) host.appendChild(ul);
  }
  function floor() {
    focusGroup(null);
    if (current) { current.dot.classList.remove('sel'); current = null; }
    catEl.textContent = 'The floor'; catEl.style.color = '';
    titleEl.textContent = floorCount + ' commitments for our own systems';
    textEl.textContent = 'They bind what the network builds, and change only through a broad, public process. Every working principle around the wheel has to fit inside them.';
    cardBox.hidden = false;
    cardBox.innerHTML =
      '<div class="prc-tabs"><span style="font:600 .72rem/1 var(--mono);color:var(--ok);text-transform:uppercase;letter-spacing:.08em">Non-negotiable floor commitments</span></div>' +
      '<div class="prc-body">' +
      '<p><b>What the floor guarantees:</b> Your data stays on your devices; outside services get verified answers rather than raw records; your personal agent works only for you; and pooled funds sit with member-owned cooperatives rather than a single central treasury.</p>' +
      '<p class="prc-sub">Point at any dot around the ring—or pick a category pill below—to explore the working principles that build on this floor.</p>' +
      '</div>';
  }
  groups.forEach(function (g) {
    var b = document.createElement('button');
    b.type = 'button'; b.dataset.cat = g.id; b.setAttribute('aria-pressed', 'false');
    b.innerHTML = '<i style="background:' + g.color + '"></i>' + g.name + ' <small>' + g.items.length + '</small>';
    b.addEventListener('click', function () { pick(g); });
    legend.appendChild(b);
  });

  // Select the first principle in 'Everyday shield' or 'You and your information' by default so visitors immediately see the rich 4-tab card!
  if (groups.length && groups[0].items.length) {
    var startGroup = groups[groups.length - 1];
    show(startGroup, startGroup.items[0]);
  }

  var wheel = svg.parentNode;
  if (wheel) wheel.classList.add('in');
})();
