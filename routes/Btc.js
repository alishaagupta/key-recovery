var Coins     = require('./Coins.js');



function Btc(){

}

// Create sub class of Coins class

Btc.prototype = inherit(Coins.prototype); // Subclass inherits from superclass
Btc.prototype.constructor = Btc;


extend(Coins.prototype, {

	constructor: Coins,
	asset_id: 0 ,
	Client: 'bitcoin-core',
	host: '206.189.135.167',
	port: 18332,
	password: 'test123',
	username: 'test'

})