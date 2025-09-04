const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing = require("./models/listing.js");
const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() =>{
    console.log("Connected to DB");
  })
  .catch((err) =>{
    console.log(err);
  });
async function main(){
    await mongoose.connect(MONGO_URL);
}

app.get("/",(req,res)=>{
    res.send("Hello World");
})

app.get("/testListing",async (req,res)=>{
    let sampleListing=new Listing({
        title:"My New Villa",
        description:"By the Beach",
        price:1200,
        location:"Calangute, Goa",
        country:"India",
    });

    await sampleListing.save();
    console.log("sample was saved");
    res.send("successful testing");
});
app.listen(8080,() =>{
    console.log("server is listening to port 8080");
})