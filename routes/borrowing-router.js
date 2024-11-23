var express = require('express');
const { Borrowing } = require('../models');
var router = express.Router();

//Retrieves a list of all borrowings
router.get("/", async (req, res) => {
    try {
        const borrowings = await Borrowing.findAll();  // Retrieve all borrowings from the 'borrowings' table
        res.status(200).json(borrowings);  // Send the borrowings data as JSON response
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

//Retrieves the details of a specific borrowing transaction by borrowId.
router.get("/:borrowId", async (req, res) =>{
});

//Retrieves all borrowing records for a specific user.
router.get("/user/:userId", async (req, res) =>{
});

//Retrieves all borrowing records for a specific book.
router.get("/book/:bookId", async (req, res) =>{
});

//Creates a new borrowing transaction when a user borrows a book.
router.post("/", async (req, res) =>{
});

//Marks a book as returned.
router.put("/:borrowId/return", async (req, res) =>{
});

//Deletes existing borrowing transaction.
router.delete("/:borrowId", async (req, res) =>{
});

module.exports = router;