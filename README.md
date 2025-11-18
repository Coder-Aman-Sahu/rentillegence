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
