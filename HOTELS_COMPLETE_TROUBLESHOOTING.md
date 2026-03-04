# 🔧 Complete Troubleshooting Guide - Hotels Feature

## 🚨 All Known Issues & Their Solutions

### Issue #1: MongoDB Connection Error
**Error Messages:**
- `querySrv ECONNREFUSED _mongodb._tcp.cluster0.mongodb.net`
- `Error: connect ECONNREFUSED 127.0.0.1:27017`
- `getaddrinfo ENOTFOUND cluster.mongodb.net`

**Root Cause:** MongoDB is not accessible

**Solutions:**

#### Solution 1A: Use Local MongoDB (Recommended for Testing)
```bash
# 1. Download MongoDB Community
# Windows: https://www.mongodb.com/try/download/community
# Mac: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# 2. Start MongoDB
# Windows (CMD):
mongod

# Windows (PowerShell):
& "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"

# Mac:
mongod --dbpath /usr/local/var/mongodb

# Linux:
sudo systemctl start mongod

# 3. Update .env file
MONGO_URI=mongodb://localhost:27017/trip-planner

# 4. Test connection
cd server
node test-mongodb-connection.js
```

#### Solution 1B: Fix MongoDB Atlas Cloud Connection
```bash
# 1. Check MongoDB Atlas Cluster Status
# Go to: https://cloud.mongodb.com
# Login to your account
# Check if cluster is "Available" (not "Paused")

# 2. If Paused, Resume It
# Dashboard → Click cluster name → Resume

# 3. Add Your IP to Whitelist
# Security → Network Access
# Add Current IP (or 0.0.0.0/0 for testing)
# Wait 5-10 minutes

# 4. Verify Connection String
# Connect → Copy connection string
# Should look like: mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/

# 5. Update .env with correct string
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?appName=Cluster0

# 6. Test connection
cd server
node test-mongodb-connection.js
```

---

### Issue #2: No Hotels Appearing
**Symptoms:**
- Page loads but no hotels show
- "No hotels found" message appears
- Console shows empty array `[]`

**Root Cause:** Hotels collection is empty

**Solution:**
```bash
# 1. Navigate to server directory
cd c:\trip-plan\server

# 2. Seed hotels database
node scripts/seed-hotels.js

# Expected output:
# ✅ Connected to MongoDB
# 📝 Seeding hotel data...
# ✅ Successfully seeded 20 hotels

# 3. Verify seeding worked
node test-mongodb-connection.js
# Should show "Hotels Collection: 20 documents"

# 4. Restart server
npm run dev
```

---

### Issue #3: Backend Errors / Server Won't Start
**Error Messages:**
- `Cannot find module '...'`
- `Port 5000 is already in use`
- `FATAL ERROR: CALL_AND_RETRY_LAST`

**Solutions:**

#### Solution 3A: Missing Dependencies
```bash
cd c:\trip-plan\server

# 1. Clean install dependencies
del /s node_modules package-lock.json
npm install

# 2. Check if all required packages are installed
npm list

# Should show:
# ├── axios
# ├── cors
# ├── dotenv
# ├── express
# ├── mongoose
# ├── nodemon
# └── (other packages)

# 3. Start server
npm run dev
```

#### Solution 3B: Port Already in Use
```bash
# 1. Find process using port 5000
# Windows:
netstat -ano | findstr :5000

# 2. Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# 3. Or use different port
# Edit server/index.js
# Change: const PORT = 5000;
# To: const PORT = 5001;

# 4. Update frontend API URL
# Edit client/.env
# Change: VITE_API_URL=http://localhost:5000
# To: VITE_API_URL=http://localhost:5001

# 5. Restart server
npm run dev
```

#### Solution 3C: Memory Issues
```bash
# 1. Increase Node.js memory
# Windows:
node --max-old-space-size=2048 server/index.js

# 2. Or in npm scripts in server/package.json:
"dev": "node --max-old-space-size=2048 server/index.js"

# 3. Install dependencies again
npm install
```

---

### Issue #4: Frontend Errors / Page Won't Load
**Error Messages:**
- Blank white page
- "Cannot read properties of undefined"
- CORS errors in console

**Solutions:**

#### Solution 4A: CORS Errors
**Console Error:** `Access to XMLHttpRequest blocked by CORS policy`

```javascript
// The server already has CORS enabled, but if you get this error:

// 1. Check server/index.js has CORS enabled:
const cors = require('cors');
app.use(cors());

// 2. If not, add it:
const cors = require('cors');
const express = require('express');
const app = express();

app.use(cors());
app.use(express.json());

// 3. Restart server
npm run dev
```

#### Solution 4B: API Call Failures
**Console Error:** `Failed to fetch hotels`

```javascript
// 1. Check browser console (F12) for exact error
// 2. Check Network tab for failed requests
// 3. Verify backend is running on http://localhost:5000

// If backend URL is wrong:
// Edit: client/src/api.js
// Check: const baseURL = process.env.VITE_API_URL || 'http://localhost:5000'

// 4. Add debugging to see what's being called:
// Console should show:
// "🏨 Fetching hotels near..."
// "Trip Budget: ₹50000"
// "✅ Found X hotels"

// If you see errors instead, check the specific error message
```

#### Solution 4C: Component Not Rendering
**Symptom:** Hotels component doesn't appear, no errors

```javascript
// 1. Check HiddenGems.jsx line 228-232:
{selectedGem?._id === p._id && (
  <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "2px solid #ecf0f1" }}>
    <HotelsNearby 
      gem={p} 
      budget={Number(tripForm.budget) || 50000} 
    />
  </div>
)}

// 2. Verify HotelsNearby is imported at top:
import HotelsNearby from "../components/HotelsNearby";

// 3. Test by clicking on a gem
// Expected: Hotels should expand below gem

// 4. If still not showing, check browser console for errors
```

---

### Issue #5: Hotels Not Showing Near Specific Gems
**Symptom:** Some gems show hotels, others don't

**Causes:**
1. Gems don't have location data (latitude/longitude)
2. No hotels within 15km radius
3. No hotels within budget

**Solutions:**

```javascript
// 1. Check gem has location data
// In HotelsNearby.jsx, you'll see:
"🏨 Fetching hotels near ${gem.placeTown}..."
"Location: ${gem.latitude}, ${gem.longitude}"

// If location is undefined or 0, that's the issue
// Need to ensure hidden gems have valid coordinates

// 2. Check if gems have latitude/longitude
// Go to client/src/pages/HiddenGems.jsx around line 100
// Look for where gems are loaded
// Each gem must have: latitude and longitude

// 3. If gems don't have coordinates:
// Add them manually or update the data source
// Example gem structure:
{
  "placeTown": "Shimla",
  "latitude": 31.7775,
  "longitude": 77.1577,
  // ... other fields
}

// 4. Test with console logs
// The component logs:
console.log(`🏨 Fetching hotels near ${gem.placeTown}...`);
// If you don't see this, gem is invalid
```

---

## 🧪 Step-by-Step Testing Checklist

### ✅ Phase 1: Environment Setup
```bash
# 1. Check Node.js
node --version  # Should be v16+

# 2. Check npm
npm --version   # Should be v8+

# 3. Navigate to server
cd c:\trip-plan\server

# 4. Install dependencies
npm install

# 5. Check .env exists
# Should have: MONGO_URI=...
```

### ✅ Phase 2: Database Setup
```bash
# 1. Test MongoDB connection
node test-mongodb-connection.js

# Should see:
# ✅ SUCCESS: MongoDB is Connected!
# 📚 Existing Collections: ...

# If fails, run setup wizard:
# node setup-mongodb.js

# 2. Seed hotels
node scripts/seed-hotels.js

# Should see:
# ✅ Successfully seeded 20 hotels

# 3. Verify hotels in database
node test-mongodb-connection.js

# Should show:
# 🏨 Hotels Collection: 20 documents
```

### ✅ Phase 3: Backend Testing
```bash
# 1. Start backend
npm run dev

# Should show:
# Server running on http://localhost:5000

# 2. Test API endpoints in browser or Postman
# http://localhost:5000/api/hotels
# Should return JSON array of hotels

# http://localhost:5000/api/hotels/near-gem?latitude=31.77&longitude=77.15&maxPrice=5000
# Should return filtered hotels
```

### ✅ Phase 4: Frontend Testing
```bash
# 1. In new terminal, go to client
cd c:\trip-plan\client

# 2. Start frontend
npm run dev

# Should show:
# VITE ... ready in ... ms
# Local: http://localhost:5173

# 3. Open browser
# http://localhost:5173

# 4. Navigate to Hidden Gems
# Should load page without errors

# 5. Click on a gem
# Hotels should appear below

# 6. Check browser console (F12)
# Should see logs like:
# "🏨 Fetching hotels near..."
# "✅ Found X hotels"
```

---

## 🎯 Quick Start Commands

### Fastest Way to Get Running
```bash
# 1. Setup MongoDB
cd c:\trip-plan\server
node setup-mongodb.js
# Follow prompts (choose option 1 for local or 2 for cloud)

# 2. Test connection
node test-mongodb-connection.js

# 3. Seed hotels
node scripts/seed-hotels.js

# 4. Start both servers at once (Windows)
cd c:\trip-plan
start-hotel-feature.bat

# OR start manually in two terminals:
# Terminal 1:
cd c:\trip-plan\server && npm run dev

# Terminal 2:
cd c:\trip-plan\client && npm run dev

# 5. Open browser
# http://localhost:5173
```

---

## 🆘 Emergency Fixes

### If Everything is Broken
```bash
# 1. Kill all running processes
# Ctrl+C in any active terminals

# 2. Complete fresh install
cd c:\trip-plan\server
rm -r node_modules package-lock.json
npm install

cd c:\trip-plan\client
rm -r node_modules package-lock.json
npm install

# 3. Reset MongoDB (WARNING: LOSES ALL DATA)
# This completely removes hotels and resets database
node scripts/seed-hotels.js

# 4. Restart everything
# Terminal 1: cd server && npm run dev
# Terminal 2: cd client && npm run dev
```

### If MongoDB Won't Connect
```bash
# 1. Try local MongoDB first
# Edit server/.env
# MONGO_URI=mongodb://localhost:27017/trip-planner

# 2. Start MongoDB locally
mongod

# 3. Test
node test-mongodb-connection.js

# 4. If that works, MongoDB Atlas credentials are wrong
# Go to https://cloud.mongodb.com
# Update credentials in .env
```

---

## 📊 Expected Behavior

### Working Feature
- ✅ Page loads without errors
- ✅ Hidden Gems page shows list of gems
- ✅ Clicking gem expands it and shows hotels
- ✅ Hotels have price, rating, distance
- ✅ Can filter hotels by category
- ✅ Can sort by distance/price/rating
- ✅ No red errors in browser console
- ✅ No errors in backend terminal

### What to See in Console
```
🏨 Fetching hotels near Shimla...
   Location: 31.7775, 77.1577
   Max Price: ₹5000/night
   Trip Budget: ₹50000
✅ Found 3 hotels
```

---

## 📞 Still Having Issues?

1. **Read the error message carefully** - It usually tells you exactly what's wrong
2. **Check both console tabs**:
   - Browser console (F12 in browser)
   - Terminal logs (where you ran npm run dev)
3. **Test each component separately**:
   - Can you connect to MongoDB? (`node test-mongodb-connection.js`)
   - Can you reach the backend? (Check http://localhost:5000/api/hotels)
   - Does frontend load? (Check http://localhost:5173)
4. **Try the emergency fixes** - Fresh install often solves weird issues
5. **Check MONGO_URI** - Most common issue, verify it's correct in .env

**Remember**: Most issues are either:
1. MongoDB not running/connected
2. Hotels not seeded
3. Port already in use
4. Missing dependencies

Fix these first, and the feature will work!
