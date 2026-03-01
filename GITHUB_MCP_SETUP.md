# GitHub MCP Server Setup Guide

## Step 1: Get GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "Kiro MCP Access"
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
   - ✅ `write:packages` (Upload packages)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)

## Step 2: Update MCP Configuration

Open: `C:/Users/email/.kiro/settings/mcp.json`

Replace the entire content with:

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
      "command": "uvx",
      "args": ["mcp-server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_TOKEN_HERE"
      },
      "disabled": false,
      "autoApprove": [
        "create_or_update_file",
        "push_files",
        "create_branch",
        "create_pull_request",
        "get_file_contents"
      ]
    }
  }
}
```

**Important:** Replace `YOUR_TOKEN_HERE` with your actual GitHub token!

## Step 3: Restart Kiro or Reconnect MCP

After saving the configuration:
1. Open Command Palette (Ctrl+Shift+P)
2. Search for "MCP: Reconnect All Servers"
3. Or restart Kiro

## Step 4: Verify Connection

Once reconnected, I'll be able to use GitHub MCP tools to:
- ✅ Commit changes
- ✅ Push to remote
- ✅ Create branches
- ✅ Create pull requests
- ✅ Read/write files directly to GitHub

## Alternative: Use GitHub CLI

If MCP doesn't work, you can use GitHub CLI:

### Install GitHub CLI
**Windows:**
```powershell
winget install --id GitHub.cli
```

**Mac:**
```bash
brew install gh
```

### Authenticate
```bash
gh auth login
```

### Use from Command Line
```bash
# Add and commit
git add .
git commit -m "Your message"

# Push using GitHub CLI
gh repo sync
```

## Alternative: Simple Git Setup

If you just want basic git to work:

### Install Git for Windows
1. Download: https://git-scm.com/download/win
2. Run installer with default options
3. Restart terminal

### Configure Git
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Then Use Normal Git Commands
```bash
git add .
git commit -m "Add test coverage and documentation"
git push origin main
```

## Troubleshooting

### Issue: "uvx not found"
**Solution:** Install uv first:
```powershell
# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### Issue: "GitHub token invalid"
**Solution:** 
- Verify token has correct scopes
- Check token hasn't expired
- Regenerate token if needed

### Issue: MCP server not connecting
**Solution:**
- Check MCP Server view in Kiro sidebar
- Look for error messages
- Try reconnecting manually
- Check logs in Output panel

## What Happens After Setup

Once configured, I'll be able to:

1. **List repository files**
2. **Read file contents**
3. **Create/update files**
4. **Commit changes**
5. **Push to remote**
6. **Create branches**
7. **Create pull requests**

All directly from our conversation!

## Security Notes

- ⚠️ Keep your GitHub token secure
- ⚠️ Don't share your token
- ⚠️ Token gives full access to your repositories
- ✅ You can revoke token anytime at: https://github.com/settings/tokens
- ✅ Use fine-grained tokens for better security (if available)

## Next Steps

After setup:
1. Save the mcp.json file
2. Reconnect MCP servers
3. Tell me "GitHub MCP is ready"
4. I'll commit and push your changes!

---

**Need Help?** Let me know if you encounter any issues during setup.
