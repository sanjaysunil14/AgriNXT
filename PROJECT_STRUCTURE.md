# � Docker Files - What & Why

Here is the explanation of **only** the files related to the Docker setup.

## 1. The Orchestrator
| File | Why is it needed? |
| :--- | :--- |
| **`docker-compose.yml`** | **The Boss.** Without this, you'd have to run 10 long commands manually every time to start the app. It defines: <br> • **Services**: (Frontend, Backend, Database) <br> • **Networks**: How they talk to each other <br> • **Volumes**: Where database data is stored so it doesn't vanish on restart. |

## 2. Backend Docker Files
| File | Why is it needed? |
| :--- | :--- |
| **`backend/Dockerfile`** | **The Blueprint.** It tells Docker how to build your Node.js backend from scratch. <br> • Installs Node.js & OpenSSL (for Prisma) <br> • Copies your code <br> • Runs `npm install` and `prisma generate` <br> • Starts the server. |
| **`backend/.dockerignore`** | **Speed & Security.** It tells Docker: *"Don't copy `node_modules` or `.env` into the image."* <br> • **Why?** Copying `node_modules` is slow and breaks things (Windows modules don't work on Linux). We want a fresh install inside Docker. |

## 3. Frontend Docker Files
| File | Why is it needed? |
| :--- | :--- |
| **`frontend/Dockerfile`** | **The Blueprint.** <br> • It builds your React app (`npm run build`) to create static HTML/CSS/JS files. <br> • It installs **Nginx** (a web server) to host those files. <br> *Note: We don't use `npm start` (Vite dev server) in production Docker because it's slow and not meant for deployment.* |
| **`frontend/nginx.conf`** | **The Traffic Cop.** <br> • **Why?** React is a "Single Page App". If you go to `/dashboard` and refresh, Nginx normally gives a "404 Not Found" error because that file doesn't exist. <br> • This config fixes that by redirecting everything back to `index.html` so React handles the routing. |
| **`frontend/.dockerignore`** | Same as backend - keeps the build context small and fast by ignoring local `node_modules`. |
| **`frontend/.env.production`** | **Environment Switch.** <br> • Locally, you might use `localhost:5000`. <br> • In Docker, we ensure the frontend knows exactly where the API is. |

## 4. Database & Documentation
| File | Why is it needed? |
| :--- | :--- |
| **`database_backup.sql`** | **Your Data Snapshot.** The backup file we created to move your data into Docker. You can delete/move it after import, but it's good safety. |
| **`README.docker.md`** | **The Manual.** Contains all the commands (`docker-compose up`, etc.) so you or another developer knows how to run this specific setup. |

## 📝 Summary of Changes to Your Code
We also made one critical change to an existing file for Docker:

*   **`backend/prisma/schema.prisma`**: We added `binaryTargets` (Alpine Linux).
    *   **Why?** Docker uses Linux (Alpine), but you use Windows. Prisma needs to know to download the *Linux* database engine, or the backend would crash immediately in Docker.
