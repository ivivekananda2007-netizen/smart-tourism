# 🏨 Hotels Near Hidden Gems - Quick Start Guide

## ⚡ 5-Minute Setup

### Prerequisites
- Node.js installed
- MongoDB connected and running
- Terminal/Command Prompt open

### Step 1: Seed Hotels Data (1 minute)
```bash
cd c:\trip-plan\server
node scripts/seed-hotels.js
```

**Expected output:**
```
✅ Connected to MongoDB
📝 Seeding hotel data...
✅ Successfully seeded 20 hotels

📊 Hotels by City:
   Port Blair: 3 hotels
   ...
```

### Step 2: Start Backend Server (1 minute)
```bash
cd c:\trip-plan\server
npm run dev
```

**Expected output:**
```
Server running on http://localhost:5000
```

### Step 3: Start Frontend (1 minute)
Open **another terminal**:
```bash
cd c:\trip-plan\client
npm run dev
```

**Expected output:**
```
VITE v... ready in ... ms
➜  Local:   http://localhost:5173/
```

### Step 4: Test the Feature (2 minutes)
1. Open browser: `http://localhost:5173`
2. Click on **"Hidden Gems"** in navigation
3. Click on **any hidden gem card** (e.g., "Chidiya Tapu")
4. Watch hotels appear below the gem! 🎉

---

## 🎯 How It Works

### When You Click a Hidden Gem

1. **Card Expands** - Shows gem details
2. **Hotels Load** - Fetches nearby hotels from API
3. **Budget Check** - Filters hotels by your trip budget
4. **Distance Filter** - Only shows hotels within 15km
5. **Results Display** - Shows available hotels with details

### Hotel Filtering Rules

```
Maximum Hotel Price = Trip Budget × 30%
Maximum = ₹8,000/night

Examples:
├─ ₹50,000 budget  → Max ₹15,000/night for hotels
├─ ₹30,000 budget  → Max ₹8,000/night for hotels
├─ ₹100,000 budget → Max ₹8,000/night for hotels (capped)
└─ ₹20,000 budget  → Max ₹6,000/night for hotels
```

---

## 🏨 Features You Can Use

### View Hotels
```
Click any hidden gem card
    ↓
Hotel list appears below
    ↓
Shows: Distance, Price, Rating, Location
    ↓
Click hotel card to expand
```

### Filter Hotels
```
Click "Category" dropdown
    ↓
Choose: Budget | Mid-range | Luxury | Luxury+
    ↓
Hotels instantly filter
```

### Sort Hotels
```
Click "Sort by" dropdown
    ↓
Choose: Nearest | Price (low-high) | Rating (high-low)
    ↓
Hotels reorder instantly
```

### See Hotel Details
```
Click a hotel card to expand
    ↓
See: Room types, Amenities, Descriptions
    ↓
Find: Phone, Email, Website links
    ↓
Click to call or email hotel
```

---

## 🌍 Sample Hotels by City

### Port Blair (Andaman)
- **Budget**: Budget Lodging Port Blair (₹1,200/night)
- **Mid-range**: Andaman Heritage Hotel (₹2,500/night)
- **Luxury**: Coral Island Resort (₹4,500/night)

### Jaipur (Rajasthan)
- **Budget**: Student Hostel Jaipur (₹800/night)
- **Mid-range**: Palace Heritage Jaipur (₹3,500/night)
- **Luxury**: Oberoi Rajvilas (₹10,000/night)

### Kochi (Kerala)
- **Budget**: Alleppey Homestay (₹1,800/night)
- **Mid-range**: Backwater Breeze Kochi (₹3,000/night)
- **Luxury**: Taj Malabar Resort & Spa (₹8,000/night)

### Shimla (Himachal Pradesh)
- **Budget**: Backpacker Haven Shimla (₹1,000/night)
- **Mid-range**: Mountain View Hotel (₹2,800/night)
- **Luxury**: Wildflower Hall (₹7,500/night)

---

## 🐛 Quick Troubleshooting

### "Hotels not showing"
```
1. Is backend running?
   ✓ Terminal should show: "Server running on http://localhost:5000"

2. Are hotels seeded?
   ✓ Run: node server/scripts/seed-hotels.js

3. Is MongoDB connected?
   ✓ Check backend logs for: "Connected to MongoDB"
```

### "Wrong budget calculations"
```
1. Set trip budget in Planner Wizard first
2. Then go to Hidden Gems page
3. Click on a gem to see hotels
```

### "Hotels showing but no results"
```
Possible reasons:
1. Gem location is too remote (>15km from any hotel)
2. Budget is too low for hotels in that area
3. Hotels exist but haven't been seeded yet

Solution: Try a different gem or city
```

### "Page looks weird on mobile"
```
1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh page (Ctrl+R or F5)
3. Test in different browser if issue persists
```

---

## 📊 API Endpoints (For Developers)

### Test Hotel APIs
```bash
# Get all hotels
curl http://localhost:5000/api/hotels

# Get hotels in a city
curl "http://localhost:5000/api/hotels/by-city?city=Jaipur&maxPrice=5000"

# Get hotels near a location (within 15km and budget)
curl "http://localhost:5000/api/hotels/near-gem?latitude=26.9124&longitude=75.7873&maxPrice=5000"
```

### Run API Tests
```bash
cd c:\trip-plan\server
node test-hotels-api.js
```

Expected output shows:
- Total hotel count
- Hotels by category
- Hotels by city
- Budget/rating filter results
- Sample hotel details

---

## 📱 Mobile Experience

### How It Looks
```
Desktop:
├─ Hotel cards in 1-2 columns
├─ Side-by-side filter controls
└─ Full details visible

Tablet:
├─ Hotel cards in 2 columns
├─ Filter controls stack vertically
└─ Touchable buttons optimized

Mobile:
├─ Single column layout
├─ Full-width filter dropdowns
├─ Large touch-friendly buttons
└─ Easy to scroll and read
```

### Mobile Tips
1. Scroll down to see all hotels
2. Tap hotel card to expand details
3. Use filter dropdowns for better results
4. Hotel contact buttons (Call/Email) are full-width

---

## 💡 Tips & Tricks

### Get Better Results
1. **Higher Budget** → More expensive, luxury hotels
2. **Popular Cities** → More hotels available
3. **Mid-range Filter** → Best value hotels
4. **Sort by Price** → See cheapest options first

### Understand Pricing
- **Per Night**: Price shown is for one night
- **Room Types**: Click hotel card to see all options
- **Amenities**: Included in room price

### Contact Hotels
- **Call**: Tap phone icon (need phone number)
- **Email**: Tap email icon (opens your email client)
- **Website**: Opens hotel website in new tab

---

## ❓ Frequently Asked Questions

**Q: Can I book hotels directly?**
A: Not yet. This shows hotels. You can call/email them to book.

**Q: Why are some gems showing no hotels?**
A: Could be too remote (>15km) or budget too low. Try another gem.

**Q: How accurate is the distance?**
A: Very accurate. Uses Haversine formula for real Earth distance.

**Q: Can I change my trip budget?**
A: Yes! Go back to Planner Wizard and set a new budget.

**Q: Do you have more hotels?**
A: 20+ are seeded. More can be added to MongoDB.

**Q: Why is the budget capped at ₹8,000/night?**
A: Smart filtering. Prevents hotels from being >30% of trip cost.

---

## ✅ Verification Checklist

Complete these to verify everything works:

- [ ] Backend starts without errors
- [ ] "Server running on http://localhost:5000" appears
- [ ] Hotels seeded successfully (20+ records)
- [ ] Frontend starts without errors
- [ ] "Local: http://localhost:5173" appears
- [ ] Can navigate to Hidden Gems page
- [ ] Can see list of hidden gems
- [ ] Can click on a gem to expand
- [ ] Hotels appear within 5 seconds
- [ ] Can see hotel names, prices, distances
- [ ] Can filter hotels by category
- [ ] Can sort hotels (distance/price/rating)
- [ ] Can click hotel card to expand
- [ ] Can see room types and amenities
- [ ] No red errors in browser console (F12)
- [ ] Mobile view looks good (responsive)

---

## 🎓 Learning Resources

### To Understand the Code
1. **Backend Routes**: `server/routes/hotels.js`
2. **Database Schema**: `server/models/Hotel.js`
3. **Frontend Component**: `client/src/components/HotelsNearby.jsx`
4. **Styling**: `client/src/styles/HotelsNearby.css`

### To Extend the Feature
1. Add more hotels: Edit `server/scripts/seed-hotels.js`
2. Change filters: Modify `client/src/components/HotelsNearby.jsx`
3. Update styles: Edit `client/src/styles/HotelsNearby.css`
4. Add new API endpoints: Create in `server/routes/hotels.js`

---

## 📞 Getting Help

### Check Logs
```bash
# Backend logs show:
✅ Connected to MongoDB
Server running on http://localhost:5000

# Frontend logs show:
VITE v... ready in ... ms
Local: http://localhost:5173/
```

### Enable Debug Mode
Open browser console (F12):
1. See detailed logs about hotel loading
2. API calls show in Network tab
3. Errors appear with full details

### Common Issues
| Issue | Solution |
|-------|----------|
| Hotels not showing | Restart backend, reseed hotels |
| Wrong prices | Check trip budget is set |
| Slow loading | Wait 5 seconds, check internet |
| Mobile issues | Clear cache, use Chrome/Safari |
| No results | Try different gem or city |

---

## 🎉 You're Ready!

Everything is set up. Now:

1. **Start the servers**
2. **Open the app**
3. **Go to Hidden Gems**
4. **Click a gem**
5. **Enjoy the hotels!** 🏨

---

**Last Updated**: March 3, 2026
**Version**: 1.0
**Status**: ✅ Ready to Use
