# Publishing DyndbClient to NPM

This guide outlines the steps for publishing the DyndbClient package to NPM.

## Prerequisites

1. You need an NPM account
2. You need to be added as a collaborator to the package on NPM
3. You need to have the latest code from the main branch

## Manual Publishing Steps

### 1. Prepare the Package

1. Update the version in `package.json`:
   ```bash
   npm version patch  # for bug fixes
   npm version minor  # for new features
   npm version major  # for breaking changes
   ```

2. Make sure all tests pass:
   ```bash
   npm test
   ```

3. Build the package:
   ```bash
   npm run build
   ```

### 2. Publish to NPM

1. Login to NPM:
   ```bash
   npm login
   ```

2. Publish the package:
   ```bash
   npm publish
   ```

3. Verify the package has been published:
   ```bash
   npm view dyndbclient
   ```

## Automated Publishing via GitHub Actions

An automated workflow has been set up to publish the package when a new GitHub release is created.

### Steps to publish via GitHub Actions:

1. Navigate to the repository on GitHub
2. Click on "Releases" in the right sidebar
3. Click "Create a new release"
4. Choose a tag version (e.g., v1.0.1)
5. Add a title and description for the release
6. Click "Publish release"

The GitHub Action will automatically:
- Check out the code
- Install dependencies
- Run tests
- Build the package
- Publish to NPM

## NPM Token Setup for GitHub Actions

To enable automated publishing, you need to add your NPM token as a GitHub secret:

1. Generate an NPM access token:
   - Go to npmjs.com and log in
   - Click on your profile picture → "Access Tokens"
   - Click "Generate New Token" (Select "Automation" type)
   - Copy the generated token

2. Add the token to GitHub secrets:
   - Go to your GitHub repository
   - Click Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: NPM_TOKEN
   - Value: [Paste your NPM token here]
   - Click "Add secret"

## Versioning Guidelines

Follow semantic versioning (SemVer):
- MAJOR version for incompatible API changes
- MINOR version for new functionality in a backward-compatible manner
- PATCH version for backward-compatible bug fixes 