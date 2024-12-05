var VdVcDtaValidationMgr = function () {
	var validateNumbers = function(value) {
		if (/^[0-9\+\-\.]*$/.test(value)){
			return true;
		}
		return false;
	};
	var validatePercentage = function(value) {
		if (/^[0-9%+\-\.]*$/.test(value)){
			return true;
		}
		return false;
	};
	var validateCurrency = function(value) {
		if (/^[0-9\+\-\.]*$/.test(value)){
			return true;
		}
		return false;
	};
	var validateText = function(value) {
		return true;
	};
	var validateDate = function(value) {
		return true;
	};
	var validateTime = function(value) {
		return true;
	};
	var map = {};
	map.Number = validateNumbers;
	map.Percentage = validatePercentage;
	map.Currency = validateCurrency;
	map.General = validateText;
	map.Text = validateText;
	map.Date = validateDate;
	map.Time = validateTime;
	
	this.validate = function(value,measure) {
		var dataType = measure.dataType;
		if (typeof map[dataType] == "function") {
			var m = map[dataType];
			return m(value);
		}
	};
};