---
inclusion: always
---

# Windows / PowerShell Dev Workflow Notes

## PowerShell Command Rules

- Use `;` as command separator, NOT `&&` (bash syntax fails in PowerShell)
- `tail` does not exist — use `Select-Object -Last N` instead
- `cat` works but `Get-Content` is more reliable
- Git push stderr output causes PowerShell exit code 1 even on success — treat as success if push completes

## Writing Files via PowerShell

- PowerShell heredoc (`@' '@`) can corrupt file content with encoding issues
- For JS/TS files, use `[System.IO.File]::WriteAllLines()` with explicit UTF8 no-BOM encoding:
  ```powershell
  [System.IO.File]::WriteAllLines("C:\path\to\file.js", $content, [System.Text.UTF8Encoding]::new($false))
  ```
- If a file is open in VS Code editor, `fsWrite` tool may fail with "Document has been closed" — use PowerShell `Set-Content` as fallback

## Running Tests

- Always run from `Test App/` directory: `npm run test -- --run`
- Do NOT run from workspace root (wrong working directory)
- Use `--run` flag for single execution (not watch mode)

## Vitest / ESM Mocking

- Test files MUST mock `progressStore.js` AND `cloudSync.js` before any imports to avoid Firebase HTTPS ESM loader error
- Pattern:
  ```javascript
  vi.mock('../src/engine/progressStore.js', () => ({ ... }))
  vi.mock('../src/engine/cloudSync.js', () => ({ ... }))
  ```
- Any module that imports Firebase (directly or transitively) must be mocked in tests

## Git

- Git push stderr output is not a real error in PowerShell — check actual push result, not exit code
