var ScalarControl = VidiViciControl.extend({
	constructor : function(options){
		VidiViciControl.apply(this,arguments);
		this.controlType = "ScalarControl";
		/*this.designerData = {
				"s1" :{
					"type" :"slider",
					"min" : 10,
					"max" : 1000
				},
				"s2" :{
					"type" :"textbox",
					"min" : 10,
					"max" : 1000
				},
		};*/
	},
	
	
	renderLayout : function() {
		var c = this;
		var el = c.renderContainer();
		el.addClass("vapp-control");
		el = Control.prototype.renderLayout.call(this);
		return el;
	},
	
	
	getLayout : function(markup){

		var c = this;
		var el = c.el;
		
		var attributes = c.attributes;
		$(el).find(".ctrl-wrapper").remove();

		var ctrlMarkup = '<div class="ctrl-wrapper grid-stack-item-content">\
							<div class="ctrl-toolbar">\
								 <div class="ctrl-titlebar"  style="width:50%;float:left;">\
								  <span class="ctrl-name"></span>\
								 </div>\
								<div class="ctrl-tools"  style="width:40%;float:right;">\
								 <span class="fa fa-gear" style="margin:2px;float:right;"  data-menu="config">\
									<div class="vdvc-flymenu" menu-id="config">\
										<div class="vdvc-top-arrow"></div>\
										<span menu-item="props" class="vdvc-menu-item">Properties</span>\
										<span menu-item="config" class="vdvc-menu-item">Config</span>\
						 			</div>\
							 	</span>\
			 					<span class="fa fa-tag" style="margin:2px;float:right;" title="Tag"></span>\
								</div>\
							</div>\
							<div class="ctrl-content" style="overflow:auto;"></div>\
					  </div>';
		$(el).append(ctrlMarkup);
		$(el).find(".ctrl-name").append(c.name);
		var controlHeight = $(el).height();
		var contentHeight = controlHeight-($(el).find(".ctrl-title").height()+$(el).find(".ctrl-toolbar").height());
		$(el).find(".ctrl-content").height(contentHeight).append(markup);
		$(el).find("div[data-id='accordion']").accordion({
			  collapsible: true,
			  active: false
		});
	},

	addEvents : function() {
		var c = this,
			el = c.el;
		var id=el.attr("id");
		var parent="#"+id;
		Control.prototype.addEvents.call(this ,parent);
	
		$(el).find(".ctrl-content").off("mousedown").on("mousedown",function(e){
			e.stopPropagation();
		});
		
		$(el).find(".ctrl-content input").off("blur").on("blur",function(e){
			e.stopPropagation();
			var scalar = $(this).data("scalar");
			var value = $(this).val();
			c.handleScalarChange(scalar,value);
		});
	},
	
	handleScalarChange : function(scalar,value) {
		
	
		if (!$.isEmptyObject(scalar) && window.vAppController && vAppController.vapp) {
			var vappId = vAppController.vapp.vappId;
			var wid = vAppController.vapp.currentWorkspace;
			var url = "workspace/savescalar/"+vappId+"/"+wid;
			if (value != scalar.value) {
				scalar.value = value;
				var pstData = {
					    "id": scalar.id,
					    "modelId": scalar.modelId,
					    "workspaceId": scalar.workspaceId,
					    "value": value,
					    "dataType": scalar.dataType,
					    "scalarName": scalar.scalarName,
					    "computed": scalar.computed,
					  };
				
				vAppController.vapp.isChanged = true;
				Util.ajaxPost(url,pstData,function(result){
					if(!result.Status) {
						Util.showMessage(result.Message);
					}
				});
			}
		}
	},
	
	
	getScalarByName : function(name) {
		var c = this,scalars = null,scalar = null;
		if(window.vAppController && vAppController.vapp) {
			scalars = vAppController.vapp.scalars;
		} 
		if (scalars ) {
			$.each(scalars,function(i,sclr){
				if(sclr.scalarName == name) {
					scalar = sclr;
				}
			});
		}
		return scalar;
	},
	
	renderUi : function() {
		var c = this,table = "";
		var config = c.designerData;
		if ( config) {
			table = $('<table style="width:100%;" class="table table-striped table-condensed">');
			var tb = $('<tbody>');
			table.append(tb);
			
			$.each(config,function(key,cfg){
				var sclr = c.getScalarByName(key);
				if (sclr) {
					var tr = $('<tr>');
					var td1 = $('<td>');
					var td2 = $('<td>');
					tr.append(td1);
					tr.append(td2);
					tb.append(tr);
					switch(cfg["type"]) {
					case "TextBox" :
						var input = $('<input type="text" style="width:100%;">');
						input.val(sclr.value);
						input.data("scalar",sclr);
						td1.text(sclr.scalarName);
						td2.append(input);
						break;
					case "Slider" :
						var sliderVal = $('<div class="slider-val" style="color:orange;text-align:center;padding:5px;">');
						var slider = $('<div>');
						slider.data("scalar",sclr);
						td1.text(sclr.scalarName);
						td2.append(sliderVal);
						sliderVal.html(sclr.value);
						td2.append(slider);
						var min = parseFloat(cfg.min);
						var max = parseFloat(cfg.max);
						slider.slider({
							value : sclr.value,
							min : !isNaN(min) ? min : 0,
							max : !isNaN(max) ? max : 1000,
							slide: function( event, ui ) {
							    $(this).siblings(".slider-val").html(ui.value );
							},
							change : function(event, ui) {
								var scalar = $(this).data("scalar");
								c.handleScalarChange(scalar,ui.value);
							}
						});
						break;
					}
						
				}
			});
		}
		return table;
	},
	
	
	restructureData: function (data) {
		var info = {};

		info.type = data.inptype;
		info.label = data.label;
		info.min = data.min;
		info.max = data.max;
		
		var obj = {};
		obj.name = data.scalar;
		obj.data = info;
		
		return obj;
	},
	
	readDesignDataProperties: function () {
		var usrInputs = $(".designDataUserInputs");
		var designData={};
		if (usrInputs.length > 0) {
		 	$.each(usrInputs,function(i,v){
		 	 	if ($(v).attr("datatype") == "boolean") {
		 	 		designData[$(v).attr("dataattr")] = $(v).prop('checked');
		 		} else {
		 			var val = $(v).val();
		 			if (val != null && val != "") {
		 				designData[$(v).attr("dataattr")] = $(v).val();
		 			}
		 		}
			});
		}	

		var object = this.restructureData(designData);
		return object;
	},
	
	saveScalarData: function () {
		console.log ("Saving the scalar designer data ...!!");	 
		console.log ("Scalar desiner data as JSON: "+ JSON.stringify(this.scalarsData) );
		this.setCustomDesignerData(this.scalarsData);
	 
		this.render(); 	
	},
	
	validDesignDataProperties: function (data) {
		console.log ("Validation the scalar configuration values ...!!");
		var obj = {};

		obj.status = true;
		obj.msg = null;
		if (!data) {
			obj.msg = "Invalid scalar designer data ..!!";
			obj.status = false;
			return obj;
		}

		if (!data.name || data.name == "NONE") {
			obj.msg = "Please select a valid scalar ...!!";
			obj.status = false;
			return obj;
		}

		if (!data.data && (data.data.type || data.data.type == "NONE")) {
			obj.msg = "Please select valid scalar input type";
			obj.status = false;
			return obj;
		}
		if (data.data && data.data.type && data.data.type == "TextBox") {
			if (!data.data.label) {
				obj.msg = "Please enter valid label";
				obj.status = false;
				return obj;
			}
		}
		if (data.data && data.data.type && data.data.type == "Slider") {
			if (!data.data.min) {
				obj.msg = "Please enter valid min value";
				obj.status = false;
				return obj;
			}
			if (!data.data.max) {
				obj.msg = "Please enter valid max value";
				obj.status = false;
				return obj;
			}
		}

		return obj;
	},
	addScalarData: function () {
		console.log ("Adding the scalar to local designer data ...!!"); 

		var sd = this.readDesignDataProperties(); 
		var validObj = this.validDesignDataProperties(sd);
		if (!validObj.status) {
			Util.showMessage (validObj.msg);
			return false;
		}

		this.scalarsData[sd.name] = sd.data;
		Util.showMessage ("Scalar: "+sd.name+" added successfully");
		return true;
	},
	
	removeScalarData: function() {
		var name =  $('div[ui-role="scalarConfig"]').find("select[ dataattr='scalar']").val();		 
		if (name == "NONE") {
			Util.showMessage ("Please select a valid Scalar");
			return false;
		}
		
		var c = this;
		var ds = this.scalarsData[name];
		if (!ds) {
			Util.showMessage ("Scalar : "+name +" is not available in saved data to remove ..!!");
			return;
		} else {
			Util.promptDialog ("Do you really want to delete the filter with scalar: "+name +"?",
					function(){
						delete c.scalarsData[name];						 
						Util.showMessage ("Selected scalar : "+name+ " deleted sucessfully ...!!");
						var scDiv = $('div[ui-role="scalarConfig"]').find("select[dataattr='scalar']");
						scDiv.val("NONE");
						scDiv.trigger("change");
						return;
					},
					function () {
						console.log ("No button was selected by user in deleting the scalar ...!!");
					},
					null);
		}
	},
	
	
	launchConfig : function(customData) {
		$( document ).off("change","select[ dataattr='scalar']").on("change","select[ dataattr='scalar']",function() {
			var element = $(this);
			var val = element.val();
			var scalarName =element.find('option[value="'+val+'"]').text();			
		 	var inptypeDiv = $('div[ui-role="scalarConfig"]').find("select[dataattr='inptype']");		 

			if (scalarName == "NONE") {
				inptypeDiv.prop('selectedIndex', 0);
				
				return;
			} else {				
				if (customData && customData[scalarName]) {
					var inpVal = customData[scalarName].type;
					inptypeDiv.val(inpVal);
				}
			}
			
			inptypeDiv.trigger("change");
		});
		
		$( document ).off("change","select[ dataattr='inptype']").on("change","select[ dataattr='inptype']",function() {
			var element = $(this);
			var val = element.val();
			var inputType =element.find('option[value="'+val+'"]').text();
			
		 	var labelDiv = $('div[ui-role="scalarConfig"]').find("input[dataattr='label']");	
		 	var minDiv = $('div[ui-role="scalarConfig"]').find("input[dataattr='min']");	
		 	var maxDiv = $('div[ui-role="scalarConfig"]').find("input[dataattr='max']");
		 	var scalarName = $('div[ui-role="scalarConfig"]').find("select[dataattr='scalar']").val();
		 	
		 	$('div[ui-role="scalarConfig"]').find(".scalarInputs").show();
		 	$('div[ui-role="scalarConfig"]').find(".textInputs").show();
		 	
			if (inputType == "TextBox") {
				$('div[ui-role="scalarConfig"]').find(".scalarInputs").hide();				 
			} else if (inputType == "Slider") {
				$('div[ui-role="scalarConfig"]').find(".textInputs").hide();				
			}
			
			if (inputType == "NONE") {
				labelDiv.val("");
				minDiv.val("");
				maxDiv.val("");				
				return;
			} else {
				if (customData && customData[scalarName]) {
					if (inputType == "TextBox") {
						var labelVal = customData[scalarName].label;
						$(labelDiv).val(labelVal);						 
					} else { // For slider
						var minVal = customData[scalarName].min;
						var maxVal = customData[scalarName].max;						 
						$(minDiv).val(minVal);
						$(maxDiv).val(maxVal);
					}					
				} else {
					$(minDiv).val("");
					$(maxDiv).val("");
					$(labelDiv).val("");	
				}
			}			
		
		});
		
		var c = this ;
		this.scalarsData = {};
		var scalars = null;
		 		
		// Assign the custom data
		if (customData) {
			this.scalarsData = customData;
		}
		
		if(window.vAppController && vAppController.vapp) {
			scalars = vAppController.vapp.scalars;
		} 
		
		if (scalars) {
			var markup = c.getHtmlConfigMarkup(scalars, this.scalarsData);
			var title = "Scalar Configuration";
			c.promptUserForScalarConfig(markup, title);
			
			if (this.scalarsData) {
				for (var i=0; scalars && i < scalars.length; i++) {
					var name = scalars[i].scalarName;
					var present = this.isScalarPresentInCurrentConfig (name, this.scalarsData);
					if (present) {
						$("select[ dataattr='scalar']").val(name);
						$("select[ dataattr='scalar']").trigger("change");
						break;
					}
				}
			}
		}
	},
	
	isScalarPresentInCurrentConfig: function (scalarName, configData) {
		var status = false;
		
		if (!configData || configData == null)
			return status;
			
		var s = configData[scalarName];
		if (!s) {
			return status;
		} 
		status = true;
		
		return status;
	},
	
	getHtmlConfigMarkup : function (scalars, inpConfig) {
		var inputTypes = ["TextBox", "Slider"];		 
		var markup = '<table border="1" style="width:100%"> <tr>\
			  <th>Attribute Name</th>\
			  <th>Attribute Value</th>\
			  </tr>';
		
		// Add Scalar list 
		markup += '<tr> <td>';
		markup += "Scalar";
		markup += '</td>';
		markup += '<td>';
		
		markup += '<select class="designDataUserInputs" dataAttr="scalar" typeAttr="string">';
		var none = "NONE";
		markup += '<option value='+none+'>'+none+'</option>';
		for (var i=0; scalars && i<scalars.length; i++){
			var name = scalars[i].scalarName; 	
			markup += '<option value='+name+'>'+name+'</option>';
			/*
			if (this.isScalarPresentInCurrentConfig (name, inpConfig)) {
				markup += '<option selected="selected" value='+name+'>'+name+'</option>';	
			} else {
				markup += '<option value='+name+'>'+name+'</option>';
			}	*/			
		}
		markup += '</select>';
		markup += '</td> </tr>';
		
		// Add input type
		markup += '<tr> <td>';
		markup += "Input Type";
		markup += '</td>';
		markup += '<td>';
		
		markup += '<select class="designDataUserInputs" dataAttr="inptype" typeAttr="string">';
		var none = "NONE";
		markup += '<option value='+none+'>'+none+'</option>';
		for (var j=0; inputTypes && j<inputTypes.length; j++){
			var name = inputTypes[j];
			markup += '<option value='+name+'>'+name+'</option>';		 			
		}
		markup += '</select>';
		markup += '</td> </tr>';
	
		// Add Label 
		markup += '<tr class="textInputs"> <td>';
		markup += "Label";
		markup += '</td>';
		markup += '<td>';
		markup += '<input type="text" class="designDataUserInputs" dataAttr="label" style="width:100%">';
		markup += '</td> </tr>';
		
		// Add Min
		markup += '<tr class="scalarInputs"> <td>';
		markup += "Min";
		markup += '</td>';
		markup += '<td>';	
		markup += '<input type="text" class="designDataUserInputs" dataAttr="min" style="width:100%">';
		markup += '</td> </tr>';
		
		// Add max
		markup += '<tr class="scalarInputs"> <td>';
		markup += "Max";
		markup += '</td>';
		markup += '<td>';		
		markup += '<input type="text" class="designDataUserInputs" dataAttr="max" style="width:100%">';
		markup += '</td> </tr>';
		
		markup += '</table>';
		
		return markup;
	},
	
	
	
	promptUserForScalarConfig : function (message, title) {
		var c = this;
		var cofigUi = $('<div ui-role="scalarConfig" ></div>');
		var isExist = $('body').find('div[ui-role="scalarConfig"]');

		if (isExist.length == 0) {
			$(cofigUi).dialog({
				width :  400,
				height : 400,
				title : title,
				dialogClass : "scalarConfig",
				close : function () {
					$(this).dialog("destroy");
				},
				open : function (event,ui) {
					$(".scalarConfig").css("background","rgba(255, 255, 255, 0.901961)");
					 $(this).empty();
			    	  $(this).append(message);
				},
				buttons : {
					"Save" : function(event) {
						c.saveScalarData ();
						$(this).dialog("close");
					},
					"Remove" : function(event) {
						c.removeScalarData ();
					},
					"Apply" : function(event) {
						c.addScalarData (true);
					},
					"Cancel" : function(event) {
						$(this).dialog("close");
					}
				}
			});
		}
	},
	
	
	render : function () {
		var c = this;
		c.renderLayout();
		var markup = c.renderUi();
		c.getLayout(markup);
		
		c.addEvents();
	}
});
