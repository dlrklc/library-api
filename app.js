const express = require('express');
const app = express();
app.use(express.json());

const UserRouter = require('./routes/user-router');
const BookRouter = require('./routes/book-router');
const BorrowingRouter = require('./routes/borrowing-router');
const RatingRouter = require('./routes/rating-router');
const SearchRouter = require('./routes/search-router');

app.use('/users', UserRouter); 
app.use('/books', BookRouter);

/* ****BELOW ADDED AS DETAIL**** */
app.use('/borrowings', BorrowingRouter);
app.use('/ratings', RatingRouter);
app.use('/search', SearchRouter);

module.exports = app;