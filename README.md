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
