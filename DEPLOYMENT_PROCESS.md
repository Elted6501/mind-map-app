# Unit Test Deployment Process

## Overview
This document outlines the deployment process for unit tests in the Mind Map Application repository. It defines our branching strategy, merge rules, and step-by-step deployment procedures to ensure code quality and team collaboration.

## Table of Contents
- [Branching Strategy](#branching-strategy)
- [Merge Rules](#merge-rules)
- [Prerequisites](#prerequisites)
- [Development Workflow](#development-workflow)
- [Deployment Steps](#deployment-steps)
- [Code Review Guidelines](#code-review-guidelines)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## Branching Strategy

We follow a **two-branch strategy** with `main` and `dev` as our primary branches:

### Branch Structure

```
main (production)
  └── dev (development/integration)
       ├── feature/feature-name
       ├── bugfix/bug-description
       └── test/test-description
```

### Branch Descriptions

- **`main`**: Production-ready code. Only stable, tested code is merged here.
- **`dev`**: Integration branch for ongoing development. All features are merged here first.
- **`feature/*`**: Individual feature branches created from `dev`.
- **`bugfix/*`**: Bug fix branches created from `dev`.
- **`test/*`**: Branches specifically for adding or updating unit tests.

---

## Merge Rules

### Main Branch Protection Rules

1. **Required Pull Request Reviews**
   - At least **2 approvals** required before merging to `main`
   - Code owners must review changes in their respective areas
   - All comments must be resolved

2. **Status Checks**
   - All CI/CD pipeline tests must pass
   - Unit test coverage must meet minimum threshold (80%)
   - No merge conflicts allowed
   - Linting and code style checks must pass

3. **Direct Commits**
   - Direct commits to `main` are **prohibited**
   - All changes must go through pull requests

### Dev Branch Protection Rules

1. **Required Pull Request Reviews**
   - At least **1 approval** required before merging to `dev`
   - Self-approval is not permitted

2. **Status Checks**
   - All automated tests must pass
   - Build must succeed
   - No blocking review comments

3. **Branch Updates**
   - Branch must be up-to-date with `dev` before merging

---

## Prerequisites

Before you begin deployment, ensure you have the following:

### Required Tools
- **Git** (version 2.30 or higher)
- **Node.js** (version 18.x or higher)
- **npm** or **yarn** package manager
- **GitHub CLI** (optional but recommended)

### Required Access
- Write access to the repository
- GitHub account with proper permissions
- SSH key or Personal Access Token configured

### Environment Setup
```bash
# Verify Git installation
git --version

# Verify Node.js installation
node --version

# Verify npm installation
npm --version
```

### Repository Setup
```bash
# Clone the repository
git clone git@github.com:Elted6501/mind-map-app.git

# Navigate to the project directory
cd nextjs-mind-map

# Install dependencies
npm install

# Verify tests can run
npm test
```

---

## Development Workflow

### 1. Creating a New Feature/Test Branch

```bash
# Ensure you're on the dev branch
git checkout dev

# Pull latest changes
git pull origin dev

# Create a new branch for your feature/test
git checkout -b test/add-canvas-unit-tests
# or
git checkout -b feature/new-feature-name
```

### 2. Making Changes

```bash
# Make your code changes and add unit tests

# Check status of your changes
git status

# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "test: add unit tests for Canvas component"
```

**Commit Message Conventions:**
- `test:` - Adding or updating tests
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

### 3. Running Tests Locally

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- Canvas.test.tsx
```

### 4. Pushing Your Branch

```bash
# Push your branch to GitHub
git push origin test/add-canvas-unit-tests

# If branch exists remotely, force push if needed (use with caution)
git push --force-with-lease origin test/add-canvas-unit-tests
```

---

## Deployment Steps

### Step 1: Create Pull Request to Dev

1. **Navigate to GitHub Repository**
   - Go to: https://github.com/Elted6501/mind-map-app

2. **Create Pull Request**
   - Click "Pull requests" tab
   - Click "New pull request"
   - Set base branch to `dev`
   - Set compare branch to your feature/test branch
   - Fill out PR template:

```markdown
## Description
Brief description of changes made

## Type of Change
- [ ] New unit tests
- [ ] Updated existing tests
- [ ] Bug fix
- [ ] New feature

## Testing
- [ ] All tests pass locally
- [ ] Added new tests for new functionality
- [ ] Test coverage maintained/improved

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated if needed
- [ ] No console errors or warnings
```

3. **Request Reviewers**
   - Assign at least 1 reviewer
   - Add relevant labels (e.g., `testing`, `enhancement`)
   - Link related issues if applicable

### Step 2: Code Review Process

1. **Reviewer Responsibilities**
   - Review code for quality, clarity, and correctness
   - Check test coverage and test quality
   - Verify tests are meaningful and not just for coverage
   - Approve or request changes

2. **Address Feedback**
   ```bash
   # Make requested changes
   git add .
   git commit -m "test: address review feedback"
   git push origin test/add-canvas-unit-tests
   ```

3. **Resolve Conversations**
   - Address all review comments
   - Mark conversations as resolved
   - Re-request review if needed

### Step 3: Merge to Dev

Once approved and all checks pass:

1. **Update Branch** (if needed)
   ```bash
   git checkout dev
   git pull origin dev
   git checkout test/add-canvas-unit-tests
   git merge dev
   # Resolve any conflicts
   git push origin test/add-canvas-unit-tests
   ```

2. **Merge Pull Request**
   - Click "Merge pull request" on GitHub
   - Choose merge strategy (usually "Squash and merge" for cleaner history)
   - Confirm merge
   - Delete branch after merge

### Step 4: Testing in Dev Branch

After merging to `dev`:

```bash
# Switch to dev branch
git checkout dev

# Pull latest changes
git pull origin dev

# Run full test suite
npm test

# Verify build
npm run build

# Run application locally
npm run dev
```

### Step 5: Deploying to Main (Production)

**Timing:** Only when `dev` branch is stable and ready for production release.

1. **Create Pull Request from Dev to Main**
   - Base: `main`
   - Compare: `dev`
   - Title: "Release v1.x.x - [Brief description]"

2. **Release PR Requirements**
   - All tests passing on `dev`
   - No open critical bugs
   - Documentation up-to-date
   - Release notes prepared
   - **2 approvals required**

3. **Pre-Merge Checklist**
   - [ ] All automated tests pass
   - [ ] Manual testing completed
   - [ ] Performance testing done
   - [ ] Security review completed
   - [ ] Changelog updated
   - [ ] Version bumped (package.json)

4. **Merge to Main**
   ```bash
   # After PR approval, merge via GitHub UI
   # Then locally:
   git checkout main
   git pull origin main
   
   # Tag the release
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

---

## Code Review Guidelines

### What Reviewers Should Check

#### Unit Tests Quality
- [ ] Tests are comprehensive and cover edge cases
- [ ] Tests are independent and can run in any order
- [ ] Test names clearly describe what is being tested
- [ ] Mocks and stubs are used appropriately
- [ ] No hardcoded values; use fixtures or factories
- [ ] Assertions are specific and meaningful

#### Code Quality
- [ ] Code is clean, readable, and well-organized
- [ ] No unnecessary complexity
- [ ] Proper error handling
- [ ] Security best practices followed
- [ ] Performance considerations addressed

#### Documentation
- [ ] Complex logic is commented
- [ ] README updated if needed
- [ ] API changes documented
- [ ] Breaking changes highlighted

### Review Response Times
- **Standard PRs**: 24-48 hours
- **Urgent fixes**: 4-8 hours
- **Minor changes**: 12-24 hours

### Approval Criteria
- Code meets all acceptance criteria
- All tests pass
- No blocking concerns raised
- Documentation is adequate

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Tests Failing Locally
```bash
# Clear node modules and reinstall
rm -rf node_modules
npm install

# Clear test cache
npm test -- --clearCache

# Update snapshots if needed
npm test -- -u
```

#### Issue 2: Merge Conflicts
```bash
# Update your branch with latest dev
git checkout dev
git pull origin dev
git checkout your-branch-name
git merge dev

# Resolve conflicts in your editor
# Then:
git add .
git commit -m "resolve: merge conflicts with dev"
git push origin your-branch-name
```

#### Issue 3: CI/CD Pipeline Failures
1. Check the GitHub Actions logs
2. Run tests locally with same Node version as CI
3. Check for environment-specific issues
4. Verify all dependencies are in package.json

#### Issue 4: Branch Protection Preventing Push
```bash
# You cannot push directly to protected branches
# Always create a feature branch and PR

git checkout -b feature/your-feature
# Make changes
git push origin feature/your-feature
# Then create PR on GitHub
```

#### Issue 5: Test Coverage Below Threshold
```bash
# Check current coverage
npm test -- --coverage

# Identify uncovered lines
# Add tests for uncovered code paths
# Re-run coverage report
```

#### Issue 6: Failed to Push - Branch Behind Remote
```bash
# Pull and rebase
git pull --rebase origin dev

# If conflicts, resolve them then:
git rebase --continue

# Force push with lease (safer than force push)
git push --force-with-lease origin your-branch-name
```

---

## Best Practices

### Testing Best Practices
1. **Write Tests First** (TDD approach when possible)
2. **Test Behavior, Not Implementation**
3. **Keep Tests Fast** - Unit tests should run quickly
4. **Use Descriptive Test Names** - `it('should render error message when API call fails')`
5. **One Assertion Per Test** (when practical)
6. **Mock External Dependencies** - APIs, databases, file systems
7. **Maintain High Coverage** - Aim for 80%+ coverage
8. **Test Edge Cases** - Empty arrays, null values, boundary conditions

### Git Best Practices
1. **Commit Often** - Small, logical commits
2. **Write Clear Commit Messages** - Follow conventional commits
3. **Keep Branches Short-Lived** - Merge within 1-2 days
4. **Rebase Feature Branches** - Keep history clean
5. **Never Commit Secrets** - Use environment variables
6. **Review Your Own Code First** - Before requesting review

### Collaboration Best Practices
1. **Communicate Early** - Discuss major changes before implementing
2. **Be Respectful in Reviews** - Constructive feedback only
3. **Respond to Reviews Promptly** - Don't block team progress
4. **Update PRs Regularly** - Keep them current with base branch
5. **Document Decisions** - Use PR comments to explain choices

### Code Organization
1. **Group Related Tests** - Use `describe` blocks effectively
2. **Use Setup and Teardown** - `beforeEach`, `afterEach` for common setup
3. **Share Test Utilities** - Create helper functions for common test operations
4. **Organize Test Files** - Mirror source code structure

---

## Additional Resources

### Documentation Links
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [GitHub Flow Guide](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Conventional Commits](https://www.conventionalcommits.org/)

### Team Contacts
- **Repository Owner**: @Elted6501
- **Tech Lead**: [Contact Name]
- **QA Lead**: [Contact Name]

### Related Documents
- [README.md](./README.md) - Project overview and setup
- [PRD.md](./PRD.md) - Product requirements
- [.github/workflows/main.yml](./.github/workflows/main.yml) - CI/CD configuration

---

## Revision History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2025-11-17 | 1.0.0 | Initial | Created deployment process documentation |

---

## Questions or Issues?

If you encounter any issues not covered in this document or have suggestions for improvement:

1. Open an issue in the repository
2. Tag it with `documentation` label
3. Provide detailed description of the problem or suggestion

**Remember**: Good documentation benefits everyone. If something is unclear, it probably needs improvement!
