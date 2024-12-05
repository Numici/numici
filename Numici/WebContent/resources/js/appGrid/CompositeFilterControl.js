
var CompositeFilterControl = ChartControl.extend({
	constructor : function (options) {

		ChartControl.apply(this,arguments);
		
		this.wrkSpaceDims = null;
		this.associatedCtrls= [];
		this.allAssociatedCtrls = [];
		this.fltrsPerMeasure = {};
		this.uidata = [];
		this.dimf = [];
		this.msrf = [];
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

	readDesignDataProperties : function () {
		
		var c = this,data = {};
		var parent = c.getParent();
		var filterTypes = $("input[data-role='filterType']");
		if (filterTypes.length > 0) {
		 	$.each(filterTypes,function(i,v){
		 		data[$(v).attr("dataattr")] = $(v).prop('checked');
			});
		}

		var filterProps = $(".filterControls .designDataFilterProps");
		if (filterProps.length > 0) {
			var ctrls = [];

			$.each(filterProps,function(i,v){
		  	  	var status =  $(v).prop('checked');
		 	  	var ctrlId =  $(v).attr("dataattr");
		 	  	var ctrl = parent.getChildControlById(ctrlId);
		 	  	
		 	  	if (status) {
		 	  		ctrls.push(ctrlId);
		 	  		if (!ctrl.designerData) {
		 	  			ctrl.designerData = {};
		 	  		}
		 	  		ctrl.designerData.filterControlId = c.objectId;
		 	  	} else if( ctrl.designerData.filterControlId == c.objectId) {
		 	  		delete ctrl.designerData.filterControlId ;
		 	  	}
			});
			if (ctrls.length)
				data.associatedCtrls = ctrls;
		}
		
		return data;
	},

	saveDesignerData: function () {
		var c = this;
		var mode= c.mode;
		console.log ("Saving the composite filter control designer data ...!!");
		var data = c.readDesignDataProperties();
	 	
		console.log ("Composite Filter Control JSON: "+JSON.stringify(data));

		this.setCustomDesignerData(data);
		var scrn = this.getScreen();
		if ( mode === "design") {
			scrn.setState(scrn.getVappStates().UnderProcess);
		}
	    this.render();

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
						c.saveDesignerData();
						$(this).dialog("close");
					},
					"Cancel" : function(event) {
						$(this).dialog("close");
					}
				}
			});
		}
	},
	
	addHtmlFilterType : function (customData){
		
		var markup = '<tr> <td colspan="2" style="background: #999999;font-weight: bold;">';
		markup += "Filter Types";
		markup += '</td></tr>';
		markup += '<tr><td style="width: 70%;padding-left: 40px;">Dimension Filters</td>';
		if(customData && customData.dimfilters) {
			markup += '<td style="text-align: center;"><input type="checkbox" dataattr="dimfilters" data-role="filterType" checked></td>';
		} else {
			markup += '<td style="text-align: center;"><input type="checkbox" dataattr="dimfilters" data-role="filterType"></td>';
		}
		markup += '</tr>';
		markup += '<tr><td style="width: 70%;padding-left: 40px;">Measure Filters</td>';
		if(customData && customData.msrfilters) {
			markup += '<td style="text-align: center;"><input type="checkbox" dataattr="msrfilters"  data-role="filterType" checked></td>';
		} else {
			markup += '<td style="text-align: center;"><input type="checkbox" dataattr="msrfilters"  data-role="filterType"></td>';
		}
		
		markup += '</tr>';
		return markup;

	},
	
	addHtmlAssociatedCtrls :function(data) {
		var c = this;
		var parent = this.getParent();
		var children = parent.getChildControlIds();
		
		var markup = '<table  style="width:100%" class="filterControls">\
			<tr><td colspan="2" style="background: #999999;font-weight: bold;">Controls</td></tr>';
		if (children.length > 0) {
			for (var i=0; i<children.length; i++){

				var ctrlId = children[i];
				var ctrl = parent.getChildControlById(ctrlId);
				
				if (!ctrl ){
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
					console.log ("Skip the non filterabel control: "+ctrlId);
					continue;
				}

				markup += '<tr> <td style="width: 70%;padding-left: 40px;">';
				markup += ctrl.name;//+"("+ctrl.objectId+")";
				markup += '</td>';
				markup += '<td style="text-align: center;">';

				var val = false;
				/*if (!data) {
					val = true;
				} else if (props.filterableControl && (data.associatedCtrls) && (data.associatedCtrls.indexOf(ctrl.objectId) != -1) ){
					val = true;
				}*/
				
				if (props.filterableControl && data && (data.associatedCtrls) && (data.associatedCtrls.indexOf(ctrl.objectId) != -1) ){
					val = true;
				}
				
				
				if (ctrl.designerData && ctrl.designerData.filterControlId && ctrl.designerData.filterControlId != c.objectId) {
					
					var filterCtrl = parent.getChildControlById(ctrl.designerData.filterControlId);
					var filterCtrlName = filterCtrl ? filterCtrl.name : "";
					markup += '<input type="checkbox" class="designDataFilterProps" dataAttr="'+ctrl.objectId+'" disabled title= "This control is already associated to  '+(filterCtrlName)+' filter">';
				} else if(val){
					markup += '<input type="checkbox" class="designDataFilterProps" dataAttr="'+ctrl.objectId+'" checked>';
				} else {
					markup += '<input type="checkbox" class="designDataFilterProps" dataAttr="'+ctrl.objectId+'">';
				}
				markup += '</td> </tr>';
			}
		}
		
		markup += '</table>';

		return markup;
	},
	
	getDesignerDataValue: function (obj, dimension, attr) {
		var val = null;
		val = obj.attributes[attr];

		return val;
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
		var c = this;
		var title = "Compoiste Filter Configuration";

		var markup = '<table  style="width:100%">';
		
		markup += this.addHtmlFilterType(customData);
		markup += '</table>';
		markup += this.addHtmlAssociatedCtrls(customData);
		this.promptUserForCompoisteFilterConfig (markup, title);

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
	
	getDimValues : function(dataSet,blkName,dim) {
		var c = this, blkDef = c.blockDef,axisVals = [];
		var d = c.getDimensionInputs(dataSet,dim);
		/*var dimName = c.getDimNameFromBlockDim(dim);
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

		return axisVals;*/
		
		return d;
	},

	isFilterSelected : function(filterType ,key,val) {
		var c = this,isChecked = false;
		if (filterType == "Dimension" && c.appliedFilters["DimensionFilters"]) {
			var dimFltrs = c.appliedFilters["DimensionFilters"];
			$.each(dimFltrs,function(i,v){
				if (v.filterKye == key && _.contains(v.values,val)) {
					isChecked = true;
					return false;
				}
			});
		}
		if(filterType == "Measure") {
			var msrFltrs = c.appliedFilters["MeasureFilters"];
			if (_.contains(msrFltrs,key)) {
				isChecked = true;
			}
		}
		
		return isChecked;
	} ,
	
	
	renderDims : function(blkName,dims) {
		var c = this;
		
		if (dims) {
			$.each(dims,function(i,dim){
				var d = c.getWrkSpaceDimValuesByPermissions(blkName,dim) || {};
				var o = {};
				var key = blkName+"."+d.name;
				var id = blkName+"_"+d.name;
				o.id = id;
				o.parent = "Dimensions";
				o.text = d.name;
				c.uidata.push(o);
				
				
				//var dataSet = c.getDataSet(blkName);
				var dimValues =  d.values; //c.getDimValues(dataSet,blkName,key);
				
				if (dimValues) {
					$.each(dimValues,function(k,v){
						var j = {},data={};
						
						data.isValid = true;
						data.block = blkName;
						data.type = "Dimension";
						data.dim = d.name;
						data.val = v;
						
						j.data = data;
						j.id =id+"_"+v;
						j.parent = id; // d.name;
						j.text = v;
						j.state = {
							    checked : $.isEmptyObject(c.appliedFilters) ? true : c.isFilterSelected("Dimension",key,v),
							};
						c.uidata.push(j);
					});
				}
			});
		}
	},
	
	
	
	
	
	renderMsrs : function(blk,msrs) {
		
		var c= this;
		var blkRoot = {"id":blk,"parent":"Measures","text":blk};
		c.uidata.push(blkRoot);
		if (msrs) {
			$.each(msrs,function(i,d){
				var o = {},data={};
				
				data.isValid = true;
				data.block = blk;
				data.type = "Measure";
				data.msr = d.name;
				
				var key = blk+"."+d.name;
				var id = blk+"_"+d.name;
				
				o.data = data;
				o.id = id; //d.name;
				o.parent = blk;
				o.text = d.name;
				o.state = {
				    checked : $.isEmptyObject(c.appliedFilters) ? true : c.isFilterSelected("Measure",key),
				};
				c.uidata.push(o);
			});
		}
	},
	
	renderCheckboxes : function (parent) {
		
		var c = this;
		c.uidata = [];
		if(c.designerData && c.blockDef) {
			if (c.designerData.dimfilters) {
				var dim = {"id":"Dimensions","parent":"#","text":"Dimensions"};
				c.uidata.push(dim);
			}
			if (c.designerData.msrfilters) {
				var msr = {"id":"Measures","parent":"#","text":"Measures"};
				c.uidata.push(msr);
			}
			$.each(c.blockDef,function(i,blk){
				if (c.designerData.dimfilters) {
					c.renderDims(blk.name,blk["dimensions"]);
				}
				if (c.designerData.msrfilters) {
					c.renderMsrs(blk.name,blk["measures"]);
				}
			});
		}
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

	getAssociateCtrls: function() {

		var c = this;
		var assocCtrls = [];
		function apply(contols,associates) {
			if(contols && contols.length > 0) {
				$.each(contols,function(i,v){
					if( v.isContainer ){
						var ctrls = v.controls;
						apply(ctrls,associates);
					} else {
						var id = v.objectId;
						var index = associates.indexOf(id);
						if (index !== -1 && v.isFilterable ) {
							assocCtrls.push(v);
						}
					}
				});
			}
		}
		if (c.designerData && c.designerData.associatedCtrls && c.designerData.associatedCtrls.length > 0 ) {
			var contols = c.getParent().controls;
			apply(contols,c.designerData.associatedCtrls);
		}
		
		return assocCtrls;
	},

	
	createFilterConfig : function(filters) {
		var c = this;
		if (filters) {
			var selectedFilters = {};
			var dimFltrs = [];
			var msrFltrs = [];
			$.each(filters,function(i,v) {
				if (v.data && v.data.isValid) {
					if (v.data.type == "Dimension") {
						
						var key = v.data["block"]+"."+v.data["dim"];
						var filterObj = c.getFilterObjInList(dimFltrs,key);
						if (filterObj == null) {
							filterObj = {};
							filterObj.filterKye = key;
							filterObj.values = [];
							dimFltrs.push(filterObj);
						} 
						
						filterObj.values.push(v.data.val);
					}
					if (v.data.type == "Measure") {
						var key = v.data["block"]+"."+v.data["msr"];
						msrFltrs.push(key);
					}
				}
			});
		}
		if (dimFltrs.length > 0) {
			selectedFilters.DimensionFilters = dimFltrs;
		}
		if (msrFltrs.length > 0) {
			selectedFilters.MeasureFilters = msrFltrs;
		}
		
		if (!$.isEmptyObject(selectedFilters)) {
			c.appliedFilters = selectedFilters;
			c.applyFilters();
		}
	},
	
	applyFilters : function() {
		var c = this;
		var ctrls = c.getAssociateCtrls();
		var appliedFilters =c.appliedFilters;
		c.setAppliedFilters(appliedFilters);
		c.onFilter();
		
		if (!$.isEmptyObject(appliedFilters)) {
			if (ctrls.length > 0 ) {
				$.each(ctrls,function(i,v){
					v.appliedFilters = appliedFilters;
					v.onFilter();
					if (v.isRendered) {
						v.update();
					}
				});
			}
		}
	},

	getFilterObjInList : function(list,key) {
		var c = this,obj=null;
		if ($.isArray(list)) {
			$.each(list,function(i,v){
				if(v.filterKye == key){
					obj = v;
				}
			});
		}
		return obj;
	},
	
	resetFilters : function() {
		
		var c = this,dgnrData = c.designerData;
		var ctrls = c.getAssociateCtrls();
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
	
	renderFilterUi : function () {
		var c = this;
		var el=c.renderContainer();
		var container = el.find(".ctrl-content");
		c.renderCheckboxes($(container));
		
		
		if (c.tree) {
			c.tree.jstree(true).destroy();
		} 
		
		if (c.uidata.length > 0) {
			c.tree = el.find('div[data-ui="filters"]').jstree({ 'core' : {
			    'data' : c.uidata,
			    "themes" : { 
			    	"icons": false,
			    	"stripes" : true,
			    	},
				 } ,
				 "checkbox" : {
						"whole_node" : false, 
						"tie_selection" : false,
			            "keep_selected_style" : false,
			            "three_state": true,
				  },
			    "plugins" : [ "changed","checkbox" ,"search"]
			})
			.on('check_node.jstree', function (e, data) {
				var filters = $(this).jstree('get_checked',true);
				c.createFilterConfig(filters);
			})
			.on('uncheck_node.jstree', function (e, data) {
				var filters = $(this).jstree('get_checked',true);
				c.createFilterConfig(filters);
			});
		}
	},


	
	createCtrlLayout : function() {
		var c = this;
		var el=c.renderContainer();
		var attributes = c.attributes;

		if (el.find(".ctrl-wrapper").length == 0) {
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
					<div data-ui="filters"></div>\
				</div>\
			   </div>';
	
			el.append(toolbar);
			el.find(".ctrl-title").append(attributes["title"]);
			el.find(".ctrl-name").append(c.name).attr("title",c.name);
			
			c.bindEvents();
		}
		var height = el.outerHeight();
		el.find(".ctrl-content").height(height-40);
	},

	render : function() {
		
		var c = this,dgnrDta = c.designerData;
		
		c.createCtrlLayout();
		var screen = c.getScreen();
		if(screen) {
			if (!$.isEmptyObject(screen.XfilterObjs) ){
				c.XfilterObjs = screen.getXfilterObj();
			}
			if(!$.isEmptyObject(screen.dataSets)){
				c.dataSets = screen.getDataSet();
			}
		}
		if (dgnrDta && dgnrDta["appliedFilters"]) {
			c.appliedFilters = dgnrDta["appliedFilters"];
		}
		c.renderFilterUi();
		if (!$.isEmptyObject(c.appliedFilters)) {
			c.applyFilters();
		}
	},

});
