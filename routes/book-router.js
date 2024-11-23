var express = require('express');
var router = express.Router();

const { Book } = require('../models');

const { body, validationResult, param } = require('express-validator');

const { Op } = require('sequelize');

//Retrieves a list of all books in the library.
router.get("/", async (req, res) => {
    try {
        const books = await Book.findAll({attributes: ['book_id','title']});  // Retrieve all books from the 'books' table
        let result = books.map(book => ({
            id: book.book_id,
            name: book.title
        }))
        res.status(200).json(result);  // Send the books data as JSON response
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
});

//Retrieves detailed information about a specific book by bookId
router.get("/:bookId", [
  param('bookId').exists().isInt().withMessage("Invalid ID")
],async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }
    
    const { bookId } = req.params;

    try {
      /**Book viewing should be considered as a process much more frequent than borrowing and returning.
       * To make it efficient findByPk and only needed attributes are used
      */
      const book = await Book.findByPk(bookId, {
        attributes: ['book_id', 'title', 'average_rating'],
      });

      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }

      const result = {
        id: book.book_id,
        name: book.title,
        score: book.average_rating == -1 ? parseInt(book.average_rating) : book.average_rating
      };
  
      return res.status(200).json(result);

    } catch (err) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Insert a new book into the database
router.post("/",[
  body('name').exists().isLength({ max: 255 }).withMessage("Invalid Name")
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }

    const { name } = req.body;

  try {
    const book = await Book.findOne({
      where: {
        title: {
          [Op.iLike]: name // This will make the search case-insensitive
        }
      }
    });

    if (book) {
      return res.status(409).json({ message: 'Book already exists!' });
    }

    await Book.create({
      title: name
    });

    return res.status(201).json();
  } catch (error) {
    return res.status(500).json({
      message: 'Error inserting book',
      error: error.message
    });
  }
});

/* ****BELOW ADDED AS DETAIL**** */

//Retrieves all ratings for a specific book.
router.get("/:bookId/ratings", async (req, res) =>{
});

//Updates details for a specific book by bookId.
router.put("/:bookId", async (req, res) =>{
});

//Removes a specific book from the library by bookId
router.delete("/:bookId", async (req, res) =>{
});

module.exports = router;