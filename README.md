# 🏡 Rentillegence  
**Find Your Home, Intelligently.**

Rentillegence is a full-stack rental housing platform that transforms the way people search for homes in India.  
Instead of forcing users into rigid filters, Rentillegence uses **Generative AI (Google Gemini)** and **Vector Embeddings** to understand natural language queries and match listings semantically.  
It also automates the entire rental agreement workflow from request → approval → PDF generation.

---

## ✨ Key Features

### 🧠 AI-Powered Search
- **Natural Language Search:** Query like “A quiet 2BHK near Hitec City under 30k”.
- **Intent Parsing:** Powered by **Gemini 1.5 Flash** to extract location, budget, amenities & preferences.
- **Vector Search:** Uses **text-embedding-004** to match listings by meaning, not keywords.

---

### 🗺️ Interactive Mapping
- **Cluster Map Visualization** using **Mapbox GL**.  
- **Nearby Amenities:** Auto-calculates distances to the nearest:
  - Hospitals  
  - Metro stations  
  - Schools  
  - Railway Stations  

---

### 📝 Digital Leasing Flow
- **End-to-End Booking:** Renter Request → Owner Approval → Agreement.
- **PDF Rental Agreement:** Auto-generated with renter + owner + property details.
- **E-Signature Simulation:** Digital signing workflow for both parties.
- **Payment Simulation:** Dummy secure payment flow for deposit + platform fee.

---

### 🔐 Secure & Robust Architecture
<img width="1859" height="1717" alt="rentillegence-system-diagram" src="https://github.com/user-attachments/assets/015580c6-ce64-4987-b2ea-e4713b4476ac" />

- **Authentication:** Passport.js (Local + Google OAuth).  
- **Cloud Storage:** Cloudinary for optimized image upload.  
- **Strong MVC Structure:** Built with Express.js following clean separation.  

---

## 🛠️ Tech Stack

| Component       | Technology |
|----------------|------------|
| **Frontend**   | EJS, Bootstrap 5, CSS3, JavaScript |
| **Backend**    | Node.js, Express.js |
| **Database**   | MongoDB Atlas (Mongoose) |
| **AI & LLM**   | Google Gemini (1.5-flash, text-embedding-004) |
| **Maps**       | Mapbox SDK + Geocoding API |
| **Storage**    | Cloudinary |
| **Auth**       | Passport.js (Local + Google Strategy) |
| **Utilities**  | PDFKit, Joi, Multer |

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v18+)
- MongoDB Atlas Account
- Cloudinary Account
- Mapbox Account
- Google Cloud / Gemini API Key

---

### **1. Clone the Repository**
```bash
git clone https://github.com/coder-aman-sahu/rentillegence.git
cd rentillegence

### **2. Install Dependencies**
```bash
npm install

###**3. Environment Configuration**
Create a .env file in the root directory and add the following keys:
```bash
# Database
ATLASDB_URL=your_mongodb_atlas_connection_string

# Session Secret
SECRET=your_session_secret_phrase

# Image Storage (Cloudinary)
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

# Maps (Mapbox)
MAP_TOKEN=your_mapbox_public_token

# AI (Google Gemini)
GEMINI_API_KEY=your_gemini_api_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

###**4. Database Initialization**
Seed the database with sample listings and generate their AI embeddings.
```bash
# Seed listings
node init/index.js

# Generate AI embeddings
node scripts/generateEmbeddings.js

###**5. Run the Server**
```bash
node app.js
# or if you have nodemon installed
nodemon app.js

Visit → http://localhost:8080

📖 Usage Guide
1. Sign Up / Login
Create an account using email or sign in quickly with Google OAuth.

2. Explore Homes
Standard Search: Use filters to find properties by price or location.

AI Search: Use natural language to describe what you want (e.g., "Modern apartment with a gym").

Map View: Explore properties geographically on the interactive map.

3. List a Property
Go to "Add New Listing".

Upload images and add property details.

The system will auto-geocode the address for map placement.

4. Book a Home
Click Rent Now on a listing.

Track your request status in My Dashboard.

After Approval: Generate and view the rental agreement.

Sign & Pay: Digitally sign the agreement and complete the payment simulation to get "Booking Confirmed".

📂 Project Structure
Plaintext

rentillegence/
├── controllers/      # Listing, User, Booking, AI search logic
├── init/             # DB seeding scripts
├── models/           # Mongoose Schemas
├── public/           # Static assets (CSS, JS, Images)
├── routes/           # Express routes
├── scripts/          # Embedding generator scripts
├── utils/            # Error handlers, async wrappers
├── views/            # EJS templates
│   ├── includes/     # Navbar, Footer, Flash
│   ├── layouts/      # Main layouts
│   ├── listings/     # Listing-related pages
│   └── users/        # Auth + Dashboard
├── app.js            # App entry point
└── package.json
🤝 Contributing
Contributions are welcome! Please follow these steps:

Fork the repository.

Create your feature branch:

```bash

git checkout -b feature/AmazingFeature

Commit your changes:

B```bash

git commit -m "Add AmazingFeature"

Push to the branch:

```bash

git push origin feature/AmazingFeature

Open a Pull Request.

📞 Contact
Aman Sahu GitHub: coder-aman-sahu

Note: This project is for educational purposes. The payment gateway and e-signatures are simulations.

