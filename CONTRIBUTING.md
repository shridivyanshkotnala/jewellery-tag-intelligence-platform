# Contributing to Jewellery Tag Intelligence Platform

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing Guidelines](#testing-guidelines)

## Code of Conduct

We expect all contributors to:
- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the project and community
- Show empathy towards other contributors

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/jewellery-tag-intelligence-platform.git
cd jewellery-tag-intelligence-platform
```

### 2. Set Up Upstream Remote

```bash
git remote add upstream https://github.com/shridivyanshkotnala/jewellery-tag-intelligence-platform.git
git fetch upstream
```

### 3. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

## Development Workflow

### 1. Create a Feature Branch

```bash
# Always branch from develop
git checkout develop
git pull upstream develop
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write clean, maintainable code
- Follow the existing code style
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
# Frontend
cd frontend
npm run lint
npm run build

# Backend
cd backend
npm run lint
npm run test
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat(scope): description of changes"
```

### 5. Keep Your Branch Updated

```bash
git fetch upstream
git rebase upstream/develop
```

### 6. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without feature changes
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates
- `ci`: CI/CD changes

### Scopes

- `frontend`: Frontend changes
- `backend`: Backend changes
- `api`: API changes
- `ui`: UI components
- `docs`: Documentation
- `config`: Configuration files

### Examples

```bash
feat(frontend): add camera scanner component
fix(backend): resolve Gemini API timeout issue
docs(readme): update installation instructions
refactor(api): restructure image upload endpoint
test(backend): add unit tests for abbreviation engine
chore(deps): update dependencies to latest versions
```

## Pull Request Process

### 1. Create Pull Request

- Use the PR template
- Provide clear description
- Link related issues
- Add screenshots for UI changes
- Ensure all CI checks pass

### 2. Code Review

- Address reviewer feedback promptly
- Make requested changes in new commits
- Don't force-push after review starts
- Discuss disagreements respectfully

### 3. Merge Requirements

- ✅ All CI checks passing
- ✅ At least 1 approval from code owner
- ✅ No merge conflicts
- ✅ Branch is up to date with base branch

## Code Style

### JavaScript/TypeScript

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons
- Use arrow functions where appropriate
- Use async/await over promises

### React/React Native

- Use functional components with hooks
- Use TypeScript for type safety
- Follow component naming conventions (PascalCase)
- Keep components small and focused

### Node.js

- Use async/await for asynchronous code
- Implement proper error handling
- Use meaningful variable names
- Add JSDoc comments for functions

### Example

```typescript
/**
 * Process jewellery tag image using Gemini Vision API
 * @param {Buffer} imageBuffer - The image buffer to process
 * @returns {Promise<TagData>} Extracted tag data
 */
async function processTagImage(imageBuffer: Buffer): Promise<TagData> {
  try {
    const response = await geminiClient.analyzeImage(imageBuffer);
    return parseResponse(response);
  } catch (error) {
    logger.error('Failed to process tag image', error);
    throw new ImageProcessingError('Image processing failed');
  }
}
```

## Testing Guidelines

### Frontend Tests

```typescript
// Component tests
describe('CameraScanner', () => {
  it('should capture image when button is pressed', async () => {
    const { getByTestId } = render(<CameraScanner />);
    const captureButton = getByTestId('capture-button');
    
    fireEvent.press(captureButton);
    
    await waitFor(() => {
      expect(mockCaptureImage).toHaveBeenCalled();
    });
  });
});
```

### Backend Tests

```typescript
// API endpoint tests
describe('POST /api/tags/process', () => {
  it('should process valid tag image', async () => {
    const response = await request(app)
      .post('/api/tags/process')
      .attach('image', 'test/fixtures/sample-tag.jpg')
      .expect(200);
    
    expect(response.body).toHaveProperty('tagData');
    expect(response.body.tagData).toHaveProperty('weight');
  });
});
```

### Test Coverage

- Aim for >80% code coverage
- Test happy paths and error cases
- Mock external dependencies
- Write integration tests for critical flows

## Questions?

If you have questions:
- Check existing [documentation](docs/)
- Search [existing issues](https://github.com/shridivyanshkotnala/jewellery-tag-intelligence-platform/issues)
- Create a new issue with the `question` label
- Ask in [Discussions](https://github.com/shridivyanshkotnala/jewellery-tag-intelligence-platform/discussions)

## Recognition

Contributors will be recognized in:
- Repository README
- Release notes
- Project documentation

Thank you for contributing! 🙏
