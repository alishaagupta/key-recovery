var gcm            = require('node-gcm');
var request        = require('request');
var apns           = require('apn');
var constants      = require('./constants');
// var messenger      = require('./messenger');
// var logging        = require('./logging');
// var users          = require('./users');
// var crypto         = require('crypto');

exports.checkBlank                     = checkBlank;




function checkBlank(arr)
{
    var arrlength = arr.length;
    for (var i = 0; i < arrlength; i++)
    {
        if (arr[i] === '' || arr[i] === "" || arr[i] == undefined)
        {
            console.log("<<<< BLANK PARAMETER AT INDEX :"+i+">>>>"+arr[i]);
            return 1;
            break;
        }

    }

    return 0;
}
