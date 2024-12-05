var VdVc_DBData = {};

var dbDataImpWizard  = function(modelId,menuRole){
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
	
	if (this.menuRole == "dbDataImport") {
		this.importFor = "ForDBDataImport";
	}
	
	var dbMrkUp = '<table style="width:100%;">\
					<tbody>\
						<tr>\
							<td>Connection Name <em style="color:red;">*</em></td>\
							<td><input type="text" name="cname" style="width:100%;"></td>\
						</tr>\
						<tr>\
							<td>DB Type <em style="color:red;">*</em></td>\
							<td>\
								<select ui-role="dbType" style="width:100%;">\
									<option value ="default">Select DB Type</option>\
									<option value ="MySQL">MySQL</option>\
									<option value ="Oracle">Oracle</option>\
									<option value ="SQLServer">SQLServer</option>\
									<option value ="DB2">DB2</option>\
									<option value ="Sybase">Sybase</option>\
								</select >\
							</td>\
						</tr>\
						<tr>\
							<td>Host Name <em style="color:red;">*</em></td>\
							<td><input type="text" name="hname" style="width:100%;"></td>\
						</tr>\
						<tr>\
							<td>Port Number <em style="color:red;">*</em></td>\
							<td><input type="text" name="pnum" style="width:100%;"></td>\
						</tr>\
						<tr>\
							<td>Service Or DBName <em style="color:red;">*</em></td>\
							<td><input type="text" name="srname" style="width:100%;"></td>\
						</tr>\
						<tr>\
							<td>User Name <em style="color:red;">*</em></td>\
							<td><input type="text" name="usrname" style="width:100%;"></td>\
						</tr>\
						<tr>\
							<td>Password <em style="color:red;">*</em></td>\
							<td><input type="password" name="pwd" style="width:100%;"></td>\
						</tr>\
						<tr>\
							<td>Share Connection</td>\
							<td><input type="checkbox" name="shareC" ></td>\
						</tr>\
						<tr>\
							<td>Description</td>\
							<td><textarea  name="desc" rows="5" style="width:100%;"></textarea></td>\
						</tr>\
					</tbody>\
				</table>'; 

	
	//Generic Functions
	
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
	
	this.createDBDataImprtDlg = function () {
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
						Util.showSpinner("manual");
						importDlg.buttonMode = "Next";
						nextSelectedMappingsCB (mapDlg);
						Util.hideSpinner("manual");
					}
				}
		});

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

    this.getMappingList = function () {
    	var mapDlg = importDlg.dialogs["MappingDimensions"];
    	if (mapDlg){
    		mapDlg.dialog("open");
    		return;
    	} else {
    	   	createMappingDialog ();
    	}
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
			    		var none = "Select Table Column";
			        	markup += '<option value="'+none+'">'+none+'</option>';
			        	var refBlk=null;
			        	if (!$.isEmptyObject(importDlg.refMap)){
			        		refBlk = getBlockFromRefMap (importDlg.refMap, blkName);
			        	}
			        	
			        	
			    		for (var j=0; j<columns.length; j++){
			    			if (!$.isEmptyObject(importDlg.refMap) && refBlk) {
			    				if (refBlk.blockMapping && refBlk.blockMapping[dim.name]['DBCol'] == columns[j])
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
			    		var none = "Select Table Column";
			        	markup += '<option value="'+none+'">'+none+'</option>';
			        	var refBlk=null;
			        	if (!$.isEmptyObject(importDlg.refMap)){
			        		refBlk = getBlockFromRefMap (importDlg.refMap, blkName);
			        	}
			    		for (var j=0; j<columns.length; j++){
			    			if (!$.isEmptyObject(importDlg.refMap) && refBlk) {
			    				if (refBlk.blockMapping && refBlk.blockMapping[ms.name]['DBCol'] == columns[j])
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
		importDlg.json = getFinImportJSON (importDlg.mappingInputs, "Validate", importDlg.dbInfo, importDlg.newBlocks);
    	console.log("Import input JSON structure : "+ JSON.stringify (importDlg.json));

    	dlg.dialog("close");
    	importDlg.showPreview ();
    };
    
    var getFinImportJSON = function (mappings, processType, dbDetails, newBlocks) {
    	var json = {};

    	json['modelId'] = importDlg.modelId;
    	json['dbDetails'] = dbDetails;
	
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

    		obj['DBCol'] = csv;
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
    		if (map[key].type == 'measure' && map[key].DBCol == "Select DB Column"){
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
						
					var inputObj = {"dbDetails":importDlg.dbInfo};
					Util.diff_ajaxPost ("importDBData/getListOfDBFieldsForMapping", inputObj, function(result){
					//Util.diff_ajaxPost ("importDBData/getListOfDBFieldsForMapping", importDlg.dbInfo, function(result){
						
			    		if (!result.Status) {
							Util.showMessage (result.Message);
						} else {
							//importDlg.columns = result.DBTableSetColumns;
							importDlg.columns = result.FieldsForMapping;
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
						Util.showSpinner("manual");
						$(this).dialog("close");
						importDlg.buttonMode = "Prev";
						importDlg.dialogs["ImportDBData"].dialog("open");
						Util.hideSpinner("manual");
					},
					"Next" : function(event) {
						Util.showSpinner("manual");
						importDlg.buttonMode = "Next";
						nextMappingDimensionsCB (dlg);
						Util.hideSpinner("manual");
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

			if (err.status && inputs[key].FieldsForMapping == "Select Table Column"){
				if (type != "measure"){
					err.status = false;
					err.msg = "Please select columns for "+type +": "+blk+"."+key;
					break;
				}
			}
			if (type == "measure" && inputs[key].FieldsForMapping != "Select Table Column")
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
		var importBlockDlg = importDlg.dialogs["ImportDBData"];
    	if (importBlockDlg){
    		importBlockDlg.dialog("open");
    		return;
    	} else {
    	   	//createBlockDialog ();
    		createDBConnectionDialog ();
    	}
	};

	var createDBConnectionDialog = function () {
		
		var blkDlg = $('<div ui-role="importSelectBlkDlg" ></div>');
		var isExist = $('body').find('div[ui-role="importSelectBlkDlg"]');
		if (isExist.length > 0) {
			return;
		}
		var title = "ImportWizard: Browse DB Connection";
		var name = "ImportDBData";
		
		var current = this;
	
		var forMyDBConnections={};
		var userInfo = Util.getUserInfo();
		var createdBy = userInfo["UserId"];
		forMyDBConnections['createdBy']=createdBy;

		var forSharedDBConnections={};
		forSharedDBConnections['shareConnection']="Y";
	
		$.when(
			Util.diff_ajaxGet ("model/blockdimensions/"+importDlg.modelId, function(result){
				if (!result.Status) {
					Util.showMessage (result.Message);
				} else {
					importDlg.modelBlks = result.Blocks;
				}
			}),
			Util.diff_ajaxPost ("importDBData/getDBConnectionDetails/", forMyDBConnections, function(result){
				if (!result.Status) {
					Util.showMessage (result.Message);
				} else {
					importDlg.myDBConnections = result.Data;
					importDlg.myDBConnections = sortByKey(importDlg.myDBConnections, 'connectionName');;
				}
				
				function sortByKey(array, key) {
				    return array.sort(function(b, a) {
				        var x = a[key]; var y = b[key];
				        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
				    });
				}
			}),
			Util.diff_ajaxPost ("importDBData/getDBConnectionDetails/", forSharedDBConnections, function(result){
				if (!result.Status) {
					Util.showMessage (result.Message);
				} else {
					importDlg.sharedDBConnections = result.Data;
					importDlg.sharedDBConnections = sortByKey(importDlg.sharedDBConnections, 'connectionName');;
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
				create : function(event,ui) {
					var dlg = $(this);
					//var html = createSelectModelBlocksHTML();
					var html = createSelectDBConnectionHTML();
					$(this).empty();
					$(this).append(html);
					
					importDlg.dialogs[name]=$(this);
					bindDBSelectionEvents ($(this));
					
					dlg.find("input[name='dbConne']").trigger("change");
					
					
					if (importDlg.refMap && importDlg.refMap["dbDetails"] && importDlg.refMap["dbDetails"]["tableName"] && importDlg.refMap["dbDetails"]["listOfColumnNames"]) {
						importDlg.getAllTables($(this),importDlg.refMap["dbDetails"]["tableName"]);
						importDlg.showListOfColumns();
					}
				},
				open : function (event,ui) {
					
					
				},
				buttons : {
					"Cancel" : function(event) {
						cancelDialogs ();
					},
					"Prev" : function(event) {
						Util.showSpinner("manual");
						$(this).dialog("close");
						importDlg.buttonMode = "Prev";
						importDlg.refMap = {};
						importDlg.dialogs["MappingsList"].dialog("open");
						Util.hideSpinner("manual");
					},
					"Next" : function(event) {
						Util.showSpinner("manual");
						importDlg.buttonMode = "Next";
						
						// Validatons should be done before fetching getDBConnectionInfo
						
						var dbInfo = importDlg.getDBConnectionInfo($(this));
						
						importDlg.dbInfo = dbInfo;
						
						var status = importDlg.validateDBConnectionInfo(dbInfo);
						if (status) {
							nextSelectBlockCB (blkDlg);
							
						}
						Util.hideSpinner("manual");
					}
				}
			});

		});
		
	};
	
	this.validateDBConnectionInfo = function(DBinfo) {
		
		var c = this;
		if (DBinfo) {
			var connectionType = DBinfo["connectionType"];
			var id = DBinfo["id"];
			var queryType = DBinfo["queryType"];
			var customQuery = DBinfo["customQuery"];
			var tableName = DBinfo["tableName"];
			var listOfColumnNames = DBinfo["listOfColumnNames"];
			
			
			if (connectionType.trim() == "") {
				Util.showMessage("Please select DB Connections");
				return false;
			}
			if (id.trim() == "default") {
				Util.showMessage("Please select DB Connections");
				return false;
			}
			if (!queryType || queryType.trim() == "") {
				Util.showMessage("Please select Query Type");
				return false;
			} else if(queryType == "custom"){
				if (customQuery.trim() == "") {
					Util.showMessage("Query is required");
					return false;
				}
			} else if (queryType == "singletab") {
				if (tableName.trim() == "default") {
					Util.showMessage("Please select a Table");
					return false;
				}
				if (listOfColumnNames.trim() == "") {
					Util.showMessage("Please select Columns");
					return false;
				}
			}
		}
		
		return true;
	};
	
	this.getColumnsSelected = function(dlg) {
		var c = this, cols = [],list = "";
		var chkbxs = dlg.find('.col-list input:checked');
		$.each(chkbxs,function(i,chk){
			if ($(chk).val() == "*") {
				cols =[];
				cols.push($(chk).val());
				return false;
			} else {
				cols.push($(chk).val());
			}
		});
		list = cols.join(",");
		return list;
	};
	
	this.getDBConnectionInfo = function(dlg) {
		
		var c = this,dbInfo = {};
		var dbConnTyp = dlg.find('input[name="dbConne"]:checked').val();
		var queryType = dlg.find('input[name="qtype"]:checked').val();
		
		dbInfo["queryType"] = queryType;
		dbInfo["connectionType"] = dbConnTyp;
		if (dbConnTyp == "myDBConnections") {
			dbInfo["id"] = dlg.find('select[dataattr="myDBConnections"]').val();
		} else if (dbConnTyp == "sharedDBConnections") {
			dbInfo["id"] = dlg.find('select[dataattr="sharedDBConnections"]').val();
		}
		
		if (queryType == "custom") {
			dbInfo["customQuery"] = dlg.find('textarea[data-attr="dbcqr"]').val();
		} else if (queryType == "singletab") {
			dbInfo["tableName"] = dlg.find('.tables-list').val(); 
			
			dbInfo["listOfColumnNames"] = c.getColumnsSelected(dlg); // needs to Implement
		}
		
		return dbInfo;
	};
	
	this.getDBConInfo = function(dlg) {
		var c = this,info = {};
		info["connectionName"] = dlg.find('input[name="cname"]').val();
		info["dbtype"] = dlg.find('select[ui-role="dbType"]').val();
		info["hostName"] = dlg.find('input[name="hname"]').val();
		info["portNum"] = dlg.find('input[name="pnum"]').val();
		info["serviceORDBName"] = dlg.find('input[name="srname"]').val();
		info["userName"] = dlg.find('input[name="usrname"]').val();
		info["password"] = dlg.find('input[name="pwd"]').val();
		info["shareConnection"] = dlg.find('input[name="shareC"]').is(':checked') ? "Y" : "N";
		info["description"] = dlg.find('textarea[name="desc"]').val();
		return info;
	};
	
	this.testDBConnection = function(dlg,DBinfo,callback) {
		var postData = {};
		postData["dbDetails"] = DBinfo;
		Util.ajaxSyncPost ("importDBData/testDBConnection/", postData, function(result){
			
			if (!result.Status) {
				Util.showMessage (result.Message);
			} else {
				//importDlg.modelBlks = result.Blocks;
				if (typeof callback == "function") {
					callback();
				} else {
					Util.showMessage (result.Message);
				}
			}
		},false,true);
		
	};
	
	this.saveDBConnection = function(DBinfo,dlg) {
		
		var postData = {};
		Util.ajaxSyncPost ("importDBData/saveDBConnection/", DBinfo, function(result){
			
			if (!result.Status) {
				Util.showMessage (result.Message);
			} else {
				Util.showMessage ("Successfully Saved DB Connection");
				if (dlg) {
					dlg.dialog("close");
				}
				importDlg.updateMyDBCons(result.Data.id);
			}
		},false,true);
	};
	
	this.createNewConnection = function(mode) {
		var c = this;
		var cdlg = $("<div class='vdvc-n-db'>");
		
		cdlg.dialog({
			title : "New DB Connection",
			resizable : false,
			dialogClass: "vdvc-db-dlg",
			width : 500,
			height : 450,
			create : function(event,ui) {
				$(this).append(dbMrkUp);
			},
			open : function(event,ui){
				
			},
			close : function() {
				$(this).dialog("destroy");
			},
			buttons :{
				"Test" : function(event,ui) {
					var DBinfo = importDlg.getDBConInfo($(this));
					var status = importDlg.validateDBCon(DBinfo);
					if (status) {
						importDlg.testDBConnection($(this),DBinfo);
					}
				},
				"Save" : function(event,ui) {
					var dbDlg = $(this);
					var DBinfo = importDlg.getDBConInfo(dbDlg);
					var status = importDlg.validateDBCon(DBinfo);
					if (status) {
						importDlg.testDBConnection($(this),DBinfo,function(){importDlg.saveDBConnection(DBinfo,dbDlg);});
					}
					
				},
				"Cancel" : function() {
					$(this).dialog("close");
				}
			}
		});
		
		return cdlg;
	};
	
	
	this.validateDBCon = function(DBinfo) {
		var c = this;
		if (DBinfo) {
			var cname = DBinfo["connectionName"];
			var dbtype = DBinfo["dbtype"];
			var hostName = DBinfo["hostName"];
			var portNum = DBinfo["portNum"];
			var serviceORDBName = DBinfo["serviceORDBName"];
			var userName = DBinfo["userName"];
			var password = DBinfo["password"];
			
			if (cname.trim() == "") {
				Util.showMessage("Connection Name is required");
				return false;
			}
			if (dbtype.trim() == "default") {
				Util.showMessage("DB type is required");
				return false;
			}
			if (hostName.trim() == "") {
				Util.showMessage("Host Name is required");
				return false;
			}
			if (portNum.trim() == "") {
				Util.showMessage("Port Number is required");
				return false;
			}
			if (serviceORDBName.trim() == "") {
				Util.showMessage("Service or DB Name is required");
				return false;
			}
			if (userName.trim() == "") {
				Util.showMessage("User Name is required");
				return false;
			}
			if (password.trim() == "") {
				Util.showMessage("Password is required");
				return false;
			}
		}
		
		return true;
	};
	
	this.viewDBConnection = function(mode,dbInfo) {
		
		var c = this;
		if (mode && mode == "m_view") {
			
			var cdlg = $("<div class='vdvc-n-db'>");
			cdlg.dialog({
				autoOpen : mode,
				title : "My DB Connection View",
				resizable : false,
				dialogClass: "vdvc-db-dlg",
				width : 500,
				height : 450,
				create : function(event,ui) {
					$(this).append(dbMrkUp);
				},
				open : function(event,ui){
					if (!$.isEmptyObject(dbInfo)) {
						$(this).find('input[name="cname"]').val(dbInfo["connectionName"]);
						$(this).find('select[ui-role="dbType"]').val(dbInfo["dbtype"]);
						$(this).find('input[name="hname"]').val(dbInfo["hostName"]);
						$(this).find('input[name="pnum"]').val(dbInfo["portNum"]);
						$(this).find('input[name="srname"]').val(dbInfo["serviceORDBName"]);
						$(this).find('input[name="usrname"]').val(dbInfo["userName"]);
						$(this).find('input[name="pwd"]').val(dbInfo["password"]);
						if (dbInfo["shareConnection"] == "Y") {
							$(this).find('input[name="shareC"]').prop('checked',true);
						}
						$(this).find('textarea[name="desc"]').val(dbInfo["description"]);
					}
				},
				close : function() {
					$(this).dialog("destroy");
				},
				buttons :{
					"Test" : function(event,ui) {
						var DBinfo = importDlg.getDBConInfo($(this));
						DBinfo["id"] = dbInfo["id"];
						
						var status = importDlg.validateDBCon(DBinfo);
						if(status) {
							importDlg.testDBConnection($(this),DBinfo);
						}
					},
					"Update" : function(event,ui) {
						var dbDlg = $(this);
						var DBinfo = importDlg.getDBConInfo(dbDlg);
						DBinfo["id"] = dbInfo["id"];
						DBinfo["createdOn"] = dbInfo["createdOn"];
						DBinfo["createdBy"] = dbInfo["createdBy"];
						
						var status = importDlg.validateDBCon(DBinfo);
						if(status) {
							importDlg.testDBConnection($(this),DBinfo,function(){importDlg.saveDBConnection(DBinfo,dbDlg);});
						}
					},
					"Delete" : function(){
		      	    	var dbDlg = $(this);
						var DBinfo = importDlg.getDBConInfo(dbDlg);
						Util.showMessage("Not yet Implemented");
		      	     },  
					"Cancel" : function() {
						$(this).dialog("close");
					}
				}
			});
		} 
		if (mode == "s_view") {
			var cdlg = $("<div class='vdvc-n-db'>");
			cdlg.dialog({
				autoOpen : mode,
				title : "Shared DB Connection View",
				resizable : false,
				dialogClass: "vdvc-db-dlg",
				width : 500,
				height : 450,
				create : function(event,ui) {
					$(this).append(dbMrkUp);
				},
				open : function(event,ui){
					$(this).find("input").prop("disabled",true);
					$(this).find("textarea").prop("disabled",true);
					$(this).find("select").prop("disabled",true);
					
					if (!$.isEmptyObject(dbInfo)) {
						$(this).find('input[name="cname"]').val(dbInfo["connectionName"]);
						$(this).find('select[ui-role="dbType"]').val(dbInfo["dbtype"]);
						$(this).find('input[name="hname"]').val(dbInfo["hostName"]);
						$(this).find('input[name="pnum"]').val(dbInfo["portNum"]);
						$(this).find('input[name="srname"]').val(dbInfo["serviceORDBName"]);
						$(this).find('input[name="usrname"]').val(dbInfo["userName"]);
						$(this).find('input[name="pwd"]').val(dbInfo["password"]);
						if (dbInfo["shareConnection"] == "Y") {
							$(this).find('input[name="shareC"]').prop('checked',true);
						}
						$(this).find('textarea[name="desc"]').val(dbInfo["description"]);
					}
				},
				close : function() {
					$(this).dialog("destroy");
				},
				buttons :{
					"Test" : function(event,ui) {
						var DBinfo = importDlg.getDBConInfo($(this));
						DBinfo["id"] = dbInfo["id"];
						importDlg.testDBConnection($(this),DBinfo);
					},
					"Cancel" : function() {
						$(this).dialog("close");
					}
				}
			});
		}
		
	};
	
	this.findDBinfoById = function(id,type) {
		var c = this,info = {};
		var mDB = importDlg.myDBConnections;
		var sDB = importDlg.sharedDBConnections;
		if(type == "m_view" && $.isArray(mDB)) {
			$.each(mDB,function(i,v){
				if (id == v.id) {
					info = v;
					return false;
				}
			});
			
		}
		if(type == "s_view" && $.isArray(sDB)) {
			$.each(sDB,function(i,v){
				if (id == v.id) {
					info = v;
					return false;
				}
			});
		}
		
		return info;
	};
	
	this.handleAction = function(action,dlg) {
		var c = this;
		var type = action.attr("data-action");
		if ( type == "new") {
			importDlg.createNewConnection();
		} else if ( type == "m_view") {
			
			var id = dlg.find(".myDBConnections").val();
			var dbInfo = importDlg.findDBinfoById(id,type);
			importDlg.viewDBConnection(type,dbInfo);
		} else if ( type == "s_view") {
			var id = dlg.find(".sharedDBConnections").val();
			var dbInfo = importDlg.findDBinfoById(id,type);
			importDlg.viewDBConnection(type,dbInfo);
		} else if ( type == "test") {
			var select = action.closest("tr").find("select");//.val();
			var id = $(select).val();
			if ($(select).hasClass("sharedDBConnections")) {
				var dbInfo = importDlg.findDBinfoById(id,"s_view");
				importDlg.testDBConnection(false,dbInfo);
			} else if ($(select).hasClass("myDBConnections")) {
				var dbInfo = importDlg.findDBinfoById(id,"m_view");
				importDlg.testDBConnection(false,dbInfo);
			}
		}
	};
	
	var bindDBSelectionEvents = function(dlg) {
		var c = this;
		dlg.find(".btn").off("click").on("click",function(e){
			importDlg.handleAction($(this),dlg);
		});
		
		dlg.find("input[name='dbConne']").off("change").on("change",function(e){
			
			var rb = $(this);
			var isChecked = rb.is(":checked");
			if (rb.val() == "myDBConnections" && isChecked) {
				dlg.find("button").prop("disabled",true);
				dlg.find("select").prop("disabled",true);
				var tr = rb.closest("tr");
				var mydbCon = tr.find("select").prop("disabled",false).val();
				tr.find("button").prop("disabled",false);
				if (mydbCon == "default") {
					tr.find("button[data-action='m_view']").prop("disabled",true);
					tr.find("button[data-action='test']").prop("disabled",true);
				}
			} else if (rb.val() == "sharedDBConnections" && isChecked) {
				dlg.find("button").prop("disabled",true);
				dlg.find("select").prop("disabled",true);
				var tr = rb.closest("tr");
				var mydbCon = tr.find("select").prop("disabled",false).val();
				tr.find("button").prop("disabled",false);
				if (mydbCon == "default") {
					tr.find("button[data-action='s_view']").prop("disabled",true);
					tr.find("button[data-action='test']").prop("disabled",true);
				}
			}
		});
		
		dlg.find("input[name='qtype']").off("change").on("change",function(e){
			var rb = $(this);
			var isChkd = rb.is(":checked");
			dlg.find(".qArea").empty();
			if (rb.val() == "custom" && isChkd) {
				var mrk = importDlg.getCustQArea();
				dlg.find(".qArea").append(mrk);
			} else if (rb.val() == "singletab" && isChkd) {
				var st = importDlg.getAllTables(dlg);
				if(!st) {
					rb.prop("checked",false);
				}
			}
		});
		
		dlg.find(".myDBConnections").off("change").on("change",function(e){
			var myDBSlt = $(this);
			var tr = myDBSlt.closest("tr");
			if (myDBSlt.val() == "default") {
				tr.find("button[data-action='m_view']").prop("disabled",true);
				tr.find("button[data-action='test']").prop("disabled",true);
			} else {
				tr.find("button[data-action='m_view']").prop("disabled",false);
				tr.find("button[data-action='test']").prop("disabled",false);
			}
		});
		
		dlg.find(".sharedDBConnections").off("change").on("change",function(e){
			var sDBSlt = $(this);
			var tr = sDBSlt.closest("tr");
			if (sDBSlt.val() == "default") {
				tr.find("button[data-action='s_view']").prop("disabled",true);
				tr.find("button[data-action='test']").prop("disabled",true);
			} else {
				tr.find("button[data-action='s_view']").prop("disabled",false);
				tr.find("button[data-action='test']").prop("disabled",false);
			}
		});
	};
	
	this.updateMyDBCons = function(id) {
		var c = this,
			mrkup = "<option value='default'>select DB Connection</option>",
			smrkup = "<option value='default'>select DB Connection</option>";
		var forMyDBConnections={};
		//below hard coded value for 'createdBy' has to be replaced with fuction call 
		forMyDBConnections['createdBy']="Norm.Smith@netisoftware.com";
		function sortByKey(array, key) {
		    return array.sort(function(b, a) {
		        var x = a[key]; var y = b[key];
		        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		    });
		}
		
		
		Util.ajaxPost ("importDBData/getDBConnectionDetails/", forMyDBConnections, function(result){
			if (!result.Status) {
				Util.showMessage (result.Message);
			} else {
				importDlg.myDBConnections = result.Data;
				importDlg.myDBConnections = sortByKey(importDlg.myDBConnections, 'connectionName');
				$.each(importDlg.myDBConnections,function(i,v){
					if (id == v.id) {
						mrkup += '<option value="'+v.id+'" selected>'+v.connectionName+'</option>';
					} else {
						mrkup += '<option value="'+v.id+'">'+v.connectionName+'</option>';
					}
					
				});
				if(importDlg.dialogs["ImportDBData"]) {
					importDlg.dialogs["ImportDBData"].find(".myDBConnections").empty().append(mrkup);
				}
			}
		});
		
		importDlg.updateShrdDBCons();
	};
	
	this.updateShrdDBCons = function() {
		var c = this,
		smrkup = "<option value='default'>select DB Connection</option>";
		function sortByKey(array, key) {
		    return array.sort(function(b, a) {
		        var x = a[key]; var y = b[key];
		        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		    });
		}
		var forSharedDBConnections={};
		forSharedDBConnections['shareConnection']="Y";
		Util.ajaxPost ("importDBData/getDBConnectionDetails/", forSharedDBConnections, function(result){
			if (!result.Status) {
				Util.showMessage (result.Message);
			} else {
				importDlg.sharedDBConnections = result.Data;
				importDlg.sharedDBConnections = sortByKey(importDlg.sharedDBConnections, 'connectionName');
				$.each(importDlg.sharedDBConnections,function(i,v){
					smrkup += '<option value="'+v.id+'">'+v.connectionName+'</option>';
				});
				if(importDlg.dialogs["ImportDBData"]) {
					importDlg.dialogs["ImportDBData"].find(".sharedDBConnections").empty().append(smrkup);
				}
			}
		})
	};
	
    var getMappedJSON = function () {
    	var mapJson = JSON.parse(JSON.stringify(importDlg.json));
     	delete (mapJson['process']);
     	//mapJson['fileName']=importDlg.originalFile;

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
		var DBData = importDlg.preview.DBData;

		for (var j=0; blocks && j<blocks.length; j++){
			var blkName = blocks[j].Name;

			for (var i=0; DBData && i<DBData.length; i++) {
				var csvBlk = DBData[i];
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
		Util.ajaxPost ("importDBData/dbExecuteStatement", json, function(result){
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
       	var DBData = importDlg.preview.DBData;
    	var markup="";

    	for (var i=0; DBData && i<DBData.length; i++) {
    		var csvBlk = DBData[i];
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
    	for (var i=0; result.DBData && i<result.DBData.length; i++){
    		var blk = result.DBData[i];
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

					Util.ajaxPost ("importDBData/dbExecuteStatement", importDlg.json, function(result){
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
						Util.showSpinner("manual");
						$(this).dialog("close");
						importDlg.buttonMode = "Prev";
						importDlg.dialogs["MappingDimensions"].dialog("open");
						Util.hideSpinner("manual");
					},
					"Import" : function(event) {
						Util.showSpinner("manual");
						importDlg.buttonMode = "Import";
						importColumnsCB ();
						Util.hideSpinner("manual");
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
    
	var createSelectDBConnectionHTML = function (){
		
		var isMyDbConn = importDlg.myDBConnections.length > 0 ? false : true;//$.isEmptyObject(importDlg.myDBConnections);
		var isSharedDbConn = importDlg.sharedDBConnections.length > 0 ? false : true;//$.isEmptyObject(importDlg.sharedDBConnections);
		var mr = '<input name="dbConne" type="radio" value="myDBConnections" >My DB Connections';
		var sr = '<input name="dbConne" type="radio" value="sharedDBConnections" >Shared DB Connections';
		var isMr = false;
		var isSr = false;
		var cq = '<input name="qtype" type="radio" value="custom">Custom Query';
		var tq = '<input name="qtype" type="radio" value="singletab">Single Table';
		var isCq = false;
		var isTq = false;
		if (!$.isEmptyObject(importDlg.refMap) && importDlg.refMap["dbDetails"] && importDlg.refMap["dbDetails"]["queryType"]== "custom") {
			cq = '<input name="qtype" type="radio" value="custom" checked>Custom Query';
			isCq = true;
		} else if (!$.isEmptyObject(importDlg.refMap) && importDlg.refMap["dbDetails"] && importDlg.refMap["dbDetails"]["queryType"]== "singletab") {
			tq = '<input name="qtype" type="radio" value="singletab" checked>Single Table';
			isTq = true;
		} /*else {
			cq = '<input name="qtype" type="radio" value="custom" checked>Custom Query';
		}*/
		
		if (!$.isEmptyObject(importDlg.refMap) && importDlg.refMap["dbDetails"] && importDlg.refMap["dbDetails"]["connectionType"]== "myDBConnections") {
			mr = '<input name="dbConne" type="radio" value="myDBConnections" checked>My DB Connections</td>';
			isMr = true;
		} else if (!$.isEmptyObject(importDlg.refMap) && importDlg.refMap["dbDetails"] && importDlg.refMap["dbDetails"]["connectionType"]== "sharedDBConnections") {
			sr = '<input name="dbConne" type="radio" value="sharedDBConnections" checked>My DB Connections</td>';
			isSr = true;
		} else {
			mr = '<input name="dbConne" type="radio" value="myDBConnections" checked>My DB Connections</td>';
		}
		
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
			markup += '</td>';
	    	markup += '</tr>';
		}
	
		markup += '</table>';
	
		markup += '</td>';
	
		markup += '</tr>';

		// Add another row element
		markup += '<tr>';
	
		markup += '<td style="width:20%;">Select DB Connections</td>';
		
	
		markup += '<td style="width:80%;">';
		markup += '<div>\
			<table style="width: 100%;"><tbody><tr><td style="width:40%;">'+mr+'</td>';
		markup += '<td style="width:40%;">';
		if (!isMyDbConn) {
			markup += '<select class="blockProps docInputs myDBConnections" dataAttr="myDBConnections" style="width: 100%;">';
			markup += '<option value="default" >select DB Connection</option>';
				$.each(importDlg.myDBConnections, function(i, v) {
					if (isMr && importDlg.refMap["dbDetails"]["id"]== v["id"]) {
						markup += '<option value="'+v["id"]+'" selected>'+v["connectionName"]+'</option>';
					} else {
						markup += '<option value="'+v["id"]+'">'+v["connectionName"]+'</option>';
					}
				});	
				markup += '</select>';
		} else {
			markup += '<select class="blockProps docInputs myDBConnections" dataAttr="myDBConnections" style="width: 100%;" disabled>';
			markup += '<option value="default" >No DB Connections</option>';
			markup += '</select>';
		}
		markup += '</td>';
		markup += '<td><button class="btn" data-action="new">Create</button></td>';
		if (!isMyDbConn) {
			markup += '<td><button class="btn" data-action="m_view">View</button></td>';
			markup += '<td><button class="btn" data-action="test">Test</button></td>';
		}else {
			markup += '<td><button class="btn" data-action="m_view" disabled>View</button></td>';
			markup += '<td><button class="btn" data-action="test" disabled>Test</button></td>';
		}
		markup += '</tr>';
		markup += '<tr>';
		if (!isSharedDbConn) {
			markup += '<td>'+sr+'</td>';
			markup += '<td>';
			markup += '<select class="blockProps docInputs sharedDBConnections" dataAttr="sharedDBConnections" style="width: 100%;">';
			markup += '<option value="default" >select DB Connection</option>';
				$.each(importDlg.sharedDBConnections, function(i, v) {
					if (isSr && importDlg.refMap["dbDetails"]["id"]== v["id"]) {
						markup += '<option value="'+v["id"]+'" selected>'+v["connectionName"]+'</option>';
					} else {
						markup += '<option value="'+v["id"]+'">'+v["connectionName"]+'</option>';
					}
				});	
				markup += '</select>';
		}else {
			markup += '<td style="color:gray;"><input name="dbConne" type="radio" value="sharedDBConnections"  disabled>Shared DB Connection</td>';
			markup += '<td >';
			markup += '<select class="blockProps docInputs sharedDBConnections" dataAttr="sharedDBConnections" style="width: 100%;" disabled>';
			markup += '<option value="default" >No DB Connections</option>';
			markup += '</select>';
		}
		markup += '</td>';
		markup += '<td></td>';
		if (!isSharedDbConn) {
			markup += '<td><button class="btn" data-action="s_view">View</button></td>';
			markup += '<td><button class="btn" data-action="test">Test</button></td>';
		} else {
			markup += '<td><button class="btn" data-action="s_view" disabled>View</button></td>';
			markup += '<td><button class="btn" data-action="test" disabled>Test</button></td>';
		}
		
		markup += '</tr>';
		
		markup += '</tbody></table></div>';
		
		markup += '</td>';
		markup += '</tr>';
		markup += '<tr>';
		markup += '<td>Query Type</td>';
		markup += '<td>';
		markup += cq+'</br>';
		markup += tq;
		markup += '</td>';
		markup += '</tr>';
		markup +='</tbody></table>';
		markup += '<div class="qArea" style="width:100%;min-height:100px;">';
		if (isCq && importDlg.refMap["dbDetails"]["customQuery"]) {
			
			markup += '<td colspan="2">';
			markup += importDlg.getCustQArea(importDlg.refMap["dbDetails"]["customQuery"]);
			markup += '</td>';
		} /*else {
			markup += '<td colspan="2">';
			markup += importDlg.getCustQArea();
			markup += '</td>';
		}*/
		
		if (isTq && importDlg.refMap["dbDetails"]["tableName"] && importDlg.refMap["dbDetails"]["listOfColumnNames"]) {
			
			
		} else {
			//markup += importDlg.getAllTables();
		}
		markup += '</div>';
	
		return markup;
		
	};
	
	this.getCustQArea = function(val) {
		if (val) {
			return '<textarea rows="6" style="width:100%;" data-attr="dbcqr" >'+val+'</textarea>';
		} else {
			return '<textarea rows="6" style="width:100%;" data-attr="dbcqr"></textarea>';
		}
		
	};
	
	
	this.getSelectedDBId = function(dlg) {
		var c = this,dbId = null;
		var dbConType =  dlg.find('input[name="dbConne"]:checked').val();
		if (dbConType == "myDBConnections") {
			dbId = dlg.find(".myDBConnections").val();
		} else if (dbConType == "sharedDBConnections") {
			dbId = dlg.find(".sharedDBConnections").val();
		}
		
		return dbId;
	};
	
	this.getAllTables = function(dlg,tableName) {
		
		var c = this;
		var dbId = c.getSelectedDBId(dlg);
		
		if (dbId == "default") {
			Util.showMessage("Please select DB Connection");
			return false;
		}
		if (dbId) {
			
			var postdata = {};
			postdata["dbDetails"] = {};
			postdata["dbDetails"]["id"] = dbId;
			Util.ajaxPost ("importDBData/getListOfTables", postdata, function(result){
				
				if (!result.Status) {
					Util.showMessage (result.Message);
				} else {
					c.showListOfTables(result.ListOfTables,dlg,tableName);
					
				}
			},false,true);
			
			return true;
		}
		
	};
	
	this.getColumnsOfTable = function(tableName , dlg) {
		var c = this;
		var dbId = c.getSelectedDBId(dlg);
		if (dbId) {
			var postdata = {};
			postdata["dbDetails"] = {};
			postdata["dbDetails"]["id"] = dbId;
			postdata["dbDetails"]["tableName"] = tableName;
			Util.ajaxPost ("importDBData/getListOfColumns", postdata, function(result){
				
				if (!result.Status) {
					Util.showMessage (result.Message);
				} else {
					c.showListOfColumns(result.ListOfColumns,dlg);
				}
			},false,true);
		}
		
	};
	
	this.showListOfTables = function(tables,dlg,tableName){
		var c = this;
		if ($.isArray(tables)) {
			var qArea = dlg.find(".qArea");
			qArea.empty();
			var mrkup = '<table border="1" style="width:100%;">\
							<tbody>\
								<tr>\
									<td style="vertical-align: top;width:20%;">\
									Select Table</td>\
									<td style="vertical-align: top;">\
										<select class="tables-list">\
											<option value="default">Select Table</option>';
			$.each(tables,function(i,v){
				if (tableName == v) {
					mrkup += '<option value="'+v+'" selected>'+v+'</option>';
				} else {
					mrkup += '<option value="'+v+'">'+v+'</option>';
				}
				
			});
			
			mrkup +='</td></tr><tr><td style="vertical-align: top;width:20%;">Select Column</td>';
			mrkup +='<td><div class="col-list" style="height:50px;overflow:scroll;"></div></td>';
			mrkup +='</tr></tbody></table>';
			
			qArea.append(mrkup);
			c.addTableSelectEvent(dlg);
			if (tableName) {
				dlg.find(".tables-list").trigger("change");
			}
			
		}
	};
	
	this.showListOfColumns = function(cols,dlg) {
		var c = this,a=[],mrkup = '';
		if ($.isArray(cols)) {
			var $cols = dlg.find(".col-list");
			$cols.empty();
			
			if ( importDlg.refMap && importDlg.refMap["dbDetails"] && importDlg.refMap["dbDetails"]["listOfColumnNames"]) {
				a = importDlg.refMap["dbDetails"]["listOfColumnNames"].split(",");
			}
			
			
			if ($.inArray("*",a) != -1){
				 mrkup += '<li style="list-style: none;"><input type="checkbox" value="*" data-role="All" checked>All</li>';
			} else {
				 mrkup += '<li style="list-style: none;"><input type="checkbox" value="*" data-role="All">All</li>';
			}
			
			
			$.each(cols,function(i,v){
				if ($.inArray(v,a) != -1 || $.inArray("*",a) != -1){
					mrkup += '<li style="list-style: none;"><input type="checkbox" value="'+v+'" checked>'+v+'</li>';
				} else {
					mrkup += '<li style="list-style: none;"><input type="checkbox" value="'+v+'" >'+v+'</li>';
				}
			});
			
			$cols.append(mrkup);
			c.addColSelectEvent(dlg);
		}
	};
	
	this.addTableSelectEvent = function(dlg) {
		var c = this;
		dlg.find(".tables-list").off("change").on("change",function(e){
			var tableName = $(this).val();
			if (tableName != "default") {
				c.getColumnsOfTable(tableName,dlg);
			}
		});
	};
	
	
	this.addColSelectEvent = function(dlg) {
		var c = this;
		dlg.find(".col-list input").off("change").on("change",function(e){
			
			var chkbox = $(this);
			var isChecked = chkbox.is(":checked");
			var val = chkbox.val();
			if (isChecked && val == "*") {
				chkbox.parent().siblings().find("input").prop("checked",true);
			} else if (!isChecked && val == "*") {
				chkbox.parent().siblings().find("input").prop("checked",false);
			} else if (isChecked && val != "*") {
				var chkbxes = dlg.find(".col-list input[value!='*']:not(:checked)");
				if (chkbxes.length == 0) {
					dlg.find(".col-list input[value='*']").prop("checked",true);
				} else {
					dlg.find(".col-list input[value='*']").prop("checked",false);
				}
				
			} else if (!isChecked && val != "*") {
				dlg.find(".col-list input[value='*']").prop("checked",false);
			}
			
		});
	};
    
}