const request = require('supertest');
const app = require('../app');
const { Book } = require('../models'); 

const BOOKS_PATH = '/books'

jest.mock('../models'); // Mocking the Sequelize models

describe('GET /', () => {
  it('should return a list of books with book_id and title', async () => {
    // Mock the response of Book.findAll
    const mockBooks = [
      { book_id: 1, title: 'BookName' },
      { book_id: 2, title: 'BookName-2' },
    ];

    Book.findAll.mockResolvedValue(mockBooks);  // Mocking the resolved value for findAll

    const response = await request(app).get(BOOKS_PATH);  // Send GET request

    // Assert that the response has status 200
    expect(response.status).toBe(200);

    // Assert that the returned data is correctly formatted
    expect(response.body).toEqual([
        { id: 1, name: 'BookName' },
        { id: 2, name: 'BookName-2'}
    ]);

    // Ensure that the findAll method was called once
    expect(Book.findAll).toHaveBeenCalledWith({ attributes: ['book_id', 'title'] });
  });

  it('should return a 500 error when there is an exception', async () => {
    // Mock the response to throw an error
    Book.findAll.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get(BOOKS_PATH);

    // Assert that the response status is 500
    expect(response.status).toBe(500);

    // Assert that the error message is returned in the response
    expect(response.body).toEqual({ message: 'Internal Server Error' });
  });
});

/*** TESTS FOR OTHER ROUTERS CAN BE ADDED */