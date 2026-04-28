#!/bin/bash
set -e

# Install GitHub CLI
sudo mkdir -p -m 755 /etc/apt/keyrings
wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg \
  | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null
sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
  | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt-get update && sudo apt-get install -y gh

# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Install coderabbit CLI
curl -fsSL https://cli.coderabbit.ai/install.sh | sh

# Install Playwright and Chrome with all required system dependencies
npm install -g @playwright/test
(cd /tmp && npx --yes playwright install --with-deps chrome)
claude mcp add playwright npx @playwright/mcp@latest

# Prepare frontend
cd frontend && yarn install
