const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
    book_id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false, // Cannot be null
    },
    author: {
        type: DataTypes.STRING(200),
        allowNull: true,
    },
    genre: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    published_year: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    description: DataTypes.TEXT,
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'Available', // Default status is 'Available'
        validate: {
            isIn: [['Available', 'Damaged']],
        },
    },
    average_rating: {
        type: DataTypes.DECIMAL(4, 2),
        defaultValue: -1
    }
}, { 
    tableName: 'books',
    timestamps: true,
    createdAt: 'date_added', // Rename `createdAt` to `date_added`
    updatedAt: false,
});

module.exports = Book;