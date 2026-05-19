# KeeBo Backend 🚀

The high-performance, realtime backend for the KeeBo hyperlocal services marketplace.

## Features
- 🔐 **Secure Auth**: JWT-based authentication with role-based access control (User, Technician, Admin).
- 📅 **Booking System**: Complete state-managed booking lifecycle (Request -> Accept -> Complete).
- 🔔 **Realtime Notifications**: Instant updates via Socket.IO for new bookings and status changes.
- ⭐ **Advanced Review System**: Automated average rating recalculation and review management.
- 🖼️ **Media Handling**: Profile and work image uploads integrated with Cloudinary.
- 📡 **Search & Filter**: Find technicians by category, price, and rating.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Realtime**: Socket.IO
- **Storage**: Cloudinary
- **Security**: JWT, Bcrypt, Role Middleware

## Project Structure
```
KeeBo backend/
├── config/       # Configuration (DB, Cloudinary)
├── controllers/  # Request handlers
├── middleware/   # Auth, roles, errors, uploads
├── models/       # Database schemas
├── routes/       # API endpoints
├── services/     # Business logic (Booking service)
├── utils/        # Helpers (Token, ErrorResponse)
├── validators/   # Input validation logic
├── app.js        # Express configuration
├── server.js     # Server entry point & Socket init
├── render.yaml   # Render deployment blueprint template
└── RENDER_DEPLOYMENT.md # Render deployment guide
```

## Getting Started

### 1. Installation
Navigate to your backend folder and install the required dependencies:
```bash
cd "KeeBo backend"
npm install
```

This installs all core ecosystem dependencies defined in `package.json`:
* `express` - Web framework core
* `socket.io` - Realtime bi-directional messaging
* `mongoose` - MongoDB Object Modeling
* `cloudinary` & `multer` - Media file uploads
* `bcryptjs` & `jsonwebtoken` - Security and authentication
* `nodemailer` & `resend` - Email notifications
* `twilio` - SMS validation
* `dotenv` - Environment configurations

### 2. Environment Setup
Create a `.env` file in the root of the `KeeBo backend` folder:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d

CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
ADMIN_EMAIL=your_admin_email@gmail.com
```

### 3. Run Server Locally
To start the developer live-reload server:
```bash
npm run dev
```

For production mode:
```bash
npm start
```

---

## 🚀 Render Cloud Deployment

The repository comes pre-equipped for instant deployment to **Render**:

### 1. Blueprint Deployment
1. Connect your GitHub repository to **Render**.
2. Create a new **Blueprint** from your dashboard.
3. Render will automatically read the `render.yaml` blueprint configuration, setup the service settings, and request your environment variables.

### 2. Subdirectory Settings (Monorepos)
Since the folder is named `KeeBo backend`, if your repository contains both frontend and backend subdirectories, make sure to set the **Root Directory** field in Render to:
`KeeBo backend`

### 3. Health & Verification Check
You can check if the live server is active by hitting the newly integrated health API:
```
https://your-service-name.onrender.com/api/health
```

---

## Documentation
- [API Documentation](API_DOCUMENTATION.md)
- [Booking Flow](BOOKING_FLOW.md)
- [Socket Flow](SOCKET_FLOW.md)
- [Architecture](ARCHITECTURE.md)
- [Render Deployment Guide](RENDER_DEPLOYMENT.md)
