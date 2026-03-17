# WhereGoes — URL Redirect Tracer

> Trace the full redirect chain of any URL. Visualize every hop, inspect HTTP headers, and detect redirect loops in real-time.

![WhereGoes Screenshot](https://via.placeholder.com/1200x630/06070f/3d55ff?text=WhereGoes+%E2%80%94+URL+Redirect+Tracer)

---

## Features

- 🔗 **Full Redirect Chain** — Follow every HTTP redirect from source to final destination
- ⚡ **Response Times** — Measure latency at every hop
- 🔒 **Header Analysis** — Inspect security, cache, and redirect headers per step
- 🔄 **Loop Detection** — Automatically detect redirect loops (max 10 redirects)
- 📜 **History** — Save and replay past traces via Firebase Firestore
- 🎨 **Premium UI** — Dark glassmorphism design with Framer Motion animations

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React (Vite), Tailwind CSS, Framer Motion, Axios, React Router |
| Backend   | Node.js, Express.js, Axios, CORS, dotenv |
| Database  | Firebase Firestore (optional)           |

---

## Quick Start

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### 1. Clone / Extract

```bash
cd wheregoes
```

### 2. Setup the Server

```bash
cd server
npm install

# Copy and edit the env file
cp .env.example .env
# Edit PORT if needed (default: 5001)

npm start
# Server runs on http://localhost:5001
```

### 3. Setup the Client

```bash
cd client
npm install

# Copy and edit the env file
cp .env.example .env
# Edit VITE_API_URL if your server runs on a different port
# Add Firebase credentials if you want history persistence (see below)

npm run dev
# Client runs on http://localhost:5173
```

---

## Environment Variables

### Server (`server/.env`)

| Variable       | Default                  | Description              |
|----------------|--------------------------|--------------------------|
| `PORT`         | `5001`                   | Server port              |
| `CLIENT_ORIGIN`| `http://localhost:5173`  | CORS allowed origin      |

### Client (`client/.env`)

| Variable                        | Description                                     |
|---------------------------------|-------------------------------------------------|
| `VITE_API_URL`                  | Backend API URL (default: `http://localhost:5001/api`) |
| `VITE_FIREBASE_API_KEY`         | Firebase project API key                        |
| `VITE_FIREBASE_AUTH_DOMAIN`     | Firebase auth domain                            |
| `VITE_FIREBASE_PROJECT_ID`      | Firebase project ID                             |
| `VITE_FIREBASE_STORAGE_BUCKET`  | Firebase storage bucket                         |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID               |
| `VITE_FIREBASE_APP_ID`          | Firebase app ID                                 |

> **Note:** Firebase is optional. The app works fully without it — history just won't be persisted.

---

## Firebase Setup (Optional)

1. Go to [Firebase Console](https://console.firebase.google.com) → Create project
2. Enable **Firestore Database** in production mode
3. Add a Firestore security rule allowing writes (or use Firebase Auth)
4. Copy your web app config to `client/.env`

Firestore structure:
```
results/
  {docId}/
    url: string
    result: object   # { chain, totalTime, finalUrl, warnings }
    timestamp: Timestamp
```

---

## API Reference

### `POST /api/check`

Trace the redirect chain of a URL.

**Request:**
```json
{ "url": "http://google.com" }
```

**Response:**
```json
{
  "success": true,
  "url": "http://google.com",
  "chain": [
    {
      "url": "http://google.com",
      "status": 301,
      "statusText": "Moved Permanently",
      "headers": { "location": "http://www.google.com/", ... },
      "responseTime": 120
    },
    ...
  ],
  "totalTime": 350,
  "finalUrl": "https://www.google.com/",
  "warnings": []
}
```

### `GET /health`

Health check endpoint. Returns `{ "status": "ok" }`.

---

## Project Structure

```
wheregoes/
├── client/                  # React (Vite) frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── URLInput.jsx
│   │   │   ├── RedirectTimeline.jsx
│   │   │   ├── RedirectCard.jsx
│   │   │   ├── HeaderInspector.jsx
│   │   │   └── Loader.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Result.jsx
│   │   │   └── History.jsx
│   │   ├── services/
│   │   │   ├── api.js       # Axios API client
│   │   │   └── firebase.js  # Firestore service
│   │   ├── hooks/
│   │   │   └── useRedirect.js
│   │   ├── App.jsx
│   │   └── index.css
│   ├── .env                 # Client environment variables
│   └── package.json
│
└── server/                  # Express.js backend
    ├── routes/
    │   └── redirectRoutes.js
    ├── controllers/
    │   └── redirectController.js
    ├── utils/
    │   └── redirectChecker.js  # Core redirect tracking logic
    ├── middleware/
    │   └── validateUrl.js
    ├── server.js
    ├── .env
    └── package.json
```

---

## Development Scripts

| Directory | Command       | Description            |
|-----------|---------------|------------------------|
| `server/` | `npm start`   | Start Express server   |
| `client/` | `npm run dev` | Start Vite dev server  |
| `client/` | `npm run build` | Build for production  |

---

## License

MIT — Free to use and modify.
