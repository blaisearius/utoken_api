'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Account.belongsTo(models.Wallet, {
        foreignKey: {
          allowNull: false
        }
      });
    }
  };
  Account.init({
    address: {type: DataTypes.STRING, allowNull: false},
    encryptedAccount: {type: DataTypes.TEXT, allowNull: true}
  }, {
    sequelize,
    modelName: 'Account',
    timestamps: true,
  });
  return Account;
};