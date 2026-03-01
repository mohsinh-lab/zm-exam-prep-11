# VS Code Setup for AcePrep 11+

## Configuration Files Created

The `.vscode/` folder now contains optimized configurations for this project:

### 1. launch.json - Debug Configurations

**Available debug configurations:**

- **Launch Dev Server** - Debug the development server (port 5173)
- **Launch Production Preview** - Debug the production build preview
- **Debug Deployed Site** - Debug the live GitHub Pages deployment
- **Run Tests** - Run Vitest unit tests
- **Run Tests with Coverage** - Run tests with coverage report

**Usage:**
1. Press F5 or go to Run & Debug (Ctrl+Shift+D)
2. Select a configuration from dropdown
3. Click Start Debugging

### 2. settings.json - Workspace Settings

**Configured:**
- ✅ Format on save (Prettier)
- ✅ Auto-import suggestions
- ✅ Emmet for JavaScript (HTML in JS strings)
- ✅ Vitest integration
- ✅ Search/watcher exclusions (node_modules, dist, coverage)
- ✅ Terminal defaults to PowerShell in Test App folder

### 3. tasks.json - Build Tasks

**Available tasks:**

- `npm: dev` - Start development server
- `npm: build` - Build for production
- `npm: preview` - Preview production build
- `npm: test` - Run unit tests
- `npm: test:coverage` - Run tests with coverage
- `npm: test:ui` - Run Playwright E2E tests
- `Deploy to GitHub Pages` - Commit and push changes
- `Install Dependencies` - Run npm install

**Usage:**
1. Press Ctrl+Shift+P
2. Type "Tasks: Run Task"
3. Select a task

Or use keyboard shortcuts:
- **Ctrl+Shift+B** - Run default build task
- **Ctrl+Shift+T** - Run default test task

### 4. extensions.json - Recommended Extensions

**Essential extensions:**
- ESLint - Code linting
- Prettier - Code formatting
- Vitest Explorer - Test runner UI
- Playwright - E2E testing
- GitLens - Enhanced Git features
- VSFire - Firebase integration

**Install all:**
1. Open Extensions (Ctrl+Shift+X)
2. Look for "Recommended" section
3. Click "Install All"

## Quick Start Guide

### Development Workflow

1. **Start dev server:**
   - Press F5 → Select "Launch Dev Server"
   - Or: Ctrl+Shift+P → "Tasks: Run Task" → "npm: dev"
   - Or: Terminal → `cd "Test App" && npm run dev`

2. **Make changes:**
   - Edit files in `Test App/src/`
   - Hot reload will update browser automatically

3. **Run tests:**
   - Press Ctrl+Shift+T
   - Or: F5 → Select "Run Tests"

4. **Build for production:**
   - Ctrl+Shift+B
   - Or: Ctrl+Shift+P → "Tasks: Run Task" → "npm: build"

5. **Deploy:**
   - Ctrl+Shift+P → "Tasks: Run Task" → "Deploy to GitHub Pages"
   - Or: Use git commands manually

### Debugging

**Debug development server:**
1. F5 → "Launch Dev Server"
2. Set breakpoints in source files
3. Interact with app in Chrome
4. Debugger pauses at breakpoints

**Debug deployed site:**
1. F5 → "Debug Deployed Site"
2. Opens live site with source maps
3. Can debug production issues

**Debug tests:**
1. F5 → "Run Tests"
2. See test output in Debug Console
3. Set breakpoints in test files

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Start Debugging | F5 |
| Run Build Task | Ctrl+Shift+B |
| Run Test Task | Ctrl+Shift+T |
| Open Command Palette | Ctrl+Shift+P |
| Open Terminal | Ctrl+` |
| Toggle Sidebar | Ctrl+B |
| Quick Open File | Ctrl+P |
| Search in Files | Ctrl+Shift+F |
| Source Control | Ctrl+Shift+G |

## Customization

### Personal Settings

The `.vscode/` folder is in `.gitignore`, so your personal settings won't be committed.

**To customize:**
1. Edit `.vscode/settings.json` for workspace settings
2. Edit `.vscode/launch.json` for debug configurations
3. Edit `.vscode/tasks.json` for custom tasks

### Team Settings

If you want to share VS Code settings with your team:
1. Remove `.vscode` from `.gitignore`
2. Commit the `.vscode/` folder
3. Team members will get the same configuration

## Troubleshooting

### Issue: Tasks not showing
**Fix:** Reload VS Code (Ctrl+Shift+P → "Reload Window")

### Issue: Debugger not attaching
**Fix:** 
- Ensure dev server is running
- Check port number in launch.json matches
- Try closing and reopening Chrome

### Issue: Extensions not working
**Fix:**
- Install recommended extensions
- Reload VS Code
- Check extension settings

### Issue: Terminal opens in wrong folder
**Fix:** 
- Check `terminal.integrated.cwd` in settings.json
- Or manually cd to "Test App" folder

## Integration with Kiro

The `kiroAgent.configureMCP` setting is enabled, allowing Kiro to:
- Access MCP servers
- Run automated tasks
- Debug and test the application

## Next Steps

1. **Install recommended extensions**
2. **Try the debug configurations** (F5)
3. **Run the test task** (Ctrl+Shift+T)
4. **Start development** (npm: dev task)

---

**Note:** These configurations are optimized for the AcePrep 11+ project structure. Adjust paths if you reorganize the project.
