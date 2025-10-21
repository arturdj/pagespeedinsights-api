#!/bin/bash

# Azion PageSpeed Analyzer - Edge Function
# Startup script for Azion Edge Function development

set -e

echo "🚀 Starting Azion PageSpeed Analyzer - Edge Function"
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Check if Azion CLI is installed
if ! command -v azion &> /dev/null; then
    echo "❌ Azion CLI is not installed. Please install it first:"
    echo "   npm install -g azion"
    exit 1
fi

echo "✅ Azion CLI is available"

# Start Azion development server
echo "🌟 Starting Azion Edge Function development server..."
echo ""
echo "📖 Documentation: http://localhost:3333/docs"
echo "🔧 Manual Interface: http://localhost:3333/manual"
echo "❤️ Health Check: http://localhost:3333/health"
echo ""
echo "Press Ctrl+C to stop the development server"
echo ""

npm run dev
