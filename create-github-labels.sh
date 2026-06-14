#!/bin/bash

# Script to create GitHub labels for the repository
# Requires GitHub CLI (gh) to be installed and authenticated

set -e

echo "🏷️  Creating GitHub Labels"
echo "=========================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI."
    echo "Run: gh auth login"
    exit 1
fi

echo "✓ GitHub CLI is installed and authenticated"
echo ""

# Function to create label
create_label() {
    local name=$1
    local description=$2
    local color=$3
    
    if gh label list | grep -q "^${name}"; then
        echo "  ℹ Label '${name}' already exists - skipping"
    else
        gh label create "${name}" --description "${description}" --color "${color}"
        echo "  ✓ Created label: ${name}"
    fi
}

echo "Creating Type Labels..."
create_label "frontend" "Frontend related changes" "61dafb"
create_label "backend" "Backend related changes" "68a063"
create_label "documentation" "Documentation updates" "0075ca"
create_label "devops" "CI/CD and infrastructure" "e99695"

echo ""
echo "Creating Issue Type Labels..."
create_label "bug" "Bug reports" "d73a4a"
create_label "enhancement" "New features or improvements" "a2eeef"
create_label "technical-task" "Technical implementation task" "d4c5f9"

echo ""
echo "Creating Priority Labels..."
create_label "high-priority" "High priority items" "b60205"
create_label "medium-priority" "Medium priority items" "fbca04"
create_label "low-priority" "Low priority items" "0e8a16"

echo ""
echo "Creating Status Labels..."
create_label "blocked" "Blocked by dependencies" "000000"
create_label "needs-review" "Awaiting code review" "fbca04"
create_label "in-progress" "Currently being worked on" "0052cc"
create_label "ready-to-merge" "Approved and ready to merge" "0e8a16"

echo ""
echo "Creating Component Labels..."
create_label "api" "API related changes" "5319e7"
create_label "database" "Database related changes" "c5def5"
create_label "ui" "User interface changes" "d4c5f9"
create_label "testing" "Testing related" "c2e0c6"

echo ""
echo "✓ All labels created successfully!"
echo ""
echo "View labels at: https://github.com/shridivyanshkotnala/jewellery-tag-intelligence-platform/labels"
