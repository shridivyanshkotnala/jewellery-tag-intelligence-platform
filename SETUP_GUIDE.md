# 🚀 Complete Setup Guide - Jewellery Tag Intelligence Platform

## Table of Contents
1. [Initial Git Setup](#1-initial-git-setup)
2. [GitHub Repository Creation](#2-github-repository-creation)
3. [Push Existing Code](#3-push-existing-code)
4. [Branch Strategy Setup](#4-branch-strategy-setup)
5. [GitHub Branch Protection](#5-github-branch-protection)
6. [GitHub Repository Labels](#6-github-repository-labels)
7. [GitHub Milestones](#7-github-milestones)
8. [Team Workflow Commands](#8-team-workflow-commands)

---

## 1. Initial Git Setup

### Step 1.1: Initialize Git Repository

```bash
# Navigate to project directory
cd "/home/divyanshkotnala/Desktop/Projects Delivery/Jwellery"

# Initialize git repository
git init

# Configure user (if not already configured globally)
git config user.name "Divyansh Kotnala"
git config user.email "divyanshkotnala@example.com"

# Verify configuration
git config --list
```

### Step 1.2: Add Files to Git

```bash
# Add all files
git add .

# Check status
git status

# Create initial commit
git commit -m "Initial commit: Project setup with frontend, backend, and docs structure"
```

---

## 2. GitHub Repository Creation

### Option A: Via GitHub Web Interface

1. Go to https://github.com/new
2. Repository name: `jewellery-tag-intelligence-platform`
3. Description: `AI-powered jewellery tag scanning platform using Gemini Vision API`
4. Visibility: Private (recommended) or Public
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

### Option B: Via GitHub CLI (if installed)

```bash
# Install GitHub CLI (if not installed)
# For Ubuntu/Debian:
# sudo apt install gh

# Login to GitHub
gh auth login

# Create repository
gh repo create jewellery-tag-intelligence-platform \
  --private \
  --description "AI-powered jewellery tag scanning platform using Gemini Vision API" \
  --source=. \
  --remote=origin
```

---

## 3. Push Existing Code

### Step 3.1: Connect Local Repository to GitHub

```bash
# Add remote origin
git remote add origin https://github.com/shridivyanshkotnala/jewellery-tag-intelligence-platform.git

# Verify remote
git remote -v
```

### Step 3.2: Rename Default Branch to Main

```bash
# Rename current branch to main
git branch -M main
```

### Step 3.3: Push to GitHub

```bash
# Push main branch and set upstream
git push -u origin main

# Verify push
git log --oneline
```

---

## 4. Branch Strategy Setup

### Step 4.1: Create Develop Branch

```bash
# Create and switch to develop branch
git checkout -b develop

# Push develop branch to remote
git push -u origin develop
```

### Step 4.2: Create Feature Branches

```bash
# Create Anamika's frontend feature branch
git checkout -b feature/frontend-anamika develop
git push -u origin feature/frontend-anamika

# Switch back to develop
git checkout develop

# Create Ishika's backend feature branch
git checkout -b feature/backend-ishika develop
git push -u origin feature/backend-ishika

# Switch back to develop
git checkout develop
```

### Step 4.3: Verify All Branches

```bash
# List all local branches
git branch

# List all remote branches
git branch -r

# List all branches (local and remote)
git branch -a
```

---

## 5. GitHub Branch Protection

### Configure via GitHub Web Interface

#### For `main` Branch:

1. Go to: `Settings` → `Branches` → `Add branch protection rule`
2. Branch name pattern: `main`
3. Configure:
   - ✅ Require a pull request before merging
   - ✅ Require approvals: `1`
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require status checks to pass before merging
     - Add: `backend-build`
     - Add: `frontend-build`
   - ✅ Require branches to be up to date before merging
   - ✅ Do not allow bypassing the above settings
4. Click "Create" or "Save changes"

#### For `develop` Branch:

1. Go to: `Settings` → `Branches` → `Add branch protection rule`
2. Branch name pattern: `develop`
3. Configure:
   - ✅ Require a pull request before merging
   - ✅ Require approvals: `1`
   - ✅ Require status checks to pass before merging
     - Add: `backend-build`
     - Add: `frontend-build`
   - ✅ Require branches to be up to date before merging
4. Click "Create" or "Save changes"

### Configure via GitHub CLI

```bash
# Protect main branch
gh api repos/shridivyanshkotnala/jewellery-tag-intelligence-platform/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["backend-build","frontend-build"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null

# Protect develop branch
gh api repos/shridivyanshkotnala/jewellery-tag-intelligence-platform/branches/develop/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["backend-build","frontend-build"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field restrictions=null
```

---

## 6. GitHub Repository Labels

### Create Labels via GitHub CLI

```bash
# Type Labels
gh label create "frontend" --description "Frontend related changes" --color "61dafb"
gh label create "backend" --description "Backend related changes" --color "68a063"
gh label create "documentation" --description "Documentation updates" --color "0075ca"
gh label create "devops" --description "CI/CD and infrastructure" --color "e99695"

# Issue Type Labels
gh label create "bug" --description "Bug reports" --color "d73a4a"
gh label create "enhancement" --description "New features or improvements" --color "a2eeef"
gh label create "technical-task" --description "Technical implementation task" --color "d4c5f9"

# Priority Labels
gh label create "high-priority" --description "High priority items" --color "b60205"
gh label create "medium-priority" --description "Medium priority items" --color "fbca04"
gh label create "low-priority" --description "Low priority items" --color "0e8a16"

# Status Labels
gh label create "blocked" --description "Blocked by dependencies" --color "000000"
gh label create "needs-review" --description "Awaiting code review" --color "fbca04"
gh label create "in-progress" --description "Currently being worked on" --color "0052cc"
gh label create "ready-to-merge" --description "Approved and ready to merge" --color "0e8a16"

# Component Labels
gh label create "api" --description "API related changes" --color "5319e7"
gh label create "database" --description "Database related changes" --color "c5def5"
gh label create "ui" --description "User interface changes" --color "d4c5f9"
gh label create "testing" --description "Testing related" --color "c2e0c6"
```

### Create Labels via Web Interface

Go to: `Issues` → `Labels` → `New label`

---

## 7. GitHub Milestones

### Create Milestones via GitHub CLI

```bash
# Milestone 1: Scanner UI
gh api repos/shridivyanshkotnala/jewellery-tag-intelligence-platform/milestones \
  --method POST \
  --field title="Milestone 1: Scanner UI" \
  --field description="Mobile camera integration, tag capture interface, and image preview" \
  --field due_on="2026-07-15T00:00:00Z"

# Milestone 2: Gemini Vision Integration
gh api repos/shridivyanshkotnala/jewellery-tag-intelligence-platform/milestones \
  --method POST \
  --field title="Milestone 2: Gemini Vision Integration" \
  --field description="API integration, image upload pipeline, and response parsing" \
  --field due_on="2026-08-15T00:00:00Z"

# Milestone 3: Abbreviation Engine
gh api repos/shridivyanshkotnala/jewellery-tag-intelligence-platform/milestones \
  --method POST \
  --field title="Milestone 3: Abbreviation Engine" \
  --field description="Abbreviation mapping, data normalization, and validation rules" \
  --field due_on="2026-09-15T00:00:00Z"

# Milestone 4: Review Workflow
gh api repos/shridivyanshkotnala/jewellery-tag-intelligence-platform/milestones \
  --method POST \
  --field title="Milestone 4: Review Workflow" \
  --field description="Manual review interface, edit capabilities, and approval system" \
  --field due_on="2026-10-15T00:00:00Z"

# Milestone 5: Dataset Export
gh api repos/shridivyanshkotnala/jewellery-tag-intelligence-platform/milestones \
  --method POST \
  --field title="Milestone 5: Dataset Export" \
  --field description="Export formats, bulk operations, and data analytics" \
  --field due_on="2026-11-15T00:00:00Z"
```

### Create Milestones via Web Interface

Go to: `Issues` → `Milestones` → `New milestone`

---

## 8. Team Workflow Commands

### 8.1 Anamika (Frontend Developer)

#### Clone Repository
```bash
git clone https://github.com/shridivyanshkotnala/jewellery-tag-intelligence-platform.git
cd jewellery-tag-intelligence-platform
```

#### Switch to Feature Branch
```bash
git checkout feature/frontend-anamika
```

#### Daily Workflow
```bash
# Pull latest changes from develop
git checkout develop
git pull origin develop

# Merge develop into feature branch
git checkout feature/frontend-anamika
git merge develop

# Make changes, then commit
git add .
git commit -m "feat(frontend): implement camera scanner component"

# Push to remote
git push origin feature/frontend-anamika
```

#### Create Pull Request
```bash
# Via GitHub CLI
gh pr create \
  --base develop \
  --head feature/frontend-anamika \
  --title "feat: Camera scanner component implementation" \
  --body "Implements camera integration for tag scanning"

# Or via web interface:
# Go to repository → Pull requests → New pull request
```

---

### 8.2 Ishika (Backend Developer)

#### Clone Repository
```bash
git clone https://github.com/shridivyanshkotnala/jewellery-tag-intelligence-platform.git
cd jewellery-tag-intelligence-platform
```

#### Switch to Feature Branch
```bash
git checkout feature/backend-ishika
```

#### Daily Workflow
```bash
# Pull latest changes from develop
git checkout develop
git pull origin develop

# Merge develop into feature branch
git checkout feature/backend-ishika
git merge develop

# Make changes, then commit
git add .
git commit -m "feat(backend): implement Gemini Vision API integration"

# Push to remote
git push origin feature/backend-ishika
```

#### Create Pull Request
```bash
# Via GitHub CLI
gh pr create \
  --base develop \
  --head feature/backend-ishika \
  --title "feat: Gemini Vision API integration" \
  --body "Implements image processing with Gemini Vision API"

# Or via web interface:
# Go to repository → Pull requests → New pull request
```

---

### 8.3 Divyansh (Architect / Product Owner)

#### Review Pull Requests
```bash
# List open pull requests
gh pr list

# View specific PR
gh pr view <PR_NUMBER>

# Checkout PR locally for testing
gh pr checkout <PR_NUMBER>

# Test the changes
cd frontend && npm install && npm run lint && npm run build
cd ../backend && npm install && npm run lint && npm run test

# Approve PR
gh pr review <PR_NUMBER> --approve --body "LGTM! Approved."

# Merge PR
gh pr merge <PR_NUMBER> --merge
```

#### Release to Production
```bash
# Ensure on develop branch
git checkout develop
git pull origin develop

# Merge develop into main
git checkout main
git pull origin main
git merge develop

# Create release tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push main and tags
git push origin main
git push origin v1.0.0

# Create GitHub release
gh release create v1.0.0 \
  --title "Version 1.0.0" \
  --notes "First production release with scanner UI and Gemini integration"
```

---

## 9. Common Git Commands Reference

### Viewing Status and History
```bash
# Check current status
git status

# View commit history
git log --oneline --graph --all

# View changes
git diff
```

### Undoing Changes
```bash
# Discard local changes to a file
git checkout -- <file>

# Unstage file
git reset HEAD <file>

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

### Syncing with Remote
```bash
# Fetch all remote branches
git fetch --all

# Pull latest changes
git pull origin <branch>

# Push changes
git push origin <branch>
```

### Branch Management
```bash
# Create new branch
git checkout -b <branch-name>

# Switch branch
git checkout <branch-name>

# Delete local branch
git branch -d <branch-name>

# Delete remote branch
git push origin --delete <branch-name>
```

---

## 10. Troubleshooting

### Merge Conflicts
```bash
# When merge conflict occurs
git status  # See conflicting files

# Edit conflicting files manually
# Look for <<<<<<, =======, >>>>>> markers

# After resolving
git add <resolved-files>
git commit -m "Merge: resolved conflicts"
```

### Reset to Remote State
```bash
# Discard all local changes
git fetch origin
git reset --hard origin/<branch-name>
```

### Accidentally Committed to Wrong Branch
```bash
# Create new branch with current changes
git branch <new-branch>

# Reset current branch
git reset --hard HEAD~1

# Switch to new branch
git checkout <new-branch>
```

---

## 11. Best Practices

### Commit Messages
```bash
# Format: <type>(<scope>): <subject>

# Examples:
git commit -m "feat(frontend): add camera scanner component"
git commit -m "fix(backend): resolve Gemini API timeout issue"
git commit -m "docs: update API documentation"
git commit -m "refactor(frontend): restructure component hierarchy"
git commit -m "test(backend): add integration tests for image upload"
```

### Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

---

## 12. Quick Reference Card

### Initial Setup (One Time)
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/shridivyanshkotnala/jewellery-tag-intelligence-platform.git
git push -u origin main
```

### Daily Developer Workflow
```bash
# Start of day
git checkout develop
git pull origin develop
git checkout <your-feature-branch>
git merge develop

# During development
git add .
git commit -m "feat: your feature description"
git push origin <your-feature-branch>

# Create PR
gh pr create --base develop --head <your-feature-branch>
```

### Release Workflow
```bash
# From develop to main
git checkout main
git merge develop
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main --tags
```

---

## 📧 Support

For questions or issues with this setup guide:
- Create an issue in the repository
- Contact: Divyansh Kotnala (Product Owner)

---

**Last Updated:** June 2026
**Version:** 1.0.0
