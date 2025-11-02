const Listing = require("../models/listing");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

// --- Config ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const EMBEDDING_MODEL = "text-embedding-004";
const PARSING_MODEL = "gemini-1.5-flash-latest";
const mapToken = process.env.MAP_TOKEN;
// ---

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

async function parseSearchQuery(query) {
  const parsingModel = genAI.getGenerativeModel({ 
    model: PARSING_MODEL,
    generationConfig: { responseMimeType: "application/json" }
  });
  const prompt = `Parse the following user query for a rental listing search. Extract: "semantic_query", "location_name", "amenity", "max_price" (number), "min_price" (number), "country". Query: "${query}". Respond with only the JSON object.`;
  try {
    const result = await parsingModel.generateContent(prompt);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (e) {
    console.error("Error parsing query:", e);
    return { semantic_query: query }; // Fallback
  }
}

async function getEmbedding(text) {
  if (!text) return null;
  const embeddingModel = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  try {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (e) {
    console.error("Error getting embedding:", e);
    return null;
  }
}

async function getCoordinates(locationName) {
  if (!locationName) return null;
  try {
    let response = await geocodingClient.forwardGeocode({ query: locationName, limit: 1 }).send();
    if (response && response.body.features.length) {
      return response.body.features[0].geometry.coordinates; // [lng, lat]
    }
    return null;
  } catch(e) {
    console.error("Error geocoding:", e);
    return null;
  }
}

module.exports.searchListings = async (req, res) => {
  const { q } = req.query;
  console.log("----------------AI SEARCH----------------");
  console.log("Raw Query:", q);

  if (!q) return res.status(400).json({ message: "Query 'q' is required." });

  const parsedQuery = await parseSearchQuery(q);
  console.log("Parsed Query:", JSON.stringify(parsedQuery, null, 2));

  let pipeline = [];
  
  const queryVector = await getEmbedding(parsedQuery.semantic_query);
  console.log("Query Vector (first 5 dims):", queryVector ? queryVector.slice(0, 5) : "No vector");
  
  if (queryVector) {
    pipeline.push({
      $vectorSearch: {
        index: "default", 
        path: "description_embedding",
        queryVector: queryVector,
        numCandidates: 100,
        limit: 50,
        type: "knnVector" 
      }
    });
  }

  const locationCoords = await getCoordinates(parsedQuery.location_name);
  console.log("Location Coords:", locationCoords);
  
  if (locationCoords) {
    pipeline.push({
      $geoNear: {
         near: { type: "Point", coordinates: locationCoords },
         distanceField: "dist.calculated",
         maxDistance: 50000, // 50km radius
         spherical: true
      }
    });
  }

  let matchStage = {};
  if (parsedQuery.min_price) matchStage.price = { ...matchStage.price, $gte: parsedQuery.min_price };
  if (parsedQuery.max_price) matchStage.price = { ...matchStage.price, $lte: parsedQuery.max_price };
  if (parsedQuery.country) matchStage.country = { $regex: new RegExp(parsedQuery.country, 'i') };
  
  if (Object.keys(matchStage).length > 0) {
    pipeline.push({ $match: matchStage });
  }

  console.log("Mongo Pipeline:", JSON.stringify(pipeline, null, 2));

  let listings;
  if (pipeline.length === 0 && Object.keys(matchStage).length === 0) {
    // Fallback if AI parsing fails and there's no vector
    listings = await Listing.find({ 
      $or: [
        { title: { $regex: new RegExp(q, 'i') } },
        { description: { $regex: new RegExp(q, 'i') } }
      ]
    }).limit(50);
  } else {
    pipeline.push({ $limit: 12 }); // Limits to the top 12 results
    
    pipeline.push({ $project: { title: 1, price: 1, location: 1, country: 1, image: 1, _id: 1, description: 1 } });
    listings = await Listing.aggregate(pipeline);
  }

  console.log("Listings Found:", listings.length);
  res.json(listings);
};