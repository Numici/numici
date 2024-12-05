
var finBEADataImportWizard = function(modelId,menuRole){
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
	
	if (this.menuRole == "beaGDPbyIndustryHistory") {
		this.forBEADataSet = "GDPBYINDUSTRY";
		this.importFor = "BEAGDPbyIndustry";
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
		
	
		// Read listOfYear information
		var chkBoxes = $(".selectedBlocks .blockProps.docInputs.listOfYear:checked");
		var listOfYears = [];
		if (chkBoxes && chkBoxes.length > 0) {
			$.each(chkBoxes,function(i,chk) {
				if ($(chk).is(':checked')){
	    			var val=$(chk).attr('dataValue');
	    			if (val == "ALL") {
	    				listOfYears = [];
	    				listOfYears.push(val);
	    				return false;
	    			} else {
	    				listOfYears.push(val);
	    			}
	    		}
			});
		} else {
			Util.showMessage("Please Select Years");
			return;
		}
    	if (listOfYears.length > 0)
    		importDlg.blockInputs.listOfYears = listOfYears;
		
		// Read listOfIndustry information
		var chkBoxes = $(".selectedBlocks .blockProps.docInputs.listOfIndustry:checked");
		var listOfIndustrys = [];
		if (chkBoxes && chkBoxes.length > 0) {
			$.each(chkBoxes,function(i,chk) {
				if ($(chk).is(':checked')){
	    			var val=$(chk).attr('dataValue');
	    			if (val == "ALL") {
	    				listOfIndustrys = [];
	    				listOfIndustrys.push(val);
	    				return false;
	    			} else {
	    				listOfIndustrys.push(val);
	    			}
	    		}
			});
		} else {
			Util.showMessage("Please Select Industry");
			return;
		}
    	if (listOfIndustrys.length > 0)
    		importDlg.blockInputs.listOfIndustrys = listOfIndustrys;
		
		// Read listOfTableID information
		var chkBoxes = $(".selectedBlocks .blockProps.docInputs.listOfTableID:checked");
		var listOfTableIDs = [];
		if (chkBoxes.length && chkBoxes.length > 0) {
			$.each(chkBoxes,function(i,chk) {
				if ($(chk).is(':checked')){
	    			var val=$(chk).attr('dataValue');
	    			if (val == "ALL") {
	    				listOfTableIDs = [];
	    				listOfTableIDs.push(val);
	    				return false;
	    			} else {
	    				listOfTableIDs.push(val);
	    			}
	    		}
			});
		} else {
			Util.showMessage("Please Select Table");
			return;
		}
    	if (listOfTableIDs.length > 0)
    		importDlg.blockInputs.listOfTableIDs = listOfTableIDs;

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

	this.createFinBEADataImprtDlg = function () {
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
						
						importDlg.buttonMode = "Next";
						nextSelectedMappingsCB (mapDlg);
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

			if (err.status && inputs[key].BEACol == "Select BEA Column"){
				if (type != "measure"){
					err.status = false;
					err.msg = "Please select columns for "+type +": "+blk+"."+key;
					break;
				}
			}
			if (type == "measure" && inputs[key].BEACol != "Select BEA Column")
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

    var getFinImportJSON = function (mappings, processType, dataGroup, statementFrequency, listOfYear, listOfIndustry, listOfTableID, newBlocks) {
    	var json = {};

    	json['modelId'] = importDlg.modelId;
    	json['dataGroup'] = dataGroup;
    	json['statementFrequency'] = statementFrequency;

    	var listOfYears="";
    	for (var i=0; i<listOfYear.length; i++){
    		listOfYears+=listOfYear[i];
    		if (i+1<listOfYear.length){
        		listOfYears+=","
    		}
    	}
    	json['listOfYears'] = listOfYears;

    	var listOfIndustrys="";
    	for (var i=0; i<listOfIndustry.length; i++){
    		listOfIndustrys+=listOfIndustry[i];
    		if (i+1<listOfIndustry.length){
        		listOfIndustrys+=","
    		}
    	}
    	json['listOfIndustry'] = listOfIndustrys;
    	
    	var listOfTableIDs="";
    	for (var i=0; i<listOfTableID.length; i++){
    		listOfTableIDs+=listOfTableID[i];
    		if (i+1<listOfTableID.length){
        		listOfTableIDs+=","
    		}
    	}
    	json['listOfTable'] = listOfTableIDs;
    	
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
    			obj['BEACol'] = csv;
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

    		obj['BEACol'] = csv;
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
    		if (map[key].type == 'measure' && map[key].BEACol == "Select BEA Column"){
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
		importDlg.json = getFinImportJSON (importDlg.mappingInputs, "Validate", importDlg.forBEADataSet, importDlg.blockInputs.statementFrequency, importDlg.blockInputs.listOfYears, importDlg.blockInputs.listOfIndustrys, importDlg.blockInputs.listOfTableIDs, importDlg.newBlocks);
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
					
					inputObj.dataGroup = importDlg.forBEADataSet;
					inputObj.statementFrequency = importDlg.blockInputs.statementFrequency;
					
					Util.diff_ajaxPost ("importBEAFinData/beaCols/", inputObj, function(result){

			    		if (!result.Status) {
							Util.showMessage (result.Message);
						} else {
							importDlg.columns = result.BEADataSetColumns;
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
			    		var none = "Select BEA Column";
			        	markup += '<option value="'+none+'">'+none+'</option>';
			        	var refBlk=null;
			        	if (!$.isEmptyObject(importDlg.refMap)){
			        		refBlk = getBlockFromRefMap (importDlg.refMap, blkName);
			        	}
			        	
			    		for (var j=0; j<columns.length; j++){
			    			if (!$.isEmptyObject(importDlg.refMap) && refBlk) {
			    				if (refBlk.blockMapping && refBlk.blockMapping[dim.name]['BEACol'] == columns[j])
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
			    		var none = "Select BEA Column";
			        	markup += '<option value="'+none+'">'+none+'</option>';
			        	var refBlk=null;
			        	if (!$.isEmptyObject(importDlg.refMap)){
			        		refBlk = getBlockFromRefMap (importDlg.refMap, blkName);
			        	}
			    		for (var j=0; j<columns.length; j++){
			    			if (!$.isEmptyObject(importDlg.refMap) && refBlk) {
			    				if (refBlk.blockMapping && refBlk.blockMapping[ms.name]['BEACol'] == columns[j])
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
		var BEAData = importDlg.preview.BEAData;

		for (var j=0; blocks && j<blocks.length; j++){
			var blkName = blocks[j].Name;

			for (var i=0; BEAData && i<BEAData.length; i++) {
				var csvBlk = BEAData[i];
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
		Util.ajaxPost ("importBEAFinData/beaFinData", json, function(result){
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
       	var BEAData = importDlg.preview.BEAData;
    	var markup="";

    	for (var i=0; BEAData && i<BEAData.length; i++) {
    		var csvBlk = BEAData[i];
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
    	for (var i=0; result.BEAData && i<result.BEAData.length; i++){
    		var blk = result.BEAData[i];
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

					Util.ajaxPost ("importBEAFinData/beaFinData", importDlg.json, function(result){
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

	markup += '<td style="width:20%;">Frequency</td>';

	markup += '<td style="width:80%;">';
	
	if (!$.isEmptyObject(importDlg.beaFinacialDataFrequency)) {
		markup += '<select disabled class="blockProps docInputs statementFrequency" dataAttr="statementFrequency" style="width: 100%;"><div>';
			$.each(importDlg.beaFinacialDataFrequency, function(i, v) {
				if ($.inArray(v["key"],importDlg.beaFinacialDataFrequency) != -1) {
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
	markup +='<tr>';
	markup +='<td style="width:20%;">Years</td>';
	markup +='<td style="width:80%;" data-role="years"><div style="height: 70px; overflow: auto;">';

	var listOfYear =[];
	
	if(!$.isEmptyObject(importDlg.refMap) && importDlg.refMap["listOfYears"]) {
		listOfYear = importDlg.refMap["listOfYears"].replace(/'/g,"").split(",");
	} 
	
	if (!$.isEmptyObject(importDlg.beaFinacialDataYear)) {
		if ( $.inArray("ALL",listOfYear) != -1) {
			markup +='<input type="checkbox" class="blockProps docInputs listOfYear" dataValue="ALL" checked>Select All<br>';
			$.each(importDlg.beaFinacialDataYear,function(i,v){
					markup +='<input type="checkbox" class="blockProps docInputs listOfYear" dataValue="'+v["key"]+'" checked>'+v["desc"]+'<br>';
			});
		} else {
			markup +='<input type="checkbox" class="blockProps docInputs listOfYear" dataValue="ALL" >Select All<br>';
			$.each(importDlg.beaFinacialDataYear,function(i,v){
				if ($.inArray(v["key"],listOfYear) != -1) {
					markup +='<input type="checkbox" class="blockProps docInputs listOfYear" dataValue="'+v["key"]+'" checked>'+v["desc"]+'<br>';
				} else {
					markup +='<input type="checkbox" class="blockProps docInputs listOfYear" dataValue="'+v["key"]+'" >'+v["desc"]+'<br>';
				}
			});
		}

	}
	
	markup +='</div></td></tr>';
	
	// Add another row element
	markup +='<tr>';
	markup +='<td style="width:20%;">Industries</td>';
	markup +='<td style="width:80%;" data-role="industries"><div style="height: 70px; overflow: auto;">';

	markup +='</div></td></tr>';
	
	// Add another row element
	markup +='<tr>';
	markup +='<td style="width:20%;">Tables</td>';
	markup +='<td style="width:80%;" data-role="tables"><div style="height: 70px; overflow: auto;">';
	
	markup +='</div></td></tr>\
	</tbody></table>';

	return markup;
};


var createBlockDialog = function () {
	var blkDlg = $('<div ui-role="importSelectBlkDlg" ></div>');
	var isExist = $('body').find('div[ui-role="importSelectBlkDlg"]');
	if (isExist.length > 0) {
		return;
	}

	var title = "ImportWizard: Browse Industry Information";
	var name = "ImportFinancialData";
	
	var current = this;

	var forListOfYear={};
	forListOfYear['dataSetName']=importDlg.forBEADataSet;
	forListOfYear['parameterName']="YEAR";
	
	var forFrequency={};
	forFrequency['dataSetName']=importDlg.forBEADataSet;
	forFrequency['parameterName']="FREQUENCY";
	
	$.when(
			Util.diff_ajaxGet ("model/blockdimensions/"+importDlg.modelId, function(result){
				if (!result.Status) {
					Util.showMessage (result.Message);
				} else {
					importDlg.modelBlks = result.Blocks;
				}
			}),
			Util.diff_ajaxPost ("importBEAFinData/getBEAFinDataCollection/", forListOfYear, function(result){
				if (!result.Status) {
					Util.showMessage (result.Message);
				} else {
					importDlg.beaFinacialDataYear = result.Data;
					importDlg.beaFinacialDataYear = sortByKey(importDlg.beaFinacialDataYear, 'key');;
				}
				
				function sortByKey(array, key) {
				    return array.sort(function(a, b) {
				        var x = a[key]; var y = b[key];
				        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
				    });
				}
				
			}),
			Util.diff_ajaxPost ("importBEAFinData/getBEAFinDataCollection/", forFrequency, function(result){
				if (!result.Status) {
					Util.showMessage (result.Message);
				} else {
					importDlg.beaFinacialDataFrequency = result.Data;
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
					
					dlg.find(".listOfYear").off("change").on("change",function(e){
						var chk3 = $(this);
						var otrchk3 = chk3.siblings("input");
						if(chk3.attr("dataValue") == "ALL") {
							if(chk3.is(":checked")) {
								$(otrchk3).prop("checked",true);
							} else {
								$(otrchk3).prop("checked",false);
							}
						} else {
							var allchk3 = chk3.parent().find("input[dataValue='ALL']");
							if(chk3.is(":checked")) {
								$.each(otrchk3,function(i,v){
									if($(v).attr("dataValue") != "ALL") {
										if (!$(v).is(":checked")) {
											$(allchk3).prop("checked",false);
											return false;
										} else {
											$(allchk3).prop("checked",true);
										}
									}
								});
							} else {
								$(allchk3).prop("checked",false);
							}
							
						}
					});
					
					
					$(this).find(".statementFrequency").off("change").on("change",function(){
						var forListOfIndustry={};
						forListOfIndustry['dataSetName']=importDlg.forBEADataSet;
						forListOfIndustry['parameterName']="INDUSTRY";
						//forListOfIndustry['descriptionName']="("+$(this).val()+")";
						if ($(this).val() == "A") {
							forListOfIndustry['descriptionName']="\\(A";
						} else if ($(this).val() == "Q") {
							forListOfIndustry['descriptionName']="Q\\)";
						}
						
						var forListOfTableID={};
						forListOfTableID['dataSetName']=importDlg.forBEADataSet;
						forListOfTableID['parameterName']="TABLEID";
						//forListOfTableID['descriptionName']="("+$(this).val()+")";
						if ($(this).val() == "A") {
							forListOfTableID['descriptionName']="\\(A";
						} else if ($(this).val() == "Q") {
							forListOfTableID['descriptionName']="Q\\)";
						}
						
						Util.ajaxPost ("importBEAFinData/getBEAFinDataCollection/", forListOfIndustry, function(result){
							if (!result.Status) {
								Util.showMessage (result.Message);
							} else {
								importDlg.beaFinacialDataIndustry = result.Data;
								var listOfIndustry =[];
								var markup ="";
								if(!$.isEmptyObject(importDlg.refMap) && importDlg.refMap["listOfIndustry"]) {
									listOfIndustry = importDlg.refMap["listOfIndustry"].replace(/'/g,"").split(",");
								} 
								
								if (!$.isEmptyObject(importDlg.beaFinacialDataIndustry)) {
									if ( $.inArray("ALL",listOfIndustry) != -1) {
										markup +='<input type="checkbox" class="blockProps docInputs listOfIndustry" dataValue="ALL" checked>Select All<br>';
										$.each(importDlg.beaFinacialDataIndustry,function(i,v){
											markup +='<input type="checkbox" class="blockProps docInputs listOfIndustry" dataValue="'+v["key"]+'" checked>'+v["desc"]+'<br>';
										});
									} else {
										markup +='<input type="checkbox" class="blockProps docInputs listOfIndustry" dataValue="ALL" >Select All<br>';
										$.each(importDlg.beaFinacialDataIndustry,function(i,v){
											if ($.inArray(v["key"],listOfIndustry) != -1) {
												markup +='<input type="checkbox" class="blockProps docInputs listOfIndustry" dataValue="'+v["key"]+'" checked>'+v["desc"]+'<br>';
											} else {
												markup +='<input type="checkbox" class="blockProps docInputs listOfIndustry" dataValue="'+v["key"]+'" >'+v["desc"]+'<br>';
											}
										});
									}
								}
								
								dlg.find('td[data-role="industries"] div').html(markup);
								
								dlg.find('.listOfIndustry').off("change").on("change",function(e){
									var chk1 = $(this);
									var otrchk1 = chk1.siblings("input");
									if(chk1.attr("dataValue") == "ALL") {
										if(chk1.is(":checked")) {
											$(otrchk1).prop("checked",true);
										} else {
											$(otrchk1).prop("checked",false);
										}
									} else {
										var allchk1 = chk1.parent().find("input[dataValue='ALL']");
										if(chk1.is(":checked")) {
											$.each(otrchk1,function(i,v){
												if($(v).attr("dataValue") != "ALL") {
													if (!$(v).is(":checked")) {
														$(allchk1).prop("checked",false);
														return false;
													} else {
														$(allchk1).prop("checked",true);
													}
												}
											});
										} else {
											$(allchk1).prop("checked",false);
										}
										
									}
								});
							}
						}),
						Util.ajaxPost ("importBEAFinData/getBEAFinDataCollection/", forListOfTableID, function(result){
							
							if (!result.Status) {
								Util.showMessage (result.Message);
							} else {
								importDlg.beaFinacialDataTable = result.Data;
								var listOfTableID =[];
								var markup ="";
								if(!$.isEmptyObject(importDlg.refMap) && importDlg.refMap["listOfTable"]) {
									listOfTableID = importDlg.refMap["listOfTable"].replace(/'/g,"").split(",");
								} 
								
								if (!$.isEmptyObject(importDlg.beaFinacialDataTable)) {
									if ( $.inArray("ALL",listOfTableID) != -1) {
										markup +='<input type="checkbox" class="blockProps docInputs listOfTableID" dataValue="ALL" checked>Select All<br>';
										$.each(importDlg.beaFinacialDataTable,function(i,v){
											markup +='<input type="checkbox" class="blockProps docInputs listOfTableID" dataValue="'+v["key"]+'" checked>'+v["desc"]+'<br>';
										});
									} else {
										markup +='<input type="checkbox" class="blockProps docInputs listOfTableID" dataValue="ALL" >Select All<br>';
										$.each(importDlg.beaFinacialDataTable,function(i,v){
											if ($.inArray(v["key"],listOfTableID) != -1) {
												markup +='<input type="checkbox" class="blockProps docInputs listOfTableID" dataValue="'+v["key"]+'" checked>'+v["desc"]+'<br>';
											} else {
												markup +='<input type="checkbox" class="blockProps docInputs listOfTableID" dataValue="'+v["key"]+'" >'+v["desc"]+'<br>';
											}
										});
									}
								}
								
								dlg.find('td[data-role="tables"] div').html(markup);
								
								dlg.find('.listOfTableID').off("change").on("change",function(e){
									var chk2 = $(this);
									var otrchk2 = chk2.siblings("input");
									if(chk2.attr("dataValue") == "ALL") {
										if(chk2.is(":checked")) {
											$(otrchk2).prop("checked",true);
										} else {
											$(otrchk2).prop("checked",false);
										}
									} else {
										var allchk2 = chk2.parent().find("input[dataValue='ALL']");
										if(chk2.is(":checked")) {
											$.each(otrchk2,function(i,v){
												if($(v).attr("dataValue") != "ALL") {
													if (!$(v).is(":checked")) {
														$(allchk2).prop("checked",false);
														return false;
													} else {
														$(allchk2).prop("checked",true);
													}
												}
											});
										} else {
											$(allchk2).prop("checked",false);
										}
										
									}
								});
								
							}
						})
					}); 
					importDlg.dialogs[name]=$(this);
					bindSelectModelEvents ();
					$(this).find(".statementFrequency").trigger("change");

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

		});
	
};

return this;

};