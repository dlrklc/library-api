-- Create table for users
CREATE TABLE users (
    user_id  SERIAL PRIMARY KEY,                                                                -- SERIAL type automatically handles auto-incrementing
    user_name VARCHAR(100) NOT NULL,                                                            -- User's name (cannot be NULL)
    phone VARCHAR(15),                                                                          -- User's phone number (optional)
    date_of_birth DATE,                                                                         -- User's date of birth (optional)
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                                      -- Timestamp for when the user registered (defaults to current time)
    status VARCHAR(20) CHECK (status IN ('Active', 'Inactive', 'Suspended')) DEFAULT 'Active'   -- User account status with a default value of 'Active'
);


-- Create table for books
CREATE TABLE books (
    book_id  SERIAL PRIMARY KEY,                                                                -- Unique identifier for each book (auto-incremented using SERIAL)
    title VARCHAR(255) NOT NULL,                                                                -- Title of the book (cannot be NULL)
    author VARCHAR(200),                                                                        -- Author of the book (optional)
    genre VARCHAR(100),                                                                         -- Genre of the book (optional)
    published_year INT,                                                                         -- Year the book was published
    description TEXT,                                                                           -- Optional description of the book
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                                             -- Date when the book was added to the library
    status VARCHAR(20) CHECK (status IN ('Available', 'Damaged')) DEFAULT 'Available',          -- Book status with a default value of 'Available'
    average_rating DECIMAL(4, 2) DEFAULT -1                                                     -- Average rating of the book
);

-- Create table for borrowing records
CREATE TABLE borrowings (
    borrow_id SERIAL PRIMARY KEY,                                                               -- Unique identifier for each borrowing
    user_id INT NOT NULL,                                                                       -- Foreign Key to Users table
    book_id INT NOT NULL,                                                                       -- Foreign Key to Books table
    borrow_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                                            -- Date when the book was borrowed
    due_date DATE NOT NULL,                                                                     -- Date when the book is due
    return_date DATE,                                                                           -- Date when the book was returned (nullable)
    status VARCHAR(20) CHECK (status IN ('Borrowed', 'Returned')) DEFAULT 'Borrowed',           -- Borrowing status
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,                          -- Cascade delete for user removal
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE                           -- Cascade delete for book removal
);



-- Create table for Book Ratings
CREATE TABLE ratings (
    rating_id SERIAL PRIMARY KEY,                                                               -- Unique identifier for each rating
    user_id INT NOT NULL,                                                                       -- Foreign Key to Users table (who rated the book)
    book_id INT NOT NULL,                                                                       -- Foreign Key to Books table (which book is being rated)
    rating INT DEFAULT -1,                                                                      -- Rating default -1
    rating_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                                            -- Date when the rating was made
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,                          -- User who gave the rating
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE                           -- Book being rated
);

-- Function to update the average rating after a rating is inserted or updated
CREATE OR REPLACE FUNCTION UpdateAverageRating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the average_rating column of the books table
    UPDATE books
    SET average_rating = (
        SELECT AVG(rating)
        FROM ratings
        WHERE book_id = NEW.book_id
    )
    WHERE book_id = NEW.book_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update the average rating after a new rating is inserted
CREATE TRIGGER UpdateAverageRatingAfterInsert
AFTER INSERT ON ratings
FOR EACH ROW
EXECUTE FUNCTION UpdateAverageRating();

-- Trigger to update the average rating after a rating is updated
CREATE TRIGGER UpdateAverageRatingAfterUpdate
AFTER UPDATE ON ratings
FOR EACH ROW
EXECUTE FUNCTION UpdateAverageRating();

-- Create an index for frequently queried fields

-- Create an index for searching books by title
CREATE INDEX idx_books_title ON books (title);

-- Create an index for searching users by user_name
CREATE INDEX idx_users_user_name ON users (user_name);

-- Create an index on user_id in the borrowings table for faster lookups
CREATE INDEX idx_borrowing_user_id ON borrowings (user_id);

-- Create an index on book_id in the borrowings table for faster lookups
CREATE INDEX idx_borrowing_book_id ON borrowings (book_id);

-- Create an index on status in the borrowings table for faster lookups
CREATE INDEX idx_borrowing_status ON borrowings (status);

-- Create an index on user_id in the ratings table for faster lookups
CREATE INDEX idx_ratings_user_id ON ratings (user_id);

-- Create an index on book_id in the ratings table for faster lookups
CREATE INDEX idx_ratings_book_id ON ratings (book_id);


