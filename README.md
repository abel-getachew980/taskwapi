# Task API — Week 2 End-Goal

A two-container application: an **Express + Prisma** REST API and a **PostgreSQL** database,
wired together with `docker-compose`. Tasks can be created and listed (plus updated/deleted)
via HTTP, and everything is testable with the included Postman Collection.

## Project structure

```
task-api/
├── docker-compose.yml          # defines the api + db containers
├── Dockerfile                  # builds the API image
├── package.json
├── prisma/
│   └── schema.prisma            # Task model + DB connection config
├── src/
│   └── index.js                 # Express server with CRUD routes
├── .env.example                 # env vars for running the API outside Docker
├── .dockerignore
└── Task-API.postman_collection.json   # import into Postman
```

## Data model

```prisma
model Task {
  id        Int      @id @default(autoincrement())
  title     String
  completed Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

- `id` — primary key, auto-incrementing.
- `title` — required text field.
- `completed` — defaults to `false`.
- `createdAt` — timestamp, set automatically.

## Running it

You need Docker and Docker Compose installed. From the `task-api` directory:

```bash
docker-compose up --build
```

This will:
1. Start a `postgres:16-alpine` container (`task-db`) with a persisted volume.
2. Wait until Postgres reports healthy.
3. Build and start the API container (`task-api`), which pushes the Prisma
   schema to the database (creating the `Task` table) and then starts
   listening on port `3000`.

Once running, the API is available at `http://localhost:3000`.

To stop everything:

```bash
docker-compose down
```

To stop and wipe the database volume too:

```bash
docker-compose down -v
```

## API endpoints

| Method | Path         | Description          | Body                                  | Success status |
|--------|--------------|-----------------------|----------------------------------------|-----------------|
| GET    | `/health`    | Health check          | —                                       | 200             |
| GET    | `/tasks`     | List all tasks        | —                                       | 200             |
| GET    | `/tasks/:id` | Get a single task     | —                                       | 200             |
| POST   | `/tasks`     | Create a task         | `{ "title": "New task" }`               | 201             |
| PUT    | `/tasks/:id` | Update a task         | `{ "title": "...", "completed": true }` | 200             |
| DELETE | `/tasks/:id` | Delete a task         | —                                       | 204             |

Error responses (400/404/500) return JSON: `{ "error": "message" }`.

### Example: create a task with curl

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "New task"}'
```

### Example: list tasks

```bash
curl http://localhost:3000/tasks
```

## Testing with Postman

1. Open Postman → **Import** → select `Task-API.postman_collection.json`.
2. The collection uses a `baseUrl` variable set to `http://localhost:3000`
   (edit it in the collection's **Variables** tab if needed).
3. Run **Create Task** first — a test script automatically saves the
   returned `id` into the `taskId` collection variable, which the
   **Get / Update / Delete Task** requests then reuse.
4. Run requests individually, or use **Run collection** to execute them
   all in order.

## Local development without Docker (optional)

If you want to run the API directly on your machine against the Dockerized DB:

```bash
docker-compose up db          # just the database
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm start
```

## Checklist coverage

- [x] SELECT/INSERT/UPDATE/DELETE — handled by Prisma Client under the hood
      for every route (`findMany`, `create`, `update`, `delete`).
- [x] Primary key (`id`) defined in `prisma/schema.prisma`; ready to extend
      with a foreign key (e.g. a `User` model) later.
- [x] REST API with proper HTTP methods and status codes (200/201/204/400/404/500).
- [x] Postman Collection included and importable.
- [x] API server connected to PostgreSQL via `DATABASE_URL`.
- [x] Whole system starts with a single `docker-compose up`.
