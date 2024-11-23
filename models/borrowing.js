const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Borrowing = sequelize.define('Borrowing', {
    user_id: {
        allowNull: false, 
        type: DataTypes.INTEGER
    },
    book_id: {
        allowNull: false, 
        type: DataTypes.INTEGER,
    },
    borrow_id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    due_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    return_date: DataTypes.DATE,
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'Borrowed', // Default status is 'Borrowed'
        validate: {
          isIn: [['Borrowed', 'Returned']],
        },
    },
}, { 
    tableName: 'borrowings' ,
    timestamps: true,
    createdAt: 'borrow_date', // Rename `createdAt` to `borrow_date`
    updatedAt: false,
});

module.exports = Borrowing;
