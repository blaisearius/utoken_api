//Imports 
var jwtUtils = require('./../utils/jwt.utils');
var constants = require('./../utils/constants');
var models = require('./../models');
var Web3 = require('web3');
var Tx = require('ethereumjs-tx').Transaction;

//variables 
var web3 = new Web3(new Web3.providers.HttpProvider(constants.ethereumProviderURL)); 

//function controller
module.exports = {
    checkEthBalance: function(req, res){
        
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);
        
        if(userId < -1){
            return res.status(400).json({'error': 'Wrong token'});
        }
        var address = req.body.address;

        if(address ==null || address ==""){ return res.status(400).json({'error': 'missing address'});}
        
        web3.eth.getBalance(address, (err, bal)=>{
            return res.status(200).json({
                'data': {
                    'address': address,
                    'token': "ETH",
                    'balance': web3.utils.fromWei(bal, 'ether')
                }
            });
        })
        .catch(function(err){
            return res.status(404).json({
                'error': 'can not found balance !'
            });
        });
    }, 

    sendEtherTransactionFromPrivate: function(req, res){
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);
        
        if(userId < -1){
            return res.status(400).json({'error': 'Wrong token'});
        }

        var toAddress = req.body.to_address;
        var fromAddress = req.body.from_address;
        var fromPrivate = req.body.from_private_address;
        var amount = req.body.amount;


        if(toAddress ==null || toAddress ==""){ return res.status(400).json({'error': 'missing to_address'});}
        if(fromAddress ==null || fromAddress ==""){ return res.status(400).json({'error': 'missing from_address'});}
        if(fromPrivate ==null || fromPrivate ==""){ return res.status(400).json({'error': 'missing from_private_address'});}
        if(amount ==null || amount ==""){ return res.status(400).json({'error': 'missing amount'});}
        
        // SEND TRANSACTION HERE
        
        web3.eth.getTransactionCount(fromAddress, (err, txCount) =>{
            // create transaction object 
            var txObject = {
                nonce: web3.utils.toHex(txCount),
                gasPrice: web3.utils.toHex(web3.utils.toWei(constants.gasPrice, 'gwei')),
                gasLimit: web3.utils.toHex(constants.gasLimit),
                to: toAddress,
                value : web3.utils.toHex(web3.utils.toWei(amount, 'ether'))
            };

            //Sign transaction 
            var tx = new Tx(txObject);
            tx.sign(Buffer.from(fromPrivate.substring(2), 'hex')); 

            var serializedTx = tx.serialize();
            var raw = '0x' + serializedTx.toString('hex');

            //Broadcast the transaction 
            web3.eth.sendSignedTransaction(raw, (err, txHash) => {
                console.log('err : ', err, 'txHash : ', txHash);
                if(err){
                    return res.status(500).json({
                        'error': 'invalid signature !'
                    });
                }
                else{
                    return res.status(200).json({
                        'data': {
                            'message': "transaction send successfully",
                            'txHash': txHash
                        }
                    });
                }
            })
            .catch(function(err){
                console.log("ERROR : ", err);
                return res.status(404).json({
                    'error': err
                });
            });
        })
        .catch(function(err){
            return res.status(404).json({
                'error': 'can not send transaction !'
            });
        });

    }
    
   
}
