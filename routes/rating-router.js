var express = require('express');
const { Rating } = require('../models');
var router = express.Router();

//Retrieves a list of all ratings
router.get("/", async (req, res) =>{
    try {
        const ratings = await Rating.findAll();  // Retrieve all ratings from the 'ratings' table
        res.status(200).json(ratings);  // Send the ratings data as JSON response
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

//Retrieves all ratings for a specific book.
router.get("/book/:bookId", async (req, res) =>{
});

//Allows users to submit a rating for a book.
router.post("/", async (req, res) =>{
});

//Allows users to update their existing rating for a book.
router.put("/:ratingId", async (req, res) =>{
});

//Allows users to delete their existing rating for a book.
router.delete("/:ratingId", async (req, res) =>{
});

module.exports = router;