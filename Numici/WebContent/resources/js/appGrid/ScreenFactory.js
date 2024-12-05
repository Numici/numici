/**
 * New node file
 */

var ScreenFactory = {
		_map: {
			"Regular": "RegularScreen",
			"Popup":"PopupScreen"
		},
		
		createInstance: function (ctrlType, options) {
			return new RegularScreen(options);
		}
	};