//This module provides dataFormatting 

var VdVcDataFmtManager = function() {
	
	var isSpecialChar = function(value) {
		if (/^[\+\-\.%]*$/.test(value)){
			return true;
		}
		return false;
	};
	this.handleDataFormat = function(value,measure) {
		var dataObj = {};
		dataObj.fmtData = value;
		dataObj.unFmtData = value;
		dataObj.dataType = measure.dataType;
		dataObj.isNumber = false;
		if (measure.format && measure.format.trim() != "" && value.trim() != "" && !isSpecialChar(value)) {
			try {
				dataObj.fmtData = numeral(value).format(measure.format);
				dataObj.unFmtData = numeral().unformat(value);
				dataObj.isNumber = true;
			} catch(err){
				console.log("err :"+err.message);
			}
			
		} 
		return dataObj;
	};

	this.unformatData = function(value,measure) {
		var dataObj = {};
		dataObj.fmtData = value;
		dataObj.unFmtData = value;
		dataObj.dataType = measure.dataType;
		if (measure.format && measure.format.trim() != "" && value.trim() != "") {
			try {
				dataObj.unFmtData = numeral().unformat(value);
			} catch(err){
				console.log("err :"+err.message);
			}
		}
		return dataObj;
	};
	return this;
	
};
