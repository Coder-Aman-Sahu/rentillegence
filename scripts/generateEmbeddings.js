require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- Config ---
const MONGO_URL = process.env.ATLASDB_URL; // Your Atlas DB URL
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Your new Gemini API key
const EMBEDDING_MODEL = "text-embedding-004"; // Google's new embedding model
// ---

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to DB");

  const embeddingModel = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  
  const listings = await Listing.find({ description_embedding: { $exists: false } });
  console.log(`Found ${listings.length} listings to update.`);

  for (let listing of listings) {
    try {
      const textToEmbed = `${listing.title}: ${listing.description}`;
      const result = await embeddingModel.embedContent(textToEmbed);
      const embedding = result.embedding.values;
      
      listing.description_embedding = embedding;
      await listing.save();
      console.log(`Updated embedding for: ${listing.title}`);
    
    } catch (e) {
      console.error(`Failed to update ${listing.title}:`, e.message);
    }
  }

  console.log("All listings updated.");
  await mongoose.disconnect();
}

main().catch(console.error);