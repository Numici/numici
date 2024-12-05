/**
 * 
 */

var VAppgenControls = (function() {
	var controls;
	var closure = this;
	
	/*
	 * Function to fetch and list the controls
	 */
	this.listControls = function(drawControls) {		
		Util.ajaxGet ("vappgen/controls", function(result){
				if (!result.Status) {
					Util.showMessage (result.Message);				
				} else {
					closure.controls = result.Controls;
					if (typeof drawControls === "function") {
						drawControls(closure.controls);
					}
				}
			});
	};
/*	
	this.getMatchingControlAttrs = function(ctrlName){
	 	for (var i=0; i < this.controls.length; i++){
	   		   if (ctrlName == this.controls[i].name) {
	   			   return this.controls[i];
	   		   }
  	   	}    	   
  	   	return null;
	};
	
	this.isContainer = function(ctrlName){
	 	for (var i=0; i < this.controls.length; i++){
	   		   if (ctrlName == this.controls[i].name) {
	   			   return this.controls[i].container;
	   		   }
  	   	}  	   	
	};
*/
	return this;
})();