# Frontend for FastAPI Project

This folder contains a simple React application built with Vite that consumes the FastAPI backend located in the `backend/` directory.

## Prerequisites

- Node.js 18+ (or latest LTS)
- npm or yarn
- The backend server running locally (default `http://localhost:8000`).

## Setup

1. Change into the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   # or yarn
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

The Vite configuration proxies `/api` requests to the backend at port 8000, so calls to the FastAPI endpoints like `/api/v1/products` will work out of the box.

## Features

- **Authentication**: register and login with JWT tokens
- **Product catalog**: list and view product details
- **Place orders**: authenticated users can create orders
- **User profile**: view and update your profile, see order history
- **Routing**: React Router handles navigation

## Notes

- The frontend stores the access token in `localStorage` and sets the `Authorization` header automatically.
- CORS settings on the backend already allow `http://localhost:3000`.

You can customize the UI or add new pages/components as needed.
