---
inclusion: auto
---

# Trunk-Based Development Workflow

## Overview

This project follows **trunk-based development** principles to ensure stable deployments and continuous integration. All changes must go through feature branches before merging to main (trunk).

## Critical Rules

### ❌ NEVER
- Push directly to `main` branch
- Commit directly to `main` branch
- Bypass code review and testing
- Merge without passing tests
- Deploy untested code

### ✅ ALWAYS
- Create feature branches from `main`
- Use descriptive branch names
- Keep branches short-lived (1-2 weeks max)
- Run tests before merging
- Use pull requests for code review
- Squash commits for clean history
- Delete branch after merge

## Workflow Steps

### 1. Create Feature Branch
```bash
# From main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feat/{feature-name}-v{version}
# Example: feat/parent-portal-tests-v1
```

### 2. Make Changes
```bash
# Make your changes
git add .
git commit -m "feat: description of changes"

# Push to remote
git push origin feat/{feature-name}-v{version}
```

### 3. Create Pull Request
- Go to GitHub repository
- Create PR from feature branch to `main`
- Add description of changes
- Request code review
- Ensure CI/CD pipeline passes

### 4. Code Review & Testing
- Wait for code review approval
- Verify all tests pass (unit, E2E, build)
- Address any feedback
- Make additional commits if needed

### 5. Merge to Main
```bash
# Option A: Squash commits (recommended for clean history)
git checkout main
git pull origin main
git merge --squash feat/{feature-name}-v{version}
git commit -m "merge: {feature description}"
git push origin main

# Option B: Create merge commit
git merge --no-ff feat/{feature-name}-v{version}
git push origin main
```

### 6. Delete Feature Branch
```bash
# Delete local branch
git branch -d feat/{feature-name}-v{version}

# Delete remote branch
git push origin --delete feat/{feature-name}-v{version}
```

## Branch Naming Convention

### Format
`{type}/{description}-v{version}`

### Types
- `feat/` - New feature
- `fix/` - Bug fix
- `chore/` - Maintenance, documentation
- `refactor/` - Code refactoring
- `test/` - Test additions/improvements

### Examples
- `feat/parent-portal-tests-v1`
- `fix/build-errors-v1`
- `chore/update-roadmap-v1`
- `test/e2e-coverage-v1`
- `refactor/exam-mode-v1`

## Commit Message Format

### Format
`{type}: {description}`

### Types
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `test:` - Tests
- `chore:` - Maintenance
- `refactor:` - Code refactoring

### Examples
```
feat: add parent portal E2E tests
fix: resolve build errors in ExamMode
docs: update trunk-based development guide
test: add accessibility tests for parent portal
chore: update project roadmap
refactor: simplify radar chart rendering
```

## Deployment Strategy

### Main Branch (Trunk)
- Always production-ready
- All tests passing
- Automatically deployed to GitHub Pages
- Tagged with version numbers

### Feature Branches
- Short-lived (1-2 weeks max)
- Not deployed to production
- Used for development and testing
- Deleted after merge

### Release Process
1. Create feature branch from `main`
2. Make changes and test locally
3. Push to remote
4. Create PR and request review
5. Merge to `main` after approval
6. GitHub Actions automatically deploys to GitHub Pages
7. Delete feature branch

## Testing Requirements Before Merge

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:ui
```

### Build Verification
```bash
npm run build
```

### All must pass before merging to main

## CI/CD Pipeline

The GitHub Actions workflow automatically:
1. Runs unit tests on PR
2. Runs E2E tests on PR
3. Builds production bundle
4. Deploys to GitHub Pages on main merge
5. Generates test reports

## Common Scenarios

### Scenario 1: Adding New Feature
```bash
git checkout main
git pull origin main
git checkout -b feat/new-feature-v1

# Make changes
git add .
git commit -m "feat: add new feature"
git push origin feat/new-feature-v1

# Create PR on GitHub
# After approval and tests pass:
git checkout main
git pull origin main
git merge --squash feat/new-feature-v1
git commit -m "merge: add new feature"
git push origin main
git branch -d feat/new-feature-v1
git push origin --delete feat/new-feature-v1
```

### Scenario 2: Fixing Bug
```bash
git checkout main
git pull origin main
git checkout -b fix/bug-name-v1

# Make fix
git add .
git commit -m "fix: resolve bug description"
git push origin fix/bug-name-v1

# Create PR, get approval, merge
git checkout main
git pull origin main
git merge --squash fix/bug-name-v1
git commit -m "merge: fix bug description"
git push origin main
git branch -d fix/bug-name-v1
git push origin --delete fix/bug-name-v1
```

### Scenario 3: Updating Documentation
```bash
git checkout main
git pull origin main
git checkout -b chore/update-docs-v1

# Update docs
git add .
git commit -m "docs: update documentation"
git push origin chore/update-docs-v1

# Create PR, merge after review
git checkout main
git pull origin main
git merge --squash chore/update-docs-v1
git commit -m "merge: update documentation"
git push origin main
git branch -d chore/update-docs-v1
git push origin --delete chore/update-docs-v1
```

## Troubleshooting

### Accidentally Committed to Main
```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Create feature branch
git checkout -b feat/feature-name-v1

# Commit to feature branch
git add .
git commit -m "feat: description"
git push origin feat/feature-name-v1
```

### Need to Update Feature Branch from Main
```bash
git checkout feat/feature-name-v1
git fetch origin
git rebase origin/main

# If conflicts, resolve them
git add .
git rebase --continue

# Force push to remote
git push origin feat/feature-name-v1 --force-with-lease
```

### Merge Conflicts
```bash
# During merge, if conflicts occur:
git merge --abort  # Cancel merge

# Or resolve conflicts:
# 1. Open conflicted files
# 2. Resolve conflicts manually
# 3. git add .
# 4. git commit -m "merge: resolve conflicts"
# 5. git push origin main
```

## Best Practices

1. **Keep branches short-lived** - Merge within 1-2 weeks
2. **Small, focused changes** - One feature per branch
3. **Frequent commits** - Commit logical units of work
4. **Clear commit messages** - Describe what and why
5. **Test before pushing** - Run tests locally first
6. **Review code** - Get peer review before merge
7. **Squash commits** - Keep main history clean
8. **Delete branches** - Clean up after merge
9. **Pull before push** - Avoid conflicts
10. **Use descriptive names** - Branch names should be clear

## Key Learning for Future

**CRITICAL**: Never push directly to `main`. Always use feature branches to:
- Ensure code quality through review
- Run automated tests before deployment
- Maintain clean git history
- Enable safe rollbacks if needed
- Prevent broken deployments
- Allow parallel development

This workflow ensures AcePrep 11+ remains stable and production-ready at all times.
