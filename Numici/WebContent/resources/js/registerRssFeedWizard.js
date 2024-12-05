
var registerRssFeedWizard = function() {
	this.dialogs = {};
	var rssFeedDlg = this;	
	
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
				rssFeedDlg.createRegisterRssFeedDialog (id);				
			} else if ($(this).attr("data-action") == "delete") {				 
				rssFeedDlg.deleteRegisterRssFeed (id);			
			}; 
		});
		dlg.find(".addNewRssFeed").off("click").on("click",function(e){
			 rssFeedDlg.createRegisterRssFeedDialog ();
		});
	};
	
	var getRegisteredRSSFeedInfoRowMarkUp = function (e) {	
		var active = '<input type="checkbox" disabled>';
		if (e.active) {
			active = '<input type="checkbox" checked disabled>';
		}
		var markup = '<tr class="registeredRSSFeedRows" id="'+e.id+'"> <td>'+e.feedName+'</td> <td>'+e.feedSource+'</td> <td>'+e.feedUrl+'</td> <td>'+active+'</td>';	
		markup += '<td  style="width:10%" ><button class="btn" data-action="view">View</button></td>';
		markup += '<td style="width:10%" ><button class="btn" data-action="delete">Delete</button></td>';
		markup += '</tr>';
		
		return markup;
	};
	
	var createRegisterRSSFeedHTML = function () {
		var markup = '<table border="1" style="width:100%" class="listRegisteredRSSFeeds"> \
						<tbody>\
			<tr> <button class="addNewRssFeed" style="float:right">Register RSS Feed</button> <br> </tr> \
							<tr> <th> Feed Name </th> <th> Feed Source </th> <th> Feed URL </th> <th> Is Active </th> <th colspan="2"> Actions </th> </tr>';
		
					
		for (var i=0; rssFeedDlg.registeredRSSFeeds && i<rssFeedDlg.registeredRSSFeeds.length; i++) {
			var e = rssFeedDlg.registeredRSSFeeds[i];
			var rowMarkUp = getRegisteredRSSFeedInfoRowMarkUp (e);			 
			markup += rowMarkUp;
		}
		
		markup += '</tbody> </table>';
		return markup;
	};
	
		
	this.listRegisterRssFeedDialog = function () {
    	var dlg = $('<div ui-role="listRegisterRssFeedDialog" ></div>');
		var isExist = $('body').find('div[ui-role="listRegisterRssFeedDialog"]');
		if (isExist.length > 0) {
			return;
		};
		 
		var title = "Registered RSS Feed Information";			
		$(dlg).dialog({
				width :  650,
				height : 350,
				title : title,
				
				create: function (event, ui){
					var c = this;				 
				 				 
					// Invoke one time AJAX API's.		 
					Util.showSpinner("manual");
					$.when(						
					    Util.diff_ajaxGet ("/newsFeed/getAllRegisterFeed", function(result){					    	 
							if (!result.Status) {
								Util.showMessage (result.Message);
							} else {								
								rssFeedDlg.registeredRSSFeeds = result.Data;								 
							}
						}, false, false)
						
					).then(function(){
						Util.hideSpinner("manual");
						var html = createRegisterRSSFeedHTML();
						
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
    
    var getRegisterRSSFeedInfoById = function (id) {
    	for (var i=0; rssFeedDlg.registeredRSSFeeds && i<rssFeedDlg.registeredRSSFeeds.length; i++) {
    		var e = rssFeedDlg.registeredRSSFeeds[i];
    		if (id == e.id) {
    			return e;    			
    		}
    	}
    	return null;
    };
    
    var getDefaultRegisterRSSFeedInfo = function () {
    	var obj = {};
    	
    	obj["feedName"]=null;
    	obj["feedSource"]=null;
    	obj["feedUrl"]=null; 
    	obj["description"]=null;
    	obj["active"]=null;
    	   	 
    	return obj;    	
    };
    
   
    var createRegisterRSSFeedInformationHTML = function (registeredRSSFeedInfo) {    	
       	var markup = '<table border="1" style="width:100%" class="selectedRegisteredRSSFeedInfo">\
				<tbody>';       	
       	$.each(registeredRSSFeedInfo, function(key, value) {
       		if (key != 'id') {
       			markup += '<tr> <td>'+key.toUpperCase()+' </td>';

   				var val = (value == null ? "" : value);       		
       			var active = '<input type="checkbox" class="registerRSSFeedInputs" dataAttr="'+key+'" datatype="boolean">';
       			if (key == "active") {
       				if (value == true){
           				active = '<input type="checkbox" class="registerRSSFeedInputs" dataAttr="'+key+'" datatype="boolean" checked>';
       				} 
       				markup += '<td>' +active+ '</td></tr>';	
       			} else {
       				markup += '<td> <input type="text" class="registerRSSFeedInputs" style="width:100%" dataAttr="'+key+'" value="'+val+'" </td></tr>';	
       			}				
   				
       		}     
   		});
       	markup += 	'</tbody> </table>'; 
    
    	return markup;    	 
    };
    
    var refreshEventList = function (div) {    	 
    	Util.diff_ajaxGet ("/newsFeed/getAllRegisterFeed", function(result){					    	 
				if (!result.Status) {
					Util.showMessage (result.Message);
				} else {					 
					rssFeedDlg.registeredRSSFeeds = result.Data;	
					var dlg =  $('body').find('div[ui-role="listRegisterRssFeedDialog"]');
		 			var tbody = dlg.find(".listRegisteredRSSFeeds tbody");
			    	var trows = dlg.find(".listRegisteredRSSFeeds .registeredRSSFeedRows");
			    //	if (trows.length) {
			    		trows.remove();
			    		
			    		for (var i=0; rssFeedDlg.registeredRSSFeeds && i<rssFeedDlg.registeredRSSFeeds.length; i++) {
			    			var e = rssFeedDlg.registeredRSSFeeds[i];
			    			var rowMarkUp = getRegisteredRSSFeedInfoRowMarkUp (e);			 
			    			tbody.append(rowMarkUp);
			    			var dlg =  $('body').find('div[ui-role="listRegisterRssFeedDialog"]');
			    			bindNotificationEvents (dlg);
			    		}
			    //	}
					
				}
			}, false, true);    	  
     
    };
    
    var validateRegisteredRSSFeedInfoData = function (info) {
    	var err = {};	
		err.status = false;
		err.msg = "";
		var mandatory = ["feedSource", "feedName", "feedUrl"];
		 		
		if ($.isEmptyObject(info)) {
			err.msg = "Please enter mandatory inputs (feedSource/feedUrl/feedName) ...!!";
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
		
		return err;
    };
    
   
    var saveRegisterRSSFeedInformation = function (dlg, registeredRSSFeedId) { 
    	var regRSSFeedInputs =  readUserInputs(".selectedRegisteredRSSFeedInfo .registerRSSFeedInputs");
    	var registerRSSFeedObj = {};
    	$.each(regRSSFeedInputs, function(key, value) {
       		 if (value.length != 0) {
       			 registerRSSFeedObj[key]=value;
       		 }   
   		});
    	
    	if (registeredRSSFeedId) {
    		registerRSSFeedObj['id']=registeredRSSFeedId;
    	}
    	
      	var err = validateRegisteredRSSFeedInfoData (registerRSSFeedObj);
    	if (err.status) {
    		Util.showMessage (err.msg);
    		return;
    	} 
    
    	Util.ajaxPost ("newsFeed/saveRegisterFeed", registerRSSFeedObj, function(result){ 
       		if (!result.Status) {
				Util.showMessage ("Failed to save the RSS feed information : "+ result.Message);
			} else {
				 console.log ("RSS feed information saved successfully ....");
				 refreshEventList (dlg);				 
			}		
    		dlg.dialog("close");
    		dlg.dialog("destroy");
		},false,true); 
    };
    
    this.deleteRegisterRssFeed = function (registeredRSSFeedId) {
    	var dlg = $('body').find('div[ui-role="listRegisterRssFeedDialog"]');
    	
    	Util.promptDialog ("Do you want to delete the registered RSS feed information ?",
				function(){    		 
    		 		Util.ajaxDelete ("newsFeed/deleteRegisteredFeed/"+registeredRSSFeedId, null, function(result){ 
	    	       		if (!result.Status) {
	    					Util.showMessage ("Failed to delete the registered RSS feed information : "+ result.Message);
	    				} else {
	    					 console.log ("Registered RSS feed information is deleted successfully ....");
	    					 refreshEventList (dlg);				 
	    				}	    	    		 
    		 		},false,true);    			
    			}, function(){}, null);
    };
    
    this.createRegisterRssFeedDialog = function (rowID) {     
    	var dlg = $('<div ui-role="editRegisteredRSSFeedInfoDlg" ></div>');
		var isExist = $('body').find('div[ui-role="editRegisteredRSSFeedInfoDlg"]');
		if (isExist.length > 0) {
			return;
		};

		var heading = (rowID ? "View/Edit RSS Feed Information" : "Register RSS Feed Information");
	 	var btns;
	 	var registeredRSSFeedInfo;
		if (rowID) {
    		registeredRSSFeedInfo = getRegisterRSSFeedInfoById (rowID);  
    		btns = {					
    				"Save" : function (event) {
    					saveRegisterRSSFeedInformation ($(dlg), rowID);
    				},				
    				"Cancel" : function(event) {
    					$(dlg).dialog("close");
    					$(dlg).dialog("destroy");
    				} 
    			};
    	} else {
    		registeredRSSFeedInfo = getDefaultRegisterRSSFeedInfo();
    		btns = {					
    				"Create" : function (event) {
    					saveRegisterRSSFeedInformation ($(dlg), rowID);
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
					var html = createRegisterRSSFeedInformationHTML (registeredRSSFeedInfo);
					$(this).empty();
					$(this).append(html);				 
				},				 
				buttons : btns
				 
		});
    };
    
    return this; 
 };
