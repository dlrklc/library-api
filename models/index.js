//Table relations

const User = require('./user');
const Book = require('./book');
const Rating = require('./rating');
const Borrowing = require('./borrowing');

User.hasMany(Borrowing, { foreignKey: 'user_id', onDelete: 'CASCADE'});
User.hasMany(Rating, { foreignKey: 'user_id', onDelete: 'CASCADE'});
User.belongsToMany(Book, { through: Borrowing, foreignKey: 'user_id' });

Book.hasMany(Rating, { foreignKey: 'book_id', onDelete: 'CASCADE'});
Book.hasMany(Borrowing, { foreignKey: 'book_id', onDelete: 'CASCADE' });
Book.belongsToMany(User, { through: Borrowing, foreignKey: 'book_id' });

Rating.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Rating.belongsTo(Book, { foreignKey: 'book_id', onDelete: 'CASCADE' });

Borrowing.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Borrowing.belongsTo(Book, { foreignKey: 'book_id', onDelete: 'CASCADE' });

module.exports = {
  User,
  Book,
  Rating,
  Borrowing
};