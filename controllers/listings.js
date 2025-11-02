const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- Config ---
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 
const EMBEDDING_MODEL = "text-embedding-004"; 
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY); 
// ---

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


module.exports.index = async (req, res) => {
    const { q } = req.query; // Get the search query from the URL
    
    let allListings;
    
    if (q) {
        // If 'q' exists (from navbar search), perform a simple regex search
        const regex = new RegExp(q, 'i'); // Case-insensitive
        allListings = await Listing.find({
            $or: [
                { title: { $regex: regex } },     // Search in title
                { location: { $regex: regex } }  // Search in location
            ]
        });
        // Note: This will render the index page with *only* the search results
    } else {
        // If no 'q', load all listings as normal
        allListings = await Listing.find({});
    }
    
    res.render("listings/index.ejs", { allListings });
};

module.exports.showMap = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/mapview.ejs", { allListings });
};

module.exports.renderNewForm=(req,res)=>{ 
    res.render("listings/new.ejs");
};

module.exports.showListing=async(req,res)=>{
    // ... (This function remains unchanged)
    let {id}=req.params;
    const listing = await Listing.findById(id).
    populate({path:"reviews",
        populate:{path:"author"}
        }).
    populate("owner");
    if(!listing){
        req.flash("error","Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
};

module.exports.createListing=async (req,res,next)=>{
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit:1
    }).send();

    let url=req.file.path;
    let filename=req.file.filename;
    const newListing = new Listing(req.body.listing);
    
    newListing.image={url,filename};
    newListing.owner=req.user._id;
    newListing.geometry=response.body.features[0].geometry;

    
    // Generate embedding for the new listing
    const textToEmbed = `${newListing.title}: ${newListing.description}. Location: ${newListing.location}, ${newListing.country}`;
    newListing.description_embedding = await getEmbedding(textToEmbed);
   

    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm= async(req,res)=>{
    // ... (This function remains unchanged)
    let {id}=req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};

module.exports.updateListing = async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);

    // Update standard fields
    listing.set({ ...req.body.listing });

    // Regenerate embedding if details changed
    const textToEmbed = `${listing.title}: ${listing.description}. Location: ${listing.location}, ${listing.country}`;
    listing.description_embedding = await getEmbedding(textToEmbed);

     
    if(typeof req.file !== "undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
    }
    
    await listing.save(); // Save all changes
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing=async(req,res)=>{
    // ... (This function remains unchanged)
    let {id}=req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};