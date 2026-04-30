@echo off
echo Setting up MongoDB with Docker...

echo Checking if Docker is installed...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not installed or not in PATH
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo Docker found! Setting up MongoDB...

echo Stopping any existing MongoDB containers...
docker stop voting-mongodb 2>nul
docker rm voting-mongodb 2>nul

echo Starting new MongoDB container...
docker run --name voting-mongodb -d -p 27017:27017 mongo:latest

if %errorlevel% equ 0 (
    echo ✅ MongoDB container started successfully!
    echo ✅ MongoDB is now running on: mongodb://127.0.0.1:27017
    echo ✅ You can now test your voting system!
    echo.
    echo To stop MongoDB later, run: docker stop voting-mongodb
    echo To start MongoDB again, run: docker start voting-mongodb
) else (
    echo ❌ Failed to start MongoDB container
    echo Please check Docker Desktop is running
)

pause