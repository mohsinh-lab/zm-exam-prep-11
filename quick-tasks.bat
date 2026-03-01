@echo off
REM Quick Tasks Script for AcePrep 11+
REM Windows batch file for common development tasks

:menu
cls
echo ========================================
echo   AcePrep 11+ Quick Tasks
echo ========================================
echo.
echo 1. Start Development Server
echo 2. Run Tests
echo 3. Run Tests with Coverage
echo 4. Build for Production
echo 5. Preview Production Build
echo 6. Deploy to GitHub Pages
echo 7. Check Deployment Status
echo 8. Clean Build Artifacts
echo 9. Install Dependencies
echo 0. Exit
echo.
set /p choice="Enter your choice (0-9): "

if "%choice%"=="1" goto dev
if "%choice%"=="2" goto test
if "%choice%"=="3" goto coverage
if "%choice%"=="4" goto build
if "%choice%"=="5" goto preview
if "%choice%"=="6" goto deploy
if "%choice%"=="7" goto status
if "%choice%"=="8" goto clean
if "%choice%"=="9" goto install
if "%choice%"=="0" goto end
goto menu

:dev
echo.
echo Starting development server...
cd "Test App"
npm run dev
pause
goto menu

:test
echo.
echo Running tests...
cd "Test App"
npm test
pause
goto menu

:coverage
echo.
echo Running tests with coverage...
cd "Test App"
npm run test:coverage
echo.
echo Coverage report generated in Test App/coverage/
pause
goto menu

:build
echo.
echo Building for production...
cd "Test App"
npm run build
echo.
echo Build complete! Output in Test App/dist/
pause
goto menu

:preview
echo.
echo Previewing production build...
cd "Test App"
npm run preview
pause
goto menu

:deploy
echo.
echo Deploying to GitHub Pages...
echo.
git status
echo.
set /p message="Enter commit message: "
git add .
git commit -m "%message%"
git push origin main
echo.
echo Deployment triggered!
echo Check status at: https://github.com/mohsinh-lab/zm-exam-prep-11/actions
pause
goto menu

:status
echo.
echo Opening GitHub Actions page...
start https://github.com/mohsinh-lab/zm-exam-prep-11/actions
echo.
echo Opening deployed site...
start https://mohsinh-lab.github.io/zm-exam-prep-11/
pause
goto menu

:clean
echo.
echo Cleaning build artifacts...
if exist "Test App\dist" rmdir /s /q "Test App\dist"
if exist "Test App\coverage" rmdir /s /q "Test App\coverage"
if exist "Test App\playwright-report" rmdir /s /q "Test App\playwright-report"
if exist "Test App\.vite" rmdir /s /q "Test App\.vite"
echo Clean complete!
pause
goto menu

:install
echo.
echo Installing dependencies...
cd "Test App"
npm install
echo.
echo Dependencies installed!
pause
goto menu

:end
echo.
echo Goodbye!
exit
