# ⚡ Quick Start Guide

Get your repository up and running in 5 minutes!

## 🎯 Prerequisites

Before starting, ensure you have:

- [ ] Git installed (`git --version`)
- [ ] GitHub account created
- [ ] GitHub CLI installed (optional but recommended: `gh --version`)

## 📝 Option 1: Automated Setup (Recommended)

### Step 1: Make Scripts Executable

```bash
cd "/home/divyanshkotnala/Desktop/Projects Delivery/Jwellery"
chmod +x setup-repository.sh
chmod +x create-github-labels.sh
chmod +x create-github-milestones.sh
```

### Step 2: Create GitHub Repository

**Via Web Interface:**
1. Go to https://github.com/new
2. Repository name: `jewellery-tag-intelligence-platform`
3. Description: `AI-powered jewellery tag scanning platform using Gemini Vision API`
4. Choose: Private
5. **DO NOT** check any initialization options
6. Click "Create repository"

**Or via GitHub CLI:**
```bash
gh auth login
gh repo create jewellery-tag-intelligence-platform --private --description "AI-powered jewellery tag scanning platform"
```

### Step 3: Run Setup Script

```bash
./setup-repository.sh
```

This script will:
- ✓ Initialize Git repository
- ✓ Create initial commit
- ✓ Push to GitHub
- ✓ Create develop branch
- ✓ Create team feature branches

### Step 4: Create Labels (Optional)

```bash
gh auth login  # If not already logged in
./create-github-labels.sh
```

### Step 5: Create Milestones (Optional)

```bash
./create-github-milestones.sh
```

### Step 6: Configure Branch Protection

Go to GitHub repository settings and configure branch protection:

**For `main` branch:**
```
Settings → Branches → Add rule
- Branch name: main
- ✓ Require pull request before merging
- ✓ Require approvals (1)
- ✓ Require status checks to pass
```

**For `develop` branch:**
```
Settings → Branches → Add rule
- Branch name: develop
- ✓ Require pull request before merging
- ✓ Require approvals (1)
```

---

## 🔧 Option 2: Manual Setup

### Step 1: Initialize Git

```bash
cd "/home/divyanshkotnala/Desktop/Projects Delivery/Jwellery"
git init
git add .
git commit -m "Initial commit: Project setup with frontend, backend, and docs"
```

### Step 2: Create GitHub Repository

Create at: https://github.com/new
- Name: `jewellery-tag-intelligence-platform`
- Private repository
- Don't initialize with anything

### Step 3: Connect and Push

```bash
git branch -M main
git remote add origin https://github.com/shridivyanshkotnala/jewellery-tag-intelligence-platform.git
git push -u origin main
```

### Step 4: Create Branches

```bash
# Create develop
git checkout -b develop
git push -u origin develop

# Create Anamika's branch
git checkout -b feature/frontend-anamika develop
git push -u origin feature/frontend-anamika

# Create Ishika's branch
git checkout develop
git checkout -b feature/backend-ishika develop
git push -u origin feature/backend-ishika

# Return to develop
git checkout develop
```

### Step 5: Configure GitHub

Manually set up:
- Branch protection rules (Settings → Branches)
- Labels (Issues → Labels → New label)
- Milestones (Issues → Milestones → New milestone)

---

## 👥 Team Member Setup

### For Anamika (Frontend)

```bash
# Clone repository
git clone https://github.com/shridivyanshkotnala/jewellery-tag-intelligence-platform.git
cd jewellery-tag-intelligence-platform

# Switch to your branch
git checkout feature/frontend-anamika

# Install dependencies
cd frontend
npm install

# Start working!
```

### For Ishika (Backend)

```bash
# Clone repository
git clone https://github.com/shridivyanshkotnala/jewellery-tag-intelligence-platform.git
cd jewellery-tag-intelligence-platform

# Switch to your branch
git checkout feature/backend-ishika

# Install dependencies
cd backend
npm install

# Start working!
```

---

## ✅ Verification

After setup, verify everything is correct:

```bash
# Check branches
git branch -a

# Should show:
# * develop
#   feature/backend-ishika
#   feature/frontend-anamika
#   main
#   remotes/origin/develop
#   remotes/origin/feature/backend-ishika
#   remotes/origin/feature/frontend-anamika
#   remotes/origin/main

# Check remotes
git remote -v

# Should show:
# origin  https://github.com/shridivyanshkotnala/jewellery-tag-intelligence-platform.git (fetch)
# origin  https://github.com/shridivyanshkotnala/jewellery-tag-intelligence-platform.git (push)
```

Check GitHub:
- [ ] Repository created
- [ ] All branches visible
- [ ] Branch protection rules set
- [ ] Labels created (if using script)
- [ ] Milestones created (if using script)

---

## 🚀 Start Developing

### Daily Workflow

```bash
# 1. Pull latest changes
git checkout develop
git pull origin develop

# 2. Switch to your feature branch
git checkout feature/frontend-anamika  # or feature/backend-ishika

# 3. Merge develop into your branch
git merge develop

# 4. Make changes and commit
git add .
git commit -m "feat(frontend): implement camera scanner"

# 5. Push to GitHub
git push origin feature/frontend-anamika

# 6. Create Pull Request on GitHub
# Go to repository → Pull Requests → New Pull Request
```

---

## 📚 Next Steps

1. **Read the Documentation:**
   - [Setup Guide](SETUP_GUIDE.md) - Comprehensive setup instructions
   - [Commands Cheatsheet](COMMANDS_CHEATSHEET.md) - Common Git commands
   - [Contributing Guide](CONTRIBUTING.md) - How to contribute
   - [Release Process](RELEASE_PROCESS.md) - Release workflow

2. **Configure Your Environment:**
   - Set up frontend development environment
   - Set up backend development environment
   - Configure API keys (Gemini Vision)

3. **Start First Task:**
   - Check project milestones
   - Pick an issue to work on
   - Create a branch and start coding

---

## 🆘 Troubleshooting

### "Permission denied" when pushing

```bash
# Check remote URL
git remote -v

# If using HTTPS, you may need to authenticate
gh auth login

# Or set up SSH keys
```

### "Remote already exists"

```bash
# Update remote URL
git remote set-url origin https://github.com/shridivyanshkotnala/jewellery-tag-intelligence-platform.git
```

### "Branch protection rule violations"

- You cannot push directly to `main` or `develop`
- Always push to your feature branch
- Create a Pull Request to merge changes

---

## 💡 Tips

- Run `git status` frequently to check your current state
- Commit often with meaningful messages
- Pull from develop regularly to avoid large merge conflicts
- Ask for help in team chat if stuck

---

## 📧 Support

- Check existing documentation in `/docs`
- Create an issue on GitHub
- Ask in team Slack/Discord
- Contact: @divyanshkotnala

---

**Ready to build something amazing! 🚀**
