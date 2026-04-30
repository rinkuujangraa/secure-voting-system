#!/bin/bash

echo "Setting up MongoDB with Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed"
    echo "Please install Docker from: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

echo "✅ Docker found! Setting up MongoDB..."

# Stop and remove existing container if it exists
echo "Stopping any existing MongoDB containers..."
docker stop voting-mongodb 2>/dev/null || true
docker rm voting-mongodb 2>/dev/null || true

# Start new MongoDB container
echo "Starting new MongoDB container..."
docker run --name voting-mongodb -d -p 27017:27017 mongo:latest

if [ $? -eq 0 ]; then
    echo "✅ MongoDB container started successfully!"
    echo "✅ MongoDB is now running on: mongodb://127.0.0.1:27017"
    echo "✅ You can now test your voting system!"
    echo ""
    echo "To stop MongoDB later, run: docker stop voting-mongodb"
    echo "To start MongoDB again, run: docker start voting-mongodb"
    echo ""
    echo "Testing connection in 3 seconds..."
    sleep 3
    
    # Test if MongoDB is responding
    if docker exec voting-mongodb mongosh --eval "db.adminCommand('ping')" &>/dev/null; then
        echo "✅ MongoDB is responding correctly!"
    else
        echo "⚠️  MongoDB container started but may still be initializing..."
    fi
else
    echo "❌ Failed to start MongoDB container"
    echo "Please check Docker Desktop is running"
    exit 1
fi