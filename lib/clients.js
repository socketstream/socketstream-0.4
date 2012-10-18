/*
   
   Clients
   -------
   Allow actions (such as sending code or packing assets to be performed on ALL clients simultaneously)

*/

var util = require('util'),
    Code = require('./client/code')

Clients = function(){

  this.collection = []

  this.code = new Code

  this.add = function(newClient){
    this.collection.push(newClient)
  }

}

module.exports = Clients