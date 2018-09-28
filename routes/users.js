const Client     = require('bitcoin-core');
const client     = new Client(  { 
                             network : 'testnet',
                             port    : 18332,
                             host : '206.189.135.167' ,
                             username    : 'test',
                             password : 'test123'
                           } );


var Coins                 = require('./Coins.js');
var express               = require('express');
var uniqueid              = require('shortid');



exports.createWallet       = createWallet ;

exports.sendCoins          = sendCoins ;
exports.receiveCoins       = receiveCoins ;
exports.test               = test ;

exports.Submit             = Submit ;
exports.currencyChange     = currencyChange ;
exports.initialiseCoin     = initialiseCoin ;
exports.checkBalance       = checkBalance;
exports.getTransaction     = getTransaction ;
exports.submitTransaction  = submitTransaction ;
exports.inactiveAssets     = inactiveAssets;
exports.showAllCoins       = showAllCoins ;

const pg = require('pg');
var pgp = require('pg-promise')(/*options*/)


var db = pgp('postgres://postgres:test@127.0.0.1:5432/maxwallet')


//info_search o



function createWallet(req,res) {
   var handlerInfo   = {
    "apiModule": "users",
    "apiHandler":"signUpUser"
  };
    



   var private_keyHash    = req.body.private_keyHash;
   var public_key         = req.body.public_key;
   var wallet_id          = uniqueid.generate() ;


 var Query = "INSERT INTO wallet_info(private_keyhash,public_key,logged_on,wallet_id) VALUES($1,$2,$3,$4)";


  db.none(Query, [private_keyHash, public_key,new Date(),wallet_id])
    .then(function(result) {
        console.log("success")
       res.send({
      "log" : "Date inserted successfully",
      "wallet_id": wallet_id

    });
    })
    .catch(error => {
        // error;

        res.send({
        "log" : "Internal server error",
        // "flag": constants.responseFlags.ACTION_FAILED
      });

      console.log(error);

    });

}

function getTransaction(req,res) {

     var handlerInfo   = {
    "apiModule": "users",
    "apiHandler":"getTransaction"
     };


  var transactionId  = req.body.transactionId ;

  client.getTransaction(txid).then((result) => {
    console.log("Transaction details: " + JSON.stringify(result))

    res.send(JSON.stringify(result));


   });
    

}

function initialiseCoin(req,res){


   var handlerInfo   = {
    "apiModule": "users",
    "apiHandler":"initialiseCoin"
  };
    
  
  var asset_id      = req.body.asset_id ;
  var wallet_id     = req.body.wallet_id ;
  var asset_address = req.body.asset_address;
  var asset_data    = req.body.asset_data ;

var Query = "INSERT INTO personal_info(asset_id,wallet_id,asset_address,asset_data,created_on) VALUES($1,$2,$3,$4,$5)";


  db.none(Query, [asset_id,wallet_id,asset_address,asset_data, new Date()])
    .then(function(result) {
        // success;
        console.log("success")

        client.importAddress(address,'',false).then((result) => console.log("Address Imported"));


       res.send({
      "log" : "Date inserted successfully",
      "data": result,
      // "flag": constants.responseFlags.ACTION_COMPLETE
    });
    })
    .catch(error => {
        // error;

        res.send({
        "log" : "Internal server error",
        // "flag": constants.responseFlags.ACTION_FAILED
      });

      console.log(error);

    });



}



function test(req,res) {
   var handlerInfo   = {
    "apiModule": "users",
    "apiHandler":"signUpUser"
  };
    


 var Query = "SELECT * FROM wallet_info";


  db.any(Query)
    .then(function(data){
        // success;
        console.log("success")
       res.send({
      "log" : "Date inserted successfully",
      "data": data,
      // "flag": constants.responseFlags.ACTION_COMPLETE
    });
    })
    .catch(function(error) {
        // error;

        res.send({
        "log" : "Internal server error",
        // "flag": constants.responseFlags.ACTION_FAILED
      });

      console.log(error);

    });




}





function inactiveAssets(req,res) {
   var handlerInfo   = {
    "apiModule": "users",
    "apiHandler":"signUpUser"
  };
    

    var wallet_id = req.body.wallet_id ;


 var Query = "SELECT * from assets where asset_id not in (SELECT asset_id from personal_info where wallet_id=$1)";


  db.any(Query,[wallet_id])
    .then(function(data){
        // success;
        console.log("success")
       res.send({
      "log" : "Date fetched successfully",
      "data": data,
      // "flag": constants.responseFlags.ACTION_COMPLETE
    });
    })
    .catch(function(error) {
        // error;

        res.send({
        "log" : "Internal server error",
        // "flag": constants.responseFlags.ACTION_FAILED
      });

      console.log(error);

    });

}

//base class . each coin will inherit properties from the prototype object of createWallet

/**
  *
  * This is coin independent .
  * Creates mnemonic , seed and private and public keys of wallet
  * hash of private key is stored 
  *
  */




function checkBalance(req,res) {

  var handlerInfo = {
    "apiModule" : "users",
    "apiHandler" : "Submit"
  };


  var address = req.body.address ;

var min_conf = 0
var max_conf = 99999

client.listUnspent(min_conf,max_conf,[address]).then(function(unspent) {

var sum = 0;
  for (var i = 0; i < unspent.length; i++) {
    sum += unspent[i].amount;
    
}

console.log("Balance of given address is :" +  sum);

res.send("Balance of address is " + sum);
} )




}




function Submit(req,res) {


  var handlerInfo = {
    "apiModule" : "users",
    "apiHandler" : "Submit"
  };

 
 var asset_id         = req.body.asset_id ;
 var wallet_id        = "ss";
 var asset_address    = req.body.asset_address ;
 var asset_data       = req.body.asset_data ;



 var Query = "INSERT INTO personal_info(asset_id,wallet_id,asset_address,asset_data,created_on) VALUES($1,$2,$3,$4,$5)";


  db.none(Query, [asset_id,wallet_id,asset_address,asset_data,new Date()])
    .then(function(result){
        // success;
        console.log("success")
       res.send({
      "log" : "Date inserted successfully",
      "data": result,
      // "flag": constants.responseFlags.ACTION_COMPLETE
    });
    })
    .catch(error => {
        // error;

        res.send({
        "log" : "Internal server error",
        // "flag": constants.responseFlags.ACTION_FAILED
      });

      console.log(error);

    });



}
/*
 * coin dependent function, depends on asset id 
 * this api creates public key, private key and address of that particular coin
 * 
 * needs to import address 
 */

function sendCoins(req,res) {


	var handlerInfo = {
		"apiModule" : "users",
		"apiHandler" : "createKeys"
	};

 
 var asset_id   = req.body.asset_id ;
 var coin_info  = req.body.coin_info;
 var address    = req.body.address ;



var min_conf = 0 
var max_conf = 99999
client.listUnspent(min_conf,max_conf,[address]).then((unspent) => console.log("UTXO: " + JSON.stringify(unspent)));


client.estimateSmartFee(blocks).then((result) => {
 
  console.log("Fees: "+ result)
  } );




}


function submitTransaction(req,res) {

  var handlerInfo = {
    "apiModule" : "users",
    "apiHandler" : "createKeys"
  };

var hash = req.body.hash ;

client.sendRawTransaction(txHash,true).then((transactionID) => {

  res.send(transactionID);
  console.log("Transaction ID: " + transactionID)

});



}




function showAllCoins(req,res) {

  var handlerInfo = {
    "apiModule" : "users",
    "apiHandler" : "showCoins"
  };



 var Query = "SELECT * FROM assets";


  db.any(Query)
    .then(function(data){
        // success;
        console.log("success")
       res.send({
      "log" : "Date sent successfully",
      "data": data,
      // "flag": constants.responseFlags.ACTION_COMPLETE
    });
    })
    .catch(function(error) {
        // error;

        res.send({
        "log" : "Internal server error",
        // "flag": constants.responseFlags.ACTION_FAILED
      });

      console.log(error);

    });


}


/*
 * coin dependent function, depends on asset id 
 * this api creates public key, private key and address of that particular coin
 * 
 * needs to import address 
 */

function receiveCoins(req,res) {


	var handlerInfo = {
		"apiModule" : "users",
		"apiHandler" : "createKeys"
	};

 
 var asset_id   = req.body.asset_id ;
 var coin_info  = req.body.coin_info;
 var address    = req.body.address ;






}





function currencyChange(req,res) {


  var handlerInfo = {
    "apiModule" : "users",
    "apiHandler" : "Submit"
  };


 var wallet_id                  = req.body.wallet_id;
 var asset_value_currency       = req.body.asset_value_currency ;



 var Query = "SELECT asset_id FROM personal_info where wallet_id=$1";


  db.none(Query, [wallet_id])
    .then(function(result){
        // success;
        console.log("success")
       res.send({
      "log" : "Date inserted successfully",
      "data": result,
      // "flag": constants.responseFlags.ACTION_COMPLETE
    });
    })
    .catch(error => {
        // error;

        res.send({
        "log" : "Internal server error",
        // "flag": constants.responseFlags.ACTION_FAILED
      });

      console.log(error);

    });



}