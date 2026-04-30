# MongoDB Setup Guide

## Option 1: Local MongoDB Installation

### Windows:
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install MongoDB with default settings
3. Start MongoDB service:
   ```bash
   # As Administrator
   net start MongoDB
   ```
4. MongoDB should now be running on `mongodb://127.0.0.1:27017`

### macOS:
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux (Ubuntu/Debian):
```bash
# Import the public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create a list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Option 2: MongoDB Atlas (Cloud - Recommended for Production)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account and cluster
3. Get connection string
4. Update `.env.local`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/voting-system?retryWrites=true&w=majority
   ```

## Option 3: Docker MongoDB (Easiest for Development)

```bash
# Run MongoDB in Docker
docker run --name voting-mongodb -d -p 27017:27017 mongo:latest

# To stop
docker stop voting-mongodb

# To start again
docker start voting-mongodb
```

## Verify Connection

After setting up MongoDB, restart the Next.js server:
```bash
npm run dev
```

You should see "✅ MongoDB connected successfully" in the console.