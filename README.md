# Getting Started

Follow these steps to set up and run the project.

---

## 1. Database Setup

First, ensure your MongoDB server is running. Open your terminal and check the connection:

```bash
mongosh
If it fails, start the service and re-check:

bash
Copy code
services mongodb start
mongosh
2. Installation and Running
Clone the repository and install dependencies:

bash
Copy code
git clone https://github.com/Coder-Aman-Sahu/rentillegence.git
cd rentillegence
npm install
Run the setup scripts for your models:

bash
Copy code
cd models
node listing.js
node review.js
Return to the root directory and start the application:

bash
Copy code
cd ..
nodemon app.js




Ask ChatGPT
