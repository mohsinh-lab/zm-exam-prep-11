@echo off
echo ========================================
echo AcePrep 11+ - Deploy Changes Script
echo ========================================
echo.

echo Checking git status...
git status
echo.

echo Staging all changes...
git add .
echo.

echo Committing changes...
git commit -m "Add comprehensive test coverage and deployment documentation

- Add tests for adaptiveEngine, readinessEngine, and router
- Add deployment checklist and Firebase setup guide
- Add verification guide for testing procedures
- Update package.json with coverage scripts
- Configure Vitest coverage reporting
- Add steering documentation for AI assistance
- Add deployment status checking documentation"
echo.

echo Pushing to remote (main branch)...
git push origin main
echo.

echo ========================================
echo Deployment triggered!
echo ========================================
echo.
echo Next steps:
echo 1. Check GitHub Actions: https://github.com/mohsinh-lab/zm-exam-prep-11/actions
echo 2. Wait 2-3 minutes for deployment
echo 3. Visit deployed site: https://mohsinh-lab.github.io/zm-exam-prep-11/
echo.
pause
