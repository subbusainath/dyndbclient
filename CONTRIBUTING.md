# Contributing to DyndbClient

Thank you for your interest in contributing to DyndbClient! We're excited to have you join our community. This document provides guidelines and steps for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful, inclusive, and considerate in all interactions.

## Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** to your local machine.
3. **Set up the development environment**:
   ```bash
   npm install
   ```
4. **Create a new branch** for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. **Make your changes** in your feature branch.
2. **Write or update tests** that cover your changes.
3. **Run tests** to ensure they pass:
   ```bash
   npm test
   ```
4. **Format your code**:
   ```bash
   npm run format
   ```
5. **Lint your code**:
   ```bash
   npm run lint
   ```
6. **Build the project** to make sure it compiles:
   ```bash
   npm run build
   ```

## Pull Request Process

1. **Update documentation** if needed.
2. **Commit your changes** with clear, descriptive commit messages.
3. **Push to your fork**.
4. **Submit a pull request** to the main repository.
5. **GitHub Actions**:
   - Automated checks will run on your PR
   - Tests must pass
   - Code formatting must be correct
   - Build must succeed
6. **Review process**:
   - Maintainers will review your PR
   - Address any requested changes
   - Once approved, your PR will be merged

## Coding Standards

- Follow the existing code style in the project.
- Keep files small and focused (< 200 lines).
- Write clean, readable, and maintainable code.
- Add helpful comments, especially for complex logic.
- Use clear and consistent naming conventions.

## Testing

- Write tests for all new features and bug fixes.
- Ensure that existing tests still pass.
- Aim for good test coverage of your code.

## Documentation

- Update the README.md file if your changes affect the public API.
- Add JSDoc comments to all public methods and classes.
- Document any complex algorithms or design decisions.

## Reporting Bugs

If you find a bug, please report it by creating an issue on GitHub with:

1. A clear title and description
2. Steps to reproduce the issue
3. Expected and actual behavior
4. Any relevant code snippets or logs

## Feature Requests

Feature requests are welcome! Please create an issue on GitHub with:

1. A clear title and description
2. Explanation of the value/use case for the feature
3. Any implementation ideas you might have

## Questions or Needs Help?

If you have questions or need help with the project, please:

1. Check the documentation and README first
2. Search for existing issues that might answer your question
3. Create a new issue if you can't find an answer

## Thank You!

Thank you for contributing to DyndbClient. Your effort and expertise help make this project better for everyone. 