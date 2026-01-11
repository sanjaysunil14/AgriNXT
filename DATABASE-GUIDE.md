# Database Guide - Docker vs Local PostgreSQL

## 🗄️ Understanding Your Database Setup

### What's Happening Now

You have **TWO separate PostgreSQL databases**:

```
┌─────────────────────────────────────┐
│   Your Local PostgreSQL (Windows)   │
│                                     │
│  Location: localhost:5432           │
│  Status: Still running (maybe)      │
│  Data: ALL YOUR OLD DATA IS HERE   │
│  ❌ Docker is NOT using this        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   Docker PostgreSQL (Container)     │
│                                     │
│  Location: Inside Docker container  │
│  Exposed at: localhost:5432         │
│  Data: Empty (just schema)          │
│  ✅ Docker backend uses this        │
└─────────────────────────────────────┘
```

**Important**: When Docker is running, it "takes over" port 5432, so your local PostgreSQL might be blocked or running on a different port.

---

## 🎯 Your Options

### Option 1: Use Docker PostgreSQL (Current Setup) ⭐ Recommended

**Pros:**
- ✅ Everything in Docker is portable
- ✅ Easy to deploy to servers
- ✅ Isolated environment
- ✅ No conflicts with other apps

**Cons:**
- ❌ Your old data is not automatically migrated
- ❌ Need to export/import data manually

**What you have now:**
- Empty database with schema
- One Super Admin account:
  - Phone: `9999999999`
  - Password: `admin`

---

### Option 2: Point Docker Backend to Your Local PostgreSQL

**Make Docker use your Windows PostgreSQL instead of the container.**

#### Steps:

1. **Edit `docker-compose.yml`:**

```yaml
services:
  # Comment out the postgres service
  # postgres:
  #   image: postgres:16-alpine
  #   ...

  backend:
    environment:
      # Change this line:
      DATABASE_URL: postgresql://postgres:password@host.docker.internal:5432/farmer_buyer_db
      # (host.docker.internal = your Windows machine from inside Docker)
```

2. **Restart:**
```bash
docker-compose down
docker-compose up -d
```

3. **Make sure your local PostgreSQL is running.**

**Pros:**
- ✅ Access all your existing data immediately
- ✅ No data migration needed

**Cons:**
- ❌ Not portable (requires PostgreSQL installed)
- ❌ Harder to deploy to other servers

---

### Option 3: Migrate Your Data from Local to Docker

**Copy your existing data into the Docker PostgreSQL.**

#### Method A: Using pg_dump (if you have PostgreSQL tools installed)

```bash
# 1. Export from local PostgreSQL
pg_dump -U postgres -h localhost -p 5432 farmer_buyer_db > backup.sql

# 2. Import into Docker
cat backup.sql | docker-compose exec -T postgres psql -U postgres farmer_buyer_db
```

#### Method B: Using Prisma Studio (Visual Tool)

```bash
# 1. Start Prisma Studio for Docker database
docker-compose exec backend npx prisma studio

# 2. Manually add your data through the web UI
# Opens at http://localhost:5555
```

#### Method C: Export/Import via CSV

If you have the data in CSV files or can export it:

```bash
# Copy CSV files into container
docker cp your_data.csv farmer-buyer-db:/tmp/

# Import via psql
docker-compose exec postgres psql -U postgres farmer_buyer_db -c "\copy users FROM '/tmp/your_data.csv' DELIMITER ',' CSV HEADER"
```

---

## 🔧 Quick Actions

### Check What's in Docker Database Now

```bash
# Open Prisma Studio
docker-compose exec backend npx prisma studio
```

Opens a web UI at http://localhost:5555 to view/edit your database.

### Run the Seed Again (if needed)

```bash
docker-compose exec backend npm run seed
```

Creates the Super Admin account (Phone: 9999999999, Password: admin).

### Connect to Docker PostgreSQL Directly

```bash
# Open PostgreSQL shell
docker-compose exec postgres psql -U postgres farmer_buyer_db

# Then you can run SQL commands
SELECT * FROM users;
```

---

## 📊 Current Database Status

### Docker PostgreSQL Contents:

| Table | Records |
|-------|---------|
| users | 1 (Super Admin) |
| All other tables | Empty |

**Login credentials:**
- Phone: `9999999999`
- Password: `admin`
- Role: ADMIN

---

## 💡 Recommendations

### For Development (Right Now)
**Use Option 1 (Docker PostgreSQL)** and seed with test data as needed.

### For Production Deployment
**Use Option 1** - Keep everything in Docker for portability.

### If You MUST Have Your Old Data
**Use Option 3** - Migrate data from local to Docker.

---

## 🆘 Troubleshooting

### "Can't connect to my local PostgreSQL anymore"

When Docker runs, it uses port 5432. To check if your local PostgreSQL is running:

```powershell
# Check if local PostgreSQL is running
Get-Service postgresql*

# Check what's using port 5432
netstat -ano | findstr :5432
```

You might need to:
1. Stop Docker: `docker-compose down`
2. Start local PostgreSQL
3. Or change Docker postgres port in `docker-compose.yml`:
   ```yaml
   postgres:
     ports:
       - "5433:5432"  # Use 5433 externally, 5432 inside container
   ```

### "I want to start fresh"

```bash
# Delete everything (including data)
docker-compose down -v

# Start fresh
docker-compose up -d

# Seed the database
docker-compose exec backend npm run seed
```

---

## 📚 Next Steps

1. **Decide which option** you want to use (Docker DB vs Local DB)
2. **If using Docker DB**: Decide if you need to migrate old data
3. **If yes, migrate**: Use one of the methods in Option 3
4. **If no**: Just use the seeded Super Admin account and create new data

**Your current setup is ready to use!** You can log in with the Super Admin credentials and start testing. 🚀
