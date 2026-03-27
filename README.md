# LocalServe

**Live:** [https://localservicebysam.vercel.app/](https://localservicebysam.vercel.app/)

A local services marketplace. Clients book workers for home/local services, workers manage their requests, admins oversee everything. Built with React + Express + MongoDB + Socket.io.

---

## Project Structure

```
/
├── client/          # React frontend (Vite)
└── server/          # Express backend
```

---

## Tech

**Backend**
- Node.js + Express 4.18
- MongoDB + Mongoose 8
- JWT auth (jsonwebtoken 9)
- Socket.io 4.8 — real-time notifications
- bcryptjs — password hashing
- express-validator — request validation
- nodemon (dev)

**Frontend**
- React 18 + Vite 5
- React Router v6
- Zustand — auth state
- Axios — HTTP client
- Socket.io-client 4.8
- Tailwind CSS 3.3
- lucide-react — icons
- react-hot-toast — toasts

---

## Setup

### Requirements
- Node.js 18+
- MongoDB (local or Atlas)

### Server

```bash
cd server
npm install
```

Copy and fill in `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/local_services_marketplace
JWT_SECRET=some_random_secret_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

```bash
npm run dev        # nodemon
npm start          # production
```

### Client

```bash
cd client
npm install
npm run dev        # http://localhost:3000
```

If your server runs on a different port, set `VITE_API_URL` in `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Seed admin account

```bash
cd server
node seed/createAdmin.js
```

Logs the credentials on success. Default: `admin@localserve.com` / `admin123` — change the password after first login.

---

## Roles

**client** — registers normally, books services, tracks/cancels bookings

**worker** — registers with `role: worker`, gets a WorkerProfile auto-created, manages their own services and incoming booking requests

**admin** — seeded manually, full read access to all users/bookings/services, can verify workers, suspend/delete users

---

## Auth

JWT stored in localStorage. Token sent as `Authorization: Bearer <token>` on every request. `protect` middleware validates it, `authorize(...roles)` checks role.

Registration blocks `admin` role — you can only become admin via the seed script or direct DB update.

---

## Real-time (Socket.io)

On login the client connects to the socket server and joins a room by user ID:

```js
socket.emit('join', userId)
```

Events:
- `new_booking` — emitted to the worker when a client books their service. Payload includes the full populated booking object so the worker's request list updates instantly without a refetch.
- `booking_status` — emitted to the client when a worker accepts/rejects/completes. Payload: `{ bookingId, status, message }`.

Both trigger a beep (Web Audio API oscillator) + dark toast popup on the receiving end.

---

## Booking flow

1. Client opens a service, clicks "Book This Service"
2. Fills in: date, time, address (with auto-detect via browser Geolocation + Nominatim reverse geocode), phone, issue description, optional notes
3. POST `/api/bookings` — creates booking, emits `new_booking` to worker via socket
4. Worker sees it instantly in Requests, clicks the card to open full details modal
5. Worker accepts/rejects → `booking_status` emitted to client → client's booking list updates live
6. Worker marks complete when done

---

## API Reference

All routes prefixed with `/api`.

### Auth

```
POST   /auth/register       body: { name, email, password, role?, location? }
POST   /auth/login          body: { email, password }
GET    /auth/me             protected
```

### Bookings

```
GET    /bookings            protected — returns own bookings (role-filtered)
GET    /bookings/:id        protected
POST   /bookings            client only — body: { serviceId, date, scheduledTime, address, phone, notes }
PUT    /bookings/:id/status worker only — body: { status: accepted|rejected|completed }
PUT    /bookings/:id/cancel client only
```

### Services

```
GET    /services            public — query: category, location, search, page, limit
GET    /services/:id        public
POST   /services            worker only
PUT    /services/:id        worker only (own)
DELETE /services/:id        worker only (own)
```

### Workers

```
GET    /workers/profile     worker only
PUT    /workers/profile     worker only — body: { skills, experience, bio, hourlyRate, location }
GET    /workers/:id         public — returns WorkerProfile populated with user info
```

### Admin

```
GET    /admin/stats         returns totals + booking breakdown by status + last 7 days daily counts
GET    /admin/users         query: role, page, limit
GET    /admin/users/:id     returns user + their last 20 bookings
DELETE /admin/users/:id     cannot delete admin accounts
PUT    /admin/users/:id/suspend    toggles isSuspended
PUT    /admin/workers/:id/verify   sets isVerified = true
GET    /admin/bookings      query: status, page, limit
DELETE /admin/services/:id
```

---

## Data Models

### User
```
name, email, password (hashed), role (client|worker|admin),
location, phone, isVerified, isSuspended, lastIp, lastLoginAt
```

### WorkerProfile
```
userId (ref User), skills[], experience, bio, hourlyRate, rating, ratingCount, location
```

### Service
```
workerId (ref User), title, description, category, price, location, isActive
```

### Booking
```
clientId, workerId, serviceId (all ref User/Service),
date, scheduledTime, address, phone, notes,
status (pending|accepted|rejected|completed|cancelled)
```

---

## Notes

- IP is captured on every login from `x-forwarded-for` or `req.socket.remoteAddress` and stored on the user document
- The Nominatim reverse geocode request requires a `User-Agent` header — it's set to `LocalServeApp/1.0`. Don't spam it.
- Socket rooms use MongoDB ObjectId strings as room names. Make sure the `join` event fires after connection — the client handles reconnects via the `connect` event listener.
- No file uploads. Worker profile photos aren't implemented.
- No email verification or password reset flow yet.
