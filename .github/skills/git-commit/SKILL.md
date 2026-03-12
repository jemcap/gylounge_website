---
name: git-commit
description: 'Stage and commit all changes with a conventional commit message. Use when: committing code, git commit, save changes, stage and commit, conventional commit.'
---

# Git Commit

## When to Use
- After completing a feature, fix, or any code change
- When asked to commit, save, or push changes

## Procedure

1. Run `git diff --stat` and `git diff --cached --stat` to review changed files
2. Run `git diff` and `git diff --cached` to understand the actual changes
3. Stage everything: `git add -A`
4. Craft a commit message following the format below
5. Commit: `git commit -m "<type>(<scope>): <subject>" -m "<body>"`

## Commit Message Format

### Header (first line, max 72 chars)
```
<type>(<scope>): <imperative summary>
```

**Type** (pick one):
| Type | Use when |
|------|----------|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `refactor` | Code restructure, no behavior change |
| `perf` | Performance improvement |
| `style` | Formatting, whitespace, missing semicolons |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `chore` | Build, tooling, dependency updates |
| `ci` | CI/CD config changes |

**Scope** (optional): Module or area affected, e.g. `booking`, `membership`, `api`.

**Subject**: Imperative mood, lowercase, no period. Describe *what* changed.

### Body (second `-m` flag, wrap at 72 chars)
- List key changes in 1–3 bullet points using `-`
- Focus on *what* and *why*, not *how*
- Each bullet: one concise line

### Examples

```bash
git commit -m "feat(booking): add slot availability check before confirming" -m "- query available_spots before insert
- return early with error when slot is full"
```

```bash
git commit -m "fix(membership): handle expired membership on booking" -m "- check member status is active, not just present
- redirect to membership page with context message"
```

```bash
git commit -m "chore(deps): upgrade supabase-js to 2.94.1" -m "- bump @supabase/supabase-js in package.json
- regenerate lock file"
```

## Rules
- Always read the diff before crafting the message
- Header under 72 characters
- Imperative mood: "add" not "added", "fix" not "fixes"
- Body bullets start with lowercase
- If changes span many areas, omit scope: `feat: add dark mode support`
