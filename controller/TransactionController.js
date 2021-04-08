//Imports 
var jwtUtils = require('./../utils/jwt.utils');
var constants = require('./../utils/constants');
var models = require('./../models');
var Web3 = require('web3');
var Tx = require('ethereumjs-tx').Transaction;

//variables 
var web3 = new Web3(new Web3.providers.HttpProvider(constants.ethereumProviderURL)); 
const contractABI = [{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_symbol","type":"string"},{"internalType":"uint8","name":"_decimals","type":"uint8"},{"internalType":"uint256","name":"_initialSupply","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"adminAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]
const contractAddress = "0x380C639889B2f5d365FAC9ae15a60d0eEeeB21F1";
const contract = new web3.eth.Contract(contractABI, contractAddress); 

//function controller
module.exports = {

    checkBalance: function(req, res){
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);
        
        if(userId < -1){
            return res.status(400).json({'error': 'Wrong token'});
        }
        var address = req.body.address;

        if(address ==null || address ==""){ return res.status(400).json({'error': 'missing address'});}
        
        contract.methods.balanceOf(address).call((err, bal)=>{
            return res.status(200).json({
                'data': {
                    'address': address,
                    'token': "UToken",
                    'balance': bal
                }
            });
        })
        .catch(function(err){
            return res.status(404).json({
                'error': 'can not found balance !'
            });
        });
    }, 

    sendTransaction: function(req, res){
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);
        
        if(userId < -1){
            return res.status(400).json({'error': 'Wrong token'});
        }

        var encryptionPassword = req.body.encryption_password;
        var toAddress = req.body.to_address;
        var amount = req.body.amount;


        if(encryptionPassword ==null || encryptionPassword ==""){ return res.status(400).json({'error': 'missing encryption_password'});}
        if(toAddress ==null || toAddress ==""){ return res.status(400).json({'error': 'missing to_address'});}
        if(amount ==null || amount ==""){ return res.status(400).json({'error': 'missing amount'});}
        
        models.Wallet.findOne({
            attributes: ['id', 'userId', 'name', 'encryptedWallet', 'createdAt'],
            where : {userId : userId}
        })
        .then(function(walletFound){
            
            if(walletFound.id){
                var encryptedWallet = JSON.parse(walletFound.encryptedWallet);
                var decryptedWallet = web3.eth.accounts.wallet.decrypt(encryptedWallet, encryptionPassword);
                
                var first_account = decryptedWallet[0];
  
                // SEND TRANSACTION HERE
                
                web3.eth.getTransactionCount(first_account.address, (err, txCount) =>{
                    // create transaction object 
                    var txObject = {
                        nonce: web3.utils.toHex(txCount),
                        gasPrice: web3.utils.toHex(web3.utils.toWei(constants.gasPrice, 'gwei')),
                        gasLimit: web3.utils.toHex(constants.gasLimit),
                        to: contractAddress,
                        data: contract.methods.transfer(toAddress, amount).encodeABI()
                    };

                    //Sign transaction 
                    var tx = new Tx(txObject);
                    tx.sign(Buffer.from(first_account.privateKey.substring(2), 'hex')); 

                    var serializedTx = tx.serialize();
                    var raw = '0x' + serializedTx.toString('hex');

                    //Broadcast the transaction 
                    web3.eth.sendSignedTransaction(raw, (err, txHash) => {
                        console.log('err : ', err, 'txHash : ', txHash);

                        if(err){
                            return res.status(500).json({
                                'error': "sender doesn't have enough funds to send tx. "
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


    sendTransactionFromPrivate: function(req, res){
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
                to: contractAddress,
                data: contract.methods.transfer(toAddress, amount).encodeABI(),
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
