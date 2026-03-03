# 🗺️ Smart Tourism Assistant (MERN Stack)

A full-stack web application for personalized trip planning with hidden gems discovery, budget tracking, and weather-aware itineraries.

## ✨ Features

- **🤖 AI Trip Planner** - Personalized itinerary generation with optimization
- **💎 Hidden Gems Engine** - Discover lesser-known destinations across India (943 hidden gems!)
- **📅 Smart Replanning** - Auto-adjust plans based on weather or manual preferences
- **💰 Budget Tracker** - Track spending and manage trip budget
- **🌤️ Weather Alerts** - Real-time weather-aware travel advisories
- **🔐 User Authentication** - Secure login and profile management
- **📍 Comprehensive Dataset** - 1,508 places across 28 Indian states

## 📁 Project Structure

```
trip-plan/
├── server/                 # Express.js + MongoDB backend
│   ├── routes/            # API endpoints
│   ├── models/            # Database schemas
│   ├── config/            # Configuration
│   ├── scripts/          # Utilities (seeding)
│   └── .env              # Environment variables
├── client/                # React + Vite frontend
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React context (Auth, Trips)
│   │   └── App.jsx
│   └── .env.local        # Frontend environment
└── datasets/             # Place data (JSON files)
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** v14+ 
- **npm** v6+
- **MongoDB Atlas** account (free tier available)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/trip-plan.git
cd trip-plan
```

### 2. Backend Setup

```bash
cd server

# Create environment file
# On Windows (PowerShell):
# Copy .env.example to .env and edit it
# Or create manually with:
cat > .env << EOF
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
WEATHER_API_KEY=your_openweather_api_key
EOF

# Install dependencies
npm install

# Seed the database with places
npm run seed

# Start server in development mode
npm run dev
```

**Server runs on:** `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../client

# Create environment file
cat > .env.local << EOF
VITE_API_BASE_URL=http://localhost:5000/api
EOF

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend runs on:** `http://localhost:5173` (or next available port)

### 4. Access the App
Open your browser and go to: `http://localhost:5173`

## 🔑 Environment Variables

### Server (`.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `WEATHER_API_KEY` | OpenWeatherMap API key | `your-api-key` |

### Client (`.env.local`)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:5000/api` |

## 📚 Getting MongoDB & API Keys

### MongoDB Atlas (Free)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a cluster (M0 free tier)
4. Get your connection string and add it to `.env`

### Weather API Key (Free)
1. Go to [openweathermap.org/api](https://openweathermap.org/api)
2. Sign up for free
3. Get your API key
4. Add it to `.env`

## 🛣️ API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Places & Hidden Gems
- `GET /api/places` - Get all places with filters
- `GET /api/places/hidden-gems` - Get hidden gems (943 places)
- `GET /api/places/states` - Get list of all states
- `GET /api/places/by-destination/:destination` - Get places by destination

### Trips & Itineraries
- `POST /api/trips/generate` - Generate personalized itinerary
- `GET /api/trips/:id` - Get trip details
- `POST /api/trips/:id/replan` - Replan trip (weather/manual)
- `POST /api/trips/:id/spend` - Add spending entry

### Weather
- `GET /api/weather/:city` - Get weather alerts

## 🗄️ Database Schema

### Place Model
```javascript
{
  state: String,
  placeTown: String,
  cityTown: String,
  type: String,
  hiddenGem: Boolean,
  visitDuration: Number,
  budgetINR: Number,
  latitude: Number,
  longitude: Number,
  crowdLevel: String ('low', 'medium', 'high'),
  rating: Number
}
```

## 🧪 Testing

```bash
cd server
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Features Breakdown

### 🎯 Trip Planner
- Select destination and duration
- Choose preferences (budget, pace, interests)
- Get AI-optimized day-by-day itinerary
- Modify and finalize plans

### 💎 Hidden Gems Discovery
- Browse 943 lesser-known destinations
- Filter by state, crowd level, type
- Search specific locations
- Get smart recommendations

### 💰 Budget Tracking
- Set trip budget
- Track expenses by category
- See spending breakdown
- Get budget alerts

### 🌤️ Weather Alerts
- Real-time weather updates
- Auto-reschedule recommendations
- Activity suggestions based on weather

## 📊 Dataset Info

- **Total Places:** 1,508
- **Hidden Gems:** 943
- **States Covered:** 28 (All Indian states & territories)
- **Data Format:** JSON files in `datasets/` folder

## 🐛 Troubleshooting

### "Failed to load hidden gems"
- Check backend is running (`npm run dev` in server folder)
- Verify MongoDB connection in `.env`
- Check `VITE_API_BASE_URL` in frontend `.env.local`

### "MongoDB connection refused"
- Verify MONGO_URI is correct
- Check MongoDB Atlas network access (allow 0.0.0.0/0)
- Ensure internet connection is active

### Port already in use
- Change PORT in `.env` (e.g., 5001, 5002)
- Or kill the process using the port

## 📄 License

This project is open source and available under the MIT License.

## 👥 Team

Made with ❤️ for travel enthusiasts

## 📞 Support

For issues, questions, or suggestions:
- Open an [GitHub Issue](https://github.com/YOUR_USERNAME/trip-plan/issues)
- Check existing documentation in `HIDDEN_GEMS_SETUP.md`
- See troubleshooting guide in `HIDDEN_GEMS_TROUBLESHOOTING.md`
