#!/bin/bash

# Jewellery Tag Intelligence Platform - Repository Setup Script
# This script automates the initial Git and GitHub setup

set -e  # Exit on error

echo "🚀 Jewellery Tag Intelligence Platform - Repository Setup"
echo "=========================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REPO_NAME="jewellery-tag-intelligence-platform"
GITHUB_USERNAME="shridivyanshkotnala"
REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

print_success "Git is installed"

# Step 1: Initialize Git repository
echo ""
print_info "Step 1: Initializing Git repository..."

if [ -d .git ]; then
    print_info "Git repository already initialized"
else
    git init
    print_success "Git repository initialized"
fi

# Step 2: Configure Git user (if not already configured)
echo ""
print_info "Step 2: Configuring Git user..."

if [ -z "$(git config user.name)" ]; then
    read -p "Enter your name: " git_user_name
    git config user.name "$git_user_name"
    print_success "Git user name set to: $git_user_name"
else
    print_info "Git user name already configured: $(git config user.name)"
fi

if [ -z "$(git config user.email)" ]; then
    read -p "Enter your email: " git_user_email
    git config user.email "$git_user_email"
    print_success "Git user email set to: $git_user_email"
else
    print_info "Git user email already configured: $(git config user.email)"
fi

# Step 3: Add files to Git
echo ""
print_info "Step 3: Adding files to Git..."
git add .
print_success "Files added to staging area"

# Step 4: Create initial commit
echo ""
print_info "Step 4: Creating initial commit..."

if git rev-parse HEAD >/dev/null 2>&1; then
    print_info "Commits already exist"
else
    git commit -m "Initial commit: Project setup with frontend, backend, and docs structure"
    print_success "Initial commit created"
fi

# Step 5: Rename branch to main
echo ""
print_info "Step 5: Renaming default branch to main..."
git branch -M main
print_success "Branch renamed to main"

# Step 6: Add remote origin
echo ""
print_info "Step 6: Adding remote origin..."

if git remote | grep -q "^origin$"; then
    print_info "Remote 'origin' already exists"
    current_url=$(git remote get-url origin)
    if [ "$current_url" != "$REPO_URL" ]; then
        print_info "Updating remote URL from $current_url to $REPO_URL"
        git remote set-url origin "$REPO_URL"
        print_success "Remote URL updated"
    fi
else
    git remote add origin "$REPO_URL"
    print_success "Remote 'origin' added"
fi

# Step 7: Ask about pushing to GitHub
echo ""
print_info "Step 7: Push to GitHub"
echo ""
print_error "⚠️  IMPORTANT: Make sure you have created the repository on GitHub first!"
print_info "Repository URL: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
echo ""
read -p "Have you created the repository on GitHub? (y/n): " repo_created

if [ "$repo_created" = "y" ] || [ "$repo_created" = "Y" ]; then
    print_info "Pushing to GitHub..."
    git push -u origin main
    print_success "Pushed to GitHub successfully"
else
    print_error "Please create the repository on GitHub first, then run:"
    echo "  git push -u origin main"
    exit 0
fi

# Step 8: Create and push develop branch
echo ""
print_info "Step 8: Creating develop branch..."

if git show-ref --verify --quiet refs/heads/develop; then
    print_info "Branch 'develop' already exists"
else
    git checkout -b develop
    git push -u origin develop
    print_success "Branch 'develop' created and pushed"
fi

# Step 9: Create feature branches
echo ""
print_info "Step 9: Creating team feature branches..."

# Ensure we're on develop
git checkout develop

# Create Anamika's frontend branch
if git show-ref --verify --quiet refs/heads/feature/frontend-anamika; then
    print_info "Branch 'feature/frontend-anamika' already exists"
else
    git checkout -b feature/frontend-anamika
    git push -u origin feature/frontend-anamika
    print_success "Branch 'feature/frontend-anamika' created"
    git checkout develop
fi

# Create Ishika's backend branch
if git show-ref --verify --quiet refs/heads/feature/backend-ishika; then
    print_info "Branch 'feature/backend-ishika' already exists"
else
    git checkout -b feature/backend-ishika
    git push -u origin feature/backend-ishika
    print_success "Branch 'feature/backend-ishika' created"
    git checkout develop
fi

# Step 10: Summary
echo ""
echo "=========================================================="
print_success "Repository setup complete!"
echo "=========================================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Configure Branch Protection Rules on GitHub:"
echo "   → Go to: Settings → Branches → Add rule"
echo "   → Protect 'main' and 'develop' branches"
echo ""
echo "2. Create GitHub Labels:"
echo "   → Run the commands in SETUP_GUIDE.md (Section 6)"
echo "   → Or create labels manually on GitHub"
echo ""
echo "3. Create GitHub Milestones:"
echo "   → Run the commands in SETUP_GUIDE.md (Section 7)"
echo "   → Or create milestones manually on GitHub"
echo ""
echo "4. Team Members Setup:"
echo "   → Anamika: git clone $REPO_URL && git checkout feature/frontend-anamika"
echo "   → Ishika: git clone $REPO_URL && git checkout feature/backend-ishika"
echo ""
echo "📚 Documentation:"
echo "   → Setup Guide: SETUP_GUIDE.md"
echo "   → Commands Cheatsheet: COMMANDS_CHEATSHEET.md"
echo "   → Contributing Guide: CONTRIBUTING.md"
echo "   → Release Process: RELEASE_PROCESS.md"
echo ""
echo "🌿 Current branches:"
git branch -a
echo ""
print_success "Happy coding! 🚀"
