'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.User.hasOne(models.Wallet); 
      models.User.hasMany(models.TokenConfirmation); 
    }
  };
  User.init({
    email: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, allowNull: false },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    roles: { type: DataTypes.STRING, allowNull: false },
  }, {
    sequelize,
    modelName: 'User',
    timestamps: true,
    //tableName: 'users'
  });
  return User;
};