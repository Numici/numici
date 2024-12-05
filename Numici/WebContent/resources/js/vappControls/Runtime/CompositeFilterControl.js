
var CompositeFilterControl = ChartControl.extend({
	constructor : function (options) {

		ChartControl.apply(this,arguments);
		this.associatedCtrls= [];
		this.allAssociatedCtrls = [];
		this.fltrsPerMeasure = {};
	},

	updateControlNameInDesignerData: function (oldName, newName) {
		var designData = this.getCustomDesignerData();
		if (!designData)
			return;

		if (designData.filters) {
			for (var i=0; i < designData.filters.length; i++){
				var fltr = designData.filters[i];
				var index = fltr.controls.indexOf(oldName);
				if (index != -1) {
						fltr.controls.splice(index, 1, newName);
				}
			}
		}

	},

	removeControlFromDesignerData: function (ctrlName) {
		var designData = this.getCustomDesignerData();
		if (!designData)
			return;

		if (designData.filters) {
			for (var i=0; i < designData.filters.length; i++){
				var fltr = designData.filters[i];
				var index = fltr.controls.indexOf(ctrlName);
				if (index != -1) {
					fltr.controls.splice(index, 1);
				}
			}
		}
	},

	restructureData: function (data) {
		var obj = {};

		obj.filterChartType = data.filterChartType;
		obj.dimension = data.filterDimension;
		obj.measure = data.filterMeasure;

		// Assign the attribute if any
		if (data.attributes) {
			obj.attributes = data.attributes;
		}

		// Add control attributes if any
		if (data.controls) {
			obj.controls = data.controls;
		}

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
		 			designData[$(v).attr("dataattr")] = $(v).val();
		 		}
			});
		}

		var properties = $(".dynamicDimension .designDataFilterProps");

		if (properties.length > 0) {
			var attributes = {};

		 	$.each(properties,function(i,v){
		 	 	if ($(v).attr("datatype") == "boolean") {
		 	 		attributes[$(v).attr("dataattr")] = $(v).prop('checked');
		 		} else {
		 			attributes[$(v).attr("dataattr")] = $(v).val();
		 		}
			});

		 	designData.attributes = attributes;
		}

		var filterProps = $(".filterControls .designDataFilterProps");
		if (filterProps.length > 0) {
			var ctrls = [];

			$.each(filterProps,function(i,v){
		  	  	var status =  $(v).prop('checked');
		 	  	var name =  $(v).attr("dataattr");

		 	  	if (status)
		 	  		ctrls.push(name);
			});

			if (ctrls.length)
				designData.controls = ctrls;
		}

		var object = this.restructureData(designData);
		return object;
	},

	saveDesignerData: function () {
		var mode= this.mode;
		console.log ("Saving the composite filter control designer data ...!!");
		var data = {};
	 	var fs = [];

	 	for (var measure in this.filters){
	 		var dimension = this.filters[measure];
	 		for (var key in dimension) {
	 		//	console.log ("Value: "+dimension[key]);
	 			fs.push(dimension[key]);
	 		}
	 	}
		data.filters = fs;
		console.log ("Composite Filter Control JSON: "+JSON.stringify(data));

		this.setCustomDesignerData(data);
		var scrn = this.getScreen();
		if ( mode === "design") {
			scrn.setState(scrn.getVappStates().UnderProcess);
		}

		if (this.singleControlFilterMode) {
			delete this.singleControlFilterMode;
			delete this.singleControlFilterName;
		}

	    this.render();

	},

	removeFilterObject: function(measure, dimension) {
		delete this.filters[measure][dimension];

		if($.isEmptyObject(this.filters[measure])){
			delete this.filters[measure];
		}
		var msDiv = $('div[ui-role="cmpstfilterCnfg"]').find("select[dataattr='filterMeasure']");
		msDiv.val("NONE");
		msDiv.trigger("change");
	},

	removeFilterData: function() {
		var measure = $('div[ui-role="cmpstfilterCnfg"]').find("select[dataattr='filterMeasure']").val();
		console.log ("Removing the filter measure: "+measure);
		if (measure == "NONE") {
			Util.showMessage ("Please select a dimension to remove");
			return;
		}

		var dimension =  $('div[ui-role="cmpstfilterCnfg"]').find("select[dataattr='filterDimension']").val();
		console.log ("Removing the filter dimension: "+dimension);
		if (dimension == "NONE") {
			Util.showMessage ("Please select a measure to remove");
			return;
		}

		var c = this;
		var mObj = this.filters[measure][dimension];
		if (!mObj) {
			Util.showMessage ("Filter is not available in saved data to remove ..!!");
			return;
		} else {
			Util.promptDialog ("Do you really want to delete the filter with measure: "+measure+ " dimension: "+dimension +" ?",
					function(){
						c.removeFilterObject (measure, dimension);
						Util.showMessage ("Selected filter deleted sucessfully ...!!");
						return;
					},
					function () {
						console.log ("No button was selected by user in deleting the filter ...!!");
					},
					null);
		}
	},

	validDesignDataProperties: function (data) {
		console.log ("Validation the chart propetires");
		var obj = {};

		obj.status = true;
		obj.msg = null;

		if (!data) {
			obj.msg = "Invalid filter designer data ..!!";
			obj.status = false;
			return obj;
		}

		if (!data.dimension || data.dimension == "NONE") {
			obj.msg = "Please select a valid dimension";
			obj.status = false;
			return obj;
		}

		if (!data.filterChartType || data.filterChartType == "NONE") {
			obj.msg = "Please select valid filter chart type";
			obj.status = false;
			return obj;
		}

		return obj;
	},

	addFilterData: function () {
		console.log ("Adding the filter to local designer data ...!!");

		var div =  $('div[ui-role="cmpstfilterCnfg"]').find("select[ dataattr='filterDimension']");
		var curDimension = div.val();
		if (curDimension == "NONE") {
			Util.showMessage ("Please select a valid Dimension");
			return false;
		}

		var data = this.readDesignDataProperties();
		var validObj = this.validDesignDataProperties(data);
		if (!validObj.status) {
			Util.showMessage (validObj.msg);
			return false;
		}

		if (!this.filters[data.measure]){
			this.filters[data.measure] = {};
		}
		this.filters[data.measure][data.dimension]=data;
		Util.showMessage ("Measure: "+data.measure+" Dimension :"+data.dimension+ " added successfully");
		return true;
	},


	promptUserForCompoisteFilterConfig : function (message, title) {
		var c = this;
		var cofigUi = $('<div ui-role="cmpstfilterCnfg" ></div>');
		var isExist = $('body').find('div[ui-role="cmpstfilterCnfg"]');

		if (isExist.length == 0) {
			$(cofigUi).dialog({
				width :  400,
				height : 400,
				title : title,
				dialogClass : "cmpstfilterCnfg",
				close : function () {
					$(this).dialog("destroy");
				},
				open : function (event,ui) {
					$(".cmpstfilterCnfg").css("background","rgba(255, 255, 255, 0.901961)");
					 $(this).empty();
			    	  $(this).append(message);
				},
				buttons : {
					"Save" : function(event) {
				//		c.filters = []; //CHCEK REMOVE TODO
						c.saveDesignerData ();
						$(this).dialog("close");
					},
					"Remove" : function(event) {
						c.removeFilterData ();
					},
					"Apply" : function(event) {
						c.addFilterData ();
					},
					"Cancel" : function(event) {
						$(this).dialog("close");
					}
				}
			});
		}
	},

	addHtmlMeasures: function (customData) {
		var modelBlocks=this.getScreen().model.blocks;
		var markup = '<tr> <td>';
		markup += "Measures";
		markup += '</td>';
		markup += '<td>';
		var val=null;

		var txt = '<select class="designDataUserInputs" dataAttr="filterMeasure" typeAttr="string">';
		var none = "NONE";
		txt += '<option value='+none+'>'+none+'</option>';

		for (var l=0; l<modelBlocks.length; l++){
			var blk = modelBlocks[l];
			for (var m=0; blk.measures && m<blk.measures.length; m++){
				var opt = blk.name+"."+blk.measures[m].name;
				if (opt == val)
					txt += '<option selected="selected" value='+opt+'>'+opt+'</option>';
				else
					txt += '<option value='+opt+'>'+opt+'</option>';
			}
		}
		txt += '</select>';
		markup += txt;
		markup += '</td> </tr>';
		return markup;
	},

	addHtmlDimensions: function (customData) {
		var modelBlocks=this.getScreen().model.blocks;
		var markup = '<tr> <td>';
		markup += "Dimensions";
		markup += '</td>';
		markup += '<td>';
		var val=null;

		var txt = '<select class="designDataUserInputs" dataAttr="filterDimension" typeAttr="string">';
		var none = "NONE";
		txt += '<option value='+none+'>'+none+'</option>';

		for (var l=0; l<modelBlocks.length; l++){
			var blk = modelBlocks[l];
			for (var m=0; blk.dimensions && m<blk.dimensions.length; m++){
				var opt = blk.name+"."+blk.dimensions[m].name;
				if (opt == val)
					txt += '<option selected="selected" value='+opt+'>'+opt+'</option>';
				else
					txt += '<option value='+opt+'>'+opt+'</option>';
			}
		}
		txt += '</select>';
		markup += txt;
		markup += '</td> </tr>';
		return markup;
	},

	addHtmlFilterType: function (customData){
		var vappgenControls=this.getScreen().vappgen.completeControls;
		var markup = '<tr> <td>';
		markup += "Filter Chart Type";
		markup += '</td>';
		markup += '<td>';
		var val=null;

		var txt = '<select class="designDataUserInputs" dataAttr="filterChartType" typeAttr="string">';
//		var none = "NONE";
//		txt += '<option value='+none+'>'+none+'</option>';

		for (var l=0; l<vappgenControls.length; l++){
			var ctrl = vappgenControls[l];
			if (ctrl.subControl && (ctrl.subControlGroupList.indexOf("FilterCharts") != -1)) {
				var opt = ctrl.name;
				if (opt == val)
					txt += '<option selected="selected" value='+opt+'>'+opt+'</option>';
				else
					txt += '<option value='+opt+'>'+opt+'</option>';
			}
		}
		txt += '</select>';
		markup += txt;
		markup += '</td> </tr>';
		return markup;

	},

	getDesignerDataValue: function (obj, dimension, attr) {
		var val = null;
		val = obj.attributes[attr];

		return val;
	},

	addHtmlControlsList: function (control, data){
		var parent = this.getParent();
		var children = parent.getChildControls();
		if (!children.length) {
			console.log ("No associated controls found ...!!");
			return null;
		}

		var markup = '<table border="1" style="width:100%" class="filterControls">';
		for (var i=0; i<children.length; i++){

			var ctrlName = children[i];
			var ctrl = parent.getChildControlByName(ctrlName);
			if (!ctrl){
				console.log ("No matching control found ....!!");
				continue;
			}

			var props = null;
			if (this.mode === "design") {
				props = ctrl.getVappgenAttributes();
			} else {
				props = ctrl.getScreen().getMatchingControlAttrs(ctrl.controlType);
			}
			var attrs = ctrl.getAttributes();

			if (!props.filterableControl || !attrs.filterable) {
				console.log ("Skil the non filterabel control: "+ctrlName);
				continue;
			}

			markup += '<tr> <td>';
			markup += ctrlName;
			markup += '</td>';
			markup += '<td>';


			var val = false;
			if (!data) {
				if (props.filterableControl && !this.singleControlFilterMode)
					val = true;
				else if (props.filterableControl && this.singleControlFilterMode && (this.singleControlFilterName == ctrl.getName()))
					val = true;
			} else {
				if (props.filterableControl && (data.controls) &&
						(data.controls.indexOf(ctrlName) != -1) && !this.singleControlFilterMode)
					val = true;
				else if (props.filterableControl && (data.controls) && this.singleControlFilterName == ctrlName &&
						(data.controls.indexOf(this.singleControlFilterName) != -1) && this.singleControlFilterMode)
					val = true;
			}

			if (val == true || val == "true")
				markup += '<input type="checkbox" class="designDataFilterProps" checked  dataAttr="'+ctrlName+'">';
			else
	 			markup += '<input type="checkbox" class="designDataFilterProps"  dataAttr="'+ctrlName+'">';

			markup += '</td> </tr>';
		}
		markup += '</table>';

		return markup;
	},

	listFilterAttributes: function (dimensionName, control, data){
		if (!control) {
			console.log ("Failed to list the control props:"+control);
			return;
		}

		console.log ("List filter attributes: "+control.name);
		var markup = '<table border="1" style="width:100%" class="dynamicDimension">';

		for (var i=0; control.attributes && i<control.attributes.length; i++) {
			var p = control.attributes[i];
			var attrName = (p.caption ? p.caption : p.name);
			var val = (data ? this.getDesignerDataValue (data, dimensionName, p.name) : null);

			markup += '<tr> <td>';
			markup += attrName;
			markup += '</td>';
			markup += '<td>';

			if (p.type == "DimensionMeasure") {
				var modelBlocks = this.getScreen().model.blocks;
			 	var txt = '<select class="designDataFilterProps" dataAttr="'+p.name+'" typeAttr="'+p.type+'">';
			 	var none = "NONE";
				txt += '<option value='+none+'>'+none+'</option>';
				for (var j=0; j<modelBlocks.length; j++){
					var blk = modelBlocks[j];
					for (var k=0; blk.dimensions && k<blk.dimensions.length; k++){
						var opt = blk.name+"."+blk.dimensions[k].name;
						if (opt == val)
							txt += '<option selected="selected" value='+opt+'>'+opt+'</option>';
						else
							txt += '<option value='+opt+'>'+opt+'</option>';
					}
					for (var l=0; blk.measures && l<blk.measures.length; l++){
						var opt = blk.name+"."+blk.measures[l].name;
						if (opt == val)
							txt += '<option selected="selected" value='+opt+'>'+opt+'</option>';
						else
							txt += '<option value='+opt+'>'+opt+'</option>';
					}
				}
				txt += '</select>';
				markup += txt;
			} else if(p.type == "boolean") {
			 	if (val == true || val == "true")
					markup += '<input type="checkbox" class="designDataFilterProps" dataAttr="'+p.name +'" checked dataType="'+p.type+'">';
				else
		 			markup += '<input type="checkbox" class="designDataFilterProps" dataAttr="'+p.name +'" dataType="'+p.type+'">';
			} else if (p.type == "StaticValues"){
				var txt = '<select class="designDataFilterProps" dataAttr="'+p.name+'">';

				var none = "NONE";
				txt += '<option value='+none+'>'+none+'</option>';

				for (var k=0; k<p.possibleValues.length; k++){
					var opt = p.possibleValues[k];
					if (opt == val)
						txt += '<option selected="selected" value='+opt+'>'+opt+'</option>';
					else
						txt += '<option value='+opt+'>'+opt+'</option>';
				}
				txt += '</select>';
				markup += txt;
			} else if (p.type == "Measure") {
				var modelBlocks = this.getScreen().model.blocks;
				var txt = '<select class="designDataFilterProps" dataAttr="'+p.name+'" typeAttr="'+p.type+'">';
				var none = "NONE";
				txt += '<option value='+none+'>'+none+'</option>';

				for (var l=0; l<modelBlocks.length; l++){
					var blk = modelBlocks[l];
					for (var m=0; blk.measures && m<blk.measures.length; m++){
						var opt = blk.name+"."+blk.measures[m].name;
						if (opt == val)
							txt += '<option selected="selected" value='+opt+'>'+opt+'</option>';
						else
							txt += '<option value='+opt+'>'+opt+'</option>';
					}
				}
				txt += '</select>';
				markup += txt;
			} else if (p.type == "Dimension") {
				var modelBlocks = this.getScreen().model.blocks;
				var txt = '<select class="designDataFilterProps" dataAttr="'+p.name+'" typeAttr="'+p.type+'">';
				var none = "NONE";
				txt += '<option value='+none+'>'+none+'</option>';

				for (var l=0; l<modelBlocks.length; l++){
					var blk = modelBlocks[l];
					for (var m=0; blk.dimensions && m<blk.dimensions.length; m++){
						var opt = blk.name+"."+blk.dimensions[m].name;
						if (opt == val)
							txt += '<option selected="selected" value='+opt+'>'+opt+'</option>';
						else
							txt += '<option value='+opt+'>'+opt+'</option>';
					}
				}
				txt += '</select>';
				markup += txt;
			} else {
				if(!p.editable){
					markup += '<input type="text" class="designDataFilterProps" dataAttr="'+p.name+'" style="width:100%" name="inp_value"   value="'+(val == undefined?"":val)+'" disabled>';
				}else{
					markup += '<input type="text" class="designDataFilterProps" dataAttr="'+p.name+'" style="width:100%" name="inp_value"   value="'+(val == undefined?"":val)+'">';
				}
			}
			markup += '</td> </tr>';
		}

		markup += '</table>';

		var ctrlsList = this.addHtmlControlsList (control, data);
		if (ctrlsList) {
			markup += ctrlsList;
		}

		var dialog = $('body').find('div[ui-role="cmpstfilterCnfg"]');
		dialog.find(".dynamicDimension").remove();
		dialog.find(".filterControls").remove();
		dialog.append(markup);
		var c = this;

	},

	getControlProps: function (chartName){
		var vappgenControls=this.getScreen().vappgen.completeControls;
		var ctrlProps = null;

		for (var i=0; i<vappgenControls.length; i++){
			if (vappgenControls[i].name == chartName) {
				ctrlProps = vappgenControls[i];
				break;
			}
		}

		return ctrlProps;
	},

	getFilterDataByDimension: function(data, dimension) {
		console.log ("get filter data by dimension ...!!");
		var obj = null;

		for (var i=0; data && i<data.length; i++){
			if (data[i].dimension == dimension) {
				obj = data[i];
				break;
			}
		}

		if (!obj){
			console.log("No matching filter found in the data ....!!");
		}

		return obj;
	},

	getFilterData: function (data, dimensionName, measureName) {
		var obj = null;

		for (var i=0; data && i<data.length; i++){
			if (data[i].measure == measureName &&
					data[i].dimension == dimensionName)
			{
				obj = data[i];
				break;
			}
		}

		if (!obj){
			console.log("No matching filter found in the data ....!!");
		}

		return obj;
	},

	launchConfig : function(customData) {

		$( document ).off("change","select[ dataattr='filterMeasure']").on("change","select[ dataattr='filterMeasure']",function() {
			var element = $(this);
			var val = element.val();
			var measureName =element.find('option[value="'+val+'"]').text();
		 	var dimensionDiv = $('div[ui-role="cmpstfilterCnfg"]').find("select[dataattr='filterDimension']");
		 	var filterDiv =  $('div[ui-role="cmpstfilterCnfg"]').find("select[dataattr='filterChartType']");

			if (measureName == "NONE" || !data) {
				dimensionDiv.prop('selectedIndex', 0);
				filterDiv.prop('selectedIndex', 0);

				// Remove all the chart based prpoperties.
				 $('div[ui-role="cmpstfilterCnfg"]').find(".dynamicDimension").remove();
				 $('div[ui-role="cmpstfilterCnfg"]').find(".filterControls").remove();

				return;
			}

			var fVal = filterDiv.val();
			filterDiv.val(fVal);
			filterDiv.trigger("change");
		});

		$( document ).off("change","select[ dataattr='filterDimension']").on("change","select[ dataattr='filterDimension']",function() {
			var element = $(this);
			var val = element.val();
			var dimensionName =element.find('option[value="'+val+'"]').text();
			var filterDiv =  $('div[ui-role="cmpstfilterCnfg"]').find("select[dataattr='filterChartType']");
			var measureName = $('div[ui-role="cmpstfilterCnfg"]').find("select[dataattr='filterMeasure']").val();

			if (dimensionName == "NONE" || !data) {
				filterDiv.prop('selectedIndex', 0);

				// Remove all the chart based prpoperties.
				 $('div[ui-role="cmpstfilterCnfg"]').find(".dynamicDimension").remove();
				 $('div[ui-role="cmpstfilterCnfg"]').find(".filterControls").remove();
				return;
			}

			// Set chart from saved/custom data.
			if (dimensionName != "NONE" && measureName != "NONE" && data && data.length > 0) {
				var mObj = c.getFilterData (data, dimensionName, measureName);
				if (mObj) {
					filterDiv.val(mObj.filterChartType);
					filterDiv.trigger("change");
				} else {
					filterDiv.prop('selectedIndex', 0);
					// Remove all the chart based prpoperties.
					$('div[ui-role="cmpstfilterCnfg"]').find(".dynamicDimension").remove();
				}
			} else {
				filterDiv.val(filterDiv.val());
				filterDiv.trigger("change");
			}

		});

		$( document ).off("change","select[dataattr='filterChartType']").on("change","select[dataattr='filterChartType']",function() {
			var element = $(this);
			var val = element.val();

			var curDimension =  $('div[ui-role="cmpstfilterCnfg"]').find("select[ dataattr='filterDimension']").val();
			var curMeasure =  $('div[ui-role="cmpstfilterCnfg"]').find("select[ dataattr='filterMeasure']").val();
			/*
			if (curDimension == "NONE" || curMeasure == "NONE") {
				Util.showMessage ("Please select a valid Dimension and Measure");
				return;
			}*/

			var chartName=element.find('option[value="'+val+'"]').text();
			var ctrl = c.getControlProps (chartName);
			var obj = null;
			if (data && data.length) {
				obj = c.getFilterData (data, curDimension, curMeasure);
			}
			c.listFilterAttributes (curDimension, ctrl, obj);

		});

		var c = this;
		var title = "Compoiste Filter Configuration";
		var data = null;
		var filterData = [];
		this.filters = {};

		if (customData && customData.filters) {
		 	var fs = {};
			for (var i=0; i<customData.filters.length; i++){
				var t = customData.filters[i];
				if (!fs[t.measure]){
					fs[t.measure]={};
				}
				fs[t.measure][t.dimension]=t;
			}
			this.filters = fs;
			filterData = customData.filters;
		}
		data = filterData;

		var markup = '<table border="1" style="width:100%"> <tr>\
			  <th>Attribute Name</th>\
			  <th>Attribute Value</th>\
			  </tr>';

		markup += this.addHtmlMeasures(data);
	 	markup += this.addHtmlDimensions(data);
		markup += this.addHtmlFilterType(data);
		markup += '</table>';

		this.promptUserForCompoisteFilterConfig (markup, title);

		// List the current filters from designer data.
		if (data && data.length >0) {
			var measure = data[0].measure;
			var chart = data[0].filterChartType;
			var dimension = data[0].dimension;

			$("select[ dataattr='filterMeasure']").val(measure);
			$("select[ dataattr='filterDimension']").val(dimension);
			$("select[ dataattr='filterChartType']").val(chart);
			$("select[ dataattr='filterChartType']").trigger("change");
		}

	},

	bindEvents : function () {
		var c = this;
		var el=this.renderContainer();
		el.addClass("vapp-control");

		var id=el.attr("id");
		var parent="#"+id;
		Control.prototype.addEvents.call(this ,parent);

		$(document).off("click",parent+ " .fa-refresh").on("click",parent+ " .fa-refresh",function(e) {
			e.stopPropagation();
			c.resetFilters();
		});
	},


	bindCheckBoxEvents : function() {
		var c = this;
		var el=c.renderContainer();

		el.find('input[type="checkbox"][name="chkbx_fltr"]').off("change").on("change",function(e){
			var config = $(this).closest("ul").data("config");
			var dim = config["dimension"];
			var msr = config["msr"];
			var chkbxs = el.find('ul[dim="'+dim+'"][msr="'+msr+'"]').find('input[type="checkbox"][name="chkbx_fltr"]');

			var filters = [];
			$.each(chkbxs,function(i,v){
				if ($(v).is(":checked")) {
					filters.push($(v).val());
				}
			});
			if (filters.length == 0) {
				$.each(chkbxs,function(i,v){
					 $(v).prop("checked",true);
					 filters.push($(v).val());
				});
			}
			c.applyFilters(filters,config);
		});
	},


	getDimValues : function(dataSet,blkName,dim) {
		var c = this, blkDef = c.blockDef,axisVals = [];
		var d = c.getDimensionInputs(dataSet,dim);
		var dimName = c.getDimNameFromBlockDim(dim);
		if (blkDef) {
			$.each(blkDef,function(i,obj){
				if(obj && obj.name == blkName) {
					var dims = obj["dimensions"];
					if ($.isArray(dims)) {
						$.each(dims,function(j,dimObj){
							if(dimName == dimObj.name && dimObj.values ){
								$.each(dimObj.values,function(k,v){
									if($.inArray(v,d) != -1) {
										axisVals.push(v);
									}
								});
							}
						});
					}
				}
			});
		}

		return axisVals;
	},


	renderCheckboxes : function (dim,msr) {
		
		var c = this,markup = '',dimFilters = null;
		var msrFilters = c.getAppliedFilters(msr);
		var dimName = c.getDimNameFromBlockDim(dim);
		if (msrFilters) {
			dimFilters = msrFilters[dimName];
		}
		var blockName = c.getBlockNameFromDim(dim);
		var dataSet = c.getDataSet(blockName);
		var d = c.getDimValues(dataSet,blockName,dim);
		if ( d && d.length > 0){
			markup = '<span style="font-weight: bold" >'+dim+'</span> <ul dim="'+dim+'" msr="'+msr+'" style="list-style-type: none;">';
			$.each(d,function (i,v){
				var index = 0;
				if(dimFilters && dimFilters.length > 0) {
					 index = dimFilters.indexOf(v);
				}
				if(index == -1) {
					markup += '<li><input type="checkbox" name="chkbx_fltr" value="'+v+'" >'+v+'</li>';
				}else {
					markup += '<li><input type="checkbox" name="chkbx_fltr" value="'+v+'" checked>'+v+'</li>';
				}
			});
			markup += '</ul>';
			//el.find(".ctrl-content").empty().append(markup);
		}
		return markup;
	},

	setAssociateCtrls: function(associates) {
		var c = this;
		var assocCtrls = c.associatedCtrls;
		function apply(contols,associates) {
			if(contols && contols.length > 0) {
				$.each(contols,function(i,v){
					if( v.isContainer ){
						var ctrls = v.controls;
						apply(ctrls,associates);
					} else {
						var ctrlName = v.getName();
						var index = associates.indexOf(ctrlName);
						if (index !== -1 && v.isFilterable ) {
							assocCtrls.push(v);
						}
					}
				});
			}
		}
		if ( associates && associates.length > 0 ) {
			var contols = c.getParent().controls;
			apply(contols,associates);
		}
	},

	getAssociateCtrls: function(associates) {

		var c = this;
		var assocCtrls = [];
		function apply(contols,associates) {
			if(contols && contols.length > 0) {
				$.each(contols,function(i,v){
					if( v.isContainer ){
						var ctrls = v.controls;
						apply(ctrls,associates);
					} else {
						var ctrlName = v.getName();
						var index = associates.indexOf(ctrlName);
						if (index !== -1 && v.isFilterable ) {
							assocCtrls.push(v);
						}
					}
				});
			}
		}
		if ( associates && associates.length > 0 ) {
			var contols = c.getParent().controls;
			apply(contols,associates);
		}


		return assocCtrls;
	},

	applyFilters : function(filters,config) {

		/*function apply(contols,filters,dim) {
			if(contols && contols.length > 0) {
				$.each(contols,function(i,v){
					if( v.isContainer ){
						var ctrls = v.controls;
						apply(ctrls,filters,dim);
					}
					if( v.isFilterable ) {
						v.update(filters,dim);
					}
				});
			}
		}

		var c = this;
		var contols = c.getParent().controls;
		apply(contols,filters,dim);
		c.setAppliedFilters(dim,filters);*/

		var c = this;
		var ctrls = c.getAssociateCtrls(config["ctrlsToFilter"]);
		var dim = config["dimension"];
		var msr = config["msr"];
		if (ctrls.length > 0 ) {
			$.each(ctrls,function(i,v){
				v.update(filters,dim,msr);
				v.onFilter();
			});
		}
		c.setAppliedFilters(msr,dim,filters);
		c.onFilter();
	},

	resetFilters : function() {
		/*function apply(contols,filters) {
			if(contols && contols.length > 0) {
				$.each(contols,function(i,v){
					if( v.isContainer ){
						var ctrls = v.controls;
						apply(ctrls,filters);
					}
					if( v.isFilterable ) {
						v.resetFilters(filters);
					}
				});
			}
		}

		var c = this;
		var contols = c.getParent().controls;
		apply(contols,c.appliedFilters);
		c.appliedFilters = {};
		c.renderFilterUi();*/

		var c = this,dgnrData = c.designerData;
		var ctrls = c.getAssociateCtrls(c.allAssociatedCtrls);
		if (ctrls.length > 0 ) {
			$.each(ctrls,function(i,v){
				v.resetFilters(c.appliedFilters);
			});
		}
		c.appliedFilters = {};
		if (dgnrData) {
			delete dgnrData["appliedFilters"];
		}
		c.renderFilterUi();
		c.onFilter();
	},


	prepareFilterConfig : function() {
		var c = this;c.fltrsPerMeasure = {};c.allAssociatedCtrls = [];
		
		var customData = c.designerData;

		if( customData && customData.filters) {
			$.each(customData.filters,function (i,obj) {
				var msr = obj["measure"];
				var fltrCnfg = {};
				fltrCnfg["dimension"] = obj["dimension"];
				fltrCnfg["filterType"] = obj["filterChartType"];
				fltrCnfg["ctrlsToFilter"] = obj["controls"];
				c.allAssociatedCtrls = c.allAssociatedCtrls.concat(obj["controls"]);
				if (!c.fltrsPerMeasure[msr]) {
					c.fltrsPerMeasure[msr] = [];
				}
				c.fltrsPerMeasure[msr].push(fltrCnfg);
			});
		}
		c.allAssociatedCtrls = _.uniq(c.allAssociatedCtrls);
		return c.fltrsPerMeasure;
	},

	renderFilterUi : function () {
		var c = this;
		var el=c.renderContainer();
		var container = el.find(".ctrl-content");
		$(container).empty();
		var fltrCnfg = c.prepareFilterConfig();

		if (!$.isEmptyObject(fltrCnfg)) {
			$.each(fltrCnfg,function(msr,cnfgArray){
				var div = $('<div/>'),mrkUp = "";;
				div.attr("msr",msr);
				div.append('<div>'+msr+'</div>');
				if (cnfgArray && cnfgArray.length > 0) {
					$.each(cnfgArray,function(i,cnfg){
						cnfg["msr"] = msr;
						var type = cnfg["filterType"];
						var dim = cnfg["dimension"];
						switch( type ) {
						case "CheckBoxes" :
							mrkUp = c.renderCheckboxes(dim,msr);
							break;
						}
						div.append(mrkUp);
						div.find('ul[dim="'+dim+'"]').data("config",cnfg);
					});
				}
				$(container).append(div);
			});
		}


		c.bindCheckBoxEvents();
		/*c.associatedCtrls = [];
		if( customData && customData.filters) {
			$.each(customData.filters,function (i,obj) {

				var type = obj["filterChartType"];
				switch( type ) {
				case "CheckBoxes" :
					c.renderCheckboxes(obj["dimension"]);
					break;
				}
				c.setAssociateCtrls(obj["controls"]);
			});
		}*/
	},

	createCtrlLayout : function() {
		var c = this;
		var el=c.renderContainer();
		var attributes = c.attributes;

		el.find(".ctrl-wrapper").remove();
		var toolbar = '<div class="ctrl-wrapper grid-stack-item-content">\
						<div class="ctrl-toolbar">\
							<div class="ctrl-titlebar" style="width:50%;float:left;">\
								<span class="ctrl-name" ></span>\
							</div>\
							<div class="ctrl-tools" style="width:40%;float:right;">\
								<span class="fa fa-gear" style="margin:2px;float:right;"  data-menu="config">\
									<div class="vdvc-flymenu" menu-id="config">\
									<div class="vdvc-top-arrow"></div>\
										<span menu-item="props" class="vdvc-menu-item">Properties</span>\
										<span menu-item="config" class="vdvc-menu-item">Config</span>\
							 		</div>\
								</span>\
								<span class="fa fa-refresh" style="margin:2px; float:right;" title="Reset"></span>\
								<span class="fa fa-tag" style="margin:2px;float:right;" title="Tag"></span>\
								<span class="fa fa-comments" style="margin:2px;float:right;" title="Comment"></span>\
							</div>\
						</div>\
						<div class="ctrl-title"></div>\
						<div class="ctrl-content ctrl-scrollableY">\
						</div>\
					   </div>';
		//var titleBar = '<div class="ctrl-title"></div>';
		el.append(toolbar);
		//el.append(titleBar);
		el.find(".ctrl-title").append(attributes["title"]);
		el.find(".ctrl-name").append(c.name).attr("title",c.name);
		var height = el.outerHeight();
		el.find(".ctrl-content").height(height-40);
		c.bindEvents();
	},

	render : function() {
		var c = this,dgnrDta = c.designerData;
		c.createCtrlLayout();
		var screen = c.getScreen();
		if(screen) {
			if ($.isEmptyObject(c.XfilterObjs) ){
				c.XfilterObjs = screen.getXfilterObj();
			}
			if($.isEmptyObject(c.dataSets)){
				c.dataSets = screen.getDataSet();
			}
		}
		if (dgnrDta && dgnrDta["appliedFilters"]) {
			c.appliedFilters = dgnrDta["appliedFilters"];
		}
		c.renderFilterUi();
	},

});
