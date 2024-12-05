
var finDataImportWizard = function(modelId){
	var mode, vAppId, workspaceId;
	if (window.vAppController) {
		mode = "VAppImport";
		vAppId = window.vAppController.vapp.vappId;
		workspaceId = window.vAppController.vapp.currentWorkspace;
	}
	
	this.dialogs = {};
	this.modelId = modelId;
	var importDlg = this;

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
		
		var fdt = $("input[dataattr='fromDt']").datepicker("getDate");
		var tdt = $("input[dataattr='toDt']").datepicker("getDate");
		if (!fdt) {
			Util.showMessage("Please select From Date");
			return false;
		} 
		if (!tdt) {
			Util.showMessage("Please select To Date");
			return false;
		}
		if (fdt && tdt && fdt > tdt) {
			Util.showMessage("To date must be greater than from date");
			return false;
		}
		
		// Read ticker information
		//var blk = $(".mappingList"+"."+blkName);
    	//var chkBoxes = $(blk).find('input[type="checkbox"]');
		var chkBoxes = $(".selectedBlocks .blockProps.docInputs.ticker:checked");
		var tickers = [];
		if (chkBoxes.length && chkBoxes.length > 0) {
			for (var i=0; chkBoxes && i<chkBoxes.length; i++){
	    		var row=chkBoxes[i];
	       		if ($(row).is(':checked')){
	    			var val=$(row).attr('dataValue');
	    			tickers.push(val);
	    		}
	    	}
		} else {
			Util.showMessage("Please Select Ticker");
			return;
		}
    	if (tickers.length > 0)
    		importDlg.blockInputs.tickers = tickers;
		dlg.dialog("close");
		importDlg.blockInputs.blocks = blocks;
		importDlg.getMappingList ();
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
/*    	markup += '<tr>';

    	markup += '<td>';
      	markup += '<select style="width:230px;" mapType="matchList">';
    	for (var i=0; importDlg.modelMatchedMappings && i<importDlg.modelMatchedMappings.length; i++){
    		var mapFileName = importDlg.modelMatchedMappings[i].name;
    		var id = importDlg.modelMatchedMappings[i].id;
    		markup += '<option value="'+id+'" selected>'+mapFileName+'</option>';
    	}
    	markup += '</select>';
    	markup += '</td>';
    	markup += '</tr>';*/

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
/*    	case 'mapFiles':
       		console.log ("Selected mapping file from matched map files list ....!!");
    		var id = $('div[ui-role="importSelectMapDlg"]').find('select[mapType="matchList"]').val();
    		importDlg.refMap = getReferenceMapById (importDlg.modelMatchedMappings, id);
    		console.log ("Reference Map is: "+ JSON.stringify(importDlg.refMap));
    		break;*/
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

	this.createFinDataImprtDlg = function () {
//	var createSelectMappingsDialog = function () {
		var mapDlg = $('<div ui-role="importSelectMapDlg" ></div>');
		var isExist = $('body').find('div[ui-role="importSelectMapDlg"]');
		if (isExist.length > 0) {
			return;
		}

		var title = "ImportWizard: SelectMapType";
		var name = "MappingsList";

		$(mapDlg).dialog({
				width :  500,
				height : 300,
				title : title,
				
				create: function (event, ui){
					var c = this;
/*					var obj1 = {};
					obj1['modelId']=importDlg.modelId;
					obj1['fileName']=importDlg.originalFile;
					obj1['mappingFor']="FinHistoricalData";*/

					var obj2={};
					obj2['modelId']=importDlg.modelId;
					obj2['mappingFor']="FinHistoricalData";

					$.when(
						Util.diff_ajaxGet ("model/blockdimensions/"+importDlg.modelId, function(result){
							if (!result.Status) {
								Util.showMessage (result.Message);
							} else {
								importDlg.modelBlks = result.Blocks;
							}
						}),

/*						Util.diff_ajaxPost ("import/getmappings", obj1, function(result){
							if (!result.Status) {
								Util.showMessage (result.Message);
							} else {
								importDlg.modelMatchedMappings = result.Data;
							}
						}),*/

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
						
						importDlg.buttonMode = "Next";
						nextSelectedMappingsCB (mapDlg);
					}
				}
		});

	 };

/*	 this.importModel = function (importedFile, originalFile, modelId) {
	    	var mappingsTypeDlg = importDlg.dialogs["mappingsType"];
	    	if (mappingsTypeDlg){
	    		mappingsTypeDlg.dialog("open");
	    		return;
	    	} else {
	    		this.modelId = modelId;
	    	   	this.importedFile = importedFile;
	    	   	this.originalFile = originalFile;
	    		createSelectMappingsDialog ();
	    	}
	    };*/

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
       		markup += '<input type="checkbox" class="blockProps newBlocks" dataType ="boolean" dataMode="blocks" checked disabled>';
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
/*
    var createBlockDialog = function () {
    	var blkDlg = $('<div ui-role="importSelectBlkDlg" ></div>');
		var isExist = $('body').find('div[ui-role="importSelectBlkDlg"]');
		if (isExist.length > 0) {
			return;
		}

		//var title = "ImportWizard: BrowseBlock - "+importDlg.originalFile;
		var name = "BrowseBlock";

		$(blkDlg).dialog({
				width :  500,
				height : 300,
				title : title,

				create: function (event, ui){
				},

				open : function (event,ui) {
					var html = createSelectModelBlocksHTML();
					$(this).empty();
					$(this).append(html);
					importDlg.dialogs[name]=$(this);

					bindSelectModelEvents ();
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
						importDlg.buttonMode = "Next";
						nextSelectBlockCB (blkDlg);
					}
				}
		});

    };
*/
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

			if (err.status && inputs[key].TickerCol == "Select Ticker Column"){
				if (type != "measure"){
					err.status = false;
					err.msg = "Please select columns for "+type +": "+blk+"."+key;
					break;
				}
			}
			if (type == "measure" && inputs[key].TickerCol != "Select Ticker Column")
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

/*    var getTickerHistoryColsJSON = function (mappings, processType, fileName, newBlocks) {
    	var json = {};

    	json['modelId'] = importDlg.modelId;
    	json['sourceSystem'] = importDlg.blockInputs.sourceSystem;
    	json['tickerSymbol'] = importDlg.blockInputs.tickerSymbol;
    	json['process']= processType;
    	if (mappings.length){
    		json['mappings'] = mappings;
    	}
    	if (newBlocks && newBlocks.length){
    		json['newBlocks']=newBlocks;
    	}

    	return json;
    };*/


    var getFinImportJSON = function (mappings, processType, sourceSystem, tickerSymbol, newBlocks, fromDt, toDt) {
    	var json = {};
    	
    	json['modelId'] = importDlg.modelId;
    	json['sourceSystem'] = sourceSystem;
    	var tickerSymbols="";
    	for (var i=0; i<tickerSymbol.length; i++){
    		tickerSymbols+="'"+tickerSymbol[i]+"'";
    		if (i+1<tickerSymbol.length){
        		tickerSymbols+=","
    		}
    	}

    	json['tickerSymbol'] = tickerSymbols;
    	json['fromDt'] = fromDt;
    	json['toDt'] = toDt;
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
    			obj['TickerCol'] = csv;
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

    		obj['TickerCol'] = csv;
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
    		if (map[key].type == 'measure' && map[key].TickerCol == "Select Ticker Column"){
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

		//create the JSON strucuture to import
    	importDlg.json = getFinImportJSON (importDlg.mappingInputs, "Validate", importDlg.blockInputs.sourceSystem, importDlg.blockInputs.tickers, importDlg.newBlocks, importDlg.blockInputs.fromDt, importDlg.blockInputs.toDt);
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
				width :  600,
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
/*					inputObj.fileName = importDlg.importedFile;
					inputObj.delimiter = importDlg.blockInputs.delimiter;
					inputObj.lineSep = importDlg.blockInputs.separator;*/
					inputObj.sourceSystem = importDlg.blockInputs.sourceSystem;

					//Util.ajaxPost ("import/csv/columns", inputObj, function(result){
					Util.ajaxPost ("importFinData/ticker/historyCols", inputObj, function(result){

			    		if (!result.Status) {
							Util.showMessage (result.Message);
						} else {
							importDlg.columns = result.TickerHistoryColumns;
							var html = createSelectMappingListHTML();
							$(current).empty();
							$(current).append(html);

							bindSelectMapEvents();

						//	var dataTypeDiv = $('body').find('div[ui-role="importMappingDlg"]').find("select[class='elementDataType']");
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
		    		<tr> <th> Block Fields </th> <th> Ticker Element </th> </tr></table>\
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
			    		var none = "Select Ticker Column";
			        	markup += '<option value="'+none+'">'+none+'</option>';
			        	var refBlk=null;
			        	if (!$.isEmptyObject(importDlg.refMap)){
			        		refBlk = getBlockFromRefMap (importDlg.refMap, blkName);
			        	}
			    		for (var j=0; j<columns.length; j++){
			    			if (!$.isEmptyObject(importDlg.refMap) && refBlk) {
			    				if (refBlk.blockMapping && refBlk.blockMapping[dim.name]['TickerCol'] == columns[j])
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
			    		var none = "Select Ticker Column";
			        	markup += '<option value="'+none+'">'+none+'</option>';
			        	var refBlk=null;
			        	if (!$.isEmptyObject(importDlg.refMap)){
			        		refBlk = getBlockFromRefMap (importDlg.refMap, blkName);
			        	}
			    		for (var j=0; j<columns.length; j++){
			    			if (!$.isEmptyObject(importDlg.refMap) && refBlk) {
			    				if (refBlk.blockMapping && refBlk.blockMapping[ms.name]['TickerCol'] == columns[j])
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
		    		<tr> <th>Ticker Element</th> <th>Role</th> <th>Name</th> <th>Type</th>  <th>Format</th> </tr> </table>\
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
        	mapJson['mappingFor']="FinHistoricalData";
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
		var TickerData = importDlg.preview.TickerData;

		for (var j=0; blocks && j<blocks.length; j++){
			var blkName = blocks[j].Name;

			for (var i=0; TickerData && i<TickerData.length; i++) {
				var csvBlk = TickerData[i];
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
    	// Remove following code after removeing the default value restriction by Sunil.
/*    	if (json['newBlocks']){
    		addDimensionDefaultValues(json['newBlocks']);
    	}*/
    	
    	console.log("Import input JSON structure : "+ JSON.stringify (json));
		//Util.ajaxPost ("import/csv", json, function(result){
		Util.ajaxPost ("importFinData/yahooTickerHistory", json, function(result){
    		if (!result.Status) {
				Util.showMessage ("Import process failed : "+ result.Message);
			} else {
				Util.showMessage ("Import Completed successfully");

				if (mode == "VAppImport") {
					window.vAppController.switchWorkspace(workspaceId);
				}
				
/*				if (!(importDlg.refMap && importDlg.refMap.id) && !importDlg.savedMap.id) { // do only new mappings
					var mapJson = getMappedJSON ();
		        	importDlg.mappingJson = mapJson;
		        	mapJson['name']=importDlg.originalFile;
		        	mapJson['mappingFor']="FinHistoricalData";
		         	delete (mapJson['options']);
		         	delete (mapJson['newBlocks']);
		    		Util.ajaxPost ("import/savemapping", mapJson, function(result){
		        		if (!result.Status) {
		    				Util.showMessage ("Faield to save mapping : "+ result.Message);
		    			} else {
		    				importDlg.savedMap = result.Data;
		    			//	Util.showMessage ("Mapping's saved successfully");
		    			}
		    		},false,true);
				}*/
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
       	var TickerData = importDlg.preview.TickerData;
    	var markup="";

    	for (var i=0; TickerData && i<TickerData.length; i++) {
    		var csvBlk = TickerData[i];
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
/*			markup += '<tr style="background-color: #B7D6FC;">';
			markup += '<td style="width:50%;">';
			markup += 'Total Rows : '+csvBlk.TotalRecCount;
			markup += '</td>';

			markup += '<td style="width:50%;">';
			markup += 'Invalid Rows : '+csvBlk.InvalidRecCount;
			markup += '</td>';
			markup += '</tr>';*/

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
    	for (var i=0; result.TickerData && i<result.TickerData.length; i++){
    		var blk = result.TickerData[i];
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

					//Util.ajaxPost ("import/csv", importDlg.json, function(result){
					Util.ajaxPost ("importFinData/yahooTickerHistory", importDlg.json, function(result){
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


    /////

    /*	this.createFinDataImprtDlg = function() {
	var finDlg = $('<div ui-role="finDataImprt" ></div>');
	var isExist = $('body').find('div[ui-role="finDataImprt"]');
	if (isExist.length > 0) {
		return false;
	}
	var title = " ";
//	var c = this;
	$(finDlg).dialog({
			width :  600,
			height : 400,
			//title : title,
			create: function (event, ui){
				var current = this;
				$.when(
						Util.diff_ajaxGet ("model/blockdimensions/"+importDlg.modelId, function(result){
							if (!result.Status) {
								Util.showMessage (result.Message);
							} else {
								importDlg.modelBlks = result.Blocks;
							}
						})

					).then(function(){

						var html = createSelectMappingsHTML();
						$(c).empty();
						$(c).append(html);
						importDlg.dialogs[name]=$(c);
					//});
				var markup ='<table style="width:100%;"><tbody>';
				markup += '<table border="1" class="selectedBlocks" style="width:100%">';
		    	var importFrom = 	{	"Yahoo Finance": "Yahoo",
						"Bloomberg" : "Bloomberg",
						"Xignite": "Xignite"
					};
		    	markup += '<br><br>';
		    	markup += '<tr>';

		    	markup += '<td>';
		    	markup += "Select Blocks";
		    	markup += '</td>';

		    	markup += '<td>';

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

		    		markup += '<input type="checkbox" dataAttr="'+blk.name+'" >';

		    		markup += "   "+blk.name;
		    //		markup += '<br>';
		    		markup += '</td>';
		        	markup += '</tr>';
		    	}

		    	markup += '</table>';

		    	// Add another row element
		    	markup += '<tr>';

		    	markup += '<td>Import From</td>';

		    	markup += '<td>';
		    	markup += '<select class="blockProps docInputs" dataAttr="sourceSystem">';
		    	$.each(importFrom, function(key, value) {
		    		if ((!$.isEmptyObject(importDlg.refMap) && importDlg.refMap.sourceSystem == value) || (key == "Yahoo Finance")){
		    			markup += '<option value="'+value+'" selected>'+key+'</option>';
		    		} else {
		    			markup += '<option value="'+value+'">'+key+'</option>';
		    		}


				});

		    	markup += '</select>';
		    	markup += '</td>';

		    	markup += '</tr>';
		    	// Add another row element
				markup +='<tr>\
						<td style="width:50%;">Import From</td>\
						<td style="width:50%;">\
							<select style="width:100%;">\
								<option value="yahoo">Yahoo</option>\
								<option value="bloomberg">BloomBerg</option>\
							</select>\
						</td>\
					</tr>\
					<tr>\
						<td style="width:50%;">From</td>\
						<td style="width:50%;"><input type="text" data-id="datepicker" style="width:100%;"></td>\
					</tr>\
					<tr>\
						<td style="width:50%;">To</td>\
						<td style="width:50%;"><input type="text" data-id="datepicker" style="width:100%;"></td>\
					</tr>\
					<tr>\
						<td style="width:50%;">Ticker</td>\
						<td style="width:50%;"><input type="checkbox">Yahoo<br>\
												<input type="checkbox">Apple<br>\
						</td>\
					</tr>\
					</tbody></table>';
				$(current).html(markup);
				$(current).find('input[data-id="datepicker"]').datepicker();
					});
			},
			close : function (event,ui) {
				$(this).dialog("destroy");
			},
			buttons : {
				"Cancel" : function(event) {
					$(this).dialog("close");
				},
				"Next" : function(event) {

				}
			}
	});
};*/

var createSelectModelBlocksHTML = function (){
	var markup = '<table border="1" class="selectedBlocks" style="width:100%">';
	var importFrom = 	{	"Yahoo Finance": "Yahoo",
			"Bloomberg" : "Bloomberg",
			"Xignite": "Xignite"
		};

	markup += '<br>';
	markup += '<tr>';

	markup += '<td>';
	markup += "Select Blocks";
	markup += '</td>';

	markup += '<td>';

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

	markup += '<td>Import From</td>';

	markup += '<td>';
	markup += '<select class="blockProps docInputs" dataAttr="sourceSystem" style="width: 100%;">';
	$.each(importFrom, function(key, value) {
		if ((!$.isEmptyObject(importDlg.refMap) && importDlg.refMap.sourceSystem == value) || (key == "Yahoo Finance")){
			markup += '<option value="'+value+'" selected>'+key+'</option>';
		} else {
			markup += '<option value="'+value+'">'+key+'</option>';
		}
	});

	markup += '</select>';
	markup += '</td>';

	markup += '</tr>';

	// Add another row element

	markup +='<tr><td style="width:50%;">From</td>';
	if(!$.isEmptyObject(importDlg.refMap) && importDlg.refMap["fromDt"]) {
		markup +='<td style="width:50%;"><input type="text" value="'+importDlg.refMap["fromDt"]+'" class="blockProps docInputs" data-id="datepicker" style="width:100%;" dataAttr="fromDt"></td>';
	} else {
		markup +='<td style="width:50%;"><input type="text" class="blockProps docInputs" data-id="datepicker" style="width:100%;" dataAttr="fromDt"></td>';
	}
	
	markup +='</tr><tr><td style="width:50%;">To</td>';
	
	if(!$.isEmptyObject(importDlg.refMap) && importDlg.refMap["toDt"]) {
		markup +='<td style="width:50%;"><input type="text" value="'+importDlg.refMap["toDt"]+'" class="blockProps docInputs" data-id="datepicker" style="width:100%;" dataAttr="toDt"></td>';
	} else {
		markup +='<td style="width:50%;"><input type="text" class="blockProps docInputs" data-id="datepicker" style="width:100%;" dataAttr="toDt"></td>';
	}
	markup +='</tr>';
	markup +='<tr>';
	markup +='<td style="width:50%;">Ticker</td>';
	markup +='<td style="width:50%;"><div style="height: 110px; overflow: auto;">';
	
	var tickerSymbol =[];
	
	if(!$.isEmptyObject(importDlg.refMap) && importDlg.refMap["tickerSymbol"]) {
		tickerSymbol = importDlg.refMap["tickerSymbol"].replace(/'/g,"").split(",");
	} 
	
	if (!$.isEmptyObject(importDlg.finacialData)) {
		$.each(importDlg.finacialData,function(i,v){
			if ($.inArray(v["code"],tickerSymbol) != -1) {
				markup +='<input type="checkbox" class="blockProps docInputs ticker" dataValue="'+v["code"]+'" checked>'+v["ticker"]+'<br>';
			} else {
				markup +='<input type="checkbox" class="blockProps docInputs ticker" dataValue="'+v["code"]+'" >'+v["ticker"]+'<br>';
			}
		});
	}
	
	markup +='</div></td></tr>\
		</tbody></table>';

	return markup;
};


//    this.createFinDataImprtDlg = function () {

var createBlockDialog = function () {
	var blkDlg = $('<div ui-role="importSelectBlkDlg" ></div>');
	var isExist = $('body').find('div[ui-role="importSelectBlkDlg"]');
	if (isExist.length > 0) {
		return;
	}

	var title = "ImportWizard: Browse Ticker Information";
	var name = "ImportFinancialData";

	$(blkDlg).dialog({
			width :  600,
			height : 400,
			title : title,

			create: function (event, ui){

				var current = this;
				$.when(
						Util.ajaxSyncGet ("model/blockdimensions/"+importDlg.modelId, function(result){
							if (!result.Status) {
								Util.showMessage (result.Message);
							} else {
								importDlg.modelBlks = result.Blocks;
							}
						}),
						Util.ajaxSyncGet ("financial/data/Yahoo", function(result){
							if (!result.Status) {
								Util.showMessage (result.Message);
							} else {
								importDlg.finacialData = result.Data;
								importDlg.finacialData = sortByKey(importDlg.finacialData, 'ticker');;
							}
							
							function sortByKey(array, key) {
							    return array.sort(function(a, b) {
							        var x = a[key]; var y = b[key];
							        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
							    });
							}
						})

					).then(function(){
						/*
						var html = createSelectModelBlocksHTML();
						$(current).empty();
						$(current).append(html);
						$(current).find('input[data-id="datepicker"]').datepicker({
							constrainInput: true,
							dateFormat: "mm/dd/yy",
							maxDate: "+0d"
						});
						importDlg.dialogs[name]=$(current);

						bindSelectModelEvents ();*/
					});

			},

			open : function (event,ui) {			
				var html = createSelectModelBlocksHTML();
				$(this).empty();
				$(this).append(html);
				$(this).find('input[data-id="datepicker"]').datepicker({
					constrainInput: true,
					dateFormat: "mm/dd/yy",
					maxDate: "+0d"
				});
				importDlg.dialogs[name]=$(this);

				bindSelectModelEvents ();
				
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
					importDlg.buttonMode = "Next";
					nextSelectBlockCB (blkDlg);
				}
			}
	});

};

return this;

};