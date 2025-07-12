#!/bin/bash

# Deploy script for Vercel
# This script handles database migrations safely

echo "🚀 Starting deployment..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Check if we're in production
if [ "$VERCEL_ENV" = "production" ]; then
    echo "🌍 Production environment detected"
    
    # Try to run migrations with retry logic
    echo "🗄️ Running database migrations..."
    max_attempts=3
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "Attempt $attempt of $max_attempts"
        
        if npx prisma migrate deploy --preview-feature; then
            echo "✅ Migrations completed successfully"
            break
        else
            echo "❌ Migration attempt $attempt failed"
            if [ $attempt -eq $max_attempts ]; then
                echo "⚠️ All migration attempts failed. Continuing without migrations..."
                break
            fi
            attempt=$((attempt + 1))
            sleep 5
        fi
    done
else
    echo "🛠️ Development environment - skipping migrations"
fi

# Build the application
echo "🔨 Building Next.js application..."
npm run build

echo "✅ Deployment completed!" 