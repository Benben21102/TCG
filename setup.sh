#!/bin/sh
# TCG Project Setup Script
# This script installs all dependencies and sets up git hooks for pre-commit linting/formatting.

set -e

# Check for Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "[ERROR] Node.js is not installed. Please install it from https://nodejs.org/ and try again."
  exit 1
fi

# Check for npm
if ! command -v npm >/dev/null 2>&1; then
  echo "[ERROR] npm is not installed. Please install Node.js (which includes npm) from https://nodejs.org/ and try again."
  exit 1
fi

echo "Node version: $(node -v)"
echo "npm version: $(npm -v)"

echo "Installing npm dependencies..."
npm install

echo "Setting up Husky git hooks..."
npx husky install

echo "Setup complete! You can now use git and npm scripts."
