# 🎯 CRM Coregate — Full-Stack Ticket Management System

CRM Coregate is a customer relationship management ticket cockpit built to log, manage, and trace customer issues. Wired directly to a live FastAPI Python backend and persistent SQLite database.

## ⚡ Tech Stack & Highlights

*   **Frontend**: React 19 with TypeScript and Tailwind CSS.
*   **Backend**: FastAPI with Python 3.13.
*   **Database**: SQLite
* **Deployment**: Railway

## 📂 Project Directory Structure

```text
CRM_SYSTEM/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── database/         # SQLite engine and session configuration
│   │   ├── models/           # DB schema models (models.py)
│   │   ├── routers/          # REST API endpoints (routes.py)
│   │   ├── app_schemas/      # Pydantic serialization schemas (schemas.py)
│   │   ├── services/         # Custom sequential ticket ID generation service
│   │   └── utils/            # Structured logs and exceptions middleware
│   ├── main.py               # Uvicorn entrypoint & startup tables lifecycle
│   ├── pyproject.toml        # Poetry/Pip project configuration
│   └── requirements.txt      # Server python dependencies
│
└── frontend/                 # Vite + React Client
    ├── src/
    │   ├── components/       # Pages (HomeView, AddTicketView, TicketDetailView, UpdateTicketView)
    │   ├── context/          # React Context API and REST controllers (CRMContext.tsx)
    │   ├── App.tsx           # Layout root with dynamic Toasts
    │   ├── main.tsx          # React application bootstrapping
    │   └── index.css         # Custom alabaster vintage tokens & keyframes
    ├── .env                  # Environment config (loaded via VITE_ prefix)
    ├── package.json          # Node dependencies
    └── tsconfig.json         # TypeScript compiler configurations
```

## ⚙️ Local Development Setup

To run CRM Coregate locally, you will spin up both the FastAPI server and the Vite client.

### 1. Clone the repository:

```bash
git clone https://github.com/Jerry-britto/CRM_ASSIGNMENT.git
cd CRM_ASSIGNMENT
```

### 2. Project setup:


### 🔌 Part 1: Backend Setup
1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```
2.  **Create a virtual environment**:
    ```bash
    python3 -m venv .venv
    ```
3.  **Activate the virtual environment**:
    ```bash
    source .venv/bin/activate
    ```
4.  **Install the dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
5.  **Start the development server**:
    ```bash
    ./.venv/bin/uvicorn main:app --reload
    ```
    *The backend server will spin up on **`http://localhost:8000`**. Upon startup, SQLAlchemy will automatically initialize tables inside your persistent SQLite file (`crm.db`).*

---

### 💻 Part 2: Frontend Setup
1.  **Navigate to the frontend directory**:
    ```bash
    cd ../frontend
    ```
2.  **Install Node dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment variables**:
    Confirm there is a `.env` file inside `/frontend` containing the correct local backend address:
    ```bash
    cp .env.example .env
    ```
    ```text
    VITE_API_BASE_URL=http://localhost:8000/api/tickets
    ```
4.  **Start the Vite development server**:
    ```bash
    npm run dev
    ```
    *Open the allocated port (typically **`http://localhost:5173`**) in your browser to view the application.*

5.  **Build the production bundle**:
    To compile and verify TypeScript strict compliance and bundle output:
    ```bash
    npm run build
    ```