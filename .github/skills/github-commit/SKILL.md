---
name: github-commit
description: Create and push GitHub commits with Conventional Commit prefixes (`feat`, `fix`, `perf`, etc.), a meaningful header that reflects the main task, and a fully detailed body describing all implemented changes and verification. Use when asked to commit code, craft a commit message, or push completed work.
---

# GitHub Commit

Use this workflow to produce clear, standards-compliant commits that capture the main task in the header and all implementation details in the body.

## Workflow

1. Inspect changes before writing any commit message.
2. Select the correct Conventional Commit prefix.
3. Build a meaningful header that states the primary completed task.
4. Write a fully detailed body that documents all changes and validation.
5. Commit and push to GitHub.

## Inspect Changes

Run:

```bash
git status --short
git diff --stat
git diff --cached --stat
git diff
git diff --cached
```

If nothing is staged, stage all tracked and untracked files:

```bash
git add -A
```

Then re-check the staged diff:

```bash
git diff --cached --stat
git diff --cached
```

## Select Prefix

Choose one prefix that best matches the primary objective:

- `feat`: add new user-facing behavior or capability
- `fix`: correct a defect or regression
- `perf`: improve runtime, build, or query performance
- `refactor`: restructure code without changing behavior
- `docs`: documentation-only changes
- `test`: add or update tests
- `chore`: tooling, maintenance, dependencies, configuration
- `ci`: CI/CD workflow changes
- `style`: formatting-only changes

If multiple prefixes seem valid, choose the one aligned with the main task outcome.

## Build Header

Format:

```text
<type>(<scope>): <main-task result in imperative form>
```

Rules:

- Keep it under 72 characters.
- Use present-imperative wording (for example, `add`, `fix`, `optimize`).
- Make the subject specific to the primary change.
- Use scope only when it improves clarity (for example, `booking`, `admin-auth`, `home-ui`).

Good examples:

- `feat(admin-auth): add password reset flow for admin login`
- `fix(booking): block overbooking when slot capacity is exhausted`
- `perf(home): reduce section render cost during scroll transitions`

## Write Detailed Body

Always include a body and make it complete. Cover all implemented work, not only highlights.

Use this structure:

```text
Summary:
- one sentence on the objective and why this change was needed

Implemented:
- list each meaningful implementation detail, grouped by feature/module/file
- include behavior changes, data flow updates, and edge-case handling
- include migrations/config/docs/tests updated as part of the work

Validation:
- list every verification step run (lint, tests, build, manual checks)
- include outcomes (pass/fail and key notes)

Notes:
- include follow-ups, known constraints, or intentional omissions
```

Body quality rules:

- Prefer concrete, file-aware statements over vague summaries.
- Capture both code changes and documentation/operational changes.
- Mention skipped checks explicitly as `UNCONFIRMED` with reason.
- Keep lines readable (target 72-100 chars where possible).

## Commit and Push

Build message variables and commit:

```bash
header="<type>(<scope>): <subject>"
body="$(cat <<'EOF'
Summary:
- ...

Implemented:
- ...

Validation:
- ...

Notes:
- ...
EOF
)"

git commit -m "$header" -m "$body"
```

Push to GitHub:

```bash
branch="$(git rev-parse --abbrev-ref HEAD)"
if git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
  git push
else
  git push -u origin "$branch"
fi
```

## Final Check

Confirm:

- header uses a valid prefix (`feat`, `fix`, `perf`, etc.)
- header reflects the main completed task
- body includes full implementation details
- commit is pushed to remote successfully
