
var Client                = require('bitcoin-core');


/*
* This constructor function defines the instance fields client and Client 
* instance it creates. 
*/



function Coins(asset_id,Client,port,host,username,password) {



    this.asset_id = this.asset_id
		this.Client   = this.Client
		client        = new Client(  { 
                             network : 'testnet',
                             port    : this.port,
                             host : this.host ,
                             username    : this.username,
                             password : this.password
                             });
}



  Coins.prototype.importAddress = function(address) {

      this.client.importAddress(address,'',false).then((result) => console.log("Address Imported"));
    }


  Coins.prototype.getBalance = function(address) {



          var min_conf = 0
          var max_conf = 99999

          client.listUnspent(min_conf,max_conf,[address]).then(function(unspent) {

          var sum = 0;
            for (var i = 0; i < unspent.length; i++) {
              sum += unspent[i].amount;
    
          }

          console.log("Balance of given address is :" +  sum);
          } )

          } ;



  Coins.prototype.createTransaction = function(address) {


                 var min_conf = 0 
                 var max_conf = 99999
                 client.listUnspent(min_conf,max_conf,[address]).then((unspent) => console.log("UTXO: " + JSON.stringify(unspent)));


                 var blocks = 6

                 client.estimateSmartFee(blocks).then((result) => {
                  
                   console.log("Fees: "+ result)
                   } );
             };

  
  Coins.prototype.broadcastTransaction = function(transactionHash) {

              client.sendRawTransaction(txHash,true).then((transactionID) => console.log("Transaction ID: " + transactionID));
             } ;



  Coins.prototype.getTransactionDetails = function(transactionID) {

              client.getTransaction(txid).then((result) => console.log("Transaction details: " + JSON.stringify(result)));
             }







