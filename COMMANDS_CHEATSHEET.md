# 🚀 Git Commands Cheatsheet - Jewellery Tag Intelligence Platform

Quick reference for daily Git operations.

## 🏁 Initial Setup (One Time Only)

```bash
# Initialize and push to GitHub
cd "/home/divyanshkotnala/Desktop/Projects Delivery/Jwellery"
git init
git add .
git commit -m "Initial commit: Project setup with frontend, backend, and docs"
git branch -M main
git remote add origin https://github.com/shridivyanshkotnala/jewellery-tag-intelligence-platform.git
git push -u origin main

# Create develop branch
git checkout -b develop
git push -u origin develop

# Create team feature branches
git checkout -b feature/frontend-anamika develop
git push -u origin feature/frontend-anamika

git checkout develop
git checkout -b feature/backend-ishika develop
git push -u origin feature/backend-ishika

git checkout develop
```

## 👤 For Anamika (Frontend Developer)

### First Time Setup
```bash
git clone https://github.com/shridivyanshkotnala/jewellery-tag-intelligence-platform.git
cd jewellery-tag-intelligence-platform
git checkout feature/frontend-anamika
cd frontend
npm install
```

### Daily Workflow
```bash
# Start your day - sync with develop
git checkout develop
git pull origin develop
git checkout feature/frontend-anamika
git merge develop

# Make your changes to frontend code
# ...edit files...

# Commit changes
git add .
git commit -m "feat(frontend): add camera zoom controls"
git push origin feature/frontend-anamika

# Create Pull Request (when ready)
gh pr create --base develop --head feature/frontend-anamika --title "feat: Camera zoom controls" --body "Implements zoom functionality for scanner"
```

### Common Tasks
```bash
# Check status
git status

# View changes
git diff

# Discard local changes
git checkout -- <filename>

# Update from develop
git fetch origin
git merge origin/develop

# See commit history
git log --oneline --graph
```

## 👤 For Ishika (Backend Developer)

### First Time Setup
```bash
git clone https://github.com/shridivyanshkotnala/jewellery-tag-intelligence-platform.git
cd jewellery-tag-intelligence-platform
git checkout feature/backend-ishika
cd backend
npm install
```

### Daily Workflow
```bash
# Start your day - sync with develop
git checkout develop
git pull origin develop
git checkout feature/backend-ishika
git merge develop

# Make your changes to backend code
# ...edit files...

# Commit changes
git add .
git commit -m "feat(backend): implement tag data validation"
git push origin feature/backend-ishika

# Create Pull Request (when ready)
gh pr create --base develop --head feature/backend-ishika --title "feat: Tag data validation" --body "Adds validation for extracted tag data"
```

### Common Tasks
```bash
# Check status
git status

# Run tests before committing
npm run test

# Commit specific files
git add src/validators/tagValidator.js
git commit -m "feat(backend): add tag weight validator"

# Update from develop
git fetch origin
git merge origin/develop
```

## 👤 For Divyansh (Architect/Product Owner)

### Review & Merge PRs
```bash
# List all open PRs
gh pr list

# View specific PR details
gh pr view 5

# Checkout and test PR locally
gh pr checkout 5

# Test frontend PR
cd frontend
npm install
npm run lint
npm run build

# Test backend PR
cd backend
npm install
npm run lint
npm run test

# If tests pass, approve and merge
gh pr review 5 --approve --body "LGTM! Great work."
gh pr merge 5 --merge
```

### Release to Production
```bash
# Prepare release
git checkout develop
git pull origin develop

# Merge to main
git checkout main
git pull origin main
git merge develop

# Create release tag
git tag -a v1.0.0 -m "Release version 1.0.0 - Scanner UI and Gemini integration"
git push origin main
git push origin v1.0.0

# Create GitHub release
gh release create v1.0.0 \
  --title "Version 1.0.0 - Initial Release" \
  --notes "First production release with scanner UI and Gemini Vision integration"
```

### Manage Milestones and Issues
```bash
# Create new issue
gh issue create --title "Implement offline mode" --body "Add offline support with sync" --label enhancement,high-priority --milestone "Milestone 1: Scanner UI"

# List issues
gh issue list

# Close issue
gh issue close 10

# View milestone progress
gh api repos/shridivyanshkotnala/jewellery-tag-intelligence-platform/milestones
```

## 🔧 Common Scenarios

### Scenario: Merge Conflict

```bash
# When you see merge conflict
git status  # Shows conflicting files

# Open conflicting files and look for:
# <<<<<<< HEAD
# your changes
# =======
# incoming changes
# >>>>>>> branch-name

# After resolving conflicts manually:
git add <resolved-file>
git commit -m "Merge: resolve conflicts with develop"
git push origin <your-branch>
```

### Scenario: Accidentally Committed to Wrong Branch

```bash
# If you committed to develop instead of feature branch
git checkout develop
git log --oneline  # Note the commit hash you want to move

# Create branch with these commits
git checkout -b feature/my-feature

# Reset develop to before your commits
git checkout develop
git reset --hard origin/develop
```

### Scenario: Need to Undo Last Commit

```bash
# Undo commit but keep changes
git reset --soft HEAD~1

# Undo commit and discard changes
git reset --hard HEAD~1

# Undo pushed commit (creates new commit)
git revert HEAD
git push origin <branch>
```

### Scenario: Want to Discard All Local Changes

```bash
# Discard all uncommitted changes
git reset --hard HEAD

# Also remove untracked files
git clean -fd
```

### Scenario: See What Changed in Last Commit

```bash
# View last commit
git show

# View specific commit
git show <commit-hash>

# View changes in specific file
git show HEAD:path/to/file
```

## 🎯 Commit Message Examples

### Frontend Commits (Anamika)
```bash
git commit -m "feat(frontend): add camera component with flash toggle"
git commit -m "fix(frontend): resolve image preview rotation issue"
git commit -m "style(frontend): update scanner button styling"
git commit -m "refactor(frontend): extract camera logic into custom hook"
```

### Backend Commits (Ishika)
```bash
git commit -m "feat(backend): implement Gemini Vision API client"
git commit -m "fix(backend): handle timeout errors in image processing"
git commit -m "test(backend): add tests for abbreviation parser"
git commit -m "refactor(backend): restructure tag processing pipeline"
```

## 📊 Useful Git Commands

### Check Repository Status
```bash
# Detailed status
git status

# Short status
git status -s

# Show branch info
git branch -a

# Show remote info
git remote -v
```

### View History
```bash
# Pretty log
git log --oneline --graph --all --decorate

# Last 5 commits
git log -5

# Commits by author
git log --author="Anamika"

# Commits in date range
git log --since="2 weeks ago"
```

### Stashing Changes
```bash
# Save work in progress
git stash save "WIP: camera feature"

# List stashes
git stash list

# Apply latest stash
git stash pop

# Apply specific stash
git stash apply stash@{0}

# Delete stash
git stash drop stash@{0}
```

### Branching
```bash
# List branches
git branch

# Create branch
git branch feature/new-feature

# Create and switch
git checkout -b feature/new-feature

# Switch branch
git checkout develop

# Delete local branch
git branch -d feature/old-feature

# Delete remote branch
git push origin --delete feature/old-feature
```

## 🆘 Emergency Commands

### "Help! I broke everything!"
```bash
# Reset to last known good state
git fetch origin
git reset --hard origin/<your-branch>
```

### "I need to start over!"
```bash
# Delete all local changes and untracked files
git reset --hard HEAD
git clean -fd
```

### "I accidentally deleted important code!"
```bash
# Find the commit before deletion
git reflog

# Restore from that commit
git checkout <commit-hash> -- path/to/deleted/file
```

## 🔗 Helpful Aliases (Optional Setup)

Add to `~/.gitconfig`:

```bash
[alias]
    st = status
    co = checkout
    br = branch
    cm = commit -m
    lg = log --oneline --graph --all --decorate
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = log --oneline --graph --all --decorate --color
```

Then use:
```bash
git st          # instead of git status
git co develop  # instead of git checkout develop
git cm "message" # instead of git commit -m "message"
git lg          # pretty log
```

## 📚 Resources

- [Setup Guide](SETUP_GUIDE.md) - Complete setup instructions
- [Contributing Guide](CONTRIBUTING.md) - Contribution guidelines
- [Release Process](RELEASE_PROCESS.md) - Release workflow

## 🆘 Need Help?

- Check existing issues: `gh issue list`
- Create new issue: `gh issue create`
- Ask team on Slack/Discord
- Contact: @divyanshkotnala

---

**Quick Tip:** Run `git status` frequently to know where you are!
