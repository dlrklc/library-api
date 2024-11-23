const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rating = sequelize.define('Rating', {
    user_id: {
        allowNull: false, 
        type: DataTypes.INTEGER
    },
    book_id: {
        allowNull: false, 
        type: DataTypes.INTEGER,
    },
    rating_id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    rating: {
        type: DataTypes.INTEGER,
        defaultValue: -1,
    }
}, { 
    tableName: 'ratings',
    timestamps: true,
    createdAt: 'rating_date', // Rename `createdAt` to `rating_date`
    updatedAt: false,
 });

module.exports = Rating;

