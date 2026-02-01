#!/bin/bash
# GENI Worktree Aliases Setup
# Run: source setup-aliases.sh

echo "Setting up GENI worktree aliases..."

# Main worktree
alias zm='cd /Users/yimi/Desktop/GENI && echo "📍 Main worktree (production)"'

# Testing worktree  
alias zt='cd /Users/yimi/Desktop/GENI-worktrees/testing && echo "🧪 Testing worktree"'

# Docs worktree
alias zd='cd /Users/yimi/Desktop/GENI-worktrees/docs && echo "📚 Docs worktree"'

# Features worktree
alias zf='cd /Users/yimi/Desktop/GENI-worktrees/features && echo "⚡ Features worktree"'

# Quick status across all worktrees
alias zstatus='echo "=== Main ===" && cd /Users/yimi/Desktop/GENI && git status -sb && echo "\n=== Testing ===" && cd /Users/yimi/Desktop/GENI-worktrees/testing && git status -sb && echo "\n=== Docs ===" && cd /Users/yimi/Desktop/GENI-worktrees/docs && git status -sb && echo "\n=== Features ===" && cd /Users/yimi/Desktop/GENI-worktrees/features && git status -sb'

echo "✅ Aliases loaded!"
echo ""
echo "Available commands:"
echo "  zm      - Main worktree"  
echo "  zt      - Testing worktree"
echo "  zd      - Docs worktree"
echo "  zf      - Features worktree"
echo "  zstatus - Git status for all worktrees"
echo ""
echo "Add these to your ~/.zshrc or ~/.bashrc to make them permanent."
