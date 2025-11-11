# 🚀 QUICK SETUP GUIDE (After Cloning from GitHub)

## ⚡ Super Fast Setup (5 Minutes)

### Step 1: Install Dependencies
```bash
npm install
```
**What this does:** Downloads all packages listed in `package.json`

---

### Step 2: Create Environment File
```bash
# Windows:
copy .env.example .env

# Mac/Linux:
cp .env.example .env
```
**What this does:** Creates your local configuration file

---

### Step 3: Edit `.env` File

Open `.env` with any text editor and change these values:

```env
DB_NAME=smarttax
DB_USER=root
DB_PASS=YOUR_MYSQL_PASSWORD_HERE    ← CHANGE THIS!
DB_HOST=localhost
PORT=5000
```

**Replace `YOUR_MYSQL_PASSWORD_HERE` with your actual MySQL password!**

---

### Step 4: Create Database

Open MySQL and run:
```sql
CREATE DATABASE smarttax;
```

**Or use command line:**
```bash
mysql -u root -p
# Enter password
CREATE DATABASE smarttax;
exit;
```

---

### Step 5: Start Server
```bash
npm start
```

**You should see:**
```
✅ Database synced successfully
🚀 SmartTax Server running on port 5000
```

---

## ✅ Verify It's Working

Open browser and check:
- http://localhost:5000/api/health
- http://localhost:5000/api/test-db

**If you see JSON responses, it's working! 🎉**

---

## ❌ Common Errors & Quick Fixes

### Error: "Cannot find module"
```bash
# Fix:
npm install
```

### Error: "ER_ACCESS_DENIED_ERROR"
```bash
# Fix:
# Edit .env file with correct MySQL password
```

### Error: "Unknown database 'smarttax'"
```bash
# Fix:
mysql -u root -p
CREATE DATABASE smarttax;
exit;
```

### Error: "Port 5000 already in use"
```bash
# Fix:
# Change PORT in .env to 5001 or another port
```

---

## 📁 What You Should See After Setup

```
back/
├── node_modules/     ← Installed by npm install
├── .env              ← YOU created this
├── .env.example      ← Template (in GitHub)
├── package.json      ← From GitHub
├── package-lock.json ← From GitHub
├── server.js         ← From GitHub
└── ... other files
```

---

## 🎯 Default Login Credentials

After first run, these users are auto-created:

**Super Admin:**
- Email: `superadmin@smarttax.gov.rw`
- Password: `admin123`

**RRA Admin:**
- Email: `rraadmin@rra.gov.rw`
- Password: `rra123`

**Local Admin:**
- Email: `localadmin@kigali.gov.rw`
- Password: `local123`

**Agent:**
- Email: `agent@nyamirambo.gov.rw`
- Password: `agent123`

---

## 🔄 Daily Workflow

**Starting the server:**
```bash
npm start
```

**Stopping the server:**
```
Ctrl + C
```

**Running with auto-reload (development):**
```bash
npm run dev
```

---

## 💡 Pro Tips

1. ✅ **Never commit `.env`** - It has your passwords!
2. ✅ **Always run `npm install`** after pulling new changes
3. ✅ Keep MySQL running before starting the server
4. ✅ Use `npm run dev` during development for auto-reload

---

**That's it! You're ready to code! 🚀**
