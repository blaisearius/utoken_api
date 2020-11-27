'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Wallet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      models.Wallet.belongsTo(models.User, {
        foreignKey: {
          allowNull: true
        }
      });

      models.Wallet.hasMany(models.Account);
    }
  };
  Wallet.init({
    name: {type: DataTypes.STRING, allowNull: false},
    encryptedWallet: {type: DataTypes.TEXT, allowNull: true}
  }, {
    sequelize,
    modelName: 'Wallet',
    timestamps: true,
  });
  
  return Wallet;
};