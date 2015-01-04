/*

 mtb1 = characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_UINT16, 3);
 mtb5 = characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_UINT16, 5);
 heel = characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_UINT16, 7);
 tick = characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_UINT32, 9);
 accX = byteToGs(characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_UINT8, 0));
 accY = byteToGs(characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_UINT8, 1));
 accZ = byteToGs(characteristic.getIntValue(BluetoothGattCharacteristic.FORMAT_UINT8, 2));

 */

function byteToGs(b) {
  var val;

  if (b < 128) {
    val = 0.03125 * b;
  } else {
    val = 0.03125 * -(256 - b);
  }

  return val;
}


var parseSensoria = function(data){
  var sensorData = {
    accX: byteToGs(data.readUInt8(0)),
    accY: byteToGs(data.readUInt8(1)),
    accZ: byteToGs(data.readUInt8(2)),
    mtb1: data.readUInt16LE(3),
    mtb5: data.readUInt16LE(5),
    heel: data.readUInt16LE(7),
    tick: data.readUInt32LE(9)
  };

  return sensorData;
};

module.exports = parseSensoria;
