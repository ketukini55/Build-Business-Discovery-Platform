# 🚀 Business Discovery Platform

A fully functional web application that helps entrepreneurs identify and contact small businesses without websites for selling website services.

## ✨ Features

- **🗺️ Google Maps Integration** - Find local businesses by country and category
- **🔍 Website Detection** - Automatically checks if businesses have websites
- **🤖 AI-Powered Insights** - Business summaries and contact recommendations using OpenAI
- **📊 CSV Export** - Download leads for follow-up
- **📱 Mobile Responsive** - Works on all devices
- **⚡ Demo Mode** - Works without API keys using mock data

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, Tailwind CSS |
| Backend | Python FastAPI, uvicorn |
| APIs | Google Maps API, OpenAI GPT-3.5 |
| Database | SQLite (via aiosqlite) |
| Deployment | Docker + docker-compose |

## 📦 Project Structure

```
Build-Business-Discovery-Platform/
├── frontend/                 # Next.js React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Next.js pages
│   │   ├── utils/            # API utilities
│   │   └── styles/           # Global CSS
│   ├── package.json
│   └── next.config.js
├── backend/                  # Python FastAPI backend
│   ├── app.py                # Main application
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   ├── models/               # Database models
│   ├── requirements.txt
│   └── .env.example
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
└── README.md
```

## 🚀 Quick Start

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/ketukini55/Build-Business-Discovery-Platform.git
   cd Build-Business-Discovery-Platform
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys (optional - works with mock data without keys)
   ```

3. **Run with Docker**
   ```bash
   docker-compose up --build
   ```

4. **Open the app** at `http://localhost:3000`

### Option 2: Local Development

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
uvicorn app:app --reload --port 8000
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Access the app at `http://localhost:3000`

## 🔑 API Keys (Optional)

The app works in **demo mode** without any API keys using mock data.

For real data, add these to your `.env` file:

### Google Maps API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Places API** and **Maps JavaScript API**
3. Create an API key
4. Add to `.env`: `GOOGLE_MAPS_API_KEY=your_key_here`

### OpenAI API
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an API key
3. Add to `.env`: `OPENAI_API_KEY=your_key_here`

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/search` | Search businesses by country & category |
| `GET` | `/api/results` | Fetch cached results |
| `GET` | `/api/business/:id` | Get detailed business info |
| `GET` | `/api/searches` | Get search history |
| `GET` | `/health` | Health check |

### Search Request Example
```json
POST /api/search
{
  "country": "United States",
  "category": "restaurants",
  "max_results": 20,
  "filter_no_website": true
}
```

## 🎯 How to Use

1. **Select a country** from the dropdown
2. **Choose a business category** (e.g., restaurants, plumbers, salons)
3. **Click "Search for Businesses"**
4. **Browse results** - businesses are shown with their details
5. **Click "Show AI Insights"** for AI-generated summaries
6. **Export to CSV** for your CRM or outreach campaigns

## 🤝 Contributing

Pull requests are welcome! Please ensure:
- Code follows existing patterns
- Tests pass (when applicable)
- Documentation is updated

## 📄 License

MIT License - feel free to use this for your own business!