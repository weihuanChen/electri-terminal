#!/bin/bash

echo "🚀 Starting Electri Pro Development Environment..."
echo ""

# Step 1: Clean up
echo "🧹 Cleaning up old files..."
rm -rf convex/_generated
rm -rf .next

echo "✓ Cleanup complete"
echo ""

# Step 2: Start Convex
echo "📡 Starting Convex development server..."
echo "   This will upload your functions to Convex cloud..."
npx convex dev &

# Wait for Convex to start
echo "⏳ Waiting for Convex to initialize (15 seconds)..."
sleep 15

echo "✓ Convex should be starting"
echo ""

# Step 3: Start Next.js
echo "🌐 Starting Next.js development server..."
pnpm dev

echo ""
echo "✅ Both servers should now be running!"
echo ""
echo "📝 URLs:"
echo "   - Next.js: http://localhost:3000"
echo "   - Convex Dashboard: https://glad-deer-519.convex.cloud"
