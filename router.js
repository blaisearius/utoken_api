var express = require('express');
const EthTransactionController = require('./controller/EthTransactionController');
const TransactionController = require('./controller/TransactionController');
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

    apiRouter.route('/transaction/send').post(TransactionController.sendTransaction);
    apiRouter.route('/transaction/send_from_private').post(TransactionController.sendTransactionFromPrivate);
    apiRouter.route('/transaction/check_balance').post(TransactionController.checkBalance);

    apiRouter.route('/transaction/send_eth_from_private').post(EthTransactionController.sendEtherTransactionFromPrivate);
    apiRouter.route('/transaction/check_eth_balance').post(EthTransactionController.checkEthBalance);
    
    return apiRouter;
    
})();