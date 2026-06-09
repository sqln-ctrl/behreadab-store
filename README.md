# WatchStore — behreadab-store

A full-stack e-commerce store for luxury watches.

## Stack
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express
- **Database**: MongoDB (Atlas)
- **Images**: Cloudinary
- **Auth**: JWT

## Setup

### Backend
```bash
cd backend
cp .env.example .env   # fill in your values
npm install
npm run dev            # runs on http://localhost:5000
```

### Seed the database
```bash
cd backend
node seeder.js
# Admin: admin@watchstore.com | Password: admin123
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev            # runs on http://localhost:5173
```

## API Routes
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | — | Register |
| POST | /api/auth/login | — | Login |
| GET | /api/auth/me | User | Get profile |
| GET | /api/products | — | All products |
| GET | /api/products/:id | — | Single product |
| POST | /api/products | Admin | Create product |
| PUT | /api/products/:id | Admin | Update product |
| DELETE | /api/products/:id | Admin | Delete product |
| POST | /api/orders | User | Place order |
| GET | /api/orders/my | User | My orders |
| GET | /api/orders | Admin | All orders |
| PUT | /api/orders/:id/status | Admin | Update status |
| GET | /api/admin/stats | Admin | Dashboard stats |
| GET | /api/admin/hero | — | Hero config |
| PUT | /api/admin/hero | Admin | Update hero |
