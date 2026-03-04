# 🏨 Hotels Near Hidden Gems - Visual Feature Guide

## 🎬 User Journey Flowchart

```
START
  │
  ├─→ User opens Trip Planner app
  │
  ├─→ Sets trip budget (e.g., ₹50,000)
  │
  ├─→ Navigates to "Hidden Gems" page
  │   
  ├─→ Sees list of hidden gems
  │   ┌─────────────────────────┐
  │   │ Gem Card #1             │
  │   │ Chidiya Tapu            │
  │   │ Port Blair, Andaman     │
  │   │ Budget: ₹500 | 2 hours  │
  │   │ 👥 Low Crowd ⭐ 4.3     │
  │   │ [CLICK TO VIEW HOTELS]  │
  │   └─────────────────────────┘
  │   ┌─────────────────────────┐
  │   │ Gem Card #2             │
  │   │ Mini Zoo                │
  │   │ Port Blair, Andaman     │
  │   │ Budget: ₹400 | 3 hours  │
  │   │ 👥 Low Crowd ⭐ 4.1     │
  │   │ [CLICK TO VIEW HOTELS]  │
  │   └─────────────────────────┘
  │
  ├─→ USER CLICKS GEM CARD "Chidiya Tapu"
  │
  ├─→ Card expands
  │   ┌─────────────────────────────────────┐
  │   │ CHIDIYA TAPU                        │
  │   │ Port Blair, Andaman & Nicobar       │
  │   │ Nature | Budget: ₹500 | 2 hours     │
  │   │ 👥 Low Crowd | ⭐ 4.3               │
  │   │                                     │
  │   │ Beautiful island with scenic views. │
  │   │                                     │
  │   │ ──────────────────────────────────│
  │   │ 🏨 HOTELS NEARBY (Within ₹15,000) │
  │   │ ──────────────────────────────────│
  │   └─────────────────────────────────────┘
  │
  ├─→ HotelsNearby component loads
  │   
  ├─→ Fetches hotels from API
  │   /api/hotels/near-gem?
  │   latitude=11.7401
  │   longitude=92.7460
  │   maxPrice=15000
  │   maxDistance=15
  │
  ├─→ Hotel results appear:
  │   ┌─────────────────────────────────┐
  │   │ 🏢 ANDAMAN HERITAGE HOTEL       │
  │   │                                 │
  │   │ Distance: 1.2km                 │
  │   │ Price: ₹2,500/night             │
  │   │ Rating: ⭐⭐⭐⭐ (4.3)            │
  │   │ Category: [MID-RANGE]           │
  │   │                                 │
  │   │ WiFi • AC • Restaurant • Beach  │
  │   │                                 │
  │   │ [CLICK TO EXPAND DETAILS]       │
  │   └─────────────────────────────────┘
  │
  │   ┌─────────────────────────────────┐
  │   │ 🏝️ CORAL ISLAND RESORT          │
  │   │                                 │
  │   │ Distance: 3.5km                 │
  │   │ Price: ₹4,500/night             │
  │   │ Rating: ⭐⭐⭐⭐⭐ (4.6)          │
  │   │ Category: [LUXURY]              │
  │   │                                 │
  │   │ WiFi • Pool • Spa • Beach Access│
  │   │                                 │
  │   │ [CLICK TO EXPAND DETAILS]       │
  │   └─────────────────────────────────┘
  │
  ├─→ USER CLICKS "CORAL ISLAND RESORT"
  │
  ├─→ Hotel card expands
  │   ┌──────────────────────────────────────┐
  │   │ 🏝️ CORAL ISLAND RESORT               │
  │   │ Port Blair, Andaman & Nicobar        │
  │   │                                      │
  │   │ Distance: 3.5km  ⭐ 4.6              │
  │   │ Price: ₹4,500/night   [LUXURY]      │
  │   │                                      │
  │   │ Luxury resort with water sports      │
  │   │ and island activities                │
  │   │                                      │
  │   │ ─── ROOM TYPES ───                   │
  │   │ ✓ Deluxe (₹4,500) - 2 guests        │
  │   │ ✓ Suite (₹7,000) - 4 guests         │
  │   │                                      │
  │   │ ─── AMENITIES ───                    │
  │   │ ✓ WiFi                              │
  │   │ ✓ Swimming Pool                     │
  │   │ ✓ Spa & Wellness                    │
  │   │ ✓ Beach Access                      │
  │   │ ✓ Water Sports                      │
  │   │                                      │
  │   │ [📞 CALL] [📧 EMAIL] [🌐 WEBSITE]   │
  │   └──────────────────────────────────────┘
  │
  ├─→ USER CAN:
  │   ├─→ Change filter (Category dropdown)
  │   ├─→ Change sort (Distance/Price/Rating)
  │   ├─→ Call hotel (phone button)
  │   ├─→ Email hotel (email button)
  │   └─→ Visit website (link button)
  │
  └─→ END
```

---

## 🎨 UI Component Breakdown

### Hidden Gems Page Layout
```
┌────────────────────────────────────────────────┐
│  HIDDEN GEMS RECOMMENDATION ENGINE            │
├────────────────────────────────────────────────┤
│                                                │
│  [Search] [State ▼] [Preset ▼]               │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ Instead of popular spots, try these      │ │
│  │ • Instead of Famous Lake, try Secret     │ │
│  │   Beach (Less crowded)                   │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────┐  ┌──────────────┐          │
│  │ GEM CARD #1  │  │ GEM CARD #2  │          │
│  │              │  │              │          │
│  │ [EXPAND]     │  │ [EXPAND]     │          │
│  └──────────────┘  └──────────────┘          │
│                                                │
│  ┌────────────────────────────────────────┐   │
│  │ SELECTED GEM #1 (EXPANDED)             │   │
│  │                                        │   │
│  │ Gem Details...                         │   │
│  │                                        │   │
│  │ ┌──────────────────────────────────┐  │   │
│  │ │ 🏨 HOTELS NEARBY COMPONENT       │  │   │
│  │ │                                  │  │   │
│  │ │ [Category ▼] [Sort ▼] Found: 5  │  │   │
│  │ │                                  │  │   │
│  │ │ ┌──────────────────────────────┐ │  │   │
│  │ │ │ HOTEL 1                      │ │  │   │
│  │ │ │ Distance • Price • Rating    │ │  │   │
│  │ │ │ Amenities                    │ │  │   │
│  │ │ └──────────────────────────────┘ │  │   │
│  │ │                                  │  │   │
│  │ │ ┌──────────────────────────────┐ │  │   │
│  │ │ │ HOTEL 2                      │ │  │   │
│  │ │ │ Distance • Price • Rating    │ │  │   │
│  │ │ │ Amenities                    │ │  │   │
│  │ │ └──────────────────────────────┘ │  │   │
│  │ │                                  │  │   │
│  │ └──────────────────────────────────┘  │   │
│  └────────────────────────────────────────┘   │
│                                                │
└────────────────────────────────────────────────┘
```

### Hotel Card (Compact View)
```
┌─────────────────────────────────────────────┐
│ ANDAMAN HERITAGE HOTEL        [MID-RANGE]  │ ⭐4.3
│                                             │
│ Distance: 1.2km  |  Price: ₹2,500/night   │
│ Port Blair, Andaman & Nicobar              │
│                                             │
│ WiFi • AC • Restaurant • Beach Access      │
└─────────────────────────────────────────────┘
         [CLICK TO EXPAND DETAILS]
```

### Hotel Card (Expanded View)
```
┌──────────────────────────────────────────────────┐
│ ANDAMAN HERITAGE HOTEL              [MID-RANGE] │ ⭐4.3
│                                                  │
│ Distance: 1.2km  |  Price: ₹2,500/night        │
│ Port Blair, Andaman & Nicobar                   │
│                                                  │
│ Comfortable hotel near Port Blair beaches       │
│ with local cuisine.                             │
│                                                  │
│ ────── ROOM TYPES ──────                        │
│ ┌────────────────┐  ┌────────────────┐          │
│ │ Deluxe         │  │ Standard       │          │
│ │ ₹2,500         │  │ ₹1,800         │          │
│ │ 2 guests       │  │ 2 guests       │          │
│ └────────────────┘  └────────────────┘          │
│                                                  │
│ ────── AMENITIES ──────                         │
│ ✓ WiFi           ✓ Restaurant                  │
│ ✓ Air Conditioning ✓ Beach Access              │
│                                                  │
│ ────── CONTACT ──────                           │
│ [📞 CALL] [📧 EMAIL] [🌐 WEBSITE]              │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Filter & Sort Controls
```
┌──────────────────────────────────────────────────┐
│ Category:          Sort by:              Count:  │
│ ┌──────────────┐ ┌──────────────┐               │
│ │ All Category │ │ Nearest First│  Found: 5    │
│ │ Budget       │ │ Price (L-H)  │ hotels       │
│ │ Mid-range    │ │ Rating (H-L) │               │
│ │ Luxury       │ └──────────────┘               │
│ │ Luxury+      │                                │
│ └──────────────┘                                │
└──────────────────────────────────────────────────┘
```

---

## 💰 Budget Filtering Logic

```
Trip Budget Input
      ↓
   ×0.30 (30%)
      ↓
Calculated Max
   ↓        ↓
   v        v
< ₹8,000?  Yes → Use ₹8,000
   ↓
   No → Use (Budget × 0.30)
   ↓
Maximum Hotel Price Per Night
   ↓
API filters hotels
   ↓
Only shows hotels meeting budget

Examples:
┌──────────────────────────────────┐
│ Trip Budget  │  Max Hotel Price  │
├──────────────┼───────────────────┤
│ ₹20,000      │ ₹6,000/night      │
│ ₹50,000      │ ₹15,000/night →  │
│              │ Cap at ₹8,000     │
│ ₹100,000     │ ₹30,000 →        │
│              │ Cap at ₹8,000     │
│ ₹30,000      │ ₹9,000 →         │
│              │ Cap at ₹8,000     │
└──────────────────────────────────┘
```

---

## 📍 Location & Distance

```
Hidden Gem (Chidiya Tapu)
    Lat: 11.7401
    Lon: 92.7460

        ↓ (15km radius search)

Hotels Found Within Radius:
├─ 1.2km away → Andaman Heritage Hotel
├─ 3.5km away → Coral Island Resort
├─ 5.8km away → Beach Resort
├─ 12.3km away → Budget Lodging
└─ 14.9km away → Another Hotel

(Hotels >15km away are not shown)
```

---

## 📱 Responsive Design

### Desktop (>768px)
```
┌─────────────────────────────────────┐
│ GEM 1      │      │      GEM 2      │
│            │ GEM 3│                 │
├─────────────────────────────────────┤
│          GEM DETAILS (EXPANDED)      │
├─────────────────────────────────────┤
│                                     │
│ Hotels in 2-3 column layout         │
│ ┌──────────┐  ┌──────────┐         │
│ │ HOTEL 1  │  │ HOTEL 2  │         │
│ └──────────┘  └──────────┘         │
│ ┌──────────┐                        │
│ │ HOTEL 3  │                        │
│ └──────────┘                        │
│                                     │
└─────────────────────────────────────┘
```

### Tablet (480px - 768px)
```
┌──────────────────────────────────┐
│ GEM 1          │        GEM 2     │
├──────────────────────────────────┤
│   GEM DETAILS (EXPANDED)          │
├──────────────────────────────────┤
│ Filter Controls Stack Vertically  │
│ Category: [Dropdown]              │
│ Sort by:  [Dropdown]              │
│                                   │
│ Hotels in Single Column           │
│ ┌──────────────────────────────┐  │
│ │ HOTEL 1                      │  │
│ └──────────────────────────────┘  │
│ ┌──────────────────────────────┐  │
│ │ HOTEL 2                      │  │
│ └──────────────────────────────┘  │
│                                   │
└──────────────────────────────────┘
```

### Mobile (<480px)
```
┌────────────────────┐
│ GEM 1              │
│ [EXPAND]           │
├────────────────────┤
│ GEM 2              │
│ [EXPAND]           │
├────────────────────┤
│ GEM DETAILS        │
│ (FULL WIDTH)       │
│                    │
│ [Category ▼]       │
│ [Sort by ▼]        │
│                    │
│ ┌────────────────┐ │
│ │ HOTEL 1        │ │
│ │ Distance       │ │
│ │ Price          │ │
│ │ [EXPAND]       │ │
│ └────────────────┘ │
│                    │
│ ┌────────────────┐ │
│ │ HOTEL 2        │ │
│ │ Distance       │ │
│ │ Price          │ │
│ │ [EXPAND]       │ │
│ └────────────────┘ │
│                    │
└────────────────────┘
```

---

## 🌈 Color Coding

### Category Colors
```
Budget         Mid-Range      Luxury         Luxury+
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Budget   │  │Mid-Range │  │ Luxury   │  │Luxury+   │
│          │  │          │  │          │  │          │
│ #d4edda  │  │ #cfe2ff  │  │ #ffd6f0  │  │ #fff3cd  │
│ Green    │  │ Blue     │  │ Pink     │  │ Yellow   │
└──────────┘  └──────────┘  └──────────┘  └──────────┘

Pricing Range:
₹800-2,000    ₹2,500-4,500    ₹7,500-9,000   ₹10,000+
```

---

## 🔄 Interaction Flow

### Filter By Category
```
User clicks "Category" dropdown
        ↓
Shows options: All | Budget | Mid-range | Luxury | Luxury+
        ↓
User selects "Mid-range"
        ↓
Component filters hotels
        ↓
Only mid-range hotels (₹2,500-4,500) display
        ↓
Count updates (e.g., "Found 3 hotels")
```

### Sort By Option
```
User clicks "Sort by" dropdown
        ↓
Shows options: Nearest | Price (L-H) | Rating (H-L)
        ↓
User selects "Price (L-H)"
        ↓
Component reorders hotels
        ↓
Cheapest hotel appears first
```

### View Hotel Details
```
User clicks hotel card
        ↓
Card animates (slideDown animation)
        ↓
Shows expanded details:
  • Description
  • All room types
  • All amenities
  • Contact buttons
        ↓
User can call/email/visit website
```

---

## 📊 Data Display Examples

### Sample Hidden Gem
```
Name: Chidiya Tapu
Type: Nature
City: Port Blair
State: Andaman and Nicobar Islands
Budget: ₹500
Duration: 2 hours
Crowd Level: Low
Rating: 4.3⭐
Description: Beautiful island with scenic views and photography opportunities
```

### Sample Hotel
```
Name: Andaman Heritage Hotel
City: Port Blair
State: Andaman and Nicobar Islands
Distance from Gem: 1.2 km
Price per Night: ₹2,500
Category: Mid-range
Rating: 4.3⭐
Amenities: WiFi, AC, Restaurant, Beach Access
Room Types:
  - Deluxe (₹2,500, 2 guests)
  - Standard (₹1,800, 2 guests)
Phone: +91-XXXXX-XXXXX
Email: info@heritage.com
Website: https://heritage.com
```

---

## ✨ Animation Flows

### Card Expand Animation
```
Initial State:
╔═══════════════════════╗
║ Hotel Name • Distance ║
╚═══════════════════════╝

Click Triggered:
↓ (slideDown animation, 0.3s)

Expanded State:
╔═══════════════════════╗
║ Hotel Name • Distance ║
║ Price • Location      ║
║ Amenities...          ║
║ ─────────────────────║
║ Description           ║
║ Room Types...         ║
║ All Amenities...      ║
║ [Contact Buttons]     ║
╚═══════════════════════╝
```

---

## 🎯 Summary

This visual guide shows:
✅ User journey from start to hotel selection
✅ Component layouts and structures
✅ Budget filtering logic
✅ Distance calculation
✅ Responsive design breakpoints
✅ Color coding system
✅ Interaction flows
✅ Animation sequences
✅ Data display examples

**All working together to create a seamless user experience!** 🚀
