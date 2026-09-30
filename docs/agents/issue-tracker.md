# Issue tracker: Local Markdown

Issues and specifications live inside this project under `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`.
- The specification is `.scratch/<feature-slug>/spec.md`.
- Implementation tickets are separate files under `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`.
- Record the triage label in a `Status:` line near the top, using `triage-labels.md`.
- Append comments and conversation history under `## Comments`.

## Publishing and fetching

When a skill says to publish to the tracker, create or update the relevant local Markdown specification or ticket.
When fetching a ticket, read its referenced file.
The Pac Mano PRD is `.scratch/pac-mano/spec.md`.
