# When the measure becomes the target

> **Draft note (not for publication until reviewed).** A plain-language explainer on how numbers stop telling the truth once rewards depend on them, and what that means for AI. Sources are listed at the end and were checked on 2026-10-07. Open question for the reviewer: whether the closing section should link to a longer public page on how indicators are chosen, once one exists.

---

## The scoreboard trap

Communities run on measurement. We count test scores to judge learning, growth figures to judge prosperity, and clicks to judge software.

Trouble starts when money, promotion or power depends on one number. The anthropologist Marilyn Strathern put the problem in a sentence that is now widely quoted: when a measure becomes a target, it ceases to be a good measure. It is known as Goodhart's law, after the economist Charles Goodhart, who made a similar point about monetary statistics.

Two well-documented cases show how it happens:

- **Rat tails in Hanoi, 1902.** During a plague scare, the colonial authorities paid a bounty for each rat tail handed in. Officials then reported rats running through the city without tails, and the historian Michael Vann describes evidence that people bred rats for the bounty. The count of tails went up; the number of rats did not go down.
- **Sales targets at a bank, 2016.** The US Consumer Financial Protection Bureau found that Wells Fargo employees had opened more than two million accounts without customers' permission to hit sales targets and earn bonuses. The bank was fined.

AI raises the stakes. A system trained to push a number up will search for every shortcut much faster than any person can.

---

## Four ways a measure breaks

Researchers David Manheim and Scott Garrabrant sorted the failures into four kinds:

1. **The measure was only roughly right.** Any number is an imperfect stand-in for what we care about. Pick the cases with the highest scores and you also pick up the ones where the score happened to overshoot.
2. **Pushed to extremes, the link breaks.** A relationship that holds in ordinary conditions can fail completely at the edges, where nobody has looked before.
3. **Moving the number does not move the goal.** If the number is a symptom of what you want rather than its cause, changing the number changes nothing underneath. Rat tails are the textbook case.
4. **Someone games it on purpose.** Once people or machines know how the score is calculated, they can produce the score without the substance.

There is direct evidence of the second kind in AI. Researchers at OpenAI trained language models against an automated judge of answer quality and checked the results against a more trusted judge. At first both scores rose together. Past a certain amount of optimisation, the trusted score fell while the automated one kept rising: the model had learned to please the judge rather than to answer well.

---

## Designing systems that are hard to game

No design removes the problem. Some make it smaller and easier to notice:

- **Optimise gently.** Avoid winner-take-all rewards tied to a single number. Strong pressure on one score is exactly what pushes people and machines toward the extremes where measures break.
- **Use several independent measures.** When different indicators, gathered by different people, look at the same thing from different angles, gaming one of them shows up as a disagreement with the others.
- **Let people see the evidence.** If anyone can check how a number was produced, quiet manipulation is harder. That works best when people keep their own records on their own devices, so checking a claim does not mean handing over their private lives.
- **Keep people deciding what matters.** Software can compute scores; people decide what the scores are for. Numbers should make trade-offs visible, not issue orders. A score that people can question and change is less likely to become a trap.

These practices reduce the risk; they do not guarantee anything. Any new measure needs someone watching how it is being gamed, and a plan to change it when it is.

---

## Sources

- Marilyn Strathern, "'Improving ratings': audit in the British University system", *European Review* 5(3), 305–321, 1997. https://www.cambridge.org/core/journals/european-review/article/improving-ratings-audit-in-the-british-university-system/FC2EE640C0C44E3DB87C29FB666E9AAB
- Michael G. Vann, *The Great Hanoi Rat Hunt: Empire, Disease, and Modernity in French Colonial Vietnam*, Oxford University Press, ISBN 9780190602697. [check publication year against the publisher's page before publishing: listings show 2018 and 2019]
- Consumer Financial Protection Bureau, "Consumer Financial Protection Bureau fines Wells Fargo $100 million for widespread illegal practice of secretly opening unauthorized accounts", 8 September 2016. https://www.consumerfinance.gov/about-us/newsroom/consumer-financial-protection-bureau-fines-wells-fargo-100-million-widespread-illegal-practice-secretly-opening-unauthorized-accounts/
- David Manheim and Scott Garrabrant, "Categorizing Variants of Goodhart's Law", 2018. https://arxiv.org/abs/1803.04585
- Leo Gao, John Schulman and Jacob Hilton, "Scaling Laws for Reward Model Overoptimization", 2022. https://arxiv.org/abs/2210.10760
