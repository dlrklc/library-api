var express = require('express');
var router = express.Router();

const { User, Borrowing, Book, Rating } = require('../models');

const { Op } = require('sequelize');

// Validation
const { body, validationResult, param } = require('express-validator');

//Retrieves all users
router.get("/", async (req, res) => {
    try {
        const users = await User.findAll({attributes: ['user_id','user_name']});  // Retrieve all users from the 'users' table
        let result = users.map(user => ({
            id: user.user_id,
            name: user.user_name
        }))
        return res.status(200).json(result);  // Send the users data as JSON response
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

//Retrieves detailed information about a specific user by userId
router.get("/:userId", [
    param('userId').exists().isInt().withMessage("Invalid ID")
], async (req, res) => {  
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }
    
    const { userId } = req.params;
    
    try {

      const user = await User.findByPk(userId, {
        attributes: ['user_id', 'user_name']
      }); 

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get present borrowings
      let present = await getBorrowingsWithStatus(userId, 'Borrowed')

      present = present.map(item => ({
        name: item.Book.title
      }));

      // Get past borrowings
      let pastBorrowings = await getBorrowingsWithStatus(userId, 'Returned')

      pastBorrowings = pastBorrowings.filter((value, index, self) => 
        index === self.findIndex((borrowing) => (
          borrowing.book_id === value.book_id
        ))
      );

      // Get ratings for the past borrowings
      let past = await getRatingsWithBorrowings(userId, pastBorrowings)

      const result = {
        id: user.user_id,
        name: user.user_name,
        books: { past, present }
      };
  
      return res.status(200).json(result);
  
    } catch (err) {
      return res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

//Creates a new user.
router.post("/",[
  body('name').exists().isLength({ max: 100 }).matches(/^[A-Za-zÇçĞğÖöŞşÜüİı ]+$/).withMessage("Invalid Name")
], async (req, res) => {
    try {

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ message: errors.array() });
      }

      const { name } = req.body;

      const user = await User.findOne({
          where: {
            user_name: {
              [Op.iLike]: name // This will make the search case-insensitive
            }
          }
      });

      if (user) {
        return res.status(409).json({ message: 'User already exists!' });
      }
    
      await User.create({
            user_name: name
      });

      return res.status(201).json();
  
    } catch (error) {
      return  res.status(500).json({ message: 'Error creating user' });
    }
});

//Creates borrowing for bookId by userId
router.post("/:userId/borrow/:bookId", [
  param('userId').exists().isInt().withMessage("Invalid User ID"),
  param('bookId').exists().isInt().withMessage("Invalid Book ID")
], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }

  const { userId, bookId } = req.params;

  try{
    /**No need to get all attributes for performance purposes */
    const user = await User.findByPk(userId, {
      attributes: ['user_name'],
    });
    const book = await Book.findByPk(bookId, {
      attributes: ['title'],
    });
  
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
  
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const borrowing = await Borrowing.findOne({ //Check if book is borrowed by another user or this user
      where: {
        book_id: bookId,
        status: 'Borrowed'
      }
    });

    if (borrowing) {
      return res.status(409).json({ message: 'The book is already borrowed by another user or this user' });
    }

    const dueDate = new Date();  
    dueDate.setDate(dueDate.getDate() + 14); 

    // Create the borrowing record
    await Borrowing.create({
      user_id: userId,
      book_id: bookId,
      due_date: dueDate,
      status: 'Borrowed'
    });

    return res.status(204).json();

  } catch (error) {
    return res.status(500).json({ message: 'Error borrowing book' });
  }


});

//Creates rating for returning bookId by userId
router.post("/:userId/return/:bookId", [
  param('userId').exists().isInt().withMessage("Invalid User ID"),
  param('bookId').exists().isInt().withMessage("Invalid Book ID"),
  body('score').exists().isInt({ min: 0, max: 10 }).withMessage("Invalid Score")
], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }

  const { userId, bookId } = req.params;
  const { score } = req.body;

  try{
    const user = await User.findByPk(userId, {
      attributes: ['user_name'],
    });
    const book = await Book.findByPk(bookId, {
      attributes: ['title'],
    });
  
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
  
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const borrowing = await Borrowing.findOne({ //Check if book is returned 
      where: {
        user_id: userId,
        book_id: bookId,
        status: 'Borrowed',
      }
    });

    if (!borrowing) {
      return res.status(409).json({ message: 'The book is already returned or has not been borrowed by the user!' });
    }

    borrowing.return_date = new Date(); // Set the current date as the return date
    borrowing.status = 'Returned'; // Change status to 'Returned'

    await borrowing.save();

    const rating = await Rating.findOne({ //Check if book has already rating from this user
      where: {
        user_id: userId,
        book_id: bookId,
      }
    });

    if(rating){ //update with new rating

      rating.rating = score
      await rating.save();

    } else {
      // Create the rating record
      await Rating.create({
        user_id: userId,
        book_id: bookId,
        rating: score,
      });
    }

    return res.status(204).json();

  } catch (error) {
    return res.status(500).json({ message: 'Error returning book', error: error.message });
  }
});

async function getBorrowingsWithStatus(userId, status) {

  // Get present borrowings
  let borrowings = await Borrowing.findAll({
    where: {
      user_id: userId,
      status: status
    },
    attributes: ['book_id'],
    include: [
      {
        model: Book, // Include the associated Book details
        attributes: ['book_id', 'title'] // Select specific columns to include
      }
    ]
  });

  return borrowings

}

async function getRatingsWithBorrowings(userId, borrowings) {

  // Get ratings for the input borrowings
  let ratings = await Promise.all(
    borrowings.map(async (borrowing) => {
      const rating = await Rating.findOne({
        where: {
          user_id: userId,
          book_id: borrowing.book_id
        },
        attributes: ['rating'] // Get the rating score
      });

      return {
        name: borrowing.Book.title,
        userScore: rating ? rating.rating : -1 // If no rating, set it to -1
      };
    })
  );

  return ratings

}

/* ****BELOW ADDED AS DETAIL**** */

//Retrieves a list of books currently borrowed by a user.
router.get("/:userId/borrowed/present", async (req, res) =>{
});

//Retrieves the list of books a user has borrowed in the past, including their ratings for each book.
router.get("/:userId/borrowed/past", async (req, res) =>{
});

//Updates user information.
router.put("/:userId", async (req, res) =>{
});

//Deletes a user by userId.
router.delete("/:userId", async (req, res) =>{
});

module.exports = router;