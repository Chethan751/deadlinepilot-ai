# DeadlinePilot AI 🚀

DeadlinePilot AI is an advanced, AI-powered project and deadline management system designed to help teams track, predict, and meet project deadlines efficiently.

This project is organized as a monorepo containing a high-performance frontend and a robust backend.

---

## 📁 Repository Structure

```
deadlinepilot-ai/
├── .github/
│   └── workflows/
│       └── ci-cd.yml             # GitHub Actions CI/CD pipeline
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py              # FastAPI application server
│   └── Dockerfile               # Backend Dockerfile
├── docs/
│   └── architecture.md          # Architecture & design documentation
├── frontend/
│   ├── src/                     # React + TanStack Start codebase
│   ├── vite.config.ts
│   └── package.json
├── firebase/                    # Firebase functions & services
├── screenshots/                 # Application screenshots
├── docker-compose.yml           # Local multi-container orchestration
├── Dockerfile                   # Root Dockerfile (multi-stage)
├── firebase.json                # Firebase configuration
├── firestore.rules              # Firestore security rules
├── firestore.indexes.json       # Firestore indexes
├── cloudbuild.yaml              # Google Cloud Build configuration
├── LICENSE                      # MIT License
└── requirements.txt             # Python backend dependencies
```

---

## 🛠️ Technology Stack

- **Frontend**: React, TanStack Start (Router + Query), Tailwind CSS, Lucide Icons.
- **Backend**: Python, FastAPI, Uvicorn, Pydantic.
- **Database/Auth**: Supabase (PostgreSQL, GoTrue Auth) and Firebase (Firestore, Firebase Auth) options.
- **DevOps**: Docker, Docker Compose, GitHub Actions, Google Cloud Build.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Python](https://www.python.org/) (v3.10+ recommended)
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

---

### Local Development

#### 1. Running the Full Stack with Docker Compose (Recommended)

The easiest way to get the entire stack up and running is using Docker Compose:

```bash
docker compose up --build
```

- Frontend: [http://localhost:8080](http://localhost:8080)
- Backend API: [http://localhost:8000](http://localhost:8000)
- Swagger API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

#### 2. Running Services Individually

##### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment template and configure your keys:
   ```bash
   cp .env.example .env
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

##### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```

---

## 🔒 License

This project is licensed under the [MIT License](LICENSE).
