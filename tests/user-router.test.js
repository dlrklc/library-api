const request = require('supertest');
const app = require('../app');
const { User, Borrowing, Rating } = require('../models'); 

const USERS_PATH = '/users'
const USERS_PATH_WITH_ID = '/users/1'

jest.mock('../models'); // Mocking the Sequelize models

describe('GET /', () => {
  it('should return a list of users with user_id and user_name', async () => {
    // Mock the response of User.findAll
    const mockUsers = [
      { user_id: 1, user_name: 'FirstName LastName' },
      { user_id: 2, user_name: 'FirstName-2 LastName-2' },
    ];
    User.findAll.mockResolvedValue(mockUsers);  // Mocking the resolved value for findAll

    const response = await request(app).get(USERS_PATH);  // Send GET request

    // Assert that the response has status 200
    expect(response.status).toBe(200);

    // Assert that the returned data is correctly formatted
    expect(response.body).toEqual([
      { id: 1, name: 'FirstName LastName' },
      { id: 2, name: 'FirstName-2 LastName-2' },
    ]);

    // Ensure that the findAll method was called once
    expect(User.findAll).toHaveBeenCalledWith({ attributes: ['user_id', 'user_name'] });
  });

  it('should return a 500 error when there is an exception', async () => {
    // Mock the response to throw an error
    User.findAll.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get(USERS_PATH);

    // Assert that the response status is 500
    expect(response.status).toBe(500);

    // Assert that the error message is returned in the response
    expect(response.body).toEqual({ message: 'Internal Server Error' });
  });
});

describe('GET /:userId', () => {
    it('should return information about a user ', async () => {

        // Mock the response of User.findByPk
        const mockUser = { user_id: 1, user_name: 'FirstName LastName' }
        User.findByPk.mockResolvedValue(mockUser);
        
        // Mock the response of Borrowing.findAll
        const mockBooks = [
          { book_id: 1, Book: { book_id: 1, title: 'BookTitle' } },
          { book_id: 2, Book: { book_id: 2, title: 'BookTitle-2' } }
        ];

        const mockRating = { 'rating': 5 };

        Borrowing.findAll.mockResolvedValue(mockBooks);  // Mocking the resolved value for findAll
        Rating.findOne.mockResolvedValue(mockRating);  

        const response = await request(app).get(USERS_PATH_WITH_ID);  // Send GET request
    
        // Assert that the response has status 200
        expect(response.status).toBe(200);
    
        // Assert that the returned data is correctly formatted
        expect(response.body).toEqual(
            { 
                id: 1, 
                name: mockUser.user_name,
                books: {
                    past: [{name: 'BookTitle',userScore: 5}, {name: 'BookTitle-2',userScore: 5}],
                    present: [{name: 'BookTitle'}, {name: 'BookTitle-2'}]
                }
            }
        );
    });

    it('should return a 500 error when there is an exception', async () => {
        // Mock the response to throw an error
        Borrowing.findAll.mockRejectedValue(new Error('Database error'));
    
        const response = await request(app).get(USERS_PATH_WITH_ID);
    
        // Assert that the response status is 500
        expect(response.status).toBe(500);
    
        // Assert that the error message is returned in the response
        expect(response.body).toEqual({ message: 'Internal Server Error', error: 'Database error'});
    });
}); 


/*** TESTS FOR OTHER ROUTERS CAN BE ADDED */