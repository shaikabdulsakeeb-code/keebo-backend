# 🚀 Deploying KeeBo Backend to Render

This comprehensive guide walks you through deploying your KeeBo backend server to **Render**. We have already updated the server to support Render out-of-the-box (including automatic port binding, a dedicated API health-check endpoint, and a customizable Render blueprint `render.yaml` template).

---

## 📁 Critical: Folder Name Changes (Subdirectories)

Since you changed your folder name (e.g., to `KeeBo backend`), your deployment process will depend on how your GitHub repository is structured:

### Scenario A: Monorepo (One Repo with Frontend & Backend Folders)
If your GitHub repository contains both folders side-by-side:
```
my-keebo-repo/
├── frontend/
└── KeeBo backend/   <-- Your backend folder
```
You **MUST** specify the backend subdirectory in Render so it knows where to find `package.json` and start the server:
1. In the **Render Dashboard**, when creating your Web Service, look for the **Root Directory** field.
2. Enter the exact name of your backend folder: **`KeeBo backend`**.
3. Render will now correctly change into that directory before installing dependencies and starting the application!

### Scenario B: Separate Repositories
If your backend is pushed to its own dedicated GitHub repository:
* You **do not** need to specify a Root Directory. Leave the **Root Directory** field empty.

---

## 🛠️ What We Prepared For You

To ensure a seamless, error-free deployment on Render, we made the following updates to your backend:

1. **🏥 Health Check & Root Landing Endpoints**
   We added standard endpoints in [app.js](app.js) to ensure Render's deployment check successfully receives a `200 OK` status when starting:
   * **`GET /`** — Welcome gateway.
   * **`GET /api/health`** — Full JSON response verifying database connectivity, node environment, and server health.

2. **⚙️ Blueprint Infrastructure as Code (`render.yaml`)**
   We generated a professional [render.yaml](render.yaml) file in the root of your backend folder. This allows you to deploy the entire stack using Render's Blueprint feature, pre-filling all necessary configuration fields automatically.

3. **📡 Smart Port & CORS Binding**
   Your server in [server.js](server.js) is already pre-configured to bind dynamically to `process.env.PORT` (which Render allocates on startup) and includes full permissive CORS handling to seamlessly receive requests from your hosted frontend.

---

## ⚡ Option 1: Quick Deployment using `render.yaml` (Recommended)

Render Blueprints allow you to instantly deploy services with pre-configured settings:

1. Push your latest code changes (including the new `render.yaml` and `app.js` updates) to your GitHub repository.
2. Go to the **[Render Dashboard](https://dashboard.render.com)**.
3. Click **New +** in the top-right corner and select **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically read the `render.yaml` configuration!
6. It will prompt you to enter the environment variables (like your `MONGO_URI` and `CLOUDINARY_API_KEY`).
7. Click **Apply** to start your automated build and deployment.

---

## 📝 Option 2: Manual Web Service Deployment

If you prefer to configure the service manually on the Render dashboard:

1. Log in to **Render** and click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the following settings:
   * **Name**: `keebo-backend`
   * **Language**: `Node`
   * **Root Directory**: `KeeBo backend` *(only if using the monorepo setup!)*
   * **Build Command**: `npm install`
   * **Start Command**: `node server.js`
4. Expand the **Advanced** section and click **Add Environment Variable** to add the required environment configurations listed below.

---

## 🔑 Required Environment Variables

Ensure the following variables are configured in the **Environment** tab on Render (do not commit your actual credentials to GitHub):

| Variable Name | Description | Example / Action |
|---|---|---|
| `NODE_ENV` | Sets the application mode | `production` |
| `PORT` | The port Render listens on | `5000` (Render binds this dynamically) |
| `MONGO_URI` | Your MongoDB Connection String | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT signing | *Click "Generate" or type a strong secret* |
| `JWT_EXPIRES_IN` | JWT validity duration | `30d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Storage Account Name | *From your Cloudinary Dashboard* |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | *From your Cloudinary Dashboard* |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | *From your Cloudinary Dashboard* |
| `EMAIL_USER` | Email address for SMTP mailer | `keebo.platform@gmail.com` |
| `EMAIL_PASS` | App password generated from Gmail | `wmfc vvpp edxt hrev` (Gmail App Pass) |
| `ADMIN_EMAIL` | Target email for admin notification | `keebo.platform@gmail.com` |

---

## 🟢 Post-Deployment Verification

Once Render displays **`Deploy Live ✅`**, you can verify that the server is active by navigating to:
```
https://your-service-name.onrender.com/api/health
```
You should see a clean response confirming that the KeeBo API is fully running!
