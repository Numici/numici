//This module provides Utility functions like ajax calls etc.

var vdvcUtils = {};

var Util = (function(Utils){

	var pathnaemArray = window.location.pathname.split( '/' );
	var current = Utils;
	
	Utils.protocol = window.location.protocol;
	Utils.host = window.location.host;
	Utils.context = pathnaemArray[1];
	Utils.baseUrl = Utils.protocol+"//" +Utils.host+"/api/";
	Utils.userinfo = {};
	Utils.userinfo["Organization"] = "";
	Utils.userinfo["OrganizationId"] = "";
	Utils.userinfo["UserId"] = "";
	Utils.userinfo["UserName"] = "";
	
	var resetTimeout=function() {
		try {
			if(window.opener && window.opener.resetSessionExpiry ){
				console.log(window.opener.location.pathname);
				try{
					window.opener.resetSessionExpiry();
				}catch(err){
					console.log(err);
				}

			}else{
				try{
					window.resetSessionExpiry();
				}catch(err){
					console.log(err);
				}
			}
		}
		catch ( err ) {
			console.log(err);
		}
	};

	 Utils.showSpinner = function(type) {
		 var style = {
					"display": "none",
					"position": "fixed",
					"z-index": "100000",
					"top": 0,
					"left": 0,
					"height": "100%",
					"width": "100%",
					"color" : "blue",
					"background": "rgba(255, 255, 255, 0.2)"
					//"background": "rgba(255, 255, 255, 0.2) url('resources/images/sandclock.gif') 50% 50% no-repeat"
					};
		var spinner = $('<div ui-role="spinner" >\
					<i class="fa fa-cog fa-spin fa-5x" style="position:absolute;top:50%;left:50%;"></i>\
					</div>');
		var isSpinner = $("body").find("div[ui-role='spinner']").length > 0 ? true : false;
		spinner.css(style);
		if (!isSpinner){
			$("body").append(spinner);
		} 
		if (!$("div[ui-role='spinner']").is(":visible")){
			$("div[ui-role='spinner']").show();
		}
		if(type == "manual") {
			$("body").find("div[ui-role='spinner']").attr("init-type","manual");
		} 
	};

	 Utils.hideSpinner = function(type) {
		 var init_type = $("div[ui-role='spinner']").attr("init-type");
		if ($("div[ui-role='spinner']").is(":visible") && init_type != "manual"){
			$("div[ui-role='spinner']").hide();
		}
		if(type == "manual") {
			$("div[ui-role='spinner']").hide();
			$("div[ui-role='spinner']").removeAttr("init-type");
		}
	};

	Utils.diff_ajaxGet=function(url,success, error,spinner) {
		if (spinner) {
			current.showSpinner();
		}
		resetTimeout();
		var fullUrl = current.baseUrl + url;
		return $.ajax({
			type : 'GET',
			contentType : 'application/json',
			url : fullUrl,
			dataType : "json",
			success : function(result, textStatus, jqXHR) {
				if (spinner) {
					current.hideSpinner();
				}
				console.log('Result for URL: '+fullUrl);
				console.log(result);
				if ("function" == typeof success) {
					success(result);
				}
			},
			error : function(jqXHR, textStatus, errorThrown) {
				if (spinner) {
					current.hideSpinner();
				}
				current.showMessage('error: ' + textStatus);
				if ("function" == typeof error) {
					error();
				}
			}
		});
	};

	Utils.diff_ajaxPost=function(url,input,success,failure,spinner){
		if (spinner) {
			current.showSpinner();
		}
		resetTimeout();
		var fullUrl = current.baseUrl + url;
		var io = null;
		if ("string" == typeof(input)) { io = input; }
		else { io = JSON.stringify(input); }
		return $.ajax({
			type : 'POST',
			contentType : 'application/json',
			url : fullUrl,
			dataType : "json",
			data : io,
			success : function(result, textStatus, jqXHR) {
				console.log('Post Data for URL: '+fullUrl);
				console.log(input);

				console.log('Result for Post URL: '+fullUrl);
				console.log(result);
				if (spinner) {
					current.hideSpinner();
				}
				if ("function" == typeof success) {
					success(result);
				}
			},
			error : function(jqXHR, textStatus, errorThrown) {
				if (spinner) {
					current.hideSpinner();
				}
				if ("function" == typeof failure) {
					current.showMessage('error: ' + textStatus);
				}
			}
		});
	};


	Utils.sync_ajaxGet=function(url,success, error,spinner) {
		if (spinner) {
			current.showSpinner();
		}
		resetTimeout();
		var fullUrl = current.baseUrl + url;
		return $.ajax({
			type : 'GET',
			contentType : 'application/json',
			url : fullUrl,
			dataType : "json",
			async : false,
			success : function(result, textStatus, jqXHR) {
				console.log('Result for URL: '+fullUrl);
				console.log(result);
				if (spinner) {
					current.hideSpinner();
				}
				if ("function" == typeof success) {
					success(result);
				}
			},
			error : function(jqXHR, textStatus, errorThrown) {
				if (spinner) {
					current.hideSpinner();
				}
				current.showMessage('error: ' + textStatus);
				if ("function" == typeof error) {
					error();
				}
			}
		});
	};

	//This method provides ajax get method
	Utils.ajaxGet= function(url,success, error,spinner) {
		if (spinner) {
			current.showSpinner();
		}
		resetTimeout();
		var fullUrl = current.baseUrl + url;
		$.ajax({
			type : 'GET',
			contentType : 'application/json',
			url : fullUrl,
			dataType : "json",
			success : function(result, textStatus, jqXHR) {
				console.log('Result for GET URL: '+fullUrl);
				console.log(result);
				if (spinner) {
					current.hideSpinner();
				}
				if ("function" == typeof success) {
					success(result);
				}
			},
			error : function(jqXHR, textStatus, errorThrown) {
				if (spinner) {
					current.hideSpinner();
				}
				current.showMessage('error: ' + textStatus);
				if ("function" == typeof error) {
					error();
				}
			}
		});
	};

	// Ajax GET synchronus function
	Utils.ajaxSyncGet= function(url,success, error,spinner) {
		if (spinner) {
			current.showSpinner();
		}
		resetTimeout();
		var fullUrl = current.baseUrl + url;
		$.ajax({
			type : 'GET',
			contentType : 'application/json',
			url : fullUrl,
			dataType : "json",
			async : false,
			success : function(result, textStatus, jqXHR) {
				console.log('Result for Sync GET URL: '+fullUrl);
				console.log(result);
				if (spinner) {
					current.hideSpinner();
				}
				if ("function" == typeof success) {
					success(result);
				}
			},
			error : function(jqXHR, textStatus, errorThrown) {
				if (spinner) {
					current.hideSpinner();
				}
				current.showMessage('error: ' + textStatus);
				if ("function" == typeof error) {
					error();
				}
			}
		});
	};
	
	
	
	
	Utils.ajaxGet_download= function(url,success, error,spinner) {
		if (spinner) {
			current.showSpinner();
		}
		resetTimeout();
		var fullUrl = current.baseUrl + url;
		$.ajax({
			type : 'GET',
			contentType : 'application/x-www-form-urlencoded',
			url : fullUrl,
			dataType : "text",
			async : false,
			success : function(result, textStatus, jqXHR) {
				console.log('Result for Sync GET URL: '+fullUrl);
				console.log(result);
				if (spinner) {
					current.hideSpinner();
				}
				if ($("iframe[data-id='exportModel']").length == 0){
					$("body").append("<iframe data-id='exportModel' src='" + fullUrl+ "' style='display: none;' ></iframe>");
				} else {
					$("iframe[data-id='exportModel']").attr("src",fullUrl);
				}
								
				if ("function" == typeof success) {
					success(result);
				}
			},
			error : function(jqXHR, textStatus, errorThrown) {
				if (spinner) {
					current.hideSpinner();
				}
				current.showMessage('error: ' + textStatus);
				if ("function" == typeof error) {
					error();
				}
			}
		});
	};
	
	
	//This method provides ajax delete method
	Utils.ajaxDelete =function(url,input,success,failure,spinner){
		if (spinner) {
			current.showSpinner();
		}
		resetTimeout();
		var fullUrl = current.baseUrl + url;
		var io = null;
		if ("string" == typeof(input)) { io = input; }
		else { io = JSON.stringify(input); }
		$.ajax({
			type : 'DELETE',
			contentType : 'application/json',
			url : fullUrl,
			dataType : "json",
			data : io,
			success : function(result, textStatus, jqXHR) {
				console.log('Result for Delete URL: '+fullUrl);
				console.log(result);
				if (spinner) {
					current.hideSpinner();
				}
				if ("function" == typeof success) {
					success(result);
				}
			},
			error : function(jqXHR, textStatus, errorThrown) {
				if (spinner) {
					current.hideSpinner();
				}
				if ("function" == typeof failure) {
					current.showMessage('error: ' + textStatus);
				}
			}
		});
	};
	
	Utils.ajaxSyncDelete =function(url,input,success,failure,spinner){
		if (spinner) {
			current.showSpinner();
		}
		resetTimeout();
		var fullUrl = current.baseUrl + url;
		var io = null;
		if ("string" == typeof(input)) { io = input; }
		else { io = JSON.stringify(input); }
		$.ajax({
			type : 'DELETE',
			contentType : 'application/json',
			url : fullUrl,
			dataType : "json",
			data : io,
			async : false,
			success : function(result, textStatus, jqXHR) {
				console.log('Result for Delete URL: '+fullUrl);
				console.log(result);
				if (spinner) {
					current.hideSpinner();
				}
				if ("function" == typeof success) {
					success(result);
				}
			},
			error : function(jqXHR, textStatus, errorThrown) {
				if (spinner) {
					current.hideSpinner();
				}
				if ("function" == typeof failure) {
					current.showMessage('error: ' + textStatus);
				}
			}
		});
	};
	
	//This method provides ajax post method
	Utils.ajaxPost=function(url,input,success,failure,spinner){
		if (spinner) {
			current.showSpinner();
		}
		resetTimeout();
		var fullUrl = current.baseUrl + url;
		var io = null;
		if ("string" == typeof(input)) { io = input; }
		else { io = JSON.stringify(input); }
		$.ajax({
			type : 'POST',
			contentType : 'application/json',
			url : fullUrl,
			dataType : "json",
			data : io,
			success : function(result, textStatus, jqXHR) {
				console.log('Post Data for URL: '+fullUrl);
				console.log(JSON.stringify(input));

				console.log('Result for Post URL: '+fullUrl);
				console.log(JSON.stringify(result));
				if (spinner) {
					current.hideSpinner();
				}
				if ("function" == typeof success) {
					success(result);
				}
			},
			error : function(jqXHR, textStatus, errorThrown) {
				if (spinner) {
					current.hideSpinner();
				}
				if ("function" == typeof failure) {
					current.showMessage('error: ' + textStatus);
				}
			}
		});
	};


	Utils.ajaxSyncPost=function(url,input,success,failure,spinner){
		if (spinner) {
			current.showSpinner();
		}
		resetTimeout();
		var fullUrl = current.baseUrl + url;
		var io = null;
		if ("string" == typeof(input)) { io = input; }
		else { io = JSON.stringify(input); }
		$.ajax({
			type : 'POST',
			contentType : 'application/json',
			url : fullUrl,
			dataType : "json",
			data : io,
			async : false,
			success : function(result, textStatus, jqXHR) {
				console.log('Post Data for URL: '+fullUrl);
				console.log(input);

				console.log('Result for Sync Post URL: '+fullUrl);
				console.log(result);
				if (spinner) {
					current.hideSpinner();
				}
				if ("function" == typeof success) {
					success(result);
				}
			},
			error : function(jqXHR, textStatus, errorThrown) {
				if (spinner) {
					current.hideSpinner();
				}
				if ("function" == typeof failure) {
					current.showMessage('error: ' + textStatus);
				}
			}
		});
	};

	Utils.jstreeNode = function(data,children,attr,metadata){
		var node={};
		node.data=data;
		node.children=children;
		node.attr=attr;
		node.metadata=metadata;

		return node;
	};

	Utils.showMessage = function(message, okfunc){
		var dialogMarkup = '<div></div>';
		$(dialogMarkup).dialog({
		      modal: true,
		      dialogClass:"alert",
		      width: 500,
		      height:250,
		      resizable: false,
		      open: function(){
		    	  $(this).empty();
		    	  $(this).append('<p>'+message+'</p>');
		      },
		      close:function(){
		    	  $( this ).dialog( "destroy" );
		      },
		      buttons: {
		        Ok: function() {
		          $( this ).dialog( "close" );
		          if ("function" == typeof okfunc) {
		        	  okfunc();
		          }
		        }
		      }
		    });

	};

	Utils.promptDialog = function(message,Yes,No,Cancel){
		var dialogMarkup = '<div id="promptUserResponseDialog"></div>';
		var dlgButtons = {};
		var isExists = $("body").find("#promptUserResponseDialog");

		if (isExists.length > 0){
			return;
		}

		var dlg = $(dialogMarkup).dialog({
		      modal: true,
		      width: 500,
		      height:200,
		      resizable: false,
		      open: function(){
		    	  $(this).empty();
		    	  $(this).append(message);

		      },
		      close:function(){
		    	  if ("function" == typeof Cancel ) {
		    		  Cancel();
		    	  }
		    	  $( this ).dialog( "destroy" );
		    	  
		      },
		      buttons: dlgButtons
		    });
		addButton($(dlg), dlgButtons, "Yes", Yes);
		addButton($(dlg), dlgButtons, "No", No);
		addButton($(dlg), dlgButtons, "Cancel", Cancel);
		$(dlg).dialog({buttons:dlgButtons});

		function addButton(dlg, map, key, fn) {
			if ("function" == typeof fn) {
				map[key] = function() {
					$(dlg).dialog("close");
					fn();
				};
			}
		}
	};

	Utils.getUserInfo=function(){
		return Utils.userinfo;
	};

	Utils.getURLParameter=function(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	        results = regex.exec(location.search);
	    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	};

	Utils.parseBoolean = function(value){
		var boolean = value;
		if(typeof boolean === "string"){
			switch(value.toLowerCase()){
			case 'true':
				boolean= true;
				break;
		    case 'false':
		    	boolean= false;
		    	break;
			}
		}
		if(typeof boolean === "boolean"){
			return boolean;
		}else{
			return false;
		}
	};

	Utils.populateDropdown = function(selector, datasource, valueMember, displayMember, hasEmpty) {
		$(selector).empty();
		if (hasEmpty) {
			$(selector).append('<option value=""> </option>');
		}
		datasource.forEach(function(data) {
			$(selector).append('<option value="'+data[valueMember]+'">'+data[displayMember]+' </option>');
		});
	};

	//initializers
	Utils.sync_ajaxGet("user/current",function(result){

		if(result.Status){
			Utils.userinfo = {};
			Utils.userinfo["Organization"] = result.Organization;
			Utils.userinfo["OrganizationId"] = result.OrganizationId;
			Utils.userinfo["UserId"] = result.UserId;
			Utils.userinfo["UserName"] = result.UserName;
		}
	});

	return Utils;

})(vdvcUtils || (vdvcUtils = {}));
