# AcePrep 11+ Makefile
# Quick commands for common development tasks

.PHONY: help install dev build preview test test-watch test-ui test-all coverage clean deploy status

# Default target
help:
	@echo "AcePrep 11+ Development Commands"
	@echo "================================="
	@echo ""
	@echo "Setup:"
	@echo "  make install      Install dependencies"
	@echo ""
	@echo "Development:"
	@echo "  make dev          Start development server"
	@echo "  make build        Build for production"
	@echo "  make preview      Preview production build"
	@echo ""
	@echo "Testing:"
	@echo "  make test         Run unit tests once"
	@echo "  make test-watch   Run tests in watch mode"
	@echo "  make test-ui      Run Playwright UI tests"
	@echo "  make test-all     Run all tests"
	@echo "  make coverage     Generate coverage report"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy       Commit and push to trigger deployment"
	@echo "  make status       Check deployment status"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean        Clean build artifacts"

install:
	@echo "Installing dependencies..."
	cd "Test App" && npm install

dev:
	@echo "Starting development server..."
	cd "Test App" && npm run dev

build:
	@echo "Building for production..."
	cd "Test App" && npm run build

preview:
	@echo "Previewing production build..."
	cd "Test App" && npm run preview

test:
	@echo "Running unit tests..."
	cd "Test App" && npm test

test-watch:
	@echo "Running tests in watch mode..."
	cd "Test App" && npm run test:watch

test-ui:
	@echo "Running Playwright UI tests..."
	cd "Test App" && npm run test:ui

test-all:
	@echo "Running all tests..."
	cd "Test App" && npm run test:all

coverage:
	@echo "Generating coverage report..."
	cd "Test App" && npm run test:coverage
	@echo "Coverage report generated in Test App/coverage/"

clean:
	@echo "Cleaning build artifacts..."
	rm -rf "Test App/dist"
	rm -rf "Test App/coverage"
	rm -rf "Test App/playwright-report"
	rm -rf "Test App/.vite"
	@echo "Clean complete!"

deploy:
	@echo "Committing and pushing changes..."
	git add .
	git status
	@read -p "Enter commit message: " msg; \
	git commit -m "$$msg"
	git push origin main
	@echo "Deployment triggered! Check status at:"
	@echo "https://github.com/mohsinh-lab/zm-exam-prep-11/actions"

status:
	@echo "Opening GitHub Actions page..."
	@echo "https://github.com/mohsinh-lab/zm-exam-prep-11/actions"
	@echo ""
	@echo "Deployed site:"
	@echo "https://mohsinh-lab.github.io/zm-exam-prep-11/"
