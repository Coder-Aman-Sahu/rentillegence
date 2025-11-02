const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const searchController = require('../controllers/search.js');

// API route for AI search
router.get("/", wrapAsync(searchController.searchListings));

module.exports = router;