var express = require('express');
var userController = require('./controller/UserController');
const WalletController = require('./controller/WalletController');

//Routes 
exports.router = (function() {
    var apiRouter = express.Router();

    //UserController routes
    apiRouter.route('/users/register').post(userController.register);
    apiRouter.route('/users/login').post(userController.login);

    apiRouter.route('/users/me').get(userController.userProfile);

    apiRouter.route('/wallet/setup').post(WalletController.setupWallet);

    apiRouter.route('/wallet/load').post(WalletController.loadWallet);

    return apiRouter;
    
})();