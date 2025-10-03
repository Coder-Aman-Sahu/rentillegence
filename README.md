# 🏡 Rentillegence – AI-Powered Rental Housing Finder  

## 🌐 Live Demo  
The project is live at:  
- [https://rentillegence.onrender.com/listings](https://rentillegence.onrender.com/listings)  
- [https://rentillegence-t2yp.vercel.app/listings](https://rentillegence-t2yp.vercel.app/listings)  

---

## 🏗️ System Architecture  
<img width="1840" height="750" alt="Rentillegence System Architecture" src="https://github.com/user-attachments/assets/325c086b-3ac1-46eb-9ae9-aa440a74cdda" />

---

## 🚀 Tutorial – How to Use the App  

### 1️⃣ Sign Up  
Create a new account by signing up.  
<img width="1919" height="958" alt="Sign Up Page" src="https://github.com/user-attachments/assets/874f231d-005f-4914-a09c-f93d47dcafb6" />  

---

### 2️⃣ Login  
Login with your registered credentials.  
<img width="1919" height="959" alt="Login Page" src="https://github.com/user-attachments/assets/899e0ab3-71cb-48fa-835d-26851446caa5" />  

---

### 3️⃣ Add a New Listing  
Once logged in, you can add a new rental property listing.  
<img width="1919" height="956" alt="Add New Listing" src="https://github.com/user-attachments/assets/a29f69c4-1074-4828-89ef-2c5fd57442d1" />  

---

### 4️⃣ Edit Listing  
You can update or modify details of your existing listing.  
<img width="1919" height="960" alt="Edit Listing" src="https://github.com/user-attachments/assets/45281e32-a2a2-410c-b1b4-5d1e4f76c5b1" />  

---

### 5️⃣ Reviews by Other Users  
Other users can view your listing and leave reviews.  
<img width="1911" height="974" alt="Review on Listing" src="https://github.com/user-attachments/assets/19d08245-dd12-4045-abb6-ba9b55ea6eae" />  

---

## ✅ Features Covered  
- User authentication (Sign up & Login)  
- Add, edit, and delete rental listings  
- Review system for listings  
- Deployed on **Render** and **Vercel**  
- MongoDB Atlas for database  

---

## 🛠️ Tech Stack  
- **Frontend:** EJS, Bootstrap, CSS
- **Backend:** Node.js, Express  
- **Database:** MongoDB Atlas  
- **Deployment:** Render + Vercel  

---

💡 Explore, list, and review properties hassle-free with **Rentillegence**!



# Getting Started

Follow these steps to set up and run the project.

---

## 1. Database Setup

First, ensure your MongoDB server is running. Open your terminal and check the connection:

```bash
mongosh
If it fails, start the service and re-check:

bash 
services mongodb start
mongosh
2. Installation and Running
Clone the repository and install dependencies:

bash
git clone https://github.com/Coder-Aman-Sahu/rentillegence.git

cd rentillegence
npm install

Run the setup scripts for your models:

In bash

cd models
node listing.js
node review.js
node user.js

cd .. 

cd init
node index.js

Return to the root directory and start the application:

cd ..
nodemon app.js


🔹 Steps to sync local with remote after web changes:

Fetch latest changes from GitHub

git fetch origin


Pull the new commits into your local main

git pull origin main
