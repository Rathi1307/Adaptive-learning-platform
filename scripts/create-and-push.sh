#!/usr/bin/env bash
# Simple helper to create a repo under your GitHub account and push the current project.
# Usage:
#   ./scripts/create-and-push.sh [repo-name] [github-username] [public|private]
# Example:
#   ./scripts/create-and-push.sh adaptive-learning-platform Rathi1307 public

set -euo pipefail

REPO_NAME="${1:-$(basename "$PWD")}"
GITHUB_USER="${2:-Rathi1307}"
VISIBILITY="${3:-public}"

echo "Repo: $GITHUB_USER/$REPO_NAME, visibility: $VISIBILITY"

# Initialize git if necessary
if [ ! -d .git ]; then
  echo "Initializing git..."
  git init
fi

git add .
# Try commit (ignore if nothing to commit)
if git rev-parse --verify HEAD >/dev/null 2>&1; then
  git commit -m "chore: update project" || echo "No changes to commit"
else
  git commit -m "Initial commit" || echo "No changes to commit"
fi

# Prefer GitHub CLI if available
if command -v gh >/dev/null 2>&1; then
  if ! gh auth status >/dev/null 2>&1; then
    echo "gh CLI not authenticated. Run: gh auth login"
    exit 1
  fi
  echo "Creating repo via gh (or using existing)..."
  # Attempt to create repo; if it exists, gh will fail — handle fallback
  if gh repo create "$GITHUB_USER/$REPO_NAME" --"${VISIBILITY}" --source=. --remote=origin --push 2>/dev/null; then
    echo "Repository created and pushed via gh."
    exit 0
  else
    echo "Repository might already exist — ensuring remote and pushing..."
    git remote remove origin 2>/dev/null || true
    git remote add origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
    git branch -M main
    git push -u origin main
    echo "Pushed to existing repository."
    exit 0
  fi
fi

# Fallback to GitHub API if GITHUB_TOKEN is set
if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "Neither 'gh' CLI found nor GITHUB_TOKEN environment variable set."
  echo "Install GitHub CLI (https://cli.github.com/) and run 'gh auth login' or export GITHUB_TOKEN and try again."
  exit 1
fi

echo "Creating repo via GitHub API..."
PRIVATE=false
if [ "$VISIBILITY" = "private" ]; then
  PRIVATE=true
fi

create_response=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  -d "{\"name\":\"$REPO_NAME\",\"private\":$PRIVATE}" https://api.github.com/user/repos)

repo_url=$(echo "$create_response" | grep -o '"ssh_url": *"[^"]*"' | head -n1 | sed 's/.*"ssh_url": *"\([^"]*\)".*/\1/')
if [ -z "$repo_url" ]; then
  echo "API response:"
  echo "$create_response"
  echo "Failed to create repository via API."
  exit 1
fi

git remote remove origin 2>/dev/null || true
git remote add origin "$repo_url"
git branch -M main
git push -u origin main

echo "Repository created and pushed: $repo_url"
