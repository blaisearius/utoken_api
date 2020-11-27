//import express JS 
const express = require('express')
var bodyParser = require('body-parser');
var apiRouter = require('./router').router;

//create server instance
const app = express()

//Body parser configuration
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//route configuration
app.get('/', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.status(200);
    res.send({'app_name':"UToken"})
})

app.use('/api', apiRouter);

//launch server
app.listen(3000, function(){
    console.log('serveur en écoute');
});