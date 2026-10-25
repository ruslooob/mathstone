# Domain Docs

This project uses a single-context layout.

## Before exploring

- Read GLOSSARY.md at the project root.
- Read relevant decisions under docs/adr/.

If these documents do not exist, proceed silently.
The domain-modeling skill creates them when terms or decisions are resolved.

## File structure

- GLOSSARY.md: domain terms shared across the project.
- docs/adr/NNNN-<decision-slug>.md: architectural decisions.

## Vocabulary

Use the glossary's terms in issue titles, proposals, hypotheses, and tests.
Respect any synonyms it explicitly avoids.

If a needed concept is missing, check whether the project already uses
another term. Record genuine gaps for domain-modeling.

## ADR conflicts

If a proposal contradicts an existing ADR, identify the ADR explicitly
and explain why the decision should be reopened.
