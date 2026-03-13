---
description: how to deploy the AcePrep app to GitHub Pages safely
---

# AcePrep Deployment Workflow

**NEVER push directly to `main`.** All changes must go through a feature branch + PR.

## Steps

1. Create a feature branch from `main`:
```bash
git checkout main && git pull origin main
git checkout -b feat/<short-task-name>
```

// turbo
2. Make code changes and verify locally:
```bash
cd "Test App" && npm run dev
```

3. Run unit tests before committing:
```bash
cd "Test App" && npm test
```

// turbo
4. Build and verify the production bundle locally:
```bash
cd "Test App" && npm run build
```

5. Commit changes with a descriptive message:
```bash
git add . && git commit -m "feat: <description of change>"
```

6. Push the feature branch:
```bash
git push origin feat/<short-task-name>
```

7. Open a Pull Request to `main` on GitHub:
   - URL: https://github.com/mohsinh-lab/zm-exam-prep-11/pull/new/feat/<short-task-name>
   - Wait for all CI checks (🧪 Tests, 🔨 Build, 🔍 Smoke Test) to pass ✅
   - ONLY merge when all checks are green

8. The deploy to GitHub Pages happens automatically after merge to `main`.

## Branch Naming Convention

| Prefix | Use For |
|---|---|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `chore/` | Dependency/config updates |
| `content/` | Question bank additions |

## What the CI Pipeline Checks

- ✅ All unit tests pass (`npm test`)
- ✅ Vite production build succeeds
- ✅ `dist/index.html` exists
- ✅ Bundle contains `__APP_BOOTED__` safety net
- ✅ Bundle contains `🚀 AcePrep Boot Successful` log
- ✅ Bundle contains `onAuthStateChanged` (Firebase Auth)
