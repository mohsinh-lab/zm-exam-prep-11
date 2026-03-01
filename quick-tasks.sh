#!/bin/bash
# Quick Tasks Script for AcePrep 11+
# Unix/Linux/Mac shell script for common development tasks

show_menu() {
    clear
    echo "========================================"
    echo "  AcePrep 11+ Quick Tasks"
    echo "========================================"
    echo ""
    echo "1. Start Development Server"
    echo "2. Run Tests"
    echo "3. Run Tests with Coverage"
    echo "4. Build for Production"
    echo "5. Preview Production Build"
    echo "6. Deploy to GitHub Pages"
    echo "7. Check Deployment Status"
    echo "8. Clean Build Artifacts"
    echo "9. Install Dependencies"
    echo "0. Exit"
    echo ""
}

dev_server() {
    echo ""
    echo "Starting development server..."
    cd "Test App"
    npm run dev
}

run_tests() {
    echo ""
    echo "Running tests..."
    cd "Test App"
    npm test
    read -p "Press Enter to continue..."
}

run_coverage() {
    echo ""
    echo "Running tests with coverage..."
    cd "Test App"
    npm run test:coverage
    echo ""
    echo "Coverage report generated in Test App/coverage/"
    read -p "Press Enter to continue..."
}

build_prod() {
    echo ""
    echo "Building for production..."
    cd "Test App"
    npm run build
    echo ""
    echo "Build complete! Output in Test App/dist/"
    read -p "Press Enter to continue..."
}

preview_build() {
    echo ""
    echo "Previewing production build..."
    cd "Test App"
    npm run preview
}

deploy() {
    echo ""
    echo "Deploying to GitHub Pages..."
    echo ""
    git status
    echo ""
    read -p "Enter commit message: " message
    git add .
    git commit -m "$message"
    git push origin main
    echo ""
    echo "Deployment triggered!"
    echo "Check status at: https://github.com/mohsinh-lab/zm-exam-prep-11/actions"
    read -p "Press Enter to continue..."
}

check_status() {
    echo ""
    echo "GitHub Actions: https://github.com/mohsinh-lab/zm-exam-prep-11/actions"
    echo "Deployed Site: https://mohsinh-lab.github.io/zm-exam-prep-11/"
    echo ""
    
    # Try to open in browser (works on Mac and some Linux)
    if command -v open &> /dev/null; then
        open "https://github.com/mohsinh-lab/zm-exam-prep-11/actions"
        open "https://mohsinh-lab.github.io/zm-exam-prep-11/"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "https://github.com/mohsinh-lab/zm-exam-prep-11/actions"
        xdg-open "https://mohsinh-lab.github.io/zm-exam-prep-11/"
    fi
    
    read -p "Press Enter to continue..."
}

clean_artifacts() {
    echo ""
    echo "Cleaning build artifacts..."
    rm -rf "Test App/dist"
    rm -rf "Test App/coverage"
    rm -rf "Test App/playwright-report"
    rm -rf "Test App/.vite"
    echo "Clean complete!"
    read -p "Press Enter to continue..."
}

install_deps() {
    echo ""
    echo "Installing dependencies..."
    cd "Test App"
    npm install
    echo ""
    echo "Dependencies installed!"
    read -p "Press Enter to continue..."
}

# Main loop
while true; do
    show_menu
    read -p "Enter your choice (0-9): " choice
    
    case $choice in
        1) dev_server ;;
        2) run_tests ;;
        3) run_coverage ;;
        4) build_prod ;;
        5) preview_build ;;
        6) deploy ;;
        7) check_status ;;
        8) clean_artifacts ;;
        9) install_deps ;;
        0) echo ""; echo "Goodbye!"; exit 0 ;;
        *) echo "Invalid choice. Please try again."; sleep 2 ;;
    esac
done
