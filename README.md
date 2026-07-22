# Andaaz — Luxury Watch Store 🕐

A full-stack e-commerce platform for luxury timepieces, built with React + Node.js + Supabase.

## 🚀 Live Demo
- **Frontend:** [andaaz.vercel.app](https://andaaz.vercel.app)
- **Backend:** [andaaz-api.railway.app](https://andaaz-api.railway.app)

---

## ✨ Features

### Storefront
- Animated hero section with product picker and background media
- Shop page with filters, search, price range, category, sort
- Product detail with image gallery, video support, reviews
- Guest checkout — no account required
- Cart with dynamic shipping threshold
- Wishlist
- WhatsApp order option on every product
- Mobile-first responsive design

### Admin Panel (`/admin`)
- **Dashboard** — total, pending, delivered, cancelled orders + revenue
- **Products** — CRUD, image/video upload, active toggle, warranty/return per product
- **Orders** — status flow, confirm delivery (finalises revenue), manual orders (WhatsApp/Instagram), print receipt, delete
- **Reviews** — feature on homepage, add manual reviews (WhatsApp/Instagram customers)
- **Hero Editor** — product picker, image selector, size/position/opacity/height controls
- **Discounts** — % or fixed per product
- **Settings** — delivery charge, free threshold, return days, warranty months
- **Inventory** — stock levels, adjustments, transaction log
- **Suppliers + Purchase Orders**
- **Accounting** — P&L, General Ledger, Balance Sheet

### Key Business Logic
- Revenue only added on **Confirm Delivered** (not on order placement)
- **Confirm Cancelled** restores stock with no revenue impact
- If cancelled after delivery, shipping cost logged as delivery loss
- Orders can only be deleted after confirmation

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4, Framer Motion |
| Backend | Node.js, Express, express-async-handler |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + custom JWT middleware |
| Images/Video | Cloudinary |
| Currency | PKR (Pakistani Rupee) |

---

## 📁 Project Structure

```
behreadab-store/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── components/    # Navbar, Hero, Footer, ProductCard...
│   │   ├── pages/         # Home, Shop, ProductDetail, Checkout...
│   │   │   └── admin/     # Dashboard, AdminOrders, AdminHero...
│   │   ├── context/       # Auth, Cart, Wishlist
│   │   ├── hooks/         # useAuth, useCart, useSettings...
│   │   └── services/      # api.js (all API calls)
│   └── .env
└── backend/           # Node.js + Express API
    ├── controllers/   # Business logic
    ├── routes/        # API routes
    ├── middleware/    # Auth, error handler
    ├── config/        # Supabase, Cloudinary
    └── sql/           # Database migrations
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- Supabase account
- Cloudinary account (optional — for image uploads)

### Backend

```bash
cd backend
cp .env.example .env
# Fill in your credentials in .env
npm install --legacy-peer-deps
npm run dev
# Runs on http://localhost:5000
```

**Backend `.env`:**
```
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your_project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev -- --host
# Runs on http://localhost:5173
```

**Frontend `.env`:**
```
VITE_API_URL=http://localhost:5000/api
```

> For mobile testing on the same network, use your PC's local IP:
> `VITE_API_URL=http://192.168.x.x:5000/api`

### Database

Run the SQL files in Supabase SQL Editor in this order:

1. `backend/sql/additions.sql` — creates tables and columns
2. `backend/sql/hero_fix.sql` — hero config columns + default row

Then set up your admin user:
1. Register an account on the site
2. Go to Supabase Table Editor → `users` table
3. Find your user and change `role` to `admin`

---

## 🌐 Deployment

### Backend — Railway

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repo → choose the `backend` folder as root
3. Add environment variables (same as `.env`)
4. Railway auto-detects Node.js and deploys
5. Copy the generated URL (e.g. `https://andaaz-api.railway.app`)

### Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select your repo
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```
5. Deploy

---

## 📱 Social & Contact

- **WhatsApp:** +92 314 6063795
- **Instagram:** [@andaaz.ba](https://www.instagram.com/andaaz.ba)
- **Facebook:** [Andaaz](https://www.facebook.com/profile.php?id=61590810473613)

---

## 🔐 Admin Access

Navigate to `/admin/dashboard` — only users with `role: admin` in the database can access it.

---

## 📄 License

Private project — all rights reserved.
