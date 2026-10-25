# Issue tracker: GitHub

Issues and specs live in https://github.com/ruslooob/mathstone.
Use the gh CLI through rtk. Always specify the repository explicitly.

## Conventions

- Create: `rtk proxy gh issue create --repo ruslooob/mathstone --title "..." --body-file <path>`.
- Read: `rtk proxy gh issue view <number> --repo ruslooob/mathstone --json number,title,body,labels,comments`.
- List: `rtk proxy gh issue list --repo ruslooob/mathstone --state open --json number,title,body,labels`. Add label filters as needed.
- Comment: `rtk proxy gh issue comment <number> --repo ruslooob/mathstone --body-file <path>`.
- Apply or remove labels: `rtk proxy gh issue edit <number> --repo ruslooob/mathstone --add-label "..."` or `--remove-label "..."`.
- Close: post the resolution comment, then run `rtk proxy gh issue close <number> --repo ruslooob/mathstone`.

Write multiline bodies to a temporary UTF-8 file and pass it with --body-file.

## Pull requests as a triage surface

**PRs as a request surface: no.**

GitHub shares issue and PR numbers. If a reference is ambiguous,
try `rtk proxy gh pr view <number> --repo ruslooob/mathstone`,
then fall back to reading the issue.

## Skill instructions

When a skill says "publish to the issue tracker", create a GitHub issue.
When it says "fetch the relevant ticket", read the referenced GitHub issue.

## Wayfinding operations

Used by /wayfinder.

- Map: one issue labelled `wayfinder:map`, containing Notes, Decisions-so-far, and Fog.
- Child ticket: an issue labelled `wayfinder:<type>`, where type is research, prototype, grilling, or task. Link it as a GitHub sub-issue when available. Otherwise, add it to a task list in the map and put `Part of #<map>` at the top of its body.
- Blocking: use GitHub native issue dependencies when available. Otherwise, put `Blocked by: #<number>, #<number>` at the top of the child body. A ticket is unblocked when every blocker is closed.
- Frontier: inspect the map's open children in map order; select the first unassigned child with no open blockers.
- Claim: assign the ticket to the driving developer before starting work, using `rtk proxy gh issue edit <number> --repo ruslooob/mathstone --add-assignee @me`.
- Resolve: comment with the answer, close the child, and append a gist and link to the map's Decisions-so-far.
