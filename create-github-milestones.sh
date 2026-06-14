#!/bin/bash

# Script to create GitHub milestones for the repository
# Requires GitHub CLI (gh) to be installed and authenticated

set -e

echo "🎯 Creating GitHub Milestones"
echo "=============================="
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

REPO="shridivyanshkotnala/jewellery-tag-intelligence-platform"

# Function to create milestone
create_milestone() {
    local title=$1
    local description=$2
    local due_date=$3
    
    echo "Creating: ${title}"
    
    gh api "repos/${REPO}/milestones" \
        --method POST \
        --field title="${title}" \
        --field description="${description}" \
        --field due_on="${due_date}" \
        > /dev/null 2>&1 && echo "  ✓ Created: ${title}" || echo "  ℹ Milestone '${title}' may already exist"
}

echo "Creating milestones..."
echo ""

# Milestone 1: Scanner UI
create_milestone \
    "Milestone 1: Scanner UI" \
    "Mobile camera integration, tag capture interface, and image preview functionality" \
    "2026-07-15T00:00:00Z"

# Milestone 2: Gemini Vision Integration
create_milestone \
    "Milestone 2: Gemini Vision Integration" \
    "API integration with Google Gemini Vision, image upload pipeline, and response parsing" \
    "2026-08-15T00:00:00Z"

# Milestone 3: Abbreviation Engine
create_milestone \
    "Milestone 3: Abbreviation Engine" \
    "Abbreviation mapping system, data normalization, and validation rules implementation" \
    "2026-09-15T00:00:00Z"

# Milestone 4: Review Workflow
create_milestone \
    "Milestone 4: Review Workflow" \
    "Manual review interface, edit capabilities, and approval system for processed tags" \
    "2026-10-15T00:00:00Z"

# Milestone 5: Dataset Export
create_milestone \
    "Milestone 5: Dataset Export" \
    "Export formats (CSV, JSON, Excel), bulk operations, and data analytics dashboard" \
    "2026-11-15T00:00:00Z"

echo ""
echo "✓ All milestones created successfully!"
echo ""
echo "View milestones at: https://github.com/${REPO}/milestones"
