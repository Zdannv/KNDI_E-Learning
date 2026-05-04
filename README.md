# KNDI E-Learning Platform

Built with **Next.js** (frontend), **Go** (backend), and **PostgreSQL** (database), orchestrated with Docker Compose.

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. Set up environment variables

Copy the example env file and fill in the required values:

```bash
cp .env.example .env
```

Open `.env` and update the following:

| Variable | Description | Required |
|---|---|---|
| `APP_PORT` | Go backend port | Default: `8080` |
| `APP_ENV` | App environment (`development` / `production`) | Default: `development` |
| `DB_HOST` | Database host | Default: `localhost` |
| `DB_PORT` | Database port | Default: `5432` |
| `DB_NAME` | Database name | Default: `e_learning` |
| `DB_USER` | Database user | Default: `kndi` |
| `DB_PASSWORD` | Database password | **Change this** |
| `DB_MAX_CONNS` | Max database connections | Default: `25` |
| `DB_MIN_CONNS` | Min database connections | Default: `5` |
| `DB_MAX_IDLE_MINUTES` | Max idle connection time (minutes) | Default: `15` |
| `DB_MAX_LIFETIME_HOURS` | Max connection lifetime (hours) | Default: `1` |
| `JWT_SECRET` | Secret key for JWT signing | **Required, set a strong value** |
| `JWT_EXPIRY_HOURS` | JWT token expiry in hours | Default: `24` |
| `ALLOWED_ORIGINS` | CORS allowed origins | Default: `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Backend URL for browser requests | Default: `http://localhost:8080` |

Minimum changes required before running:

```env
DB_PASSWORD=your_password_here
JWT_SECRET=your_strong_secret_here
```

### 3. Generating a JWT Secret

Run this command to generate a secure random secret:

```bash
openssl rand -base64 64
```

Copy the output and paste it as your `JWT_SECRET` in `.env`:

```env
JWT_SECRET=your_generated_secret_here
```

### 4. Run the project

```bash
docker compose up --build
```

On first run Docker will:
- Pull the PostgreSQL image
- Build the Go backend image
- Build the Next.js frontend image
- Run database migrations automatically

This may take a few minutes on the first run. Subsequent starts will be much faster.

### 5. Access the app

| Service | URL |
|---|---|
| Frontend (Next.js) | http://localhost:3000 |
| Backend (Go API) | http://localhost:8080 |
| Health Check | http://localhost:8080/health |

---

## Development

To run in the background:

```bash
docker compose up -d
```

To view logs:

```bash
# all services
docker compose logs -f

# specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

To stop:

```bash
docker compose down
```

---

## Project Structure

```
.
├── docker-compose.yaml
├── .env.example
├── backend/                  # Go REST API
│   ├── Dockerfile
│   ├── .air.toml             # Hot reload config
│   ├── cmd/main/main.go      # Entry point
│   ├── database/
│   │   └── migrations/       # SQL migration files
│   └── internal/
│       ├── config/
│       ├── domains/
│       ├── dto/
│       ├── handler/
│       ├── middleware/
│       ├── repository/
│       ├── router/
│       └── services/
└── frontend/                 # Next.js App
    ├── Dockerfile
    └── src/
        └── app/
            └── api/          # Next.js API routes (proxies to Go backend)
```

---

## API Endpoints

All API requests go through Next.js at `http://localhost:3000/...` which proxies to the Go backend.

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login | No |

### Materials
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/materials` | Get all materials | Required |
| GET | `/materials/:id` | Get material by ID | Required |
| POST | `/materials` | Create material | Sensei only |
| PUT | `/materials/:id` | Update material | Sensei only |
| DELETE | `/materials/:id` | Delete material | Sensei only |

### Quizzes
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/quizzes` | Get all quizzes | Required |
| GET | `/quizzes/:id` | Get quiz by ID | Required |
| POST | `/quizzes` | Create quiz | Sensei only |
| PUT | `/quizzes/:id` | Update quiz | Sensei only |
| DELETE | `/quizzes/:id` | Delete quiz | Sensei only |
| POST | `/quizzes/:id/questions` | Add question | Sensei only |
| DELETE | `/questions/:id` | Delete question | Sensei only |

### Assignments
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/assignments` | Start assignment | Student only |
| POST | `/assignments/:id/submit` | Submit assignment | Student only |
| GET | `/assignments/:id` | Get result | Student only |
| GET | `/assignments/history` | Get history | Student only |

---

## Resetting the Database

If you need to wipe the database and start fresh (re-runs migrations):

```bash
docker compose down -v
docker compose up --build
```

> **Warning:** this deletes all data permanently.

---

## Troubleshooting

**Backend can't connect to database**
Make sure `DB_HOST` is set to `postgres` (the service name) inside Docker, not `localhost`.

**Migrations didn't run**
The migrations only run on a fresh volume. If the volume already exists, wipe it:
```bash
docker compose down -v && docker compose up
```

**Port already in use**
Change `APP_PORT` or `DB_PORT` in your `.env` file if another process is using those ports.