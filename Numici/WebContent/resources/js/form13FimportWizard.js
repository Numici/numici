
var form13FimportWizard = function(modelId) {
	var mode, vAppId, workspaceId;
	if (window.vAppController) {
		mode = "VAppImport";
		vAppId = window.vAppController.vapp.vappId;
		workspaceId = window.vAppController.vapp.currentWorkspace;
	}
	this.dialogs = {};
	var importDlg = this;
	this.modelId = modelId;	 
			
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
	 
		var fileInputs = readUserInputs(".selectedFileInputs .userInputs");
		
		importDlg.fileInputs = [];
		if (fileInputs != null) {
			$.each(fileInputs, function(key, value) {
				if (value == true) {
					importDlg.fileInputs.push(key);
				}    		
			});
		}
	
		if (!importDlg.fileInputs.length) {
			Util.showMessage("Please select atleast one file to import");
			return;
		}
		
		
	 
		dlg.dialog("close");
		importDlg.blockInputs.blocks = blocks;
		importDlg.getMappingList ();
	};
	
	var cancelDialogs = function () {	
		// close the select Mappings dialog
		var selectedMap = $('body').find('div[ui-role="importSelectSearchDlg"]');
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
		
		// Close the Preview dialogs
		var prvs = $('body').find('div[ui-role="importPreviewDlg"]');
		for (var i=0; i<prvs.length; i++){
			$(prvs[i]).dialog("close");
			$(prvs[i]).dialog("destroy");
		}
	};	 
	 
	this.createImportDialog = function () {
    	var mapDlg = $('<div ui-role="importSelectSearchDlg" ></div>');
		var isExist = $('body').find('div[ui-role="importSelectSearchDlg"]');
		if (isExist.length > 0) {
			return;
		}

		var title = "ImportWizard: Select Form 13F file";
		var name = "Select13Ffile";
		
		
		$(mapDlg).dialog({
				width :  800,
				height : 500,
				title : title,
				
				create: function (event, ui){
					var c = this;
					var cikInputs = {
							"formGroup":"13F"
						};
					// Invoke one time AJAX API's.		 
					Util.showSpinner("manual");
					$.when(
							
						Util.diff_ajaxGet ("model/blockdimensions/"+importDlg.modelId, function(result){
							if (!result.Status) {
								Util.showMessage (result.Message);
							} else {
								importDlg.modelBlks = result.Blocks;
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
						}),
						
						Util.diff_ajaxPost ("importSECFiling/getSECFilingData", cikInputs, function(result){
							if (!result.Status) {
								Util.showMessage (result.Message);
							} else {								
								importDlg.companyNames = [];
								for (var i=0; result.Data && i < result.Data.length; i++){
									var d = result.Data[i];
									importDlg.companyNames.push(d.companyName);
								}
							}
						}, false, false)
						
					).then(function(){
						Util.hideSpinner("manual");
						var html = createSelectSearchFormHTML();
						$(c).empty();
						$(c).append(html);
						importDlg.dialogs[name]=$(c);
						
						bindSelectFormSearchEvents ($(c), html);
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
						nextSelectBlockCB (mapDlg);						 
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
    
    var isValidField = function (value) {
    	if (value == "" || value.length == 0 || value == undefined) {
    		return false;
    	}
    	
    	return true;
    };
   
    var bindSelectFormSearchEvents = function (div, html) {   
    	c = this;
    	 $( document ).off("click","div[ui-role='importSelectSearchDlg'] .addNewBlock").on("click","div[ui-role='importSelectSearchDlg'] .addNewBlock",function() {
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
    	
       	$( "#companyName" ).autocomplete({
    	      source: importDlg.companyNames
    	});
    	 
    	$( "#fromDatePicker" ).datepicker({dateFormat: "mm/dd/yy",
					    		onSelect: function(date,evnt) {
										
										var todt = $( "#toDatePicker" ).val();    		 					
						        		if ((todt.length != 0) && (new Date(date) > new Date(todt))) {
						        			Util.showMessage("To date must be greater than from date");
						        			return;
						        		}
									}
    						});
    	
    	$( "#toDatePicker" ).datepicker({dateFormat: "mm/dd/yy",
    		 				onSelect: function(date,evnt) {
      		 					var fmdt = $( "#fromDatePicker" ).val();    		 					
    		 	        		if ((fmdt.length != 0) && (new Date(fmdt) > new Date(date))) {
    		 	        			Util.showMessage("To date must be greater than from date");
    		 	        			return;
    		 	        		}
    		 				}});
        	 
      	$("#formSearchButton").click(function(){     
    		var blkInputs =  readUserInputs(".selectedBlocks .modelBlocks");
    		var fileSearchInputs =  readUserInputs(".selectedFormInputs .formInputs");
    		var fromDate = fileSearchInputs.fromdate;
    		var toDate = fileSearchInputs.enddate;
    		if (fromDate && toDate && (new Date(fromDate) > new Date(toDate))) {
    			Util.showMessage("To date must be greater than from date");
    			return false;
    		}
    	 
    		if (fromDate && (toDate == "" || toDate.length == 0)) {
    			Util.showMessage("Please enter the to date ...!!");
    			return false;
    		}
    		
    		if (toDate && (fromDate == "" || fromDate.length == 0)) {
    			Util.showMessage("Please enter the from date ...!!");
    			return false;
    		}
    		
    		var inpObj = {};
    		inpObj["formGroup"]="13F";
    		if (isValidField (fromDate)) {
    			inpObj["fromDateFiled"]=fromDate;
    		}
    		if (isValidField(toDate)){
    			inpObj["toDateFiled"]=toDate;
    		} 
    		if (isValidField(fileSearchInputs.cik)){
    			inpObj["cik"]=fileSearchInputs.cik;
    		}	
    		if (isValidField(fileSearchInputs.formtype)){
    			inpObj["formType"]=fileSearchInputs.formtype;
    		}
    		if (isValidField(fileSearchInputs.companyname)){
    			inpObj["companyName"]=fileSearchInputs.companyname;
    		}   		

    	 	Util.ajaxPost ("importSECFiling/getSECFilingData", inpObj, function(result){           	 
        		if (!result.Status) {
    				Util.showMessage ("Failed to get the SECFilingData : "+ result.Message);
    			} else {
    				importDlg.formInputs = result.Data;
    				if (importDlg.formInputs) {
    					var txt = '<div style="overflow:auto; height:50%;" class="selectedFileInputs" > <table border="1" style="width:100%">\
    			    		<tr> <th> </th> <th> Date </th> <th> CIK </th>  <th> Name </th>  <th  width="10%"> Type </th> <th> Filename </th> </tr>';
    			 
    					for (var i=0; i<importDlg.formInputs.length; i++) {
    						var c = importDlg.formInputs[i];
    						txt += '<tr>';
    						txt += '<td> <input class="userInputs" type="checkbox" dataattr="'+c.id+'" datatype="boolean"> </td>';
    						var date = new Date(c.dateFiled);      					 
    					//	txt += '<td>'+date.toLocaleDateString()+'</td>';
    						txt += '<td>'+(date.getMonth()+1)+'/'+date.getDate()+'/'+date.getFullYear()+'</td>';
    						txt += '<td>'+c.cik+'</td>';
    						txt += '<td>'+c.companyName+'</td>';
    						txt += '<td>'+c.formType+'</td>';
    						txt += '<td>'+c.fileName+'</td>';
    						txt +=	'</tr>';
    					}    	
    					txt += '</table> </div>';
     		 
    					div.find(".selectedFileInputs").remove();
    					div.append(txt);    					
    				}    				 
    			}    			
    		},false,true);
    	});
     	
    };
    
    var getFormTypeMarkup = function (formTypes) {
    	var markup = '<select class="formInputs" dataAttr="formtype" style="width:100%">';
    	var none = "";
		markup += '<option value='+none+'>'+none+'</option>';
    	for (var f=0; f<formTypes.length; f++) {
    		var fmType = formTypes[f];
    		markup += '<option value="'+fmType+'">'+fmType+'</option>';
    	} 
    	
    	return markup;
    };
    
    var createSelectSearchFormHTML = function (){
       	var markup = '<table border="1" class="selectedBlocks" style="width:100%">';
    	var formTypes =  ["13F-HR" ,
    							"13F-HR/A",
    							"13F-NT"
    						];
    	var ftMarkUp = getFormTypeMarkup (formTypes);
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
    		markup += '<input type="checkbox" class="blockProps modelBlocks" dataType ="boolean" dataMode="blocks" dataAttr="'+blk.name+'" >';
    		markup += "   "+blk.name;   
    		markup += '</td>';
        	markup += '</tr>';
    	}
    	
    	markup += '</table>';    	
    	markup += '</td>';    	
    	markup += '</tr>';    	
    	markup += '</table>';
    	/*
    	markup += '<table border="1" class="selectedSearchTab" style="width:100%">';
    	markup += '<button type="button" id="formSearchButton" style="float:right"> Search </button>';    
    	markup += '</table>';
    		*/	
    	
    	markup += '<table border="1" class="selectedFormInputs" style="width:100%">';   
    
    	markup += '<tr>\
    				<td> <table border="1" class="firstColumn" style="width:100%"> \
	    				<tr>\
	    					<td> Start Date </td>\
	    					<td> <input type="text" id="fromDatePicker" dataAttr="fromdate" class="formInputs" style="width:100%"> </td>\
	    				</tr>\
	    				<tr>\
	    					<td> End Date </td>\
	    					<td> <input type="text" id="toDatePicker" dataAttr="enddate" class="formInputs" style="width:100%"> </td>\
	    				</tr>\
	    		         <tr>\
	    					<td> CIK </td>\
	    					<td> <input type="text" dataAttr="cik" class="formInputs" style="width:100%"> </td>\
	    				</tr>\
    				</table> </td>\
			    	<td> <table border="1" class="secondColumn" style="width:100%"> \
						<tr>\
							<td> Company Name </td>\
    						<td> <input type="text" id="companyName" dataAttr="companyname" class="formInputs" style="width:100%"> </td>\
						</tr>\
						<tr>\
							<td> Form Type </td>\
    						<td> '+ftMarkUp+' </td>\
						</tr>\
    					<tr>\
    						<td> </td>\
    						<td> <button type="button" id="formSearchButton" style="width:100%" > Search </button> </td>\
    					</tr>\
					</table> </td>\
    		      </tr>';    	
    	markup += '</table>';
    	
       	return markup;
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
			
			if (err.status && inputs[key].SEC13FCol == "Select SEC Column"){
				if (type != "measure"){					
					err.status = false;			
					err.msg = "Please select columns for "+type +": "+blk+"."+key;
					break;	
				}
			}
			if (type == "measure" && inputs[key].SEC13FCol != "Select SEC Column")
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
    var getImportJSON = function (mappings, processType, fileInputs, newBlocks) {
    	var json = {};
    	
    	json['filingId'] = fileInputs;
    	json['modelId'] = importDlg.modelId;
    	json['formGroup'] = "13F";
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
    			obj['SEC13FCol'] = csv;
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
    		
    		obj['SEC13FCol'] = csv;
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
    		if (map[key].type == 'measure' && map[key].SEC13FCol == "Select SEC Column"){
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
    	importDlg.json = getImportJSON (importDlg.mappingInputs, "Validate", importDlg.fileInputs, importDlg.newBlocks);
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
		
		var title = "ImportWizard: Mapping - "+importDlg.originalFile;
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
					inputObj.formGroup = "13F";					 
				 	Util.ajaxPost ("importSECFiling/secCols", inputObj, function(result){
						if (!result.Status) {
							Util.showMessage (result.Message);						
						} else {
							importDlg.columns = result.SECFormGroupColumns;
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
						importDlg.dialogs["Select13Ffile"].dialog("open");
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
		    		<tr> <th> Block Fields </th> <th> Column Element </th> </tr></table>\
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
			    		var none = "Select SEC Column";
			        	markup += '<option value="'+none+'">'+none+'</option>';
			        				        	 
			    		for (var j=0; j<columns.length; j++){			    			  
			    			if (dim.name.toLowerCase() == columns[j].toLowerCase()) {
			    				markup += '<option selected="selected" value="'+columns[j]+'">'+columns[j]+'</option>';
			    			} else {
			    				markup += '<option value="'+columns[j]+'">'+columns[j]+'</option>';
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
			    		var none = "Select SEC Column";
			        	markup += '<option value="'+none+'">'+none+'</option>';
			        	 
			    		for (var j=0; j<columns.length; j++){
			    			if (ms.name.toLowerCase() == columns[j].toLowerCase()) {
			    				markup += '<option selected="selected" value="'+columns[j]+'">'+columns[j]+'</option>';
			    			} else {
			    				markup += '<option value="'+columns[j]+'">'+columns[j]+'</option>';
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
		    		<tr> <th>Column Element</th> <th>Role</th> <th>Name</th> <th>Type</th>  <th>Format</th> </tr> </table>\
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
   
    var addDimensionDefaultValues = function (blocks) {
		var csvRows = importDlg.preview.CsvRows; 	 
		
		for (var j=0; blocks && j<blocks.length; j++){
			var blkName = blocks[j].Name;
		
			for (var i=0; csvRows && i<csvRows.length; i++) {
				var csvBlk = csvRows[i];
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
    	var purge = $('body').find('div[ui-role="importPreviewDlg"] .purgeDataChkBox').is(':checked');
    	    	
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
    	options['purgeOldData'] = purge;
    	json['options'] = options;
    	// Remove following code after removeing the default value restriction by Sunil.
/*    	if (json['newBlocks']){
    		addDimensionDefaultValues(json['newBlocks']);
    	}*/
    	console.log("Import input JSON structure : "+ JSON.stringify (json));   	
		Util.ajaxPost ("importSECFiling/importMultiple13FFiling", json, function(result){
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
       	var csvRows = importDlg.preview.SEC13FFiling;   
    	var markup=""; 
     	
    	for (var i=0; csvRows && i<csvRows.length; i++) {
    		var csvBlk = csvRows[i];
    		if (csvBlk.blockName != block){
    			continue;
    		}
    	
    		var hdr = getBlockHeaderFromModelDefinition (importDlg.modelBlks, block);    			
    
	    	markup += '<div style="overflow:auto; height:80%;"><table border="1" class="previewListRows" style="width:100%">';
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
			
			markup += '<div  style="height:10%;"><table class="previewListInfo"   style="width:100%;border-collapse: collapse;">';
			markup += '<tr>';
			markup += '<td style="text-align:right;width:50%;">';
			markup += '<input type="checkbox" class="purgeDataChkBox">';
			markup += ' Purge Previous Data';
			markup += '</td>';			
			markup += '</tr>';
			markup += '</table>';
			
			markup += '</div>';
    	}
		return markup;
    };
    
    var isInvalidRowsPresent = function (result) {   
    	for (var i=0; result.SEC13FFiling && i<result.SEC13FFiling.length; i++){
    		var blk = result.SEC13FFiling[i];
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
		
		var title = "ImportWizard: Preview ";
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
					Util.ajaxPost ("importSECFiling/importMultiple13FFiling", importDlg.json, function(result){  
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
				 		}    		
			    	},false,true);					
				},
				buttons : {
					"Cancel" : function(event) {
						cancelDialogs ();						
					},
					/*
					"SaveMappings" : function(event) {
						saveMappings ();						
					},*/
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
    return this; 
 };
