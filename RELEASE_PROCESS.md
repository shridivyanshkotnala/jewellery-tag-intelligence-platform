# Release Process

This document outlines the release process for the Jewellery Tag Intelligence Platform.

## Release Environments

### 1. Development Environment
- **Branch:** `develop`
- **URL:** TBD
- **Deployment:** Automatic on merge to `develop`
- **Purpose:** Integration testing and development

### 2. Staging Environment
- **Branch:** Release candidates (tags: `v*-rc*`)
- **URL:** TBD
- **Deployment:** Manual trigger
- **Purpose:** UAT and pre-production testing

### 3. Production Environment
- **Branch:** `main`
- **URL:** TBD
- **Deployment:** Manual trigger after release approval
- **Purpose:** Live production environment

## Release Versioning

We follow [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

- **MAJOR:** Breaking changes
- **MINOR:** New features (backward compatible)
- **PATCH:** Bug fixes (backward compatible)

### Examples
- `v1.0.0` - Initial release
- `v1.1.0` - New feature added
- `v1.1.1` - Bug fix
- `v2.0.0` - Breaking changes

## Release Workflow

### 1. Development Phase

```bash
# Work on features in feature branches
git checkout -b feature/new-scanner-ui develop

# Commit changes
git add .
git commit -m "feat(frontend): implement new scanner UI"

# Push and create PR to develop
git push origin feature/new-scanner-ui
gh pr create --base develop --head feature/new-scanner-ui
```

### 2. Testing Phase

```bash
# Merge approved PRs to develop
gh pr merge <PR_NUMBER> --merge

# Develop branch auto-deploys to development environment
# Team performs integration testing
```

### 3. Release Candidate Phase

```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.1.0

# Update version numbers in package.json
# Frontend
cd frontend
npm version 1.1.0 --no-git-tag-version

# Backend
cd ../backend
npm version 1.1.0 --no-git-tag-version

# Commit version bump
git add .
git commit -m "chore: bump version to 1.1.0"

# Push release branch
git push origin release/v1.1.0

# Create release candidate tag
git tag -a v1.1.0-rc1 -m "Release candidate 1 for v1.1.0"
git push origin v1.1.0-rc1

# Deploy to staging for UAT
```

### 4. UAT and Bug Fixes

```bash
# If bugs found during UAT
git checkout release/v1.1.0

# Fix bugs
git commit -m "fix: resolve issue found in UAT"

# Create new RC
git tag -a v1.1.0-rc2 -m "Release candidate 2 for v1.1.0"
git push origin v1.1.0-rc2

# Repeat until UAT passes
```

### 5. Production Release

```bash
# Merge release branch to main
git checkout main
git pull origin main
git merge release/v1.1.0

# Create production release tag
git tag -a v1.1.0 -m "Release version 1.1.0"
git push origin main
git push origin v1.1.0

# Create GitHub release with notes
gh release create v1.1.0 \
  --title "Version 1.1.0" \
  --notes-file RELEASE_NOTES.md

# Merge back to develop
git checkout develop
git merge release/v1.1.0
git push origin develop

# Delete release branch
git branch -d release/v1.1.0
git push origin --delete release/v1.1.0
```

## Release Notes Template

Create `RELEASE_NOTES.md` for each release:

```markdown
# Release v1.1.0

## 🎉 New Features

- **Scanner UI Enhancement** - Improved camera interface with zoom controls
- **Offline Mode** - App now works offline with sync capability

## 🐛 Bug Fixes

- Fixed crash when processing large images
- Resolved timeout issues with Gemini API

## 🔧 Improvements

- Performance optimization for image processing
- Reduced app bundle size by 15%

## ⚠️ Breaking Changes

None

## 📦 Dependencies

- Updated React Native to 0.72.0
- Updated Node.js requirement to 18.x

## 🔗 Links

- [Full Changelog](https://github.com/shridivyanshkotnala/jewellery-tag-intelligence-platform/compare/v1.0.0...v1.1.0)
- [Documentation](https://github.com/shridivyanshkotnala/jewellery-tag-intelligence-platform/tree/v1.1.0/docs)

## 👥 Contributors

- @divyanshkotnala
- @anamika
- @ishika
```

## Hotfix Process

For critical production bugs:

```bash
# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/v1.1.1

# Fix the critical bug
git commit -m "fix: resolve critical production bug"

# Update version
cd frontend && npm version patch --no-git-tag-version
cd ../backend && npm version patch --no-git-tag-version
git commit -am "chore: bump version to 1.1.1"

# Merge to main
git checkout main
git merge hotfix/v1.1.1

# Tag and push
git tag -a v1.1.1 -m "Hotfix release v1.1.1"
git push origin main
git push origin v1.1.1

# Merge back to develop
git checkout develop
git merge hotfix/v1.1.1
git push origin develop

# Delete hotfix branch
git branch -d hotfix/v1.1.1
```

## Release Checklist

### Pre-Release
- [ ] All milestone issues closed
- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json files
- [ ] Release notes prepared
- [ ] Team notified of upcoming release

### Release
- [ ] Release branch created
- [ ] RC deployed to staging
- [ ] UAT completed successfully
- [ ] No critical bugs found
- [ ] Release approved by product owner
- [ ] Merged to main
- [ ] Tagged with version
- [ ] GitHub release created
- [ ] Deployed to production

### Post-Release
- [ ] Production deployment verified
- [ ] Monitoring checks normal
- [ ] Team notified of release
- [ ] Release notes published
- [ ] Documentation updated
- [ ] Social media announcement (if applicable)

## Rollback Process

If critical issues are found in production:

```bash
# Revert to previous version
git checkout main
git revert <release-commit-hash>
git push origin main

# Or tag and deploy previous stable version
git checkout v1.0.0
git tag -a v1.0.0-rollback -m "Rollback to v1.0.0"
git push origin v1.0.0-rollback

# Deploy v1.0.0-rollback to production
```

## Communication Plan

### Internal Team
- Slack/Discord notification
- Email to stakeholders
- Update project status board

### External (if applicable)
- Blog post
- Social media
- Email to users
- Update website

## Monitoring Post-Release

After each release, monitor for 24-48 hours:
- Error rates
- API response times
- User feedback
- Crash reports
- Performance metrics

## Questions?

Contact: @divyanshkotnala (Product Owner)
