
var finBLSDataImportWizard = function(modelId,menuRole){
	var mode, vAppId, workspaceId;
	if (window.vAppController) {
		mode = "VAppImport";
		vAppId = window.vAppController.vapp.vappId;
		workspaceId = window.vAppController.vapp.currentWorkspace;
	}
	this.dialogs = {};
	this.modelId = modelId;
	this.menuRole = menuRole;
	var importDlg = this;
	
	if (this.menuRole == "blsConsumerPriceIndexHistory") {
		this.forBLSDataSet = "CPIAllUrbanConsumers";
		this.importFor = "BLSCPIAllUrbanConsumers";
		this.prefix = "CUUR";
	} else if (this.menuRole == "blsProductPriceIndexHistory") {
		this.forBLSDataSet = "PPIIndustryDataCurrentSeries";
		this.importFor = "BLSPPIIndustryDataCurrentSeries";
		this.prefix = "PCU";
	}
	
	var blockInputs = {};
	var json = {};

	var readUserInputs = function (filter) {
		var properties = $(filter);
		if (!properties.length)
			return null;

		var props = {};
	 	$.each(properties,function(i,v){
	 		var val;
	 	 	if ($(v).attr("datatype") == "boolean") {
	 	 		val = $(v).prop('checked');
	 		} else {
	 			val = $(v).val();
	 		}
	 	 	if ($(v).attr("datamode") == "blocks") {
	 	 		if (!props.blocks) {
	 	 			props.blocks = [];
	 	 		}
	 	 		if (val) {
	 	 			props.blocks.push($(v).attr("dataattr"));
	 	 		}
	 	 	} else {
	 	 		props[$(v).attr("dataattr")] = val;
	 	 	}

		});

		return props;
	};

	var nextSelectBlockCB = function (dlg) {
		var newBlocks = $(".selectedBlocks .listBlocks .newBlockNames");
		for (var i=0; newBlocks && i<newBlocks.length; i++){
			var name = $(newBlocks[i]).val();
			if (!name.length){
				$(newBlocks[i]).css("border","1px solid red");
				Util.showMessage("Enter the new Block name");
				return;
			}
			$(newBlocks[i]).css("border","none");
		}

		importDlg.blockInputs = {};
		// Read model block inputs
		
		var commonInputs =  readUserInputs(".selectedBlocks .blockProps.docInputs");
		importDlg.blockInputs = commonInputs;
		
		var modelBlkInputs =  readUserInputs(".selectedBlocks .blockProps.modelBlocks");
		var newBlkInputs =  readUserInputs(".selectedBlocks .blockProps.newBlocks");
		if (!(modelBlkInputs && modelBlkInputs.blocks && modelBlkInputs.blocks.length) &&
				!(newBlkInputs && newBlkInputs.blocks && newBlkInputs.blocks.length)){
			Util.showMessage("Please select a block to import");
			return;
		}

		var blocks = {};
		if  (modelBlkInputs && modelBlkInputs.blocks && modelBlkInputs.blocks.length){
			for (var i=0; i<modelBlkInputs.blocks.length; i++){
				var blkName = modelBlkInputs.blocks[i];
				var obj = {};
				obj.name = blkName;
				obj.type = 'model';
				blocks[blkName]=obj;
			}
		}
		if  (newBlkInputs && newBlkInputs.blocks && newBlkInputs.blocks.length){
			for (var i=0; i<newBlkInputs.blocks.length; i++){
				var blkName = newBlkInputs.blocks[i];
				var obj = {};
				obj.name = blkName;
				obj.type = 'new';
				blocks[blkName]=obj;
			}
		}
		
		if (!handleYearChangeEvent($(dlg))) {
			return;
		}
		var areaCds = $(dlg).find(".areaCode");
		var itemCds = $(dlg).find(".itemCode");
		var industryCds = $(dlg).find(".industryCode");
		var productCds = $(dlg).find(".productCode");
		
		importDlg.series = [];
		
		if (importDlg.importFor == "BLSCPIAllUrbanConsumers"){
			if(areaCds && itemCds) {
				var flag = false,msg = "";
				$(areaCds).parent().css("border" ,"none");
				$(itemCds).parent().css("border" ,"none");
				$.each(areaCds,function(i,ac){
					var obj = {};
					var itc = itemCds[i];
					if ($(ac).val() == "default") {
						flag = true;
						msg = "Please select Area code";
						$(ac).parent().css("border" ,"solid 1px red");
						return false;
					} 
					if ($(itc).val() == "default") {
						flag = true;
						msg = "Please select Item code";
						$(itc).parent().css("border" ,"solid 1px red");
						return false;
					}
					obj["areaName"] = $(ac).find('option[value="'+$(ac).val()+'"]').text();
					obj["areaCode"] =$(ac).val();
					obj["itemName"] = $(itc).find('option[value="'+$(itc).val()+'"]').text();
					obj["itemCode"] = $(itc).val();
					obj["seriesId"] = importDlg.prefix+$(ac).val()+$(itc).val();
					importDlg.series.push(obj);
				});
				
				if(flag) {
					Util.showMessage(msg);
					return;
				}
				
			}
		} else if (importDlg.importFor == "BLSPPIIndustryDataCurrentSeries"){
			 if(industryCds && productCds) {
					var flag = false,msg = "";
					$(industryCds).parent().css("border" ,"none");
					$(productCds).parent().css("border" ,"none");
					$.each(industryCds,function(i,ic){
						var obj2 = {};
						var pc = productCds[i];
						if ($(ic).val() == "default") {
							flag = true;
							msg = "Please select Industry code";
							$(ic).parent().css("border" ,"solid 1px red");
							return false;
						} 
						if ($(pc).val() == "default") {
							flag = true;
							msg = "Please select Product code";
							$(pc).parent().css("border" ,"solid 1px red");
							return false;
						}
						obj2["industryName"] = $(ic).find('option[value="'+$(ic).val()+'"]').text();
						obj2["industryCode"] =$(ic).val();
						obj2["productName"] = $(pc).find('option[value="'+$(pc).val()+'"]').text();
						obj2["productCode"] = $(pc).val();
						obj2["seriesId"] = importDlg.prefix+$(ic).val()+$(pc).val();
						importDlg.series.push(obj2);
					});
					
					if(flag) {
						Util.showMessage(msg);
						return;
					}
					
				}
		}
		
		importDlg.blockInputs.blocks = blocks;
		importDlg.getMappingList ();
		
		dlg.dialog("close");
		
	};

	var cancelDialogs = function () {
		// close the select Mappings dialog
		var selectedMap = $('body').find('div[ui-role="importSelectMapDlg"]');
		for (var i=0; i<selectedMap.length; i++){
			$(selectedMap[i]).dialog("close");
			$(selectedMap[i]).dialog("destroy");
		}

		// Close the Mapping dialogs
		var maps = $('body').find('div[ui-role="importMappingDlg"]');
		for (var i=0; i<maps.length; i++){
			$(maps[i]).dialog("close");
			$(maps[i]).dialog("destroy");
		}

		// Close the Block dialogs
		var blks = $('body').find('div[ui-role="importSelectBlkDlg"]');
		for (var i=0; i<blks.length; i++){
			$(blks[i]).dialog("close");
			$(blks[i]).dialog("destroy");
		}

		// Close the Preview dialogs
		var prvs = $('body').find('div[ui-role="importPreviewDlg"]');
		for (var i=0; i<prvs.length; i++){
			$(prvs[i]).dialog("close");
			$(prvs[i]).dialog("destroy");
		}
	};

	var createSelectMappingsHTML = function () {
		var markup = '<table class="selectMaps" style="width:100%; border-collapse: collapse;">';
		var checked = false;

		markup += '<br><br>';
    	markup += '<tr>';
    	markup += '<td>';
    	if (importDlg.modelCompleteMappings && !importDlg.modelCompleteMappings.length)
    		markup += '<input type="radio" name="selMaps" value="mapList" disabled>All Mappings';
    	else {
    		if (checked)
    			markup += '<input type="radio" name="selMaps" value="mapList">All Mappings';
    		else {
    			checked = (importDlg.modelCompleteMappings && !importDlg.modelCompleteMappings.length) ? false : true;
    			if (checked)
    				markup += '<input type="radio" name="selMaps" value="mapList" checked>All Mappings';
    			else
    				markup += '<input type="radio" name="selMaps" value="mapList">All Mappings';
    		}
    	}
    	markup += '</td>';

    	if (checked) {
	    	markup += '<td>';
	      	markup += '<select style="width:230px;" mapType="fullList">';
	    	for (var i=0; importDlg.modelCompleteMappings && i<importDlg.modelCompleteMappings.length; i++){
	    		var mapFileName = importDlg.modelCompleteMappings[i].name;
	    		var id = importDlg.modelCompleteMappings[i].id;
	    		markup += '<option value="'+id+'" selected>'+mapFileName+'</option>';
	    	}
	    	markup += '</select>';
	    	markup += '</td>';
    	}

    	markup += '</tr>';

    	markup += '</tr>';

    	markup += '<tr>';

    	markup += '<td>';
    	if (!checked)
    		markup += '<input type="radio" name="selMaps" value="mapNew" checked>Map Manually';
    	else
    		markup += '<input type="radio" name="selMaps" value="mapNew">Map Manually';

    	markup += '</td>';

    	markup += '</tr>';

    	markup += '</table>';
		return markup;
	};

	var getReferenceMapById = function (maps, id) {
		for (var i=0; maps && maps.length; i++){
			var m = maps[i];
			if (m.id == id){
				return m;
			}
		}
		return null;
	};

	var nextSelectedMappingsCB = function () {
    	var opts = $('div[ui-role="importSelectMapDlg"]').find("input[type='radio']");
		var val = null;
    	$.each(opts,function(i,v){
    		if ( $(v).is(':checked') ) {
    			val = $(v).val();
    			return false;
    		}
    	});

    	switch (val){
    	case 'mapList':
    		console.log ("Selected mapping file from complete map files list ....!!");
    		// read mapping file name
    		var id = $('div[ui-role="importSelectMapDlg"]').find('select[mapType="fullList"]').val();
    		importDlg.refMap = getReferenceMapById (importDlg.modelCompleteMappings, id);
    		console.log ("Reference Map is: "+ JSON.stringify(importDlg.refMap));
    		break;
    	case 'mapNew':
    		console.log ('Creating the new mappings .....!!');
    		importDlg.refMap = {};
    		break;
    	}
    	$('div[ui-role="importSelectMapDlg"]').dialog("close");
    	importDlg.savedMap = {};
		var importBlockDlg = importDlg.dialogs["ImportFinancialData"];
    	if (importBlockDlg){
    		importBlockDlg.dialog("open");
    		return;
    	} else {
    	   	createBlockDialog ();
    	}
	};

	this.createFinBLSDataImprtDlg = function () {
		var mapDlg = $('<div ui-role="importSelectMapDlg" ></div>');
		var isExist = $('body').find('div[ui-role="importSelectMapDlg"]');
		if (isExist.length > 0) {
			return;
		}

		var title = "ImportWizard: SelectMapType";
		var name = "MappingsList";

		$(mapDlg).dialog({
				width :  650,
				height : 400,
				title : title,
				
				create: function (event, ui){
					var c = this;
					var obj2={};
					obj2['modelId']=importDlg.modelId;
					obj2['mappingFor']=importDlg.importFor;

					$.when(
						Util.diff_ajaxGet ("model/blockdimensions/"+importDlg.modelId, function(result){
							if (!result.Status) {
								Util.showMessage (result.Message);
							} else {
								importDlg.modelBlks = result.Blocks;
							}
						}),

						Util.diff_ajaxPost ("import/getmappings", obj2, function(result){
							if (!result.Status) {
								Util.showMessage (result.Message);
							} else {
								importDlg.modelCompleteMappings = result.Data;
							}
						}),

						Util.diff_ajaxGet ("measure/valuetypes", function(result){
							if (!result.Status) {
								Util.showMessage (result.Message);
							} else {
								importDlg.measureValueTypes = result.Data;
							}
						}),

						Util.diff_ajaxGet ("dimension/valuetypes", function(result){
							if (!result.Status) {
								Util.showMessage (result.Message);
							} else {
								importDlg.dimensionValueTypes = result.Data;
							}
						})
					).then(function(){
						var html = createSelectMappingsHTML();
						$(c).empty();
						$(c).append(html);
						importDlg.dialogs[name]=$(c);
					});
				},
				open : function (event,ui) {

				},
				buttons : {
					"Cancel" : function(event) {
						cancelDialogs ();
					},
					"Next" : function(event) {
						Util.showSpinner();
						importDlg.buttonMode = "Next";
						nextSelectedMappingsCB (mapDlg);
						Util.hideSpinner();
					}
				}
		});

	 };

    var isUniqueNewBlock = function (blkName) {
    	var names = [];
    	var found = false;

    	for (var j=0; importDlg.modelBlks && j<importDlg.modelBlks.length; j++){
    		var blk = importDlg.modelBlks[j];
    		if (blkName == blk.name){
    			return false;
    		}
    	}
    	var list = $('input[type=checkbox].newBlocks');
    	for (var i=0; list && i<list.length; i++){
    		if ($(list[i]).attr('dataAttr'))
    			names.push($(list[i]).attr('dataAttr'));
    	}
    	if (names.length){
    		found = (names.indexOf(blkName) == -1 ? true : false);
    	} else{
    		found = true;
    	}

    	return found;
    };

    var bindSelectModelEvents = function () {
       	$( document ).off("click","div[ui-role='importSelectBlkDlg'] .addNewBlock").on("click","div[ui-role='importSelectBlkDlg'] .addNewBlock",function() {
       		var body = $(this).closest('tbody');
       		var markup = "<tr>";
       		markup += "<td>";
       		markup += '<input type="checkbox" class="blockProps newBlocks" dataType ="boolean" dataMode="blocks" checked disable>';
       		markup += '<input type="textbox" class="newBlockNames">';
       		markup += '<img src="resources/images/delete.png" class="removeNewBlock" alt="remove_block">';
       		markup += "</td>";
       		markup += "</tr>";
       		body.append(markup);

       		body.find(".newBlockNames").off("change").on("change", function(){
       			var text = $(this).val();
       			if (!isUniqueNewBlock(text)){
       				Util.showMessage ("Please enter the unique name for new block: "+text);
       				$(this).val("");
       				return;
       			}
       			$(this).closest("tr").find("input[type=checkbox]").attr('dataAttr', text);
       		});

       		body.find(".removeNewBlock").off("click").on("click", function(){
       			$(this).closest("tr").remove();
       		});
		});
    };

    var checkForBlockInRefMap = function (ref, blkName) {
    	for (var i=0; ref && ref.mappings && i < ref.mappings.length; i++){
    		var b = ref.mappings[i];
    		if (b.blockName == blkName){
    			return true;
    		}
    	}
    	return false;
    };

    var getBlockFromRefMap = function (ref, blkName) {
    	for (var i=0; ref && ref.mappings && i < ref.mappings.length; i++){
    		var b = ref.mappings[i];
    		if (b.blockName == blkName){
    			return b;
    		}
    	}
    	return null;
    };

	var validateBlockUserInputs = function (inputs){
		var err = {};

		err.status = true;
		err.msg = null;

		if (inputs.blocks && !inputs.blocks.length){
			err.msg = "Please select the block ..!!";
			err.status = false;
			return err;
		}

		return err;
	};

    var validateModelBlocksMapUserInputs = function (blk, inputs){
		var err = {};

		err.status = true;
		err.msg = null;

		var selectedMeasuresCount = 0;
		var totalMeasuresCount = 0;
		for (var key in inputs) {
			var type = inputs[key].type;
			if (type == "measure")
				totalMeasuresCount++;

			if (err.status && inputs[key].BLSCol == "Select BLS Column"){
				if (type != "measure"){
					err.status = false;
					err.msg = "Please select columns for "+type +": "+blk+"."+key;
					break;
				}
			}
			if (type == "measure" && inputs[key].BLSCol != "Select BLS Column")
				selectedMeasuresCount++;
		}

		if (err.status && totalMeasuresCount >= 0 && selectedMeasuresCount == 0) {
			err.status = false;
			err.msg = "Please select atleast one measure column in block: "+blk;
		}

		return err;
	};

	 var validateNewBlocksMapUserInputs = function (blk, inputs){
			var err = {};
			err.status = true;
			err.msg = null;

			var selectedMeasuresCount = 0;
			var selectedDimensionsCount = 0;

			for (var key in inputs){
				var obj = inputs[key];

				if (obj.type == "measure")
					selectedMeasuresCount++;
				else if (obj.type == "dimension")
					selectedDimensionsCount++;
			}

			if (err.status && !selectedMeasuresCount) {
				err.status = false;
				err.msg = "Please select atleast one measure column in block: "+blk;
			}
			if (err.status && !selectedDimensionsCount) {
				err.status = false;
				err.msg = "Please select atleast one dimension column in block: "+blk;
			}
			return err;
		};

    var getFinImportJSON = function (mappings, processType, dataGroup, series, fromYear, toYear, newBlocks) {
    	var json = {};

    	json['modelId'] = importDlg.modelId;
    	json['dataGroup'] = dataGroup;
    	json['fromDt'] = fromYear;
    	json['toDt'] = toYear;

    	if (series.length){
    		json['listOfSeries'] = series;
    	}
	
    	json['process']= processType;
    	if (mappings.length){
    		json['mappings'] = mappings;
    	}
    	if (newBlocks && newBlocks.length){
    		json['newBlocks']=newBlocks;
    	}

    	return json;
    };

    var readNewBlockMappings = function (blkName) {
       	var blkMap = {};

    	var blk = $(".mappingList"+"."+blkName);
    	var chkBoxes = $(blk).find('input[type="checkbox"]');
  //  	blkMap['blockType']='New';
    	for (var i=0; chkBoxes && i<chkBoxes.length; i++){
    		var row=chkBoxes[i];
       		if ($(row).is(':checked')){
    			var csv=$(row).attr('csvElement');
    			var tr = $(row).closest('tr');
    			var type = tr.find('.elementType').val();
    			var dataType = tr.find('.elementDataType').val();
    			var dataFormat = tr.find('.elementDataFormat').val();
    			var dm = tr.find('.elementName').val();
    			var obj = {};
    			obj['BLSCol'] = csv;
    			obj['type'] = type;
    			obj['DM'] = dm;
    			obj['dataType']=dataType;
    			obj['dataFormat']=dataFormat;
    			obj['vdvcLocale']=null;
    			blkMap[dm]=obj;
    		}
    	}

    	return ($.isEmptyObject(blkMap) ? null : blkMap);
    };

    var readModelBlockMappings = function (blkName) {
    	var blkMap = {};

    	var blk = $(".mappingList"+"."+blkName);
    	var list = $(blk).find('select[class=modelMappings]');
   // 	blkMap['blockType']='Model';
    	for (var i=0; list && i<list.length; i++){
    		var m=list[i];
    		var obj={};
    		var csv = $(m).val();
    		var type = $(m).attr('elementType');
    		var dm = $(m).attr('elementName');
    		var dataType = $(m).attr('elementDataType');
    		var dataFormat = $(m).attr('elementDataFormat');

    		obj['BLSCol'] = csv;
			obj['type'] = type;
			obj['DM'] = dm;
			obj['dataType'] = dataType;
			obj['dataFormat'] = dataFormat;
			obj['vdvcLocale']=null;

			blkMap[dm]=obj;
    	}

    	return blkMap;
    };

    removeInvalidMeasures = function (map){
    	for (key in map){
    		if (map[key].type == 'measure' && map[key].BLSCol == "Select BLS Column"){
    			delete map[key];
    		}
    	}
    };

    getNewBlockCreateMap = function (blkName, map){
    	var nb = {};

    	nb['Name'] = blkName;
    	var measures = [];
    	var dimensions = [];

       	for (key in map) {
    		var m = map[key];
    		var obj = {};
    		obj['Name']=m.DM;
			obj['DataType']=m.dataType;
			obj['Format']=m.dataFormat;
    		if (m.type == "measure") {
    			measures.push(obj);
    		} else if (m.type == "dimension") {
    			dimensions.push(obj);
    		}
    	}

    	if (measures.length){
    		nb['Measures']=measures;
    	}
    	if (dimensions.length){
    		nb['Dimensions']=dimensions;
    	}

    	return nb;
    };

    var nextMappingDimensionsCB = function (dlg) {
    	// Return invalid blocks
		if (!importDlg.blockInputs.blocks){
			Util.showMessage ("Found incorrect block inputs from user ...!!");
			return;
    	}

		importDlg.mappingInputs = [];
		importDlg.newBlocks = [];
		for (var key in importDlg.blockInputs.blocks){
			var block = importDlg.blockInputs.blocks[key];
			var type = block.type;
			var blkName = block.name;
			var map;
			if (type == "model") {
				map = readModelBlockMappings (blkName);
				var result = validateModelBlocksMapUserInputs (blkName, map);
				if (!result.status) {
					Util.showMessage (result.msg);
					return;
				}
			} else if (type == "new") {
				map = readNewBlockMappings(blkName);
				var result = validateNewBlocksMapUserInputs (blkName, map);
				if (!result.status) {
					Util.showMessage (result.msg);
					return;
				}
			}
			removeInvalidMeasures (map);
    		importDlg.mappingInputs.push({"blockName":blkName, "blockMapping": map});
    		if (type == "new"){
    			if (!importDlg.newBlocks){
    				importDlg.newBlocks = [];
    			}

    			var nb = getNewBlockCreateMap (blkName, map);
    			importDlg.newBlocks.push(nb);
    		}
		}
		
		//create the JSON structure to import
		importDlg.json = getFinImportJSON (importDlg.mappingInputs, "Validate", importDlg.forBLSDataSet, importDlg.series, importDlg.blockInputs.fromYear, importDlg.blockInputs.toYear, importDlg.newBlocks);
    	console.log("Import input JSON structure : "+ JSON.stringify (importDlg.json));

    	dlg.dialog("close");
    	importDlg.showPreview ();
    };

    var createMappingDialog = function () {
    	var dlg = $('<div ui-role="importMappingDlg" ></div>');
		var isExist = $('body').find('div[ui-role="importMappingDlg"]');
		if (isExist.length > 0) {
			return;
		}

		var title = "ImportWizard: Mapping";
		var name = "MappingDimensions";

		$(dlg).dialog({
				width :  650,
				height : 400,
				title : title,

				create: function (event, ui){
					$(".importMappingDlg").css("background","rgba(255, 255, 255, 0.901961)");
					importDlg.dialogs[name]=$(this);
				},
				open : function (event,ui) {
					if (importDlg.buttonMode == "Prev") {
						return;
					}
					$('.ui-dialog button').removeClass('ui-state-focus');
					var current = this;
					var inputObj = {};
					
					inputObj.dataGroup = importDlg.forBLSDataSet;
					inputObj.itemCode = importDlg.blockInputs.itemCode;
					
					Util.diff_ajaxPost ("importBLSFinData/blsCols/", inputObj, function(result){

			    		if (!result.Status) {
							Util.showMessage (result.Message);
						} else {
							importDlg.columns = result.BLSDataSetColumns;
							var html = createSelectMappingListHTML();
							$(current).empty();
							$(current).append(html);

							bindSelectMapEvents();
						}
					},false,true);
				},
				buttons : {
					"Cancel" : function(event) {
						cancelDialogs ();
					},
					"Prev" : function(event) {
						$(this).dialog("close");
						importDlg.buttonMode = "Prev";
						importDlg.dialogs["ImportFinancialData"].dialog("open");
					},
					"Next" : function(event) {
						importDlg.buttonMode = "Next";
						nextMappingDimensionsCB (dlg);
					}
				}
		});

    };

    var getTotalUserSelectedBlocks = function () {
    	var cnt = 0;
    	for (var key in importDlg.blockInputs.blocks){
    		if (importDlg.blockInputs.blocks[key])
    			cnt++;
    	}

    	return cnt;
    };

    var createSelectMappingListHTML = function () {
    	if (!importDlg.blockInputs.blocks) {
    		Util.showMessage ("Found incorrect block inputs from user ...!!");
    		return;
    	}
    	var markup="";
    	var totalBlocks = getTotalUserSelectedBlocks ();
    	var index=0;
    	for (var key in importDlg.blockInputs.blocks){
    		var block = importDlg.blockInputs.blocks[key];
    		var type = block.type;
    		var blkName = block.name;
    		if (type == "model") {
    			markup += '<p><b>Block Name : '+blkName+ " ("+(index+1)+"/"+totalBlocks+")"+'</b></p>';
		    	markup += '<div><table border="0" style="width:100%">\
		    		<tr> <th> Block Fields </th> <th> Mapping Element </th> </tr></table>\
		    		</div><table border="0" class="mappingList '+blkName +'" style="width:100%">';

		    	var columns = importDlg.columns;

		       	for (var i=0; importDlg.modelBlks && i<importDlg.modelBlks.length; i++){
		    		var blk = importDlg.modelBlks[i];
		    		if (blk.name != blkName){
		    			continue;
		    		}
		    		markup += '<tr> <th colspan=2 style="float:left;color:#003366;"><b>Dimensions</b></th> </tr>';
		    		// Add dimensions to the mapping list
		    		for (var k=0; blk.dimensions && k < blk.dimensions.length; k++){
			    		var dim = blk.dimensions[k];
			    		markup += '<tr bgcolor="#CCFFCC">';
			    		markup += '<td style="width:50%">'+dim.name+'</td>';

			    		markup += '<td style="width:50%";>';
			    		markup += '<select class="modelMappings" elementType="dimension" elementName="'+dim.name+'" elementDataType="'+dim.dataType+'" elementDataFormat="'+dim.format+'" style="width:100%;">';
			    		var none = "Select BLS Column";
			        	markup += '<option value="'+none+'">'+none+'</option>';
			        	var refBlk=null;
			        	if (!$.isEmptyObject(importDlg.refMap)){
			        		refBlk = getBlockFromRefMap (importDlg.refMap, blkName);
			        	}
			        	
			    		for (var j=0; j<columns.length; j++){
			    			if (!$.isEmptyObject(importDlg.refMap) && refBlk) {
			    				if (refBlk.blockMapping && refBlk.blockMapping[dim.name]['BLSCol'] == columns[j])
			    					markup += '<option selected="selected" value="'+columns[j]+'">'+columns[j]+'</option>';
			    				else
			    					markup += '<option value="'+columns[j]+'">'+columns[j]+'</option>';
			    			} else {
			    				if (dim.name.toLowerCase() == columns[j].toLowerCase()) {
			    					markup += '<option selected="selected" value="'+columns[j]+'">'+columns[j]+'</option>';
			    				} else {
			    					markup += '<option value="'+columns[j]+'">'+columns[j]+'</option>';
			    				}
			    			}
			    		}
			    		markup += '</td>';
			    		markup += '</tr>';
		    		}
		    		markup += '<tr> <th colspan=2 style="float:left;color:#993399;"><b>Measures</b></th> </tr>';
		    		// Add measures to the mapping list.
		    		for (var k=0; blk.measures && k < blk.measures.length; k++){
			    		var ms = blk.measures[k];
			    		markup += '<tr bgcolor="#FFFF99">';
			    		markup += '<td style="width:50%">'+ ms.name+'</td>';

			    		markup += '<td style="width:50%">';
			    		markup += '<select class="modelMappings" elementType="measure" elementName="'+ ms.name+'" elementDataType="'+ ms.dataType+'" elementDataFormat="'+ ms.format+'" style="width:100%">';
			    		var none = "Select BLS Column";
			        	markup += '<option value="'+none+'">'+none+'</option>';
			        	var refBlk=null;
			        	if (!$.isEmptyObject(importDlg.refMap)){
			        		refBlk = getBlockFromRefMap (importDlg.refMap, blkName);
			        	}
			    		for (var j=0; j<columns.length; j++){
			    			if (!$.isEmptyObject(importDlg.refMap) && refBlk) {
			    				if (refBlk.blockMapping && refBlk.blockMapping[ms.name]['BLSCol'] == columns[j])
			    					markup += '<option selected="selected" value="'+columns[j]+'">'+columns[j]+'</option>';
			    				else
			    					markup += '<option value="'+columns[j]+'">'+columns[j]+'</option>';
			    			} else {
			    				if (ms.name.toLowerCase() == columns[j].toLowerCase()) {
			    					markup += '<option selected="selected" value="'+columns[j]+'">'+columns[j]+'</option>';
			    				} else {
			    					markup += '<option value="'+columns[j]+'">'+columns[j]+'</option>';
			    				}
			    			}
			    		}
			    		markup += '</td>';
			    		markup += '</tr>';
		    		}
		    	}
		    	markup += '</table>';
		    	markup += '<br><hr>';
    		} else if (type == "new") {
    			var dataTypes = ["Dimension", "Measure"];
    			var types = ["Date", "Number"];
    		//	var formats = ["F1", "F2"];
    			var formats = [];

    			markup += '<p><b>Block Name : '+blkName+ " ("+(index+1)+"/"+totalBlocks+")"+'</b></p>';
		    	markup += '<div><table border="0" style="width:100%" class="mapNewBlocks">\
		    		<tr> <th>Mapping Element</th> <th>Role</th> <th>Name</th> <th>Type</th>  <th>Format</th> </tr> </table>\
		    		</div><table border="0" class="mapNewBlocks mappingList '+blkName +'" style="width:100%">';

		    	var columns = importDlg.columns;

		    	for (var i=0; columns && i<columns.length; i++) {
		    		markup += '<tr>';
		    		markup += '<td>';
		    		markup += '<input type="checkbox" csvElement="'+columns[i]+'">';
		    		markup += columns[i];
		    		markup += '</td>';
		    		markup += '<td>';
		    		markup += '<select style="width:100%;" class="elementType">';
		    		for (var j=0; dataTypes && j<dataTypes.length; j++){
		    			markup += '<option value="'+dataTypes[j].toLowerCase()+'">'+dataTypes[j]+'</option>';
		    		}
		    		markup += '</td>';

		    		markup += '<td>';
		    		markup += '<input type="text" class="elementName" style="width:100%;">';
		    		markup += '</td>';

		    		markup += '<td>';
		    		markup += '<select style="width:100%;" class="elementDataType">';
		    		var dimTypes = importDlg.dimensionValueTypes;
		    		for (var j=0; dimTypes && j<dimTypes.length; j++){
		    			markup += '<option value="'+dimTypes[j].name+'">'+dimTypes[j].name+'</option>';
		    		}
		    		markup += '</td>';


		    		markup += '<td>';
		    		markup += '<select style="width:100%;" class="elementDataFormat">';
		    		for (var j=0; formats && j<formats.length; j++){
		    			markup += '<option value="'+formats[j]+'">'+formats[j]+'</option>';
		    		}
		    		markup += '</td>';

		    		markup += '</tr>';
    		    }
    		    markup += '</table>';
    		    markup += '<br><hr>';
    		}
    		index++;
    	};

    	return markup;
    };

    var bindSelectMapEvents = function () {
     	$( document ).off("click","input[type='checkbox']").on("click","input[type='checkbox']",function() {
     		var val = $(this).is(':checked');
			var elementNameDiv = $(this).closest("tr").find("input[class='elementName']");
			var csvElement = $(this).attr('csvElement');

			if (val) {
				$(elementNameDiv).val(csvElement);
			}else{
				$(elementNameDiv).val("");
			}
     	});

       	$( document ).off("change","select[ class='elementDataType']").on("change","select[ class='elementDataType']",function() {
       		var element = $(this);
			var val = element.val();

			var elementTypeDiv = $(this).closest("tr").find("select[class='elementType']");
			var dataFormatDiv = $(this).closest("tr").find("select[class='elementDataFormat']");
			var typeVal = $(elementTypeDiv).val();
			if (typeVal == "dimension"){
				$(dataFormatDiv).empty();
				$(dataFormatDiv).prop('disabled', false);
				var types = importDlg.dimensionValueTypes;
				for (var i=0; types && i<types.length; i++){
					if (types[i].name == val) {
						var fmts = types[i].formats;
						if (fmts && fmts.length > 0 ) {
							for (var j=0; fmts && j  < fmts.length; j++){
								$(dataFormatDiv).append('<option value="'+fmts[j]+'">'+fmts[j]+'</option>');
							}
						} else {
							$(dataFormatDiv).prop('disabled', true);
						}
					}
				}
			} else if (typeVal == "measure") {
				$(dataFormatDiv).empty();
			//	$(dataFormatDiv).prop('disabled', true);
				var types = importDlg.measureValueTypes;
				for (var i=0; types && i<types.length; i++){
					if (types[i].name == val) {
						var fmts = types[i].formats;
						for (var j=0; fmts && j  < fmts.length; j++){
							$(dataFormatDiv).append('<option value="'+fmts[j]+'">'+fmts[j]+'</option>');
						}
					}
				}
			}
		});

    	$( document ).off("change","select[ class='elementType']").on("change","select[ class='elementType']",function() {
       		var element = $(this);
			var val = element.val();


			var dataTypeDiv = $(this).closest("tr").find("select[class='elementDataType']");
			var dataFormatDiv = $(this).closest("tr").find("select[class='elementDataFormat']");
			var dimDataTypes = ["Date", "Number"];
			var msDataTypes =  ["M1", "M2"];

			if (val == "dimension"){
				$(dataTypeDiv).empty();
				var types = importDlg.dimensionValueTypes;
				for (var i=0; types && i<types.length; i++){
					$(dataTypeDiv).append('<option value="'+types[i].name+'">'+types[i].name+'</option>');
				}
				var dim = $(dataTypeDiv).val();
				$(dataTypeDiv).val(dim);
				$(dataTypeDiv).trigger('change');
			} else if (val == "measure") {
				$(dataTypeDiv).empty();
				var types = importDlg.measureValueTypes;
				for (var i=0; types && i<types.length; i++){
					$(dataTypeDiv).append('<option value="'+types[i].name+'">'+types[i].name+'</option>');
				}
				var ms = $(dataTypeDiv).val();
				$(dataTypeDiv).val(ms);
				$(dataTypeDiv).trigger('change');
			}
		});
    };

    this.getMappingList = function () {
    	var mapDlg = importDlg.dialogs["MappingDimensions"];
    	if (mapDlg){
    		mapDlg.dialog("open");
    		return;
    	} else {
    	   	createMappingDialog ();
    	}
    };

    var getMappedJSON = function () {
    	var mapJson = JSON.parse(JSON.stringify(importDlg.json));
     	delete (mapJson['process']);
     	mapJson['fileName']=importDlg.originalFile;

     	if (!$.isEmptyObject(importDlg.refMap)){
     		mapJson['id']=importDlg.refMap.id;
     		mapJson['createdOn']=importDlg.refMap.createdOn;
     		mapJson['createdBy']=importDlg.refMap.createdBy;
     	} else {
     		if (!$.isEmptyObject(importDlg.savedMap))
     			mapJson['id'] = importDlg.savedMap.id;
     	}

     	return mapJson;
    };

    var saveMappings = function () {
    	var mapInput =  $('div[ui-role="importPreviewDlg"]').find("input[attrType='mapName']");
    	var mapFile= mapInput.val();
        if(mapFile && mapFile.trim() != "") {
        	mapInput.css("border","none");
        	var mapJson = getMappedJSON ();
        	mapJson['name']=mapFile;
        	mapJson['mappingFor']=importDlg.importFor;
         	delete (mapJson['newBlocks']);
        	importDlg.mappingJson = mapJson;

    		Util.ajaxPost ("import/savemapping", mapJson, function(result){

        		if (!result.Status) {
    				Util.showMessage ("Faield to save mapping : "+ result.Message);
    			} else {
    				importDlg.savedMap = result.Data;
    				Util.showMessage ("Mapping's saved successfully");
    			}
    		},false,true);

        } else {
        	mapInput.focus();
        	mapInput.css("border","2px solid red");
        }
	};

	var addDimensionDefaultValues = function (blocks) {
		var BLSData = importDlg.preview.BLSData;

		for (var j=0; blocks && j<blocks.length; j++){
			var blkName = blocks[j].Name;

			for (var i=0; BLSData && i<BLSData.length; i++) {
				var csvBlk = BLSData[i];
	    		if (csvBlk.blockName != blkName)
	    			continue;

	    		var blockRows = csvBlk.blockRows;
	    		if (blockRows){
	    			var firstRow = blockRows[0];
	    			var dimensions = blocks[j].Dimensions;
	    			for (var k=0; dimensions && k<dimensions.length; k++ ){
	    				var dim = dimensions[k];
	    				dim['DefaultValue'] = firstRow[dim.Name];
	    			}
	    		}
	    	}
		}
	};

    var importColumnsCB = function () {
       	var json = importDlg.json;
      	// Read information from import dialg.
    	var ignore = $('body').find('div[ui-role="importPreviewDlg"] .ignoreRowsChkBox').is(':checked');

    	// Add import tag in JSON
		if (mode == "VAppImport") {
	    	json['process']='ImportWS';
	    	json['vappId']=vAppId;
	    	json['workspaceId']=workspaceId;
		} else {
	    	json['process']='Import';
		}

    	var options = {};
    	options['IgnoreInvalidRows'] = ignore;
    	json['options'] = options;
    	// Remove following code after removing the default value restriction by Sunil.
/*    	if (json['newBlocks']){
    		addDimensionDefaultValues(json['newBlocks']);
    	}*/
    	
    	console.log("Import input JSON structure : "+ JSON.stringify (json));
		Util.ajaxPost ("importBLSFinData/blsFinData", json, function(result){
    		if (!result.Status) {
				Util.showMessage ("Import process failed : "+ result.Message);
			} else {
				Util.showMessage ("Import Completed successfully");
				
				if (mode == "VAppImport") {
					window.vAppController.switchWorkspace(workspaceId);
				}
			}
			cancelDialogs();
		},false,true);

    };

    var getPreviewHeader = function (val) {
    	var markup = '<div style="height:15%;">';
    	markup += '<table style="border-collapse: collapse">';
    	markup += '<tr>';
    	markup += '<td style="width:25%; height:25px;">';
		markup += '<p>Select Block : </p>';
		markup += '</td>';
		markup += '<td style="width:25%; height:25px;">';
		markup += '<select previewType="previewBlock">';
		for (var key in importDlg.blockInputs.blocks){
			var blk;
			blk = importDlg.blockInputs.blocks[key];
			var name = blk.name;
			if (val == name)
				markup += '<option selected="selected" value="'+name+'">'+name+'</option>';
			else
				markup += '<option value="'+name+'">'+name+'</option>';
		}
    	markup += '</select>';
    	markup += '</td>';

    	markup += '<td style="width:25%; height:25px;">';
    	markup += 'Mapping Name : ';
    	markup += '</td>';
    	markup += '<td style="width:25%; height:25px;">';

    	if (!$.isEmptyObject(importDlg.refMap)) {
    		markup += '<input type="text" attrType="mapName" placeholder="Enter mapping name" value="'+importDlg.refMap.name+'" disabled>';
    	}else {
    		markup += '<input type="text" attrType="mapName" placeholder="Enter mapping name">';
    	}
    	markup += '</td>';
    	markup += '</tr>';
    	markup += '</table>';
    	markup += '</div>';

    	return markup;
    };

    function isSelectedForImport (name, block) {
    	if (importDlg.json){
    		for (var i=0; importDlg.json.mappings && i<importDlg.json.mappings.length; i++){
    			var map = importDlg.json.mappings[i];
    			if (map.blockName != block)
    				continue;

    			return map.blockMapping[name];
    		}
    	}
    	return null;
    };

    function getSelectedBlockType(blkName) {
       	var blks  = importDlg.blockInputs.blocks;

    	var sb = blks[blkName];
    	if (sb) {
    		return sb.type;
    	}

    	return null;
    };

    function getBlockHeaderFromModelDefinition (modelBlocks, block) {
    	var hdr=[];

    	var type = getSelectedBlockType (block);
    	if (!type) {
    		Util.showMessage ("Invalid Selected Model type: "+type);
    		return;
    	}
    	if (type == "model") {
	    	for (var j=0; modelBlocks && j<modelBlocks.length; j++){
	    		var mb  = modelBlocks[j];
	    		if (mb.name != block){
	    			continue;
	    		}
	    		for (var i = 0; mb.dimensions && i<mb.dimensions.length; i++) {
	        		dm =  mb.dimensions[i];
	        		hdr.push(dm.name);
	        	}
	    		for (var i = 0; mb.measures && i<mb.measures.length; i++) {
	        		ms =  mb.measures[i];
	        		if (isSelectedForImport(ms.name, block))
	        			hdr.push(ms.name);
	        	}
	    	}
    	} else {
    		var newBlocks = importDlg.newBlocks;
    		for (var j=0; newBlocks && j<newBlocks.length; j++)
    		{
    			var bk = newBlocks[j];
    			if (bk.Name != block)
    				continue;

    			for (var i = 0; bk.Dimensions && i<bk.Dimensions.length; i++) {
            		dm =  bk.Dimensions[i];
            		hdr.push(dm.Name);
            	}
        		for (var i=0; bk.Measures && i<bk.Measures.length; i++) {
            		ms =  bk.Measures[i];
            		hdr.push(ms.Name);
            	}
			}
    	}

    	if (!hdr.length)
    		return null;
    	else
    		return hdr;
    };

    var getPreviewHTML = function (block) {
       	var BLSData = importDlg.preview.BLSData;
    	var markup="";

    	for (var i=0; BLSData && i<BLSData.length; i++) {
    		var csvBlk = BLSData[i];
    		if (csvBlk.blockName != block){
    			continue;
    		}

    		var hdr = getBlockHeaderFromModelDefinition (importDlg.modelBlks, block);

	    	markup += '<div style="overflow:auto; height:70%;"><table border="1" class="previewListRows" style="width:100%">';
	    	// create HDR row
	    	if (hdr) {
	    		markup += '<tr>';
		    	for (var i=0; i<hdr.length; i++){
		    		markup += '<th>'+hdr[i]+'</th>';
		    	}
		    	markup += '</tr>';
	    	}

	    	$.each(csvBlk.blockRows, function(key, row) {
				if (row.ValidRow == "Y") {
					markup += '<tr bgcolor="#CCFFCC">';
				} else{
					markup += '<tr bgcolor="#FF3333">';
				}

				for (var i=0; hdr && i < hdr.length; i++){
					var val = hdr[i];
					markup += '<td>'+row[val]+'</td>';
				}
				markup += '</tr>';
			});

			markup += '</table> </div>';

			markup += '<div  style="height:15%;"><table class="previewListInfo"   style="width:100%;border-collapse: collapse;">';

			markup += '<tr>';

			markup += '<td style="text-align:right;width:50%">';
			markup += '</td>';

			markup += '<td style="text-align:right;width:50%;">';
			markup += '<input type="checkbox" class="ignoreRowsChkBox">';
			markup += ' Ignore Invalid Rows for Import';
			markup += '</td>';

			markup += '</tr>';
			markup += '</table>';

			markup += '</div>';
    	}
		return markup;
    };

    var isInvalidRowsPresent = function (result) {
    	for (var i=0; result.BLSData && i<result.BLSData.length; i++){
    		var blk = result.BLSData[i];
    		if (blk.InvalidRecCount > 0){
    			return true;
    		}
    	};

    	return false;
    };

    var bindImportEvents = function () {
    	$( document ).off("change","select[previewType='previewBlock']").on("change","select[previewType='previewBlock']",function() {
    		var element = $(this);
			var val = element.val();
			val=element.find('option[value="'+val+'"]').text();

			var hdr = getPreviewHeader (val);
			var preview = getPreviewHTML (val);

			var dlg = 'div[ui-role="importPreviewDlg"]';

			var chkBoxVal = $(dlg).find (" .ignoreRowsChkBox").is(':checked');
			$(dlg).empty();
			$(dlg).append(hdr+preview);
			var chkBoxDiv = $(dlg).find (" .ignoreRowsChkBox");

			$(chkBoxDiv).prop('checked', chkBoxVal);

		});

    	var checkBox = 'div[ui-role="importPreviewDlg"] .ignoreRowsChkBox';
    	$(document).off("change",checkBox ).on("change", checkBox, function (event) {

    		var dlg =  $('body').find('div[ui-role="importPreviewDlg"]');

    		if ($(this).is(':checked')) {
        		$(dlg).parent(".ui-dialog").find(".ui-dialog-buttonpane button:contains('Import')").button('enable');
    		} else {
    			$(dlg).parent(".ui-dialog").find(".ui-dialog-buttonpane button:contains('Import')").button('disable');
    		}
    	});

    };

    var createPreviewDialog = function () {
    	var dlg = $('<div ui-role="importPreviewDlg" style="overflow:hidden;" ></div>');
		var isExist = $('body').find('div[ui-role="importPreviewDlg"]');
		if (isExist.length > 0) {
			return;
		}

		var title = "ImportWizard: Preview";
		var name = "PreviewDimensions";

		$(dlg).dialog({
				width :  650,
				height : 400,
				title : title,
				resizable: false,

				create: function (event, ui){
					$(".importPreviewDlg").css("background","rgba(255, 255, 255, 0.901961)");
					importDlg.dialogs[name]=$(this);
				},
				open : function (event,ui) {
					if (importDlg.buttonMode == "Prev"){
						return;
					}
					var current = this;
					$('.ui-dialog button').removeClass('ui-state-focus');

					Util.ajaxPost ("importBLSFinData/blsFinData", importDlg.json, function(result){
						if (!result.Status) {
							Util.showMessage ("Preview process failed : "+ result.Message);
						} else {
							importDlg.preview = result;
							var hdr = getPreviewHeader();

							$(current).empty();
							$(current).append(hdr);

							bindImportEvents ();
							var blkDiv =$(current).find('select[previewType="previewBlock"]');
							blkDiv.trigger("change");

							if (isInvalidRowsPresent(importDlg.preview)) {
								$(dlg).parent(".ui-dialog").find(".ui-dialog-buttonpane button:contains('Import')").button('disable');
							}
						}
			    	},false,true);
				},
				buttons : {
					"Cancel" : function(event) {
						cancelDialogs ();
					},
					"SaveMappings" : function(event) {
						saveMappings ();
					},
					"Prev" : function(event) {
						$(this).dialog("close");
						importDlg.buttonMode = "Prev";
						importDlg.dialogs["MappingDimensions"].dialog("open");
					},
					"Import" : function(event) {
						importDlg.buttonMode = "Import";
						importColumnsCB ();
					}
				}
		});

    };

    this.showPreview = function () {
    	var previewDlg = importDlg.dialogs["PreviewDimensions"];
    	if (previewDlg){
    		previewDlg.dialog("open");
    		return;
    	} else {
    	   	createPreviewDialog ();
    	}
    };

    
    
  
	var renderAreaCodes = function(areaCode) {
		var markup = "";
		if (!$.isEmptyObject(importDlg.blsFinacialDataAreaCode)) {
			markup += '<select class="blockProps docInputs areaCode" dataAttr="areaCode" style="width: 100%;">\
				<option value="default" selected>select Area Code</option>';
				$.each(importDlg.blsFinacialDataAreaCode, function(i, v) {
					if (areaCode && areaCode == v["key"]) {
						markup += '<option value="'+v["key"]+'" selected>'+v["desc"]+'</option>';
					} else {
						markup += '<option value="'+v["key"]+'">'+v["desc"]+'</option>';
					}
				});	
				markup += '</select>';
		}
		return markup;
	};

	var renderItemCodes = function(itemCode) {
		var markup = "";
		if (!$.isEmptyObject(importDlg.blsFinacialDataItemCode)) {
			markup += '<select class="blockProps docInputs itemCode" dataAttr="itemCode" style="width: 100%;">\
				<option value="default" selected>select Item Code</option>';
				$.each(importDlg.blsFinacialDataItemCode, function(i, v) {
					if (itemCode && itemCode == v["key"]) {
						markup += '<option value="'+v["key"]+'" selected>'+v["desc"]+'</option>';
					} else {
						markup += '<option value="'+v["key"]+'">'+v["desc"]+'</option>';
					}
				});	
				markup += '</select>';
		}
		
		return markup;
	};

	var renderIndustryCodes = function(industryCode) {
		var markup = "";
		if (!$.isEmptyObject(importDlg.blsFinacialDataIndustryCode)) {
			markup += '<select class="blockProps docInputs industryCode" dataAttr="industryCode" style="width: 100%;">\
				<option value="default" selected>select Industry Code</option>';
				$.each(importDlg.blsFinacialDataIndustryCode, function(i, v) {
					if (industryCode && industryCode == v["key"]) {
						markup += '<option value="'+v["key"]+'" selected>'+v["desc"]+'</option>';
					} else {
						markup += '<option value="'+v["key"]+'">'+v["desc"]+'</option>';
					}
				});	
				markup += '</select>';
		}
		return markup;
	};

	var renderProductCodes = function(productCode) {
		var markup = "";
		if (!$.isEmptyObject(importDlg.blsFinacialDataProductCode)) {
			markup += '<select class="blockProps docInputs productCode" dataAttr="productCode" style="width: 100%;">\
				<option value="default" selected>select Product Code</option>';
				$.each(importDlg.blsFinacialDataProductCode, function(i, v) {
					if (productCode && productCode == v["key"]) {
						markup += '<option value="'+v["key"]+'" selected>'+v["desc"]+'</option>';
					} 
				});	
				markup += '</select>';
		}
		return markup;
	};

	var createSelectModelBlocksHTML = function (){
		var markup = '<table border="1" class="selectedBlocks" dataAttr="dataGroup" style="width:100%">';
	
		markup += '<br>';
		markup += '<tr>';
	
		markup += '<td style="width:20%;">';
		markup += "Select Blocks";
		markup += '</td>';
	
		markup += '<td style="width:80%;">';
	
		markup += '<table class="listBlocks" style="width:100%">';
		markup += '<tr>';
		markup += '<td>';
		markup += '<img src="resources/images/add.png" class="addNewBlock" alt="add_block" style="float:right">';
		markup += '</td>';
		markup += '</tr>';
		for (var l=0; importDlg.modelBlks && l<importDlg.modelBlks.length; l++){
			markup += '<tr>';
	    	markup += '<td>';
			var blk = importDlg.modelBlks[l];
			if (!$.isEmptyObject(importDlg.refMap) && checkForBlockInRefMap (importDlg.refMap, blk.name))
				markup += '<input type="checkbox" class="blockProps modelBlocks" dataType ="boolean" dataMode="blocks" dataAttr="'+blk.name+'" checked>';
			else
				markup += '<input type="checkbox" class="blockProps modelBlocks" dataType ="boolean" dataMode="blocks" dataAttr="'+blk.name+'" >';
			markup += "   "+blk.name;
	//		markup += '<br>';
			markup += '</td>';
	    	markup += '</tr>';
		}
	
		markup += '</table>';
	
		markup += '</td>';
	
		markup += '</tr>';
	
		// Add another row element
		markup += '<tr>';
	
		markup += '<td style="width:20%;">From Year</td>';
	
		markup += '<td style="width:80%;">';
		
		if (!$.isEmptyObject(importDlg.blsFinacialDataYear)) {
			markup += '<select class="blockProps docInputs fromYear" dataAttr="fromYear" style="width: 100%;"><div>';
				$.each(importDlg.blsFinacialDataYear, function(i, v) {
					if (!$.isEmptyObject(importDlg.refMap) && importDlg.refMap["fromDt"] && importDlg.refMap["fromDt"]== v["key"]) {
						markup += '<option value="'+v["key"]+'" selected>'+v["desc"]+'</option>';
					} else {
						markup += '<option value="'+v["key"]+'">'+v["desc"]+'</option>';
					}
				});	
				markup += '</div></select>';
		}
	
		markup += '</td>';
	
		markup += '</tr>';
	
		// Add another row element
		markup += '<tr>';
	
		markup += '<td style="width:20%;">To Year</td>';
	
		markup += '<td style="width:80%;">';
		
		
		if (!$.isEmptyObject(importDlg.blsFinacialDataYear)) {
	
			markup += '<select class="blockProps docInputs toYear" dataAttr="toYear" style="width: 100%;"><div>';
				$.each(importDlg.blsFinacialDataYear, function(i, v) {
					if (!$.isEmptyObject(importDlg.refMap) && importDlg.refMap["toDt"] && importDlg.refMap["toDt"]== v["key"]) {
						markup += '<option value="'+v["key"]+'" selected>'+v["desc"]+'</option>';
					} else {
						markup += '<option value="'+v["key"]+'">'+v["desc"]+'</option>';
					}
				});	
			markup += '</div></select>';
		}
	
		markup += '</td>';
	
		markup += '</tr>';
		markup +='</tbody></table>';
		
		if (importDlg.importFor == "BLSCPIAllUrbanConsumers"){
			
			// Add another row element
			
			markup +='<div ><table border="1" style="width:100%;"><tbody>';
			
			markup += '<tr>';
	
			markup += '<td style="width:45%;text-align: center;">Area Code</td>';
	
			markup += '<td style="width:45%;text-align: center;">Item Code</td>';
			
			markup += '<td style="width:10%;text-align: center;">\
				<img src="resources/images/add.png" class="addAnotherItem" alt="add_block">\
				</td>';
			markup += '</tr>';
			markup +='</tbody></table></div>';
			
			markup +='<div style="height:200px;overflow:auto;"><table  border="1" class="listOfItems"><tbody>';
			
			if(!$.isEmptyObject(importDlg.refMap) && importDlg.refMap["listOfSeries"]) {
				var lstSeries = importDlg.refMap["listOfSeries"];
				$.each(lstSeries,function(i,v){
					markup += '<tr>';
	
					markup += '<td style="width:45%;">';
					
					markup += renderAreaCodes(v["areaCode"]);
	
					markup += '</td>';
	
					markup += '<td style="width:45%;">';
					
					markup += renderItemCodes(v["itemCode"]);
	
					markup += '</td>';
	
					markup += '<td style="width:10%;text-align: center;">\
						<img src="resources/images/delete.png" class="delItem">\
						</td>';
					
					markup += '</tr>';
				});
			} else {
				markup += '<tr>';
	
				markup += '<td style="width:45%;">';
				
				markup += renderAreaCodes();
	
				markup += '</td>';
	
				markup += '<td style="width:45%;">';
				
				markup += renderItemCodes();
	
				markup += '</td>';
	
				markup += '<td style="width:10%;text-align: center;">\
					<img src="resources/images/delete.png" class="delItem">\
					</td>';
				
				markup += '</tr>';
			}

			markup +='</tbody></table></div>';
			
		} else if (importDlg.importFor == "BLSPPIIndustryDataCurrentSeries") {
	
			// Add another row element
			
			markup +='<div ><table border="1" style="width:100%;"><tbody>';
			
			markup += '<tr>';
	
			markup += '<td style="width:45%;text-align: center;">Industry Code</td>';
	
			markup += '<td style="width:45%;text-align: center;">Product Code</td>';
			
			markup += '<td style="width:10%;text-align: center;">\
				<img src="resources/images/add.png" class="addAnotherItem" alt="add_block">\
				</td>';
			markup += '</tr>';
			markup +='</tbody></table></div>';
			
			markup +='<div style="height:200px;overflow:auto;"><table  border="1" class="listOfItems"><tbody>';
			
			if(!$.isEmptyObject(importDlg.refMap) && importDlg.refMap["listOfSeries"]) {
				var lstSeries = importDlg.refMap["listOfSeries"];
				$.each(lstSeries,function(i,v){
					markup += '<tr>';
	
					markup += '<td style="width:45%;">';
					
					markup += renderIndustryCodes(v["industryCode"]);
	
					markup += '</td>';
	
					markup += '<td style="width:45%;">';
					
					markup += renderProductCodes(v["productCode"]);
	
					markup += '</td>';
	
					markup += '<td style="width:10%;text-align: center;">\
						<img src="resources/images/delete.png" class="delItem">\
						</td>';
					
					markup += '</tr>';
				});
			} else {
				markup += '<tr>';
	
				markup += '<td style="width:45%;">';
				
				markup += renderIndustryCodes();
	
				markup += '</td>';
	
				markup += '<td style="width:45%;">';
				
				markup += renderProductCodes();
	
				markup += '</td>';
	
				markup += '<td style="width:10%;text-align: center;">\
					<img src="resources/images/delete.png" class="delItem">\
					</td>';
				
				markup += '</tr>';
			}
			
			markup +='</tbody></table></div>';
	
		}
	
		return markup;
		
	};

	var addRemoveItemEvent = function(dlg) {
		dlg.find(".delItem").off("click").on("click",function(e){
			$(this).closest("tr").remove();
		});
	};
	
	var getProductByIndustry = function (industryC) {
		var pList = [];
		var pCodes = importDlg.blsFinacialDataProductCode;
		if (pCodes) {
			$.each(pCodes,function(i,v) {
				if (industryC == v["displayLevel"]) {
					pList.push(v);
				}
			});
		}
	
		return pList;
	};

	var handleIndustryCodeChangeEvent = function(dlg, element) {
		var industryC = element.val();
		var pList = getProductByIndustry(industryC);
		var productUi =	element.closest("tr").find("select[dataAttr= 'productCode']");
		var pSelected = productUi.val();
		productUi.empty();
		
		productUi.append('<option value="default" selected>select Product Code</option>');
		$.each(pList, function(i, v) {
			if (pSelected && pSelected == v["key"]) {
				productUi.append('<option value="'+v["key"]+'" selected>'+v["desc"]+'</option>');
			} else {
				productUi.append('<option value="'+v["key"]+'">'+v["desc"]+'</option>');
			}
		});	
		
	};

	var handleYearChangeEvent = function(dlg) {
		var status = true;
		var fy = dlg.find(".fromYear").val();
		var ty = dlg.find(".toYear").val();
		dlg.find(".fromYear").parent().css("border","none");
		dlg.find(".toYear").parent().css("border","none");
		
		if (fy > ty ) {
			status = false;
			Util.showMessage("To Year should not be less than from Year ");
			dlg.find(".toYear").parent().css("border","solid 2px red");
		} else if ((ty-fy)> 20) {
			status = false;
			Util.showMessage("The year difference should not be more than 20 years ");
			dlg.find(".fromYear").parent().css("border","solid 2px red");
			dlg.find(".toYear").parent().css("border","solid 2px red");
		}
		
		return status;
	};

	var createBlockDialog = function () {
		var blkDlg = $('<div ui-role="importSelectBlkDlg" ></div>');
		var isExist = $('body').find('div[ui-role="importSelectBlkDlg"]');
		if (isExist.length > 0) {
			return;
		}
	
		if (importDlg.importFor == "BLSCPIAllUrbanConsumers"){
			var title = "ImportWizard: Browse Area & Item Information";
			var name = "ImportFinancialData";
		} else if (importDlg.importFor == "BLSPPIIndustryDataCurrentSeries"){
			var title = "ImportWizard: Browse Industry & Product Information";
			var name = "ImportFinancialData";
		}
	
		var current = this;
	
		var forListOfYear={};
		forListOfYear['dataSetName']=importDlg.forBLSDataSet;
		forListOfYear['parameterName']="Year";
		
		var forItemCode={};
		forItemCode['dataSetName']=importDlg.forBLSDataSet;
		forItemCode['parameterName']="ItemCode";
	
		var forAreaCode={};
		forAreaCode['dataSetName']=importDlg.forBLSDataSet;
		forAreaCode['parameterName']="AreaCode";
		
		var forIndustryCode={};
		forIndustryCode['dataSetName']=importDlg.forBLSDataSet;
		forIndustryCode['parameterName']="IndustryCode";
		forIndustryCode['selectable']="Y";
	
		var forProductCode={};
		forProductCode['dataSetName']=importDlg.forBLSDataSet;
		forProductCode['parameterName']="ProductCode";
		
		$.when(
			Util.diff_ajaxGet ("model/blockdimensions/"+importDlg.modelId, function(result){
				if (!result.Status) {
					Util.showMessage (result.Message);
				} else {
					importDlg.modelBlks = result.Blocks;
				}
			}),
			Util.diff_ajaxPost ("importBLSFinData/getBLSFinDataCollection/", forListOfYear, function(result){
				if (!result.Status) {
					Util.showMessage (result.Message);
				} else {
					importDlg.blsFinacialDataYear = result.Data;
					importDlg.blsFinacialDataYear = sortByKey(importDlg.blsFinacialDataYear, 'sortSequence');;
				}
				
				function sortByKey(array, key) {
				    return array.sort(function(b, a) {
				        var x = a[key]; var y = b[key];
				        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
				    });
				}
			}),
			Util.diff_ajaxPost ("importBLSFinData/getBLSFinDataCollection/", forItemCode, function(result){
				if (!result.Status) {
					Util.showMessage (result.Message);
				} else {
					importDlg.blsFinacialDataItemCode = result.Data;
					importDlg.blsFinacialDataItemCode = sortByKey(importDlg.blsFinacialDataItemCode, 'sortSequence');;
				}
				
				function sortByKey(array, key) {
				    return array.sort(function(a, b) {
				        var x = a[key]; var y = b[key];
				        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
				    });
				}
			}),
			Util.diff_ajaxPost ("importBLSFinData/getBLSFinDataCollection/", forAreaCode, function(result){
				if (!result.Status) {
					Util.showMessage (result.Message);
				} else {
					importDlg.blsFinacialDataAreaCode = result.Data;
					importDlg.blsFinacialDataAreaCode = sortByKey(importDlg.blsFinacialDataAreaCode, 'sortSequence');;
				}
				
				function sortByKey(array, key) {
				    return array.sort(function(a, b) {
				        var x = a[key]; var y = b[key];
				        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
				    });
				}
			}),
			Util.diff_ajaxPost ("importBLSFinData/getBLSFinDataCollection/", forIndustryCode, function(result){
				if (!result.Status) {
					Util.showMessage (result.Message);
				} else {
					importDlg.blsFinacialDataIndustryCode = result.Data;
					importDlg.blsFinacialDataIndustryCode = sortByKey(importDlg.blsFinacialDataIndustryCode, 'key');;
				}
				
				function sortByKey(array, key) {
				    return array.sort(function(a, b) {
				        var x = a[key]; var y = b[key];
				        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
				    });
				}
			}),
			Util.diff_ajaxPost ("importBLSFinData/getBLSFinDataCollection/", forProductCode, function(result){
				if (!result.Status) {
					Util.showMessage (result.Message);
				} else {
					importDlg.blsFinacialDataProductCode = result.Data;
					importDlg.blsFinacialDataProductCode = sortByKey(importDlg.blsFinacialDataProductCode, 'key');;
				}
				
				function sortByKey(array, key) {
				    return array.sort(function(a, b) {
				        var x = a[key]; var y = b[key];
				        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
				    });
				}
			})
				
		).then(function(){
			$(blkDlg).dialog({
				width :  700,
				height : 450,
				title : title,
				open : function (event,ui) {
					var dlg = $(this);
					var html = createSelectModelBlocksHTML();
					$(this).empty();
					$(this).append(html);
					
					if (importDlg.importFor == "BLSCPIAllUrbanConsumers"){
						dlg.find(".addAnotherItem").off("click").on("click",function(e){
							
							var areaCds = $(dlg).find(".areaCode");
							var itemCds = $(dlg).find(".itemCode");
							
							importDlg.series = [];
							if(areaCds && itemCds) {
								var flag = false,msg = "";
								$(areaCds).parent().css("border" ,"none");
								$(itemCds).parent().css("border" ,"none");
								$.each(areaCds,function(i,ac){
									var obj = {};
									var itc = itemCds[i];
									if ($(ac).val() == "default") {
										flag = true;
										msg = "Please select Area code";
										$(ac).parent().css("border" ,"solid 1px red");
										return false;
									} 
									if ($(itc).val() == "default") {
										flag = true;
										msg = "Please select Item code";
										$(itc).parent().css("border" ,"solid 1px red");
										return false;
									}
								});
								
								if(flag) {
									Util.showMessage(msg);
									return;
								}
							}
								
							var noItems = dlg.find(".listOfItems tr").length;
							if (noItems < 50) {
								var mrk = '<tr><td>';
								mrk += renderAreaCodes();
								mrk +='</td><td>' ;
								mrk +=renderItemCodes() ;
								mrk += '</td><td style="width:10%;text-align: center;">\
									<img src="resources/images/delete.png" class="delItem">\
									</td>';
								mrk += '</tr>';
								dlg.find(".listOfItems").append(mrk);
								
								addRemoveItemEvent(dlg);
							} else {
								Util.showMessage("Reached the maximum number - can not add more");
							}
						});	
					} else if (importDlg.importFor == "BLSPPIIndustryDataCurrentSeries") {
							dlg.find(".addAnotherItem").off("click").on("click",function(e){
							
							var industryCds = $(dlg).find(".industryCode");
							var productCds = $(dlg).find(".productCode");
							
							importDlg.series = [];
							if(industryCds && productCds) {
								var flag = false,msg = "";
								$(industryCds).parent().css("border" ,"none");
								$(productCds).parent().css("border" ,"none");
								$.each(industryCds,function(i,ic){
									var obj2 = {};
									var pc = productCds[i];
									if ($(ic).val() == "default") {
										flag = true;
										msg = "Please select Industry code";
										$(ic).parent().css("border" ,"solid 1px red");
										return false;
									} 
									if ($(pc).val() == "default") {
										flag = true;
										msg = "Please select Product code";
										$(pc).parent().css("border" ,"solid 1px red");
										return false;
									}
								});
								
								if(flag) {
									Util.showMessage(msg);
									return;
								}
							}
								
							var noItems = dlg.find(".listOfItems tr").length;
							if (noItems < 50) {
								var mrk = '<tr><td>';
								mrk += renderIndustryCodes();
								mrk +='</td><td>' ;
								mrk +=renderProductCodes() ;
								mrk += '</td><td style="width:10%;text-align: center;">\
									<img src="resources/images/delete.png" class="delItem">\
									</td>';
								mrk += '</tr>';
								dlg.find(".listOfItems").append(mrk);
								
								dlg.find(".industryCode").off("change").on("change",function(e){
									return handleIndustryCodeChangeEvent(dlg,$(this));
								});
								
								addRemoveItemEvent(dlg);
							} else {
								Util.showMessage("Reached the maximum number - can not add more");
							}
						});
							
							dlg.find(".industryCode").off("change").on("change",function(e){
								return handleIndustryCodeChangeEvent(dlg,$(this));
							});
					}


					dlg.find(".fromYear").off("change").on("change",function(e){
						return handleYearChangeEvent(dlg);
					});
					dlg.find(".toYear").off("change").on("change",function(e){
						return handleYearChangeEvent(dlg);
					});
						
					importDlg.dialogs[name]=$(this);
					bindSelectModelEvents ();
					
					dlg.find(".industryCode").trigger("change");

				},
				buttons : {
					"Cancel" : function(event) {
						cancelDialogs ();
					},
					"Prev" : function(event) {
						$(this).dialog("close");
						importDlg.buttonMode = "Prev";
						importDlg.refMap = {};
						importDlg.dialogs["MappingsList"].dialog("open");
					},
					"Next" : function(event) {
						Util.showSpinner();
						importDlg.buttonMode = "Next";
						nextSelectBlockCB (blkDlg);
						Util.hideSpinner();
					}
				}
			});

		});
		
	};

	return this;

};