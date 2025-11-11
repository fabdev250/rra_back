# SmartTax Backend API

Backend server for the SmartTax RRA tax collection system.

## 🚀 Setup Instructions (After Cloning)

### 1. Install Dependencies
```bash
cd back
npm install
```

### 2. Create Environment File
Copy the example environment file and configure it:
```bash
# Copy the example file
cp .env.example .env

# Or on Windows:
copy .env.example .env
```

Then edit `.env` file with your database credentials:
```env
DB_NAME=smarttax
DB_USER=root
DB_PASS=your_mysql_password
DB_HOST=localhost
PORT=5000
```

### 3. Create MySQL Database
Open MySQL and create the database:
```sql
CREATE DATABASE smarttax;
```

### 4. Run Database Migrations
The database will auto-sync when you start the server for the first time.

### 5. Start the Server
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

## ✅ Verify Installation

Check if server is running:
```
http://localhost:5000/api/health
```

Check database connection:
```
http://localhost:5000/api/test-db
```

## 📦 What Gets Pushed to GitHub?

### ✅ Files that SHOULD be in Git:
- `package.json` - Dependencies list
- `package-lock.json` - **IMPORTANT: Locks exact versions**
- `.gitignore` - Tells git what to ignore
- `.env.example` - Example environment variables
- All `.js` files (routes, models, controllers, etc.)
- `README.md` - This file

### ❌ Files that should NOT be in Git (in `.gitignore`):
- `node_modules/` - **NEVER commit this!** (Install with `npm install`)
- `.env` - Contains sensitive data (passwords, secrets)
- `logs/` - Log files
- `.DS_Store` - Mac OS files

## 🔧 Common Errors After Cloning

### Error: "Cannot find module"
**Solution:** Run `npm install` to install dependencies

### Error: "ER_ACCESS_DENIED_ERROR"
**Solution:** Check your `.env` file has correct MySQL credentials

### Error: "Unknown database 'smarttax'"
**Solution:** Create the database in MySQL:
```sql
CREATE DATABASE smarttax;
```

### Error: "EADDRINUSE: Port 5000 already in use"
**Solution:** Change PORT in `.env` file or stop other process using port 5000

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_NAME` | MySQL database name | `smarttax` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASS` | MySQL password | (empty) |
| `DB_HOST` | MySQL host | `localhost` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |

## 🎯 Why `package-lock.json` is Important

**DO NOT delete or ignore `package-lock.json`!**

This file:
- ✅ Locks exact dependency versions
- ✅ Ensures everyone has the same versions
- ✅ Prevents "works on my machine" issues
- ✅ Makes builds reproducible

## 🔄 Proper Workflow

### When You Clone the Repo:
```bash
# 1. Clone the repository
git clone <your-repo-url>
cd rra/back

# 2. Install dependencies
npm install

# 3. Create .env file
copy .env.example .env

# 4. Edit .env with your database credentials
# (Use your text editor)

# 5. Create database
# (In MySQL: CREATE DATABASE smarttax;)

# 6. Start server
npm start
```

### When You Make Changes:
```bash
# Stage your changes (don't add node_modules or .env!)
git add .

# Commit
git commit -m "Your message"

# Push
git push origin main
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register trader

### Traders
- `GET /api/traders` - Get all traders
- `GET /api/traders/:id` - Get trader by ID
- `PUT /api/traders/:id` - Update trader

### Transactions
- `POST /api/transactions/pay` - Process payment
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get transaction by ID

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - Get all users

## 🛠️ Scripts

```bash
npm start          # Start server
npm run dev        # Start with nodemon (auto-reload)
npm test           # Run tests
```

## 📚 Tech Stack

- **Framework:** Express.js
- **Database:** MySQL with Sequelize ORM
- **Authentication:** JWT tokens
- **Validation:** express-validator
- **Security:** bcrypt, helmet, cors
- **Rate Limiting:** express-rate-limit

## 👥 Default Users

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

**Sample Trader:**
- Phone: `250788123456`
- PIN: `1234`

## 🆘 Getting Help

If you encounter issues:
1. Check this README
2. Verify `.env` file exists and is configured
3. Ensure MySQL is running
4. Check `node_modules/` exists (run `npm install` if not)
5. Check console errors for specific issues

## 🔒 Security Notes

**NEVER commit:**
- `.env` file (contains passwords)
- `node_modules/` folder (too large, unnecessary)
- Any file with sensitive data

**ALWAYS:**
- Use `.env.example` to show what variables are needed
- Keep `.gitignore` updated
- Use strong passwords in production
- Change default JWT_SECRET before deploying
