const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {

  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, // Automatically incrementing for each new entry
  },

  user_name: {
    type: DataTypes.STRING(100),
    allowNull: false, // Cannot be null
  },

  phone: {
    type: DataTypes.STRING(15),
    allowNull: true, // Optional field
  },

  date_of_birth: {
    type: DataTypes.DATEONLY, // DATE type for storing date of birth
    allowNull: true,
  },

  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'Active', // Default status is 'Active'
    validate: {
      isIn: [['Active', 'Inactive', 'Suspended']], 
    },
  },
}, {
  tableName: 'users', 
  timestamps: true,
  createdAt: 'registration_date', // Rename `createdAt` to `registration_date`
  updatedAt: false,
});

module.exports = User;
