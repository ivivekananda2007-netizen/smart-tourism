# 🎓 Getting Started Guide for Friends

Welcome! This guide will help you set up and run the Smart Tourism Assistant project on your computer.

## ⚡ Quick Summary

This is a **full-stack web application** for planning trips across India. It includes:
- 🤖 AI trip planner
- 💎 943 hidden gems (lesser-known destinations)
- 💰 Budget tracking
- 🌤️ Weather alerts

## 📋 Requirements

Before starting, make sure you have:
- ✅ **Node.js** (v14 or higher) - Download from [nodejs.org](https://nodejs.org/)
- ✅ **Git** (for cloning) - Download from [git-scm.com](https://git-scm.com/)
- ✅ **MongoDB Atlas account** (free) - Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- ✅ **Weather API Key** (free) - Get from [openweathermap.org/api](https://openweathermap.org/api)

## 🚀 Step-by-Step Setup

### Step 1: Clone the Project
```bash
git clone https://github.com/YOUR_USERNAME/trip-plan.git
cd trip-plan
```

### Step 2: Set Up MongoDB

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free
3. Create a new project
4. Create a cluster (M0 free tier)
5. Go to "Database Access" → Create a user with username & password
6. Go to "Network Access" → Add your IP (or 0.0.0.0/0 for development)
7. Click "Connect" → Copy the connection string
8. Replace `<username>`, `<password>`, and `<dbname>` with your values

Example: `mongodb+srv://myusername:mypassword@cluster0.xxxxx.mongodb.net/trip_planner?retryWrites=true&w=majority`

### Step 3: Get Weather API Key

1. Go to https://openweathermap.org/api
2. Sign up for free account
3. Go to Account Settings
4. Copy your API Key (looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

### Step 4: Set Up Backend

Open **Command Prompt** or **PowerShell**:

```bash
# Navigate to server folder
cd trip-plan/server

# Create .env file
# Windows PowerShell:
$content = @"
PORT=5000
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/trip_planner?retryWrites=true&w=majority
JWT_SECRET=my-super-secret-key-make-this-random-and-long
WEATHER_API_KEY=YOUR_WEATHER_API_KEY
DNS_SERVERS=8.8.8.8,1.1.1.1
"@
$content | Out-File .env

# Install dependencies
npm install

# Seed database with places (943 hidden gems!)
npm run seed

# Start server
npm run dev
```

**Expected output:**
```
Server running on http://localhost:5000
Mongo connected: ac-xxxx-shard-00-00.xxxxx.mongodb.net
```

### Step 5: Set Up Frontend

Open a **new Command Prompt/PowerShell** window:

```bash
# Navigate to client folder
cd trip-plan/client

# Install dependencies
npm install

# Start frontend
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

### Step 6: Open in Browser

1. Open your browser
2. Go to: `http://localhost:5173`
3. You should see the Smart Tourism Assistant app!

## 🧪 Testing the Features

### 1. Create Account
- Click "Register"
- Enter email, password, name
- Create account

### 2. View Hidden Gems
- Click "Hidden Gems" in navigation
- Browse 943 lesser-known destinations!
- Try filters:
  - Search "Wayanad"
  - Filter by state "Kerala"
  - Try "Quiet" preset

### 3. Plan a Trip
- Click "Plan Trip" or "Dashboard"
- Enter destination, duration, budget
- Get AI-optimized itinerary

### 4. Track Budget
- In trip details, add expenses
- See budget breakdown

## 📁 Project Structure

```
trip-plan/
├── server/              ← Backend (Node.js + Express)
│   ├── .env            ← Your configuration (created in Step 4)
│   ├── index.js        ← Main server file
│   ├── routes/         ← API endpoints
│   └── models/         ← Database schemas
│
├── client/             ← Frontend (React + Vite)
│   ├── .env.local      ← Frontend config
│   ├── src/
│   └── index.html
│
└── datasets/           ← Place data (1,508 places)
```

## 🆘 Troubleshooting

### "Failed to load hidden gems"
**Solution:**
1. Check backend is running (you should see logs in the terminal)
2. Verify MongoDB connection string in `.env`
3. Try accessing: http://localhost:5000/api/places/hidden-gems

### "MongoDB connection refused"
**Solution:**
1. Check internet connection
2. Verify MONGO_URI in `.env`
3. In MongoDB Atlas, ensure:
   - Database user created (Database Access)
   - IP whitelisted (Network Access - add 0.0.0.0/0)

### "Port already in use"
**Solution:**
- Change PORT in `.env` (e.g., 5001, 5002)
- Or find and close the process using the port

### "npm: command not found"
**Solution:**
- Node.js not installed
- Download from [nodejs.org](https://nodejs.org/)
- Close and reopen terminal after installation

## 💡 Tips

1. **Keep both terminals running** - Backend in one, Frontend in another
2. **Check browser console** - Press F12 to see any JavaScript errors
3. **Check backend logs** - Look at the terminal running `npm run dev`
4. **Try private/incognito window** - Clears cache and cookies

## 📚 Useful Links

- **Backend API Documentation:** `/api/health` should return `{"status":"ok"}`
- **MongoDB Guide:** https://docs.mongodb.com/manual/
- **React Documentation:** https://react.dev
- **Express Documentation:** https://expressjs.com

## 🆘 Still Stuck?

1. Check `HIDDEN_GEMS_TROUBLESHOOTING.md` in the project root
2. Open an issue on GitHub with:
   - Error message (screenshot or copy-paste)
   - What you were trying to do
   - Your setup (Windows/Mac/Linux)

## 🎉 Next Steps

Once everything is working:
- Explore the codebase
- Try modifying features
- Add new destinations
- Improve the UI
- Share improvements via GitHub!

---

**Made with ❤️ for travel lovers!**

Happy exploring! 🗺️✈️
