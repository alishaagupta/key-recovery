
 'use strict';




var express             = require('express');
var http                = require('http');
var https               = require('https');
var error               = require('./routes/error');
var users               = require('./routes/users.js');
var app                 = express();
var router              = express.Router();
var client              = require('bitcoin-core');
var logger              = require('morgan');
var bodyParser          = require('body-parser');
var cors                = require('cors');
//all environments

app.set('port', process.env.PORT  || 4013);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());             
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});







/////////////////////////////////////////////////////////////
// APIs for MaxWallet
/////////////////////////////////////////////////////////////

// API to check if connection is alive or not

app.get('/', function(req, res) {
  res.send('Welcome to the Application!');
});


app.post('/test', users.test);



app.post('/create_wallet',users.createWallet);

app.post('/show_all_coins',users.showAllCoins);





app.post('/currency_change',users.currencyChange);


app.post('/initialise_coin',users.initialiseCoin);

app.post('/check_balance',users.checkBalance);

app.post('/inactive_assets', users.inactiveAssets);


app.post('/transaction_status',users.getTransaction);


app.post('/send_coins',users.sendCoins);

app.post('/receive_coins',users.receiveCoins);

app.post('/estimate_fees',users.estimateFees);



//https://blockchain.info/multiaddr?active=$address|$address

/**
 * To change the port, please edit the configuration file
 * @type {https.Server}
 */


var httpServer = http.createServer(app).listen(app.get('port'), function()  {
  console.log('Express server listening on port ' + app.get('port'));
});


module.exports  = app;





