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
var constants             = require('./constants');


exports.createWallet       = createWallet ;

exports.sendCoins          = sendCoins ;
exports.receiveCoins       = receiveCoins ;
exports.test               = test ;


exports.currencyChange     = currencyChange ;
exports.initialiseCoin     = initialiseCoin ;
exports.checkBalance       = checkBalance;
exports.getTransaction     = getTransaction ;

exports.inactiveAssets     = inactiveAssets;
exports.showAllCoins       = showAllCoins ;

const pg = require('pg');
var pgp = require('pg-promise')(/*options*/)


var db = pgp('postgres://postgres:test@127.0.0.1:5432/maxwallet')


// index_walletinfo
// index_personalinfo

   


function createWallet(req,res) {
   var handlerInfo   = {
    "apiModule": "users",
    "apiHandler":"signUpUser"
  };
    



   var private_key_hash    = req.body.private_key_hash;
   var public_key         = req.body.public_key;
   var wallet_id          = uniqueid.generate() ;


 var Query = "INSERT INTO wallet_info(private_keyhash,public_key,logged_on,wallet_id) VALUES($1,$2,$3,$4)";


  db.none(Query, [private_key_hash, public_key,new Date(),wallet_id])
    .then(function(result) {
        console.log("success")
       res.send({
      "log" : "Date inserted successfully",
      "wallet_id": wallet_id ,
      "flag" : constants.responseFlags.ACTION_COMPLETE

    });
    })
    .catch(error => {
 

        res.send({
        "log" : "Internal server error",
        "flag": constants.responseFlags.ACTION_FAILED,
        "error" : error
      });


    });

}

function getTransaction(req,res) {

     var handlerInfo   = {
    "apiModule": "users",
    "apiHandler":"getTransaction"
     };


  var transaction_id  = req.body.transaction_id ;

  client.getTransaction(txid)
  .then((result) => {
    console.log("Transaction details: " + JSON.stringify(result))


    res.send({

      "result" : JSON.stringify(result) ,
      "flag" : constants.responseFlags.ACTION_COMPLETE
      });



   })
   .catch(error => {
        // error;

        res.send({
        "log" : "Internal server error",
        "flag": constants.responseFlags.ACTION_FAILED,
        "error" : error
      });



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

        client.importAddress(asset_address,'',false).then((result) => console.log("Address Imported"));


       res.send({
      "log" : "Date inserted successfully",
      "result": result,
      "flag": constants.responseFlags.ACTION_COMPLETE
    });
    })
    .catch(error => {
  

        res.send({
        "log" : "Internal server error",
        "flag": constants.responseFlags.ACTION_FAILED ,
        "error" : error 
      });

 

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
      "result": data,
      "flag": constants.responseFlags.ACTION_COMPLETE
    });
    })
    .catch(function(error) {
        // error;

        res.send({
        "log" : "Internal server error",
        "flag": constants.responseFlags.ACTION_FAILED,
        "error" : error
      });

  

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
      "result": data,
      "flag": constants.responseFlags.ACTION_COMPLETE
    });
    })
    .catch(function(error) {
        // error;

        res.send({
        "log" : "Internal server error",
        "flag": constants.responseFlags.ACTION_FAILED ,
        "error" : error
      });



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

var utxo ;
var fees ;

var min_conf = 0
var max_conf = 99999

client.listUnspent(min_conf,max_conf,[address])
.then(function(unspent) {

var utxo = unspent ;

var sum = 0;
  for (var i = 0; i < unspent.length; i++) {
    sum += unspent[i].amount;
    
}
})



client.estimateSmartFee(blocks).then((result) => {
 
 fees = result;
 
  console.log("Fees: "+ result)
  });


console.log("Balance of given address is :" +  sum);

res.send({

"flag": constants.responseFlags.ACTION_COMPLETE ,
"balance" :  sum ,
"utxo" : utxo ,
"fees" : fees ,
"log" : "Data fetched successfully"

});



    .catch(error => {
        // error;

        res.send({
        "log" : "Internal server error",
        "flag": constants.responseFlags.ACTION_FAILED,
        "error" : error
      });



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

 
 var transaction_hash = req.body.transaction_hash ;




client.sendRawTransaction(txHash,true)
.then((transaction_ID) => {

  res.send({

    "log" : "Data fetched successfully" ,
    "result" : transaction_ID,
    "flag": constants.responseFlags.ACTION_COMPLETE


  })
})
  .catch(function(error) {
        // error;

        res.send({
        "log" : "Internal server error",
        "flag": constants.responseFlags.ACTION_FAILED,
        "error" : error
      });



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
      "flag": constants.responseFlags.ACTION_COMPLETE
    });
    })
    .catch(function(error) {
        // error;

        res.send({
        "log" : "Internal server error",
        "flag": constants.responseFlags.ACTION_FAILED,
        "error" : error
      });



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
      "flag": constants.responseFlags.ACTION_COMPLETE
    });
    })
    .catch(error => {
        // error;

        res.send({
        "log" : "Internal server error",
        "flag": constants.responseFlags.ACTION_FAILED ,
        "error" : error
      });



    });



}