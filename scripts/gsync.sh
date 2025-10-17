#!/bin/bash

# Get current timestamp
timestamp=$(date +"%Y-%m-%d %H:%M:%S")

# Pull latest changes from GitHub
echo "Pulling latest changes from origin/main..."
git pull origin main
if [ $? -ne 0 ]; then
  echo "Pull failed. Resolve conflicts before pushing."
  exit 1
fi

# Stage all changes
echo "Staging all changes..."
git add .

# Check for workflow changes
if git diff --cached --name-only | grep -q "^.github/workflows/"; then
  echo "Workflow file detected or changed."
fi

# Commit changes
echo "Committing changes..."
git commit -m "Sync from VM at $timestamp"
if [ $? -ne 0 ]; then
  echo "Nothing to commit."
fi

# Push to GitHub
echo "Pushing to origin/main..."
git push origin main
if [ $? -ne 0 ]; then
  echo "Push failed. Check your branch or remote."
  exit 1
fi

