//Imports 
var jwtUtils = require('./../utils/jwt.utils');
var constants = require('./../utils/constants');
var models = require('./../models');
var Web3 = require('web3');

//variables 
var web3 = new Web3(new Web3.providers.HttpProvider(constants.ethereumProviderURL)); 

//function controller
module.exports = {

    setupWallet: function(req, res){
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);
        
        if(userId < -1){
            return res.status(400).json({'error': 'Wrong token'});
        }

        var encryptionPassword = req.body.encryption_password;
        var wallet_name = req.body.wallet_name;
        
        if(encryptionPassword ==null || encryptionPassword ==""){ return res.status(400).json({'error': 'missing encryption_password'});}
        if(wallet_name ==null || wallet_name ==""){ return res.status(400).json({'error': 'missing wallet_name'});}
        
        models.Wallet.findOne({
            attributes: ['id'],
            where : {userId : userId}
        })
        .then(function(walletFound){
            if(walletFound){
                return res.status(409).json({
                    'error': 'wallet already setup'
                });
            }
            else{
                var wallet = web3.eth.accounts.wallet.create(1);
                var encryptedWallet = wallet.encrypt(encryptionPassword);

                console.log(JSON.stringify(encryptedWallet));
                var newWallet = models.Wallet.create({
                    UserId: userId,
                    name: wallet_name,
                    encryptedWallet: JSON.stringify(encryptedWallet)
                })
                .then(function(newWallet){
                    var newAccount = models.Account.create({
                        WalletId: newWallet.id,
                        address: wallet[0].address,
                        encryptedAccount: JSON.stringify(wallet[0].encrypt(encryptionPassword))
                    });

                    return res.status(201).json({
                        'default_account_address': wallet[0].address
                    });
            
                });
            }
        })
        .catch(function(err){
            return res.status(500).json({
                'error': 'unable to setup wallet'
            });
        });

    }, 


    loadWallet: function(req, res){
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);
        
        if(userId < -1){
            return res.status(400).json({'error': 'Wrong token'});
        }

        var encryptionPassword = req.body.encryption_password;
        
        if(encryptionPassword ==null || encryptionPassword ==""){ return res.status(400).json({'error': 'missing encryption_password'});}
        
        models.Wallet.findOne({
            attributes: ['id', 'userId', 'name', 'encryptedWallet', 'createdAt'],
            where : {userId : userId}
        })
        .then(function(walletFound){
            
            if(walletFound.id){
                var encryptedWallet = JSON.parse(walletFound.encryptedWallet);
                var decryptedWallet = web3.eth.accounts.wallet.decrypt(encryptedWallet, encryptionPassword);
                
                var arrayAccounts = [];
                for (let index = 0; index < decryptedWallet.length; index++) {
                    arrayAccounts.push({
                        'address': decryptedWallet[index].address,
                        'private': decryptedWallet[index].privateKey
                    });
                }

                return res.status(200).json({
                    'data': {
                        userId: walletFound.userId,
                        name: walletFound.name,
                        decryptedWallet : arrayAccounts
                    }
                });
            }
            else{
                return res.status(404).json({
                    'error': 'wallet not found !'
                });
            }
        })
        .catch(function(err){
            return res.status(500).json({
                'error': 'unable to load wallet. please verify password.'
            });
        });

    }, 
    
   
}
