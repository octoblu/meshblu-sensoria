'use strict';
var util         = require('util');
var EventEmitter = require('events').EventEmitter;
var noble        = require('noble');
var async        = require('async');
var _            = require('lodash');
var debug        = require('debug')('meshblu-sensoria:index');
var parseSensoria = require('./parse-sensoria');

var MESSAGE_SCHEMA = {
  type: 'object',
  properties: {}
};

var OPTIONS_SCHEMA = {
  type: 'object',
  properties: {}
};

var SENSORIA_SERVICE = '1cac2e60020011e3898d0002a5d5c51b';
var SENSORIA_CHARACTERISTIC = '1cac2e60020111e3898d0002a5d5c51b';

function Plugin(){
  var self = this;
  self.options = {};
  self.messageSchema = MESSAGE_SCHEMA;
  self.optionsSchema = OPTIONS_SCHEMA;
  self.foundOne = false;

  return _.bindAll(this);
}
util.inherits(Plugin, EventEmitter);

Plugin.prototype.onMessage = function(message){
};

Plugin.prototype.onConfig = function(device){
  this.setOptions(device.options||{});
};

Plugin.prototype.setOptions = function(options){
  debug('setOptions');
  var self = this;
  self.options = options;

  async.waterfall([
    self.connectToSensoria,
    self.subscribeToSensoria
  ], function(error, characteristic){
    if(error){
      console.error('error: ', error);
      return;
    }

    characteristic.on('read', _.throttle(self.broadcastCharacteristic, 1000));

  });
};

Plugin.prototype.connectToSensoria = function(callback){
  debug('connectToSensoria');
  var self = this;
  noble.on('discover', function(peripheral){
    if (peripheral.advertisement.localName !== 'Sensoria-F1-0290') { return; }
    if(self.foundOne){return;}
    self.foundOne = true;
    debug('discovered', peripheral.uuid);

    peripheral.connect(function(error){
      callback(error, peripheral);
    });
  });
  noble.startScanning();
};

Plugin.prototype.subscribeToSensoria = function(peripheral, callback){
  debug('subscribeToSensoria');
  peripheral.discoverSomeServicesAndCharacteristics([SENSORIA_SERVICE], [SENSORIA_CHARACTERISTIC], function(error, services, characteristics){
    if(error){return callback(error);}

    var characteristic = _.first(characteristics);
    if(!characteristic){return callback('could not find heart rate characteristic');}

    characteristic.notify(true, function(error){
      callback(error, characteristic);
    });
  });
};

Plugin.prototype.broadcastCharacteristic = function(data){
  var sensorData = parseSensoria(data);
  debug('characteristic', sensorData);
  this.emit('data', {data: sensorData});
};


module.exports = {
  messageSchema: MESSAGE_SCHEMA,
  optionsSchema: OPTIONS_SCHEMA,
  Plugin: Plugin
};
