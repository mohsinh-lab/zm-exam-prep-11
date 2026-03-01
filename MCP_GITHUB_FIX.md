# GitHub MCP Server Fix

## Problem
The package `mcp-server-github` doesn't exist in the Python package registry.

## Solution Options

### Option 1: Use @modelcontextprotocol/server-github (Node.js)

Update your `mcp.json` to:

```json
{
  "mcpServers": {
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"],
      "env": {},
      "disabled": true,
      "autoApprove": []
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_TOKEN_HERE"
      },
      "disabled": false,
      "autoApprove": [
        "create_or_update_file",
        "push_files",
        "create_branch",
        "get_file_contents"
      ]
    }
  }
}
```

**Requirements:** Node.js must be installed

### Option 2: Use GitHub CLI MCP Server

```json
{
  "mcpServers": {
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"],
      "env": {},
      "disabled": true,
      "autoApprove": []
    },
    "github": {
      "command": "npx",
      "args": ["-y", "mcp-github"],
      "env": {
        "GITHUB_TOKEN": "YOUR_TOKEN_HERE"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### Option 3: Use Git MCP Server (Simpler)

If you just need git operations (not GitHub API):

```json
{
  "mcpServers": {
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"],
      "env": {},
      "disabled": true,
      "autoApprove": []
    },
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git"],
      "env": {},
      "disabled": false,
      "autoApprove": [
        "git_status",
        "git_diff",
        "git_commit",
        "git_add",
        "git_push"
      ]
    }
  }
}
```

This uses local git commands (requires git to be installed).

## Recommended: Option 1 (Official MCP GitHub Server)

This is the official GitHub MCP server from the Model Context Protocol organization.

### Steps:

1. **Check if Node.js is installed:**
   ```powershell
   node --version
   npm --version
   ```

2. **If not installed, install Node.js:**
   - Download from: https://nodejs.org/
   - Or use winget: `winget install OpenJS.NodeJS`

3. **Update mcp.json with Option 1 configuration above**

4. **Add your GitHub token**

5. **Reconnect MCP servers**

## Alternative: Just Install Git

If MCP is too complex, the simplest solution:

### Install Git for Windows
```powershell
winget install --id Git.Git
```

### Then use the deploy script
```bash
./deploy-changes.bat
```

This will work immediately without any MCP configuration!

## Which Should You Choose?

- **Want me to push for you?** → Use Option 1 (needs Node.js)
- **Want simplest solution?** → Install Git and use the script
- **Already have git installed?** → Just run `./deploy-changes.bat`

Let me know which option you prefer!
