;(function() {
	'use strict';
	
	// This is the function.
	String.prototype.format = function (args) {
		var str = this;
		return str.replace(String.prototype.format.regex, function(item) {
			var intVal = parseInt(item.substring(1, item.length - 1));
			var replace;
			if (intVal >= 0) {
				replace = args[intVal];
			} else {
				replace = "";
			} 
			return replace;
		});
	};
	
	String.prototype.format.regex = new RegExp("{-?[0-9]+}", "g");
	
})();