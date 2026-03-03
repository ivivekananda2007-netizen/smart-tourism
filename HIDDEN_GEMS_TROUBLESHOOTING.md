# Hidden Gems Troubleshooting Guide

## Issue: Hidden gems not loading on frontend

### Checklist:

1. **Is the backend server running?**
   ```bash
   cd server
   node index.js
   ```
   Should see: `Server running on http://localhost:5000`

2. **Is MongoDB connected?**
   The server should log: `Mongo connected: cluster0.anuubzo.mongodb.net`
   
   If you see DNS errors but MongoDB still connects, that's normal - Mongoose handles it.

3. **Can you access the API directly?**
   - Visit: `http://localhost:5000/api/places/hidden-gems`
   - Should return a JSON array of places

4. **Is the frontend API URL correct?**
   - Check: `client/src/api.js`
   - Should have: `baseURL: API_BASE_URL || "http://localhost:5000/api"`

5. **Is CORS enabled on the backend?**
   - Check: `server/index.js`
   - Should have: `cors()` middleware enabled

## Quick Tests

### Test 1: Backend Connectivity
```bash
cd server
node check-gems.js
```
Should show 5 sample hidden gems

### Test 2: API Endpoint
Open browser: `http://localhost:5000/api/places/hidden-gems`
Should return JSON array of places

### Test 3: With Filters
```
http://localhost:5000/api/places/hidden-gems?state=Kerala&crowdLevel=low
```

### Test 4: States List
```
http://localhost:5000/api/places/states
```
Should return array of all states

## Common Issues & Fixes

### Issue: "Failed to load gems" error in frontend

**Solution 1: Check browser console**
- Open DevTools (F12)
- Check Network tab for API request
- Look for error messages in Console tab

**Solution 2: Verify server is running**
```bash
netstat -ano | findstr :5000
```
If nothing shows, server isn't running

**Solution 3: Check CORS error**
If you see CORS error:
- Backend CORS is blocking frontend
- Check `server/index.js` has `cors()` enabled
- Restart server

### Issue: "No hidden gems found"

**Possible causes:**
1. Database not seeded - run: `npm run seed`
2. Filter too restrictive - remove filters and try again
3. No places match the filter criteria

**Check DB directly:**
```bash
node check-gems.js
```

### Issue: Server won't start

**Check MongoDB connection:**
```bash
node diagnose.js
```

**If DNS errors but Mongo connects**, that's fine - continue

**If Mongo connection fails:**
1. Check internet connection
2. Check MONGO_URI in `.env` file
3. Check MongoDB Atlas network access settings
4. Try using a different DNS: `DNS_SERVERS=1.1.1.1,8.8.4.4`

## Database Stats

```bash
node -e "require('dotenv').config(); const m = require('mongoose'), P = require('./models/Place'); m.connect(process.env.MONGO_URI).then(async()=>{const t = await P.countDocuments(), g = await P.countDocuments({hiddenGem:true}); console.log('Total:', t, 'Gems:', g); process.exit(0)})"
```

## Connection String Formats

### Current (SRV - works but needs DNS):
```
mongodb+srv://user:pass@cluster.db.net/?appName=Cluster0
```

### Alternative (Direct - if SRV fails):
```
mongodb+srv://user:pass@cluster.db.net/?retryWrites=true&w=majority
```

## Performance Tips

1. **Reduce data transferred**: Add limit to API calls
2. **Cache results**: Frontend can cache hidden gems
3. **Pagination**: Add pagination for large result sets
4. **Indexing**: Database already has indexes on hiddenGem, state, cityTown

## Contact Support

If issues persist:
1. Check all steps in checklist above
2. Verify database has data: `node check-gems.js`
3. Test API directly: `http://localhost:5000/api/places/hidden-gems`
4. Check logs in terminal for error messages
