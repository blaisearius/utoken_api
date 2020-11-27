'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TokenConfirmation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.TokenConfirmation.belongsTo(models.User, {
        foreignKey: {
          allowNull: false
        }
      })
    }
  };
  TokenConfirmation.init({
    token: {type: DataTypes.TEXT, allowNull: false},
    used: {type: DataTypes.BOOLEAN, allowNull: false},
    expireAt: {type: DataTypes.DATE, allowNull: false},
    callbackUrl: {type: DataTypes.STRING, allowNull: true},
  }, {
    sequelize,
    modelName: 'TokenConfirmation',
    timestamps: true,
  });
  return TokenConfirmation;
};