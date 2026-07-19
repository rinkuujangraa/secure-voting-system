# MongoDB Setup

## Option A — Docker (Easiest)

```bash
docker run --name voting-mongodb -d -p 27017:27017 mongo:latest
```

## Option B — Local Installation

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community), install, then:
```bash
net start MongoDB
```

**Linux:**
```bash
sudo systemctl start mongod
```

## Option C — MongoDB Atlas (Production)

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Get your connection URI from the "Connect" button
3. Set it as `MONGODB_URI` in your `.env.local`

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/voting-system
```
