#!/usr/bin/env node

/**
 * Simple script to bump the version in package.json
 * Usage: node scripts/bump-version.js [patch|minor|major|<explicit-version>]
 * Examples:
 *   node scripts/bump-version.js patch     # 1.0.0 -> 1.0.1
 *   node scripts/bump-version.js minor     # 1.0.0 -> 1.1.0
 *   node scripts/bump-version.js major     # 1.0.0 -> 2.0.0
 *   node scripts/bump-version.js 1.5.2     # sets to 1.5.2
 */

const fs = require('fs');
const path = require('path');

// Read the package.json file
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;

// Get the version bump type from command line arguments
const bumpType = process.argv[2] || 'patch';

// Parse the current version
const [major, minor, patch] = currentVersion.split('.').map(Number);

let newVersion;

// Determine the new version based on the bump type
if (bumpType === 'patch') {
    newVersion = `${major}.${minor}.${patch + 1}`;
} else if (bumpType === 'minor') {
    newVersion = `${major}.${minor + 1}.0`;
} else if (bumpType === 'major') {
    newVersion = `${major + 1}.0.0`;
} else if (/^\d+\.\d+\.\d+$/.test(bumpType)) {
    // If an explicit version is provided and it matches semver format
    newVersion = bumpType;
} else {
    console.error('Invalid version bump type. Use "patch", "minor", "major", or explicit version (e.g., 1.2.3)');
    process.exit(1);
}

// Update the package.json file
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`Version bumped from ${currentVersion} to ${newVersion}`); 