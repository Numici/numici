
var downloadSecFilings = function() {
	this.dialogs = {};
	var downloadDlg = this;
	var formTypes = { // "13F" : ["13F-HR","13F-HR/A","13F-NT"],
                       "10-Q": ["10-Q","10-Q/A","10-QT","10-QT/A"],
	                   "10-K": ["10-K","10-K/A","10-KT","10-KT/A"]                      
					};
	
	 
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
	
	var nextSelectSECDownloadCB = function (dlg) {
		var fileInputs = readUserInputs(".selectedFileInputs .userInputs");
		
		downloadDlg.fileInputs = [];
		if (fileInputs != null) {
			$.each(fileInputs, function(key, value) {
				if (value == true) {
					downloadDlg.fileInputs.push(key);
				}    		
			});
		}
	
		if (!downloadDlg.fileInputs.length) {
			Util.showMessage("Please select atleast one file to import");
			return;
		}
			 
	//	dlg.dialog("close");		
	};
	
	var cancelDialogs = function () {	
		// close the select Mappings dialog
		var selectedMap = $('body').find('div[ui-role="downloadSecDlg"]');
		for (var i=0; i<selectedMap.length; i++){
			$(selectedMap[i]).dialog("close");
			$(selectedMap[i]).dialog("destroy");
		}
		
	
	};	 
	 
	this.downloadSecDialog = function () {
    	var mapDlg = $('<div ui-role="downloadSecDlg" ></div>');
		var isExist = $('body').find('div[ui-role="downloadSecDlg"]');
		if (isExist.length > 0) {
			return;
		}

		var title = "Download Wizard: SEC Filings";
		var name = "dowloadSecFile";
		
		
		$(mapDlg).dialog({
				width :  800,
				height : 400,
				title : title,
				
				create: function (event, ui){
					var c = this;
					var cikInputs = {
							"formGroup":"10-K"
						};
					// Invoke one time AJAX API's.		 
					Util.showSpinner("manual");
					$.when(						
						Util.diff_ajaxPost ("importSECFiling/getSECFilingData", cikInputs, function(result){
							if (!result.Status) {
								Util.showMessage (result.Message);
							} else {								
								downloadDlg.companyNames = [];
								for (var i=0; result.Data && i < result.Data.length; i++){
									var d = result.Data[i];
									downloadDlg.companyNames.push(d.companyName);
								}
							}
						}, false, false)
						
					).then(function(){
						Util.hideSpinner("manual");
						var html = createSelectSearchFormHTML();
						$(c).empty();
						$(c).append(html);
						downloadDlg.dialogs[name]=$(c);
						
						bindSelectFormSearchEvents ($(c), html);
					});
				},
				open : function (event,ui) {

				},
				buttons : {
					"Cancel" : function(event) {
						cancelDialogs ();
					},
					"Download" : function(event) {
						downloadDlg.buttonMode = "Next";					 
						nextSelectSECDownloadCB (mapDlg);
		
						var obj = {};
						obj.formGroup = downloadDlg.formInputs.formGroup;
						obj.filingId = downloadDlg.fileInputs;
						console.log("Download input JSON structure : "+ JSON.stringify (obj));
						Util.diff_ajaxPost ("importSECFiling/downloadSECFile", obj, function(result){
							if (!result.Status) {
								Util.showMessage (result.Message);
								mapDlg.dialog("close");
							} else {
								Util.showMessage ("Download Completed successfully");
								mapDlg.dialog("close");
							}
						}, false, true);						 					
					}
				}
		});
    };
    
    var isValidField = function (value) {
    	if (value == "" || value.length == 0 || value == undefined || value == "NONE") {
    		return false;
    	}
    	
    	return true;
    };
   
    var updateFormTypes = function (div, val) {
		div.empty();
		var none = "";
		div.append('<option value='+none+'>'+ none +'</option>');
		var ftypes = formTypes[val];

		for (var l=0; l<ftypes.length; l++){
			var opt = ftypes[l];
			div.append('<option value='+opt+'>'+opt+'</option>');			
		}
	};
	
    var bindSelectFormSearchEvents = function (div, html) {   
    	c = this;
    	$( document ).off("change","div[ui-role='downloadSecDlg'] .fillingTypeInput").on("change","div[ui-role='downloadSecDlg'] .fillingTypeInput",function() {
    		var type = $(this).val();
    		console.log ("Selected SEC fillings type: "+type);
    		var formTypeDiv = $('div[ui-role="downloadSecDlg"]').find("select[dataattr='formtype']");
    		if (type == "NONE") {
    			$("#formSearchButton").attr('disabled',true);    			
    		} else {
    			$("#formSearchButton").attr('disabled',false);
    			updateFormTypes (formTypeDiv, type);
    		} 			 
       		
		}); 
    	
       	$( "#companyName" ).autocomplete({
    	      source: downloadDlg.companyNames
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
      		var fillingInputs =  readUserInputs(".listSecFillings .fillingTypeInput");
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
    		inpObj["formGroup"]=fillingInputs.fillingtype;
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

    		downloadDlg.formInputs = inpObj;
    	 	Util.ajaxPost ("importSECFiling/getSECFilingData", inpObj, function(result){           	 
        		if (!result.Status) {
    				Util.showMessage ("Failed to get the SECFilingData : "+ result.Message);
    			} else {
    				downloadDlg.listData = result.Data;
    				if (downloadDlg.listData) {
    					var txt = '<div style="overflow:auto; height:50%;" class="selectedFileInputs" > <table border="1" style="width:100%">\
    			    		<tr> <th> </th> <th> Date </th> <th> CIK </th>  <th> Name </th>  <th  width="10%"> Type </th> <th> Filename </th> </tr>';
    			 
    					for (var i=0; i<downloadDlg.listData.length; i++) {
    						var c = downloadDlg.listData[i];
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
		markup += '<option value='+none+'>'+ none +'</option>';	 
    	for (var f=0; formTypes && f<formTypes.length; f++) {
    		var fmType = formTypes[f];
    		markup += '<option value="'+fmType+'">'+fmType+'</option>';
    	}     	 
    	
    	return markup;
    };
    
    var getFillingsTypeMarkup = function (fmTypes) {
    	var markup = '<select class="fillingTypeInput" dataAttr="fillingtype" style="width:100%">';
    	var none = "NONE";
		markup += '<option value='+none+'> Select Filing Type </option>';	
    	$.each(fmTypes, function(key, value) {
    		markup += '<option value="'+key+'">'+value+'</option>';  		
		});
    	return markup;
    };
    
    var createSelectSearchFormHTML = function (){
       	var markup = '<table border="1" class="listSecFillings" style="width:100%">';
    	    	
    //	var fillingTypes = {"13F": "13-F", "10-Q" : "10-Q", "10-K": "10-K"};
       	var fillingTypes = {"10-Q" : "10-Q", "10-K": "10-K"};
    	var ftMarkUp = getFormTypeMarkup ();
    	var fgMarkup = getFillingsTypeMarkup (fillingTypes);
    	markup += '<tr>';    	
    	markup += '<td>';
    	markup += "Select Filings Type";
    	markup += '</td>';
   	
    	markup += '<td>'+ fgMarkup + '</td>';    	
    	markup += '</tr>';    	
    	markup += '</table>';
    	markup += '<br>';
    		
    	
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
    						<td> <button type="button" id="formSearchButton" style="width:100%" disabled="disabled"> Search </button> </td>\
    					</tr>\
					</table> </td>\
    		      </tr>';    	
    	markup += '</table>';
    	
       	return markup;
    };
       
   
	return this; 
 };
