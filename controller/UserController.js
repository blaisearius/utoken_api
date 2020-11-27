//Imports 
var bcrypt = require('bcrypt');
var jwtUtils = require('./../utils/jwt.utils');
var models = require('./../models');

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ ;
const expireInHour = 2;


//function controller
module.exports = {

    register: function(req, res){

        var email = req.body.email; 
        var username = req.body.username;
        var firstName = req.body.first_name; 
        var lastName = req.body.last_name;
        var number = req.body.number;
        var firstPassword = req.body.first_password;
        var secondPassword = req.body.second_password; 

        if(email ==null || email ==""){ return res.status(400).json({'error': 'missing email'});}
        if(username ==null || username ==""){ return res.status(400).json({'error': 'missing username'});}
        if(firstName ==null || firstName ==""){ return res.status(400).json({'error': 'missing first_name'});}
        if(lastName ==null || lastName ==""){ return res.status(400).json({'error': 'missing last_name'});}
        if(firstPassword ==null || firstPassword ==""){ return res.status(400).json({'error': 'missing first_password'});}
        if(secondPassword ==null || secondPassword ==""){ return res.status(400).json({'error': 'missing second_password'});}

        if(! EMAIL_REGEX.test(email)){ return res.status(400).json({'error': 'invalid email'});}

        if(firstPassword != secondPassword){ return res.status(400).json({'error': 'confirmation password mixmatch'});}

    
        //make control before saving data 
        models.User.findOne({
            attributes: ['username', 'email'],
            where : {username : username, email : email}
        })
        .then(function(userFound){
            //if user exist then return error user exist
            if(userFound){
                return res.status(409).json({
                    'error': 'user already exist'
                });
            }
            //if user not exist then save it
            else{
                bcrypt.hash(firstPassword, 5, function(err, bcryptedPassword){
                    var newUser = models.User.create({
                        email: email,
                        username: username,
                        password: bcryptedPassword,
                        firstName: firstName,
                        lastName: lastName,
                        roles : 'ROLE_ETUDIANT'
                    })
                    .then(function(newUser){
                        var newConfirmation = models.TokenConfirmation.create({
                            UserId: newUser.id,
                            token: generate_token(32),
                            used: false,
                            expireAt: (new Date()).setHours( (new Date()).getHours() + expireInHour )
                        })
                        .then(function(tokenConfirmation){
                            return res.status(201).json({
                                'id': newUser.id,
                                'username': newUser.username
                            });
                        });
                        
                    }); 
                });
            }
        })
        .catch(function(err){
            return res.status(500).json({
                'error': 'unable to verify the user'
            });
        });

    }, 
    
    login: function(req, res){
        var username = req.body.username;
        var password = req.body.password;

        //verify attributes 

        if(username ==null || password ==null){
            return res.status(400).json({
                'error': 'missing parameters'
            });
        }


        //verify login
        models.User.findOne({
            attributes: ['id', 'username', 'password', 'roles'],
            where : {username : username}
        })
        .then(function(userFound){
            //if user exist then return error user exist
            if(userFound){
                bcrypt.compare(password, userFound.password, function(errBcrypt, resBcrypt){
                    if(resBcrypt){
                        return res.status(200).json({
                            'username': userFound.username,
                            'token': jwtUtils.generateTokenUser(userFound)
                        })
                    }
                    else{
                        return res.status(403).json({
                            'error': '--invalid credentials'
                        });
                    }
                });
            }
            //if user not exist then save it
            else{
                return res.status(403).json({
                    'error': 'invalid credentials'
                });
            }
        })
        .catch(function(err){
            return res.status(500).json({
                'error': 'unable to verify credentials'
            });
        });
    },

    userProfile: function(req, res){
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);
      
        if(userId < -1 ){
            return res.status(400).json({'error': 'Wrong token'});
        }

        models.User.findOne({
            attributes: ['id', 'username', 'email', 'roles', 'firstName', 'lastName'],
            where : {id : userId}
        })
        .then(function(userFound){
            if(userFound){
                return res.status(200).json(userFound);
            }
            else{
                return res.status(404).json({'error': 'invalid token. please verify token.'});
            }
        })
        .catch(function(err){
            return res.status(500).json({
                'error': 'error while finding user. Please contact support.'
            });
        });
    }
}

function generate_token(length){
    //edit the token allowed characters
    var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
    var b = [];  
    for (var i=0; i<length; i++) {
        var j = (Math.random() * (a.length-1)).toFixed(0);
        b[i] = a[j];
    }
    return b.join("");
}