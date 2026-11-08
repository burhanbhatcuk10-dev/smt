# SM Technologies website

React storefront + Express API + admin panel for laptop and computer sales (new and refurbished).
Database: **Neon (Postgres)**. Product photos: **Cloudinary**. Hosting: **Render**.

## Features
- Product listing with price, discount, condition grade (New / Grade A / B / C), specs, inspector's notes, warranty, photos
- Search, category, condition and price sorting
- Customer reviews (moderated: they appear after you approve them in the admin panel)
- WhatsApp enquiry buttons with the product pre-filled, click-to-call, Google Maps link
- Admin panel at `/admin`: add/edit/delete products with photo upload, mark sold out, approve/hide/delete reviews, edit shop details, add social media links (shown in the footer)

## 1. Set up Neon (database)
1. Create a free project at https://neon.tech.
2. On the project dashboard click **Connect** and copy the connection string (it starts with `postgresql://`). This is your `DATABASE_URL`.
3. Nothing else to do: the app creates its own tables and adds 4 sample products on first start.

## 2. Set up Cloudinary (images)
1. Create a free account at https://cloudinary.com.
2. On the dashboard (Settings > API Keys) copy the **Cloud name**, **API Key** and **API Secret**.
3. Uploads go to a folder called `sm-technologies` and are served in an optimised format automatically.

## 3. Deploy on Render
1. Push this folder to a GitHub repository.
2. In Render choose **New > Blueprint** and select the repo (it reads `render.yaml`). It will ask for these values:
   - `ADMIN_PASSWORD` (your admin login password)
   - `DATABASE_URL` (from Neon)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (from Cloudinary)
3. Or create a **Web Service** manually: Build command `npm install && npm run build`, Start command `npm start`, and add the same environment variables.

Because data and photos live in Neon and Cloudinary, nothing is lost when Render restarts or redeploys, so the free Render plan works. (Free Render services sleep after inactivity, so the first visit after a quiet period can take a few seconds.)

## Run locally
```
npm install
npm run build
DATABASE_URL="postgresql://..." CLOUDINARY_CLOUD_NAME=... CLOUDINARY_API_KEY=... CLOUDINARY_API_SECRET=... ADMIN_PASSWORD=choose-a-password npm start
```
Open http://localhost:3000 and http://localhost:3000/admin.
For development with hot reload use `npm run dev` (site on http://localhost:5173).

## First steps after going live
1. Log in at `/admin`, delete the 4 sample products and add yours.
2. Go to Settings & Socials, check the phone, WhatsApp, address, opening hours, and add your social links.
3. The logo is `public/logo.svg`. To use your exact logo, replace that file with your own (keep the name `logo.svg`).
