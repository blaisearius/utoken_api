// imports
var jwt = require('jsonwebtoken');

const JWT_SIGN_SECRET="hfbjcbcnjq,cbucn--qcncqncqbhqbjnc,qkhuqcjk))qcqbucnqchqcbjqncqdhcb";

module.exports = {
    generateTokenUser: function(userData){
        return jwt.sign({
            id: userData.id,
            username: userData.username,
            roles: userData.roles
        },
        JWT_SIGN_SECRET,
        {
            expiresIn: '48h'
        })
    },

    parseAuthorization: function(authorization){
        return (authorization !=null) ? authorization.replace('Bearer ', '') : null; 
    },

    getUserId : function(authorization){
        var userId = -1;
        var token = module.exports.parseAuthorization(authorization);
        
        if(token !=null){
            try {
                var jwtToken = jwt.verify(token, JWT_SIGN_SECRET);
                if(jwtToken !=null){
                    userId = jwtToken.id;
                }
            } catch (error) {
                console.log("error token")
            }
        }
        return userId; 
    }
}