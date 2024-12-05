
var notificationWizard = function() {
	this.dialogs = {};
	var notifyDlg = this;	
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
			var eventType =$(this).closest('tr').attr('data-evtType');
			if ($(this).attr("data-action") == "view") {		 		
				notifyDlg.createEditNotificationDlg (id, eventType);				
			} else if ($(this).attr("data-action") == "delete") {				 
				notifyDlg.deleteNotification (id);			
			}; 
		});
		dlg.find(".addNewEvent").off("click").on("click",function(e){
			 notifyDlg.createEditNotificationDlg ();
		});
	};
	
	var getNotifictionRowMarkUp = function (e,status) {		 
		var type; 
		if (!status){
			type="sys";
		}
		
		var markup = '<tr class="eventRows" id="'+e.id+'" data-evtType="'+type+'"> <td>'+e.eventName+'</td> <td>'+e.description+'</td>';	
		markup += '<td  style="width:10%" ><button class="btn" data-action="view">View</button></td>';
		if (status) {
			markup += '<td style="width:10%" ><button class="btn" data-action="delete">Delete</button></td>';
		}
		markup += '</tr>';
		
		return markup;
	};
	
	var createNotificationHTML = function () {
		var markup = '<div id="ntfTabs">\
			<ul>\
			<li><a href="#myNtf">My Notifications</a></li>\
			<li><a href="#sysNtf">System Notifications</a></li>\
			</ul>\
			<div id="myNtf">\
			<table border="1" style="width:100%" class="listNotifications"> \
			<tbody>\
<tr> <button class="addNewEvent" style="float:right">Create Notification</button> <br> </tr> \
				<tr> <th> Event Name </th> <th colspan="1"> Description </th> <th colspan="2"> Actions </th> </tr>';
		
		for (var i=0; notifyDlg.events && i<notifyDlg.events.length; i++) {
			var e = notifyDlg.events[i];
			var rowMarkUp = getNotifictionRowMarkUp (e,true);			 
			markup += rowMarkUp;
		}
		
		markup += '</tbody> </table>\
			</div>\
			<div id="sysNtf">\
			<table border="1" style="width:100%" class="listNotifications"> \
			<tbody>\
				<tr> <th> Event Name </th> <th colspan="1"> Description </th> <th colspan="2"> Actions </th> </tr>';

		for (var i=0; notifyDlg.sysEvents && i<notifyDlg.sysEvents.length; i++) {
			var eSys = notifyDlg.sysEvents[i];
			var rowMarkUp = getNotifictionRowMarkUp (eSys,false);			 
			markup += rowMarkUp;
		}
		
		markup += '</tbody> </table></div></div>';
		return markup;
	};
	
		
	this.createNotificationDialog = function () {
    	var dlg = $('<div ui-role="notificationRegisterDlg" ></div>');
		var isExist = $('body').find('div[ui-role="notificationRegisterDlg"]');
		if (isExist.length > 0) {
			return;
		};
		this.getNotifyPostData = {};
		var userInfo = Util.getUserInfo();
		this.getNotifyPostData["createdBy"] = userInfo.UserId;
		
		var title = "Register Notification";
			
		$(dlg).dialog({
				width :  500,
				height : 350,
				title : title,
				
				create: function (event, ui){
					var c = this;				 
					var postData = notifyDlg.getNotifyPostData;	
					var sysNtfcPstData = {"createdBy":null};
					// Invoke one time AJAX API's.		 
					Util.showSpinner("manual");
					$.when(						
					    Util.diff_ajaxPost ("/registerUserNotification/getNotification", postData, function(result){					    	 
							if (!result.Status) {
								Util.showMessage (result.Message);
							} else {								
								notifyDlg.events = result.Data;								 
							}
						}, false, false),
						Util.diff_ajaxPost ("/registerUserNotification/getNotification", sysNtfcPstData, function(result){					    	 
							if (!result.Status) {
								Util.showMessage (result.Message);
							} else {								
								notifyDlg.sysEvents = result.Data;								 
							}
						}, false, false)
						
					).then(function(){
						Util.hideSpinner("manual");
						var html = createNotificationHTML();
				 
						$(c).empty();
						$(c).append(html);	
						$(c).find("#ntfTabs").tabs();
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
    
    var getEventById = function (id, eventType) {
    	var events = notifyDlg.events;
    	if (eventType == "sys"){
    		events = notifyDlg.sysEvents;
    	} 
    	for (var i=0; events && i<events.length; i++) {
    		var e = events[i];
    		if (id == e.id) {
    			return e;    			
    		}
    	}
    	return null;
    };
    
    var bindRegisterViewEvents = function (div, html, event) {
    	
       	$( document ).off("change","select[ class='selectEventType']").on("change","select[ class='selectEventType']",function() {
        	var eventName = $(this).val();
        	var desc="";        	
        		
        	if (event) {        		
        		desc = event.description;
        	}
             	 
    		var markup = '<table border="0" class="selectedEventInfo" style="width:100%"> <tr> <td><img src="resources/images/add.png" class="addNewTrigger" style="float:right"> </td></tr></table>\
    			 <table border="1" style="width:100%" class="selectedEventInfo triggerInfo">\
    			 <tbody>  <tr> <td> Description </td> <td colspan="2"> <input type="text" style="width:100%" class="selectEventDesc" dataAttr="eventDesc" value="'+desc+'"> </td> </tr>\
    			 <tr> <th> Trigger key </th> <th colspan="2"> Value </th> </tr>';
    		 for (var j=0;  event && event.userCriteria && j<event.userCriteria.length; j++) {
        		var e = event.userCriteria[j];
        		var str = getConsolidatedKeyValueString (e.keyValue);        		
        		markup += '<tr class="userCriteria">';
        		markup += '<td > <select dataAttr="triggerKey" class="ucTriggerKey" style="width:100%">';
        	//	markup += '<option value="default"> Select Trigger Key </option>';
        		$.each(notifyDlg.triggerKeys, function(key, value) {               	 
        			    if (e.triggerKey == key) {
        			    	markup += '<option value="'+key+'" selected>'+value+'</option>';
        			    } else {
        			    	markup += '<option value="'+key+'">'+value+'</option>';
        			    }
               		});
               	markup += '</select> </td>';
               	markup += '<td> <input type="text" style="width:100%" dataAttr="triggerValue" value="'+str+'"> </td>';
        		markup += '<td> <img src="resources/images/delete.png" class="removeNewTrigger"> </td> </tr>';
           	}
           	markup += '</tbody> </table>';
           	div.find(".selectedEventInfo").remove();
			div.append(markup);               		
        	
		});  
       	
       	$( document ).off("click","div[ui-role='editNotificationDlg'] .addNewTrigger").on("click","div[ui-role='editNotificationDlg'] .addNewTrigger",function() {
        	var table = $(this).closest('div[ui-role="editNotificationDlg"]').find('.triggerInfo');
       		var rows = table.find("tbody").find("tr").length-2;
       		rows = rows + 1;
       		var markup = '<tr class="userCriteria">';
       		markup += '<td > <select dataAttr="triggerKey" class="ucTriggerKey" style="width:100%">';
       		markup += '<option value="default"> Select Trigger Key </option>';
       		$.each(notifyDlg.triggerKeys, function(key, value) {
       			markup += '<option value="'+key+'">'+value+'</option>';       			
       		});
       		markup += '</select> </td>';
     
       		markup += '<td> <input type="text" style="width:100%" dataAttr="triggerValue" value=""> </td>';
       		markup += '<td> <img src="resources/images/delete.png" class="removeNewTrigger"> </td>';
           	markup += "</tr>";
       		table.append(markup);        	
		}); 
       	
     	$( document ).off("click","div[ui-role='editNotificationDlg'] .removeNewTrigger").on("click","div[ui-role='editNotificationDlg'] .removeNewTrigger",function() {
            $(this).closest("tr").remove();        	
		}); 
    };
    
    var getConsolidatedKeyValueString = function (keyValues) {     
    	var str="";
    	for (var i=0; keyValues && i<keyValues.length; i++) {
    		str += keyValues[i].trim();
    		if ((i+1) != keyValues.length) {
    			str += ",";
    		}
    	}
    	
    	return str;
    };
    
    var createRegisterViewHTML = function (event) {
    	var eventNames = 	{	"13FFiling": "13F",
    			"10QFiling" : "10-Q",
    			"10KFiling" : "10-K",
    			"8KFiling" : "8-K"
    		};
     
    	var markup = '<table border="1" style="width:100%" class="displayEvents">\
				<tbody>';
    	markup += '<tr> <td> Event Name </td>';    	
    	markup += '<td> <select class="selectEventType" dataAttr="eventName"> ';
    	
    	$.each(eventNames,function(key,val){
    		if (event && event.eventName == val) {
    			markup += '<option value="'+val+'" selected>'+key+'</option>';
    		} else {
    			markup += '<option value="'+val+'">'+key+'</option>';
    		}
    	});
    	
    	markup +=	'</select> </td> </tr>';
    	markup +=	'<tr> <td> Download Files </td>';
    	if(typeof event != "undefined" && typeof event.downloadFile != "undefined" && event.downloadFile){
    		markup +=	'<td> <input type="checkbox" datatype="boolean" dataAttr="downloadFile" checked> </td> </tr>'; 
    	}else {
    		markup +=	'<td> <input type="checkbox" datatype="boolean" dataAttr="downloadFile"> </td> </tr>'; 
    	}
    	
       	markup += 	'</tbody> </table>'; 
    
    	return markup;    	 
    };
    
    var refreshEventList = function (div) {
    	var postData = notifyDlg.getNotifyPostData;
    	Util.diff_ajaxPost ("/registerUserNotification/getNotification", postData, function(result){					    	 
				if (!result.Status) {
					Util.showMessage (result.Message);
				} else {								
					notifyDlg.events = result.Data;	
					var dlg =  $('body').find('div[ui-role="notificationRegisterDlg"]');
		 			var tbody = dlg.find(".listNotifications tbody");
			    	var trows = dlg.find(".listNotifications .eventRows");
			    	if (trows.length) {
			    		trows.remove();
			    		
			    		for (var i=0; notifyDlg.events && i<notifyDlg.events.length; i++) {
			    			var e = notifyDlg.events[i];
			    			var rowMarkUp = getNotifictionRowMarkUp (e);			 
			    			tbody.append(rowMarkUp);
			    			var dlg =  $('body').find('div[ui-role="notificationRegisterDlg"]');
			    			bindNotificationEvents (dlg);
			    		}
			    	}
					
				}
			}, false, true);    	  
     
    };
    
    var validateNotificationSaveData = function (data) {
    	var err = {};	
		err.status = false;
		err.msg = "";
		
		if (!data.description.length) {
			err.status = true;
			err.msg = "Please enter description ...!!";
			return err;
		}
		
		for (var i=0; data.userCriteria && i<data.userCriteria.length; i++) {
			var u = data.userCriteria[i];
 
			if (u.triggerKey == "default") {
				err.status = true;
				err.msg = "Please select the trigger key";
				return err;
			}
			for (var j=0; u.keyValue && j<u.keyValue.length; j++){
				var val = u.keyValue[j];
				if (val.length == 0) {
					err.status = true;
					err.msg = "Please enter the value for key: "+u.triggerKey;
					return err;
				}
			}			
		}
		
		return err;
    };
    
   
    var saveEditNotification = function (dlg, rowID) {   
    	var name =  dlg.find(".selectEventType").val();
    	var downloadFile = dlg.find('input[dataAttr=downloadFile]').is(':checked')? true : false;
    	var ds =  readUserInputs(".selectedEventInfo .selectEventDesc");
    	var tc = [];
    	var u = $(".selectedEventInfo .userCriteria");
    	for (var l=0; u && l<u.length; l++) {
    		var uc=u[l];
    		var obj={};
    		for (var i=0; uc.cells && i < uc.cells.length-1; i++) {        		
	    		if (i == 0) {
	    			var inputs =$(uc.cells[i]).find('select');
	    			obj["triggerKey"] = inputs.val();	    		 
	    		} else if (i == 1){
	    			var inputs =$(uc.cells[i]).find('input');
	    			obj["keyValue"] = inputs.val().split(',');	    		 
	    		}    		
	    	}
	    	tc.push(obj);
    	}
    	 
    	var postData = {};
    	postData["eventName"] = name;
    	postData["downloadFile"] = downloadFile;
    	postData["description"] = ds.eventDesc;
    	postData["userCriteria"] = tc; 
    	if (rowID) {
    		postData["id"] = rowID;
    	}
    	 
    	var err = validateNotificationSaveData (postData);
    	if (err.status) {
    		Util.showMessage (err.msg);
    		return;
    	} 
     
    	Util.ajaxPost ("registerUserNotification/saveNotification", postData, function(result){ 
       		if (!result.Status) {
				Util.showMessage ("Failed to save the notification : "+ result.Message);
			} else {
				 console.log ("Notfication saved successfully ....");
				 refreshEventList (dlg);				 
			}		
    		dlg.dialog("close");
    		dlg.dialog("destroy");
		},false,true); 
    };
    
    this.deleteNotification = function (notificationId) {
    	var dlg = $('body').find('div[ui-role="notificationRegisterDlg"]');
    	
    	Util.promptDialog ("Do you want to delete the notification ?",
				function(){    		 
    		 		Util.ajaxDelete ("registerUserNotification/deleteNotification/"+notificationId, null, function(result){ 
    	       		if (!result.Status) {
    					Util.showMessage ("Failed to delete the notification : "+ result.Message);
    				} else {
    					 console.log ("Notfication saved successfully ....");
    					 refreshEventList (dlg);				 
    				}	    	    		 
    			},false,true);
    			
    			}, function(){}, null);
    };
    
    this.createEditNotificationDlg = function (rowID, eventType) {     
    	var dlg = $('<div ui-role="editNotificationDlg" ></div>');
		var isExist = $('body').find('div[ui-role="editNotificationDlg"]');
		if (isExist.length > 0) {
			return;
		};

		var heading = (rowID ? "View/Edit Notification" : "Create Notification");
	 	var btns;
		if (rowID) {
    		var evt = getEventById (rowID, eventType);  
    		btns = {					
    				"Save" : function (event) {
    					saveEditNotification ($(dlg), rowID);
    				},				
    				"Cancel" : function(event) {
    					$(dlg).dialog("close");
    					$(dlg).dialog("destroy");
    				} 
    			};
    	} else {
    		btns = {					
    				"Create" : function (event) {
    					saveEditNotification ($(dlg), rowID);
    				},				
    				"Cancel" : function(event) {
    					$(dlg).dialog("close");
    					$(dlg).dialog("destroy");
    				} 
    			};
    	}    	 
    	
	  	$(dlg).dialog({
				width :  500,
				height : 450,				
				title : heading,
				resizable : false,
				create: function (event, ui){
					
				},
				open : function (event,ui) {
					var html = createRegisterViewHTML (evt);
					$(this).empty();
					$(this).append(html);
					bindRegisterViewEvents ($(this), html, evt);
			 
					var event =$(this).find('select[class="selectEventType"]');					 
					event.trigger("change");
				},				 
				buttons : btns
				 
		});
    };
    
    return this; 
 };
