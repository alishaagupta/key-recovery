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

var utils                 = require('./commonfunctions.js');
var blockchain            = require('blockchain.info');
var async                 = require('async');


var blockexplorer         = require('blockchain.info/blockexplorer').usingNetwork(3);



exports.createWallet       = createWallet ;

exports.sendCoins          = sendCoins ;
exports.receiveCoins       = receiveCoins ;
exports.test               = test ;

exports.estimateFees      = estimateFees ;
// exports.currencyChange     = currencyChange ;
exports.initialiseCoin     = initialiseCoin ;
exports.checkBalance       = checkBalance;
exports.getTransaction     = getTransaction ;

exports.inactiveAssets     = inactiveAssets;
exports.showAllCoins       = showAllCoins ;
exports.login              = login ;
exports.fetchData          = fetchData ;


exports.sendOTP            = sendOTP ;
exports.verifyOTP          = verifyOTP ;
exports.addFriends         = addFriends ;
exports.sendRecoveryOtp    = sendRecoveryOtp ;
exports.verifyRecoveryOtp  = verifyRecoveryOtp;

var shortid               = require('shortid');


const nodemailer   = require('nodemailer');
var sendgrid       = require('sendgrid')(process.env.SENDGRID_API_KEY);



const pg = require('pg');
var pgp = require('pg-promise')(/*options*/)


var db = pgp('postgres://postgres:test@139.59.12.120:5432/maxwallet')


// index_walletinfo
// index_personalinfo


function sendRecoveryOtp(req,res) {

     var handlerInfo   = {
    "apiModule": "users",
    "apiHandler":"Send Recovery Otp"
  };
 
   var email     = req.body.email ;
   var otp       = Math.floor((Math.random()*1000000)+1);
   var sessionId = shortid.generate();
  

  if(utils.checkBlank([email])) {
    return res.send(constants.parameterMissingResponse);
  }

  // insert email data in wallet_info 


  var Query = "SELECT * FROM wallet_info where email=$1";


  db.any(Query,[email])
    .then(function(result) {

        if(result.length == 0) {
         return res.send({
            "log" : "User has not set up recovery" ,
            "flag" : constants.responseFlags.ACTION_FAILED
          })
        }
    
      else {

        sendgrid.send({

        to: email,
        from: 'alisha@vevsatechnologies.com',
        subject:'Email Verification',
        text:'',
        html: 'Hello,<br><br>'+
                    'In order to complete your recovery process, you must fill the following<br>'+
                    'code on your Verification screen: '+otp+'<br><br>'+
                    'Thank you for verifying yourself.'
      }, 

      function(err, json) {
        if (err) { return console.error(err); }

        insertQuery = "INSERT INTO tb_otp(otp,email,session_id,created_on) VALUES ($1,$2,$3,$4)";
        db.none(insertQuery,[otp, email,sessionId,new Date()])
        .then(function(logErr, logRes) {
        if(logErr) {
          return res.send({
            "log": "There was some error in generating otp",
            "flag": constants.responseFlags.ACTION_FAILED,
            "err":logErr
          });
        }
   

          if(logErr) {
            return res.send({
              "log": "Error in creating user",
              "flag": constants.responseFlags.ACTION_FAILED
            });
          }


          res.send({
            "log": "Otp sent successfully",
            "session_id": sessionId,
            "flag": constants.responseFlags.ACTION_COMPLETE
          });
      });
        console.log(json);
      });
  

      }
      
    })
    .catch(error => {
 

        res.send({
        "log" : "Internal server error",
        "flag": constants.responseFlags.ACTION_FAILED,
        "error" : error
      });


    });



    // send otp and insert data in tb_otp


}


function verifyRecoveryOtp(req,res){

  var handlerInfo = {
    "apiModule" : "users" ,
    "apiHandler" : "Verify Recovery OTP"
  }

  var otp = req.body.otp ;
  var session_id = req.body.session_id ;
  var email = req.body.email ;


  var Query  = "SELECT * from tb_otp WHERE (otp = $1 AND session_id = $2)" ;


    db.any(Query,[otp,session_id])
    .then(function(data){
        // success;
     
      if(data.length == 0) {

        return res.send({
          "log": "Verification Failed",
          "flag" : constants.responseFlags.ACTION_FAILED
        })
                 

        }


        else {

          newQuery = "SELECT * from wallet_info where email = $1" ;

          db.one(newQuery,[email])
          .then(function(result){

            res.send({
              "log" : "User fetched data" ,
              "flag" : constants.responseFlags.ACTION_COMPLETE,
              "result" : result

            })
          })
        }
      })
        //update data in wallet_info 
     


    .catch(function(error) {
        // error;

        res.send({
        "log" : "Internal server error",
        "flag": constants.responseFlags.ACTION_FAILED,
        "error" : error.message
      });

    });


}



function addFriends(req,res) {

    var handlerInfo   = {
    "apiModule": "users",
    "apiHandler":"add friends"
  };
   

   var public_key = req.body.public_key ;

Query = "SELECT * FROM wallet_info where public_key=$1" ;

db.any(Query,[public_key])
.then(function (data) {

  if(data.length == 0) {

    res.send({
            "log" : "user does not exist",
            "flags" : constants.responseFlags.ACTION_FAILED

    })
  }


  else {

    res.send({

      "log" : "Friend can be added" ,
      "flags" : constants.responseFlags.ACTION_COMPLETE
     })
  }
})


}

function sendOTP(req,res) {

    var handlerInfo   = {
    "apiModule": "users",
    "apiHandler":"sendOTP"
  };
   
        var email     = req.body.email ;
        var otp       = Math.floor((Math.random()*1000000)+1);
        var sessionId = shortid.generate();
  

  // check if email exists 

  checkQuery  = "SELECT * FROM wallet_info where email=$1" ;
  db.any(checkQuery,[email])
    .then(function (data) {

        if(data.length != 0) {

          res.send({
            "log" : "user already exists",
            "flags" : constants.responseFlags.ACTION_FAILED
          })
        }
        else {

        sendgrid.send({

        to: email,
        from:'alisha@vevsatechnologies.com',
        subject:'Email  Verification',
        text:'',
        html:'Hello,<br><br>'+
                    'In order to complete your recovery process, you must fill the following<br>'+
                    'code on your Verification screen: '+otp+'<br><br>'+
                    'Thank you for verifying yourself.'
      }, 

      function(err, json) {
        if (err) { return console.error(err); }

        insertQuery = "INSERT INTO tb_otp(otp,email,session_id,created_on) VALUES ($1,$2,$3,$4)";
        db.none(insertQuery,[otp, email,sessionId,new Date()])
        .then(function(logErr, logRes) {
        if(logErr) {
          return res.send({
            "log": "There was some error in generating otp",
            "flag": constants.responseFlags.ACTION_FAILED,
            "err":logErr
          });
        }
   

          // if(logErr) {
          //   return res.send({
          //     "log": "Error in creating user",
          //     "flag": constants.responseFlags.ACTION_FAILED
          //   });
          // }


          res.send({
            "log": "Otp sent successfully",
            "session_id": sessionId,
            "flag": constants.responseFlags.ACTION_COMPLETE
          });
      });
        console.log(json);
      });
  


        }

      })




}


function verifyOTP(req,res) {

  var handlerInfo = {
    "apiModule": "users",
    "apiHandler":"verifyOTP"

  }

  var otp            = req.body.otp ;      
  var session_id     = req.body.session_id ;
  var email          = req.body.email ;
  var public_key     = req.body.public_key ;



  var Query  = "SELECT * from tb_otp WHERE (otp = $1 AND session_id = $2)" ;


  db.any(Query,[otp,session_id])
    .then(function(data){
        // success;
        console.log("success")
      if(data.length != 0) {

        //update data in wallet_info 
      updateQuery = "UPDATE wallet_info SET email=$1 , email_status=1 where public_key=$2";


  db.none(updateQuery,[email,public_key])
    .then(function(result) {
        console.log("user data updated with email")
      })

    .catch(error => {
 

        res.send({
        "log" : "Internal server error",
        "flag": constants.responseFlags.ACTION_FAILED,
        "error" : error
      });


    });

       res.send({
      
      "log" : "User Verified",
      "result": data,     // api call to recovery service 
      "flag": constants.responseFlags.ACTION_COMPLETE
    });
     }

     else {
      res.send({
        "log" : "Verification Failed" ,
        "flag" : constants.responseFlags.NOT_FOUND
      })
     }
    })
    .catch(function(error) {
        // error;

        res.send({
        "log" : "Internal server error",
        "flag": constants.responseFlags.ACTION_FAILED,
        "error" : error.message
      });

    });
}

function createWallet(req,res) {
   var handlerInfo   = {
    "apiModule": "users",
    "apiHandler":"signUpUser"
  };
    



   var private_key_hash   = req.body.private_key_hash;
   var public_key         = req.body.public_key;
   var wallet_id          = uniqueid.generate() ;


  if(utils.checkBlank([private_key_hash, public_key, wallet_id])) {
    return res.send(constants.parameterMissingResponse);
  }

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


// dependng on asset id this functionality is defined
function getTransaction(req,res) {

     var handlerInfo   = {
    "apiModule": "users",
    "apiHandler":"getTransaction"
     };

  // var asset_id        = req.body.asset_id ;
  var transaction_id  = req.body.transaction_id ;


 if(utils.checkBlank([transaction_id])) {
    return res.send(constants.parameterMissingResponse);
  }


  client.getTransaction(transaction_id,true)
  .then((result) => {
    console.log("Transaction details: " + JSON.stringify(result))


    res.send({

      "result" : result ,
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



   if(utils.checkBlank([asset_id,wallet_id,asset_address,asset_data])) {
    return res.send(constants.parameterMissingResponse);
  }

var Query = "INSERT INTO personal_info(asset_id,wallet_id,asset_data,created_on) VALUES($1,$2,$3,$4)";


  db.none(Query, [asset_id,wallet_id,asset_data, new Date()])
    .then(function(result) {
        // success;
        console.log("success")

        client.importAddress(asset_address,'',false).then((result) => console.log("Address Imported"));


       res.send({
      "log" : "Data inserted successfully",
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



function checkBalance(req,res) {
 var handlerInfo = {
    "apiModule" : "users",
    "apiHandler" : "Submit"
  };



 var addresses =  [];
 addresses =req.body.addresses ;

console.log(addresses);
  
var utxo ;

var sum ;

var min_conf = 0
var max_conf = 99999


                                                                      
client.listUnspent(min_conf,max_conf,addresses)
.then(function(unspent) {



sum = 0;
  for (var i = 0; i < unspent.length; i++) {
    sum += unspent[i].amount;
    
}

res.send({

"flag": constants.responseFlags.ACTION_COMPLETE ,
"balance" :  sum ,
"utxo" : unspent ,
"log" : "Data fetched successfully"

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




function test(req,res) {

  var handlerInfo = {
    "apiModule" : "users",
    "apiHandler" : "Submit"
  };


  var address = req.body.address ;


   if(utils.checkBlank([address])) {
    return res.send(constants.parameterMissingResponse);
  }

var utxo ;

var sum ;

var min_conf = 0
var max_conf = 99999
var blocks=6 

client.listUnspent(min_conf,max_conf,[address])
.then(function(unspent) {

utxo = unspent ;
console.log((utxo))
sum = 0;
  for (var i = 0; i < unspent.length; i++) {
    sum += unspent[i].amount;
    
}

res.send({

"flag": constants.responseFlags.ACTION_COMPLETE ,
"balance" :  sum ,
"utxo" : utxo ,
"log" : "Data fetched successfully"

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


function estimateFees(req,res){

  var blocks = 6 ;

  client.estimateSmartFee(blocks)
.then((result) => {
 
 // fees =  result;

res.send({

"flag": constants.responseFlags.ACTION_COMPLETE ,
"fees" :  result,
"log" : "Data fetched successfully"

});


  // console.log("Fees: "+ JSON.stringify(result.feerate));
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


   if(utils.checkBlank([transaction_hash])) {
    return res.send(constants.parameterMissingResponse);
  }

client.sendRawTransaction(transaction_hash,true)
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
        "flag": constants.responseFlags.NOT_FOUND,
        "error" : error.message
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

 var addresses = [] ;
addresses = req.body.addresses ;


var resultArr = [] ;

function getUtxo(callback) {

    client.listUnspent(0,99999,addresses)
     .then(function(unspent) 
     {
       callback(null,unspent);
      }
    );
    

}
 


function balanceDetails(callback){

blockexplorer.getMultiAddress(addresses,{apiCode : "bed9e8b8-5130-4fc3-9f21-df7e026cc55a"})
.then((result) =>{
    callback(null,result);
  })

}

resultArr.push(getUtxo,balanceDetails);

async.parallel(resultArr,function(newErr,newRes){

  var utxo = newRes[0]  ;
  var result   = newRes[1] ;


    res.send({

    "log" : "Data Fetched Successfully",
    "result" : result ,
    "utxo"  : utxo,
    "flag": constants.responseFlags.ACTION_COMPLETE

  })
})




}


function login(req,res) {



  var handlerInfo = {
    "apiModule" : "users",
    "apiHandler" : "createKeys"
  };

 
var private_key_hash = req.body.private_key_hash ;
var public_key      = req.body.public_key ;


   if(utils.checkBlank([private_key_hash,public_key])) {
    return res.send(constants.parameterMissingResponse);
  }

 var Query = "SELECT wallet_id FROM wallet_info where private_keyhash=$1 AND public_key=$2";


  db.one(Query,[private_key_hash,public_key])
    .then(function(data){
        // success;
        console.log("success")
      if(data.length != 0)
       res.send({
      "log" : "Data fetched successfully",
      "result": data,
      "flag": constants.responseFlags.ACTION_COMPLETE
    });

     else {
      res.send({
        "log" : "User does not exist" ,
        "flag" : constants.responseFlags.NOT_FOUND
      })
     }
    })
    .catch(function(error) {
        // error;

        res.send({
        "log" : "Internal server error",
        "flag": constants.responseFlags.ACTION_FAILED,
        "error" : error.message
      });



    });
}

function fetchData(req,res) {



  var handlerInfo = {
    "apiModule" : "users",
    "apiHandler" : "createKeys"
  };

 
var wallet_id = req.body.wallet_id ;

   if(utils.checkBlank([wallet_id])) {
    return res.send(constants.parameterMissingResponse);
  }

 var Query = "SELECT asset_id,asset_data FROM personal_info where (wallet_id=$1)";


  db.one(Query,[wallet_id])
    .then(function(data){
      

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
        "flag": constants.responseFlags.NOT_FOUND,
        "log" : error.message
      });



    });
}






// function currencyChange(req,res) {


//   var handlerInfo = {
//     "apiModule" : "users",
//     "apiHandler" : "Submit"
//   };


//  var wallet_id                  = req.body.wallet_id;
//  var asset_value_currency       = req.body.asset_value_currency ;



//  var Query = "SELECT asset_id FROM personal_info where wallet_id=$1";


//   db.none(Query, [wallet_id])
//     .then(function(result){
//         // success;
//         console.log("success")
//        res.send({
//       "log" : "Date inserted successfully",
//       "data": result,
//       "flag": constants.responseFlags.ACTION_COMPLETE
//     });
//     })
//     .catch(error => {
//         // error;

//         res.send({
//         "log" : "Internal server error",
//         "flag": constants.responseFlags.ACTION_FAILED ,
//         "error" : error
//       });



//     });



// }