#!/bin/bash
# setup.sh

echo "Checking for package managers..."

if command -v npm &> /dev/null; then
    echo "✅ npm found. Installing dependencies..."
    npm install
elif command -v yarn &> /dev/null; then
    echo "✅ yarn found. Installing dependencies..."
    yarn install
elif command -v pnpm &> /dev/null; then
    echo "✅ pnpm found. Installing dependencies..."
    pnpm install
elif command -v bun &> /dev/null; then
    echo "✅ bun found. Installing dependencies..."
    bun install
else
    echo "❌ No package manager found (npm, yarn, pnpm, or bun)."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Dependencies installed."
echo "🚀 Starting development server..."
npm run dev
