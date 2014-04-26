// JavaScript code for the BLE Scan example app.

// Application object.
var app = {};

// Device list.
app.devices = {};
app.beacons = {};

// UI methods.
app.ui = {};

app.initialize = function()
{
  console.log('here jason');
	document.addEventListener('deviceready', this.onDeviceReady, false);
	
	// Important to stop scanning when page reloads/closes!
	window.addEventListener('beforeunload', function(e) {
		app.stopScan();
	});

};



app.onDeviceReady = function()
{

  setTimeout( function(){

    var ref = window.open('http://jlchat.herokuapp.com/wall_login', '_blank', 'location=yes');

    ref.addEventListener('loadstart', function(event){
      if (( event.url == 'http://jlchat.herokuapp.com/wall') || (event.url == 'https://jlchat.herokuapp.com/wall') ) {
        ref.close();
      }
    });

  }, 1000);

};

// Start the scan. Call the callback function when a device is found.
// Format:
//   callbackFun(deviceInfo, errorCode)
//   deviceInfo: address, rssi, name
//   errorCode: String
app.startScan = function(callbackFun)
{
	app.stopScan();
	iBeacon.startScan({ nice_uuid: '20cae8a0a9cf11e3a5e20800200c9a66' },
		function(device)
		{
			// Report success.
			callbackFun(device, null);
		},
		function(errorCode)
		{
			// Report error.
			callbackFun(null, errorCode);
		}
	);
};

// Stop scanning for devices.
app.stopScan = function()
{
	evothings.ble.stopScan();
};

// Called when Start Scan button is selected.
app.ui.onStartScanButton = function()
{
	app.startScan(app.ui.deviceFound);
	app.ui.displayStatus('Scanning...');
};

// Called when Stop Scan button is selected.
app.ui.onStopScanButton = function()
{
	app.stopScan();
	app.devices = {};
	app.beacons = {};
	app.ui.displayStatus('Scanning turned off');
	app.ui.displayDeviceList();
};

// Called when a device is found.
app.ui.deviceFound = function(beacon, errorCode)
{
	if (beacon)
	{
    // console.log("beacon found: "+beacon.address+" "+beacon.name+" "+beacon.rssi+"/"+beacon.txPower);
    // console.log("M"+beacon.nice_major+" m"+beacon.nice_minor+" uuid "+beacon.nice_uuid);
    var key = 'tx'+beacon.address.replace(/:/g,'_');
    // console.log('key: '+key);
    if (app.beacons[key] == null) {
      app.beacons[key] = beacon;
    } else {
      app.beacons[key] = beacon;
    }
    console.log("beacon");

		// Display device in UI.
		//app.ui.displayDeviceList();

    $.ajax({
      url: 'https://jlchat.herokuapp.com/device',
      type: 'GET',
      dataType: 'json',
      data: {
        address: beacon.address,
        name: beacon.name,
        rssi: beacon.rssi,
        txPower: beacon.txPower,
        uuid: beacon.nice_uuid,
        estimatedDistance: beacon.estimatedDistance,
        major: beacon.nice_major,
        minor: beacon.nice_minor
      } ,
      success: function(data) {
        console.log("device success");
        console.log(data);
      }
    })

	}
	else if (errorCode)
	{
		app.ui.displayStatus('Scan Error: ' + errorCode);
	}
};

// Display the device list.
app.ui.displayDeviceList = function()
{
	// Clear device list.
	$('#found-devices').empty();

	var i = 1;
	$.each(app.devices, function(key, device)
	{
		// Set background color for this item.

		// Create a div tag to display sensor data.
		var element = $(
			'<li class="topcoat-list__item">'
			+	'<b>' + device.name + '</b><br/>'
			+	device.address + '<br/>'
      + device.rssi+"/"+device.txPower + "\u00A0" + device.estimatedDistance.toFixed(2) + 'm' + '<br/>'
			+	 device.nice_major + " \u00A0 "+ device.nice_minor + '<br/>'
      + device.nice_uuid
			+ '</li>'
		);

		$('#found-devices').append(element);
	});
};

// Display a status message
app.ui.displayStatus = function(message)
{
	$('#scan-status').html(message);
};



app.initialize();






