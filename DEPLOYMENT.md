# 📋 Unit Test Deployment Process

## Overview
This document outlines the deployment process for unit tests in the Mind Map Application repository. It defines our branching strategy, merge rules, and step-by-step deployment procedures to ensure code quality and team collaboration.

## Table of Contents
- [Branching Strategy](#branching-strategy)
- [Merge Rules](#merge-rules)
- [GitHub Actions Workflows](#github-actions-workflows)
- [Development Workflow](#development-workflow)
- [Testing Best Practices](#testing-best-practices)
- [Common Issues and Solutions](#common-issues-and-solutions)
- [Code Review Guidelines](#code-review-guidelines)

---

## Branching Strategy

We use a **two-branch strategy** for organized development:

```
main (production)
  └── dev (development/integration)
       ├── feature/feature-name
       ├── bugfix/bug-description
       └── test/test-description
```

### Branch Descriptions

- **`main`**: Production-ready code only. Protected with strict merge rules.
- **`dev`**: Integration branch for all development work.
- **`feature/*`**: Feature branches created from `dev`.
- **`bugfix/*`**: Bug fix branches created from `dev`.
- **`test/*`**: Branches for adding or updating unit tests.

---

## Merge Rules

### Main Branch Protection

- ✅ **2 approvals required** before merging
- ✅ All GitHub Actions workflows must pass (lint, build, tests)
- ✅ Unit test coverage must be ≥80%
- ✅ No merge conflicts
- ✅ Code owners must review
- ❌ Direct commits prohibited

### Dev Branch Protection

- ✅ **1 approval required** before merging
- ✅ All GitHub Actions workflows must pass (lint, build, tests)
- ✅ Build must succeed
- ❌ Self-approval not permitted

---

## GitHub Actions Workflows

Our CI/CD pipeline automatically runs on every pull request and push to `dev`/`main`:

### Current Workflows

1. **Lint Job**
   - Runs ESLint to check code style and formatting
   - Uses Node.js 18
   - Must pass before build job runs

2. **Build Job**
   - Verifies the project builds successfully
   - Requires environment variables (MONGODB_URI, JWT_SECRET, JWT_EXPIRE)
   - Runs after lint job succeeds

3. **Test Job** (Future)
   - Will run unit tests and generate coverage reports
   - Will enforce minimum coverage thresholds

### Workflow Configuration

The workflow is defined in `.github/workflows/main.yml` and triggers on:
- Pull requests to `main` or `dev` branches
- Direct pushes to `dev` branch

View workflow status in the **Actions** tab of the repository.

---

## Development Workflow

### 1. Create a Feature/Test Branch

```bash
# Switch to dev and get latest changes
git checkout dev
git pull origin dev

# Create your branch
git checkout -b test/add-canvas-unit-tests
# or
git checkout -b feature/new-feature-name
```

### 2. Make Changes and Write Tests

```bash
# Make your changes and add unit tests

# Check for linting issues
npm run lint

# Build the project to verify no errors
npm run build
```

**Note**: Unit tests will run automatically via GitHub Actions when you push your branch and create a pull request.

### 3. Commit Your Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "test: add unit tests for Canvas component"
```

#### Commit Message Conventions

- `test:` - Adding or updating tests
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

### 4. Push and Create Pull Request

```bash
# Push your branch
git push origin test/add-canvas-unit-tests
```

#### On GitHub:

1. Navigate to the repository
2. Click "Pull requests" → "New pull request"
3. Set base to `dev`, compare to your branch
4. Fill out the PR template:
   - Description of changes
   - Type of change (tests, feature, fix)
   - Testing checklist
   - Related issues

### 5. Code Review Process

- Request at least 1 reviewer for `dev` merges
- Address all feedback and comments
- **Ensure all GitHub Actions checks pass** (visible in PR status)
- Resolve merge conflicts if any
- Monitor the Actions tab for workflow results

### 6. Merge to Dev

- Once approved, merge using "Squash and merge"
- Delete the feature branch after merge

### 7. Deploy to Main (Production)

**Only when dev is stable and ready for release:**

1. Create PR from `dev` to `main`
2. Title: "Release v1.x.x - [description]"
3. Requires **2 approvals**
4. Complete pre-release checklist:
   - [ ] All tests passing
   - [ ] Manual testing completed
   - [ ] Documentation updated
   - [ ] Version bumped in package.json
   - [ ] Changelog updated

5. After merge, tag the release:
```bash
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

---

## Testing Best Practices

### General Principles

1. **Write Tests First** (TDD when possible)
2. **Test Behavior, Not Implementation**
3. **Keep Tests Fast** - Unit tests should run quickly
4. **Use Descriptive Names** - `it('should render error when API fails')`
5. **Mock External Dependencies** - APIs, databases, file systems
6. **Maintain 80%+ Coverage**
7. **Test Edge Cases** - Empty arrays, null values, boundaries

### Test Organization

```javascript
describe('Component Name', () => {
  describe('when condition A', () => {
    it('should behave in expected way', () => {
      // Test implementation
    });
  });

  describe('when condition B', () => {
    it('should handle edge case', () => {
      // Test implementation
    });
  });
});
```

### What to Test

- ✅ Component rendering
- ✅ User interactions (clicks, inputs)
- ✅ State changes
- ✅ API calls and responses
- ✅ Error handling
- ✅ Edge cases and boundary conditions
- ❌ Third-party library internals
- ❌ Implementation details that may change

---

## Common Issues and Solutions

### GitHub Actions Workflow Failures

```bash
# Check the Actions tab in GitHub for detailed logs
# Common fixes:

# 1. Lint failures - fix code style issues
npm run lint

# 2. Build failures - verify locally
npm run build

# 3. Clear cache and reinstall if needed
rm -rf node_modules
npm install
```

### Merge Conflicts

```bash
# Update your branch with latest dev
git checkout dev
git pull origin dev
git checkout your-branch
git merge dev
# Resolve conflicts, then:
git add .
git commit -m "resolve: merge conflicts"
git push origin your-branch
```

### CI/CD Pipeline Failures

1. **Check GitHub Actions logs** in the "Actions" tab
2. Look for specific job failures (lint, build, test)
3. Run `npm run lint` and `npm run build` locally with Node.js 18+
4. Verify all dependencies in package.json
5. Check for environment-specific issues
6. Ensure required secrets are set in repository settings

### Branch Protection Preventing Push

```bash
# Never push directly to protected branches
# Always use feature branches and PRs
git checkout -b feature/your-feature
# Make changes
git push origin feature/your-feature
# Then create PR on GitHub
```

### Failed to Push - Branch Behind Remote

```bash
# Pull and rebase
git pull --rebase origin dev

# If conflicts, resolve them then:
git rebase --continue

# Force push with lease (safer than force push)
git push --force-with-lease origin your-branch-name
```

---

## Code Review Guidelines

### What Reviewers Should Check

#### Unit Tests Quality
- [ ] Tests are comprehensive and cover edge cases
- [ ] Test names clearly describe what is tested
- [ ] Tests are independent and can run in any order
- [ ] Mocks and stubs are used appropriately
- [ ] No hardcoded values in tests
- [ ] Assertions are specific and meaningful

#### Code Quality
- [ ] Code is clean and well-organized
- [ ] Proper error handling
- [ ] No console errors or warnings
- [ ] Documentation updated if needed
- [ ] No unnecessary complexity
- [ ] Security best practices followed

#### GitHub Actions
- [ ] All workflow jobs pass (lint, build, test)
- [ ] No warnings in workflow logs
- [ ] Build completes successfully
- [ ] Coverage thresholds met (when applicable)

### Review Response Times

- **Standard PRs**: 24-48 hours
- **Urgent fixes**: 4-8 hours
- **Minor changes**: 12-24 hours

### Approval Criteria

- Code meets all acceptance criteria
- All GitHub Actions checks pass
- No blocking concerns raised
- Documentation is adequate
- At least 1 approval for `dev`, 2 for `main`

---

## Git Best Practices

1. **Commit Often** - Small, logical commits
2. **Write Clear Commit Messages** - Follow conventional commits
3. **Keep Branches Short-Lived** - Merge within 1-2 days
4. **Rebase Feature Branches** - Keep history clean
5. **Never Commit Secrets** - Use environment variables
6. **Review Your Own Code First** - Before requesting review

---

## Collaboration Best Practices

1. **Communicate Early** - Discuss major changes before implementing
2. **Be Respectful in Reviews** - Constructive feedback only
3. **Respond to Reviews Promptly** - Don't block team progress
4. **Update PRs Regularly** - Keep them current with base branch
5. **Document Decisions** - Use PR comments to explain choices

---

## Additional Resources

### Documentation Links
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [GitHub Flow Guide](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

### Project Documentation
- [README.md](./README.md) - Project overview and setup
- [PRD.md](./PRD.md) - Product requirements
- [.github/workflows/main.yml](./.github/workflows/main.yml) - CI/CD configuration

### Team Contacts
- **Repository Owner**: @Elted6501
- **Tech Lead**: [Contact Name]
- **QA Lead**: [Contact Name]

---

## Questions or Issues?

If you encounter any issues not covered in this document or have suggestions for improvement:

1. Open an issue in the repository
2. Tag it with `documentation` label
3. Provide detailed description of the problem or suggestion

**Remember**: Good documentation benefits everyone. If something is unclear, it probably needs improvement!

---

## Revision History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2025-11-17 | 1.0.0 | Initial | Created deployment process documentation |

---

**Built with ❤️ for the Mind Map Application**
