
var companyInformation = function() {
	this.dialogs = {};
	var companyDlg = this;	
	this.triggerKeys = {
			formType : "Form Type",
			companyName : "Company Name",
			cik : "CIK"
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
	
	var bindNotificationEvents = function (dlg) {
		var c = this;
		dlg.find(".btn").off("click").on("click",function(e){
			var id =$(this).closest('tr').attr('id');
			if ($(this).attr("data-action") == "view") {		 		
				companyDlg.createEditCompanyInformationDlg (id);				
			} else if ($(this).attr("data-action") == "delete") {				 
				companyDlg.deleteCompanyInformation (id);			
			}; 
		});
		dlg.find(".addNewCompany").off("click").on("click",function(e){
			 companyDlg.createEditCompanyInformationDlg ();
		});
	};
	
	var getCompanyInfoRowMarkUp = function (e) {		 
		var markup = '<tr class="companyRows" id="'+e.id+'"> <td>'+e.name+'</td> <td>'+e.ticker+'</td> <td>'+e.cik+'</td>';	
		markup += '<td  style="width:10%" ><button class="btn" data-action="view">View</button></td>';
		markup += '<td style="width:10%" ><button class="btn" data-action="delete">Delete</button></td>';
		markup += '</tr>';
		
		return markup;
	};
	
	var createCompaniesHTML = function () {
		var markup = '<table border="1" style="width:100%" class="listCompanies"> \
						<tbody>\
			<tr> <button class="addNewCompany" style="float:right">Create Company</button> <br> </tr> \
							<tr> <th> Company Name </th> <th> Code </th> <th> Ticker </th> <th colspan="2"> Actions </th> </tr>';
		
					
		for (var i=0; companyDlg.companies && i<companyDlg.companies.length; i++) {
			var e = companyDlg.companies[i];
			var rowMarkUp = getCompanyInfoRowMarkUp (e);			 
			markup += rowMarkUp;
		}
		
		markup += '</tbody> </table>';
		return markup;
	};
	
		
	this.listComapaniesDialog = function () {
    	var dlg = $('<div ui-role="listCompaniesDialog" ></div>');
		var isExist = $('body').find('div[ui-role="listCompaniesDialog"]');
		if (isExist.length > 0) {
			return;
		};
		 
		var title = "Companies Information";			
		$(dlg).dialog({
				width :  500,
				height : 350,
				title : title,
				
				create: function (event, ui){
					var c = this;				 
				 				 
					// Invoke one time AJAX API's.		 
					Util.showSpinner("manual");
					$.when(						
					    Util.diff_ajaxGet ("/company/list/all", function(result){					    	 
							if (!result.Status) {
								Util.showMessage (result.Message);
							} else {								
								companyDlg.companies = result.Company;								 
							}
						}, false, false)
						
					).then(function(){
						Util.hideSpinner("manual");
						var html = createCompaniesHTML();
						
						$(c).empty();
						$(c).append(html);			 
						bindNotificationEvents ($(c));
					});
				},
				open : function (event,ui) {

				},
				buttons : {
					"Cancel" : function(event) {
						$(dlg).dialog("close");
						$(dlg).dialog("destroy");
					} 
				}
		});
    };
    
    var getCompanyInfoById = function (id) {
    	for (var i=0; companyDlg.companies && i<companyDlg.companies.length; i++) {
    		var e = companyDlg.companies[i];
    		if (id == e.id) {
    			return e;    			
    		}
    	}
    	return null;
    };
    
    var getDefaultCompanyInfo = function () {
    	var obj = {};
    	
    	obj["name"]=null;
    	obj["ticker"]=null;
    	obj["phoneNumber"]=null;
    	obj["website"]=null; 
    	obj["ipoYear"]=null;
    	obj["subSector"]=null;
    	obj["industry"]=null;
    	obj["cik"]=null;
    	obj["fyPeriodEnd"]=null;
    	obj["fqPeriodEndArray"]=null;
    	   	 
    	return obj;    	
    };
    
   
    var createCompanyInformationHTML = function (companyInfo) {    	
       	var markup = '<table border="1" style="width:100%" class="selectedCompanyInfo">\
				<tbody>';       	
       	$.each(companyInfo, function(key, value) {
       		if (key != 'id') {
       			markup += '<tr> <td>'+key.toUpperCase()+' </td>';
       			if (key == "ipoYear") {
       				var minVal = 1990;
       				var maxVal = new Date().getFullYear();
       				var defaultVal = (value == null ? maxVal : value);
       				markup += '<td > <select class ="companyInputs" dataAttr="'+key+'">';
       				for (var i=minVal; i<=maxVal; i++) {
       					var year = i;
       					if (year == defaultVal) {
        			    	markup += '<option value="'+year+'" selected>'+year+'</option>';
        			    } else {
        			    	markup += '<option value="'+year+'">'+year+'</option>';
        			    }
       				}       	        		
       	            markup += '</select> </td>';
       			} else if (key == "phoneNumber") {
       				var val = (value == null ? "" : value);       		
       				markup += '<td> <input type="text" maxlength=10 class="companyInputs" style="width:100%" dataAttr="'+key+'" value="'+val+'" </td></tr>';
       			} else {
       				var val = (value == null ? "" : value);       		
       				markup += '<td> <input type="text" class="companyInputs" style="width:100%" dataAttr="'+key+'" value="'+val+'" </td></tr>';
       			}
       		}     
   		});
       	markup += 	'</tbody> </table>'; 
    
    	return markup;    	 
    };
    
    var refreshEventList = function (div) {    	 
    	Util.diff_ajaxGet ("/company/list/all", function(result){					    	 
				if (!result.Status) {
					Util.showMessage (result.Message);
				} else {					 
					companyDlg.companies = result.Company;	
					var dlg =  $('body').find('div[ui-role="listCompaniesDialog"]');
		 			var tbody = dlg.find(".listCompanies tbody");
			    	var trows = dlg.find(".listCompanies .companyRows");
			    //	if (trows.length) {
			    		trows.remove();
			    		
			    		for (var i=0; companyDlg.companies && i<companyDlg.companies.length; i++) {
			    			var e = companyDlg.companies[i];
			    			var rowMarkUp = getCompanyInfoRowMarkUp (e);			 
			    			tbody.append(rowMarkUp);
			    			var dlg =  $('body').find('div[ui-role="listCompaniesDialog"]');
			    			bindNotificationEvents (dlg);
			    		}
			    //	}
					
				}
			}, false, true);    	  
     
    };
    
    var validateCompanyInfoData = function (info) {
    	var err = {};	
		err.status = false;
		err.msg = "";
		var mandatory = ["ticker", "name", "cik"];
		 		
		if ($.isEmptyObject(info)) {
			err.msg = "Please enter mandatory inputs (ticker/cik/name) ...!!";
			err.status = true;		
			return err;
		}
		
		for (var i=0; i<mandatory.length; i++) {
			var field = mandatory[i];
			if (!info[field]) {
				err.msg = "Please enter "+field.toUpperCase()+" information ...!!";
				err.status = true;		
				return err;
			}
		} 
		
		if (info["cik"] && info['cik'].length) {
			if (isNaN(info['cik'])) {
				err.msg = "Please enter valid CIK information ...!!";
				err.status = true;		
				return err;
			}
		}
		
		if (info["phoneNumber"] && info['phoneNumber'].length) {
			if (isNaN(info['phoneNumber'])) {
				err.msg = "Please enter valid Phone Number ...!!";
				err.status = true;		
				return err;
			}
		}
		
		return err;
    };
    
   
    var saveCompanyInformation = function (dlg, companyId) { 
    	var cmpnInputs =  readUserInputs(".selectedCompanyInfo .companyInputs");
    	var companyObj = {};
    	$.each(cmpnInputs, function(key, value) {
       		 if (value.length != 0) {
       			 companyObj[key]=value;
       		 }   
   		});
    	
    	if (companyId) {
    		companyObj['id']=companyId;
    	}
    	
      	var err = validateCompanyInfoData (companyObj);
    	if (err.status) {
    		Util.showMessage (err.msg);
    		return;
    	} 
    
    	Util.ajaxPost ("company/add", companyObj, function(result){ 
       		if (!result.Status) {
				Util.showMessage ("Failed to save the company information : "+ result.Message);
			} else {
				 console.log ("Company information saved successfully ....");
				 refreshEventList (dlg);				 
			}		
    		dlg.dialog("close");
    		dlg.dialog("destroy");
		},false,true); 
    };
    
    this.deleteCompanyInformation = function (companyId) {
    	var dlg = $('body').find('div[ui-role="listCompaniesDialog"]');
    	
    	Util.promptDialog ("Do you want to delete the company information ?",
				function(){    		 
    		 		Util.ajaxDelete ("company/"+companyId, null, function(result){ 
	    	       		if (!result.Status) {
	    					Util.showMessage ("Failed to delete the comapny information : "+ result.Message);
	    				} else {
	    					 console.log ("Company information is deleted successfully ....");
	    					 refreshEventList (dlg);				 
	    				}	    	    		 
    		 		},false,true);    			
    			}, function(){}, null);
    };
    
    this.createEditCompanyInformationDlg = function (rowID) {     
    	var dlg = $('<div ui-role="editCompanyInfoDlg" ></div>');
		var isExist = $('body').find('div[ui-role="editCompanyInfoDlg"]');
		if (isExist.length > 0) {
			return;
		};

		var heading = (rowID ? "View/Edit Company Information" : "Create Company Information");
	 	var btns;
	 	var companyInfo;
		if (rowID) {
    		companyInfo = getCompanyInfoById (rowID);  
    		btns = {					
    				"Save" : function (event) {
    					saveCompanyInformation ($(dlg), rowID);
    				},				
    				"Cancel" : function(event) {
    					$(dlg).dialog("close");
    					$(dlg).dialog("destroy");
    				} 
    			};
    	} else {
    		companyInfo = getDefaultCompanyInfo();
    		btns = {					
    				"Create" : function (event) {
    					saveCompanyInformation ($(dlg), rowID);
    				},				
    				"Cancel" : function(event) {
    					$(dlg).dialog("close");
    					$(dlg).dialog("destroy");
    				} 
    			};
    	}    	 
    	
	  	$(dlg).dialog({
				width :  500,
				height : 315,				
				title : heading,
				resizable : false,
				create: function (event, ui){
					
				},
				open : function (event,ui) {
					var html = createCompanyInformationHTML (companyInfo);
					$(this).empty();
					$(this).append(html);				 
				},				 
				buttons : btns
				 
		});
    };
    
    return this; 
 };
