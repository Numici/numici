;(function(){
	'use strict';
	
	angular.module("vdvcPublicApp").factory("CommonService", ['$rootScope','httpService','$uibModal','$window','$document','$state','$deviceInfo','appData',
	                                                    function($rootScope,httpService,$uibModal,$window,$document,$state,$deviceInfo,appData) {
		
		var pathnaemArray = $window.location.pathname.split( '/' );
		var protocol = $window.location.protocol;
		var host = $window.location.host;
		var context = pathnaemArray[1];
		
		var isEditorCssLoaded = false;
		var CommonService = {
				sortAnnotationsByTextPosition : sortAnnotationsByTextPosition,
				getPublicDigestById : getPublicDigestById,
				getPublicDocById : getPublicDocById,
				getGlobalSettings : getGlobalSettings,
				loadEditorCss : loadEditorCss
		};
		
		CommonService.getBaseUrl = function() {
			return protocol+"//" +host+"/";
		}
		
		CommonService.sendUseragentinfo = function() {
			var info = $deviceInfo.deviceInfo;
			return httpService.httpPost("common/useragentinfo",info);
		};
		
		CommonService.getKeyValuesForVDVCColorCodeType = function() {
			return httpService.httpGet("publicAPI/getKeyValuesForVDVCColorCodeType");
		};
		
		CommonService.getKeyValuesForWebAnnotationsType = function() {
			return httpService.httpGet("publicAPI/getKeyValuesForWebAnnotationsType");
		};
		
		CommonService.getKeyValuesForNotificationHandledelayTime = function() {
			return httpService.httpGet("publicAPI/getKeyValuesForNotificationHandledelayTime");
		};
		
		CommonService.getDigestHtml = function(id) {
			return httpService.httpGet("publicAPI/getDigestHtml/"+id);
		};
		
	    /* Define functin to find and replace specified term with replacement string */
	    CommonService.replaceAll = function(str, term, replacement) {
	      return str.replace(new RegExp(escapeRegExp(term), 'g'), replacement);
	    };
	    
	    CommonService.getScrollingElement = function(_document) {
			 var userAgent = $window.navigator.userAgent;
			 
			 if (_document.scrollingElement) {
				 return _document.scrollingElement;
			 }
			 if (userAgent.indexOf('WebKit') != -1) {
				return _document.body;
			 }
			 return _document.documentElement;
		}
	    
	    function sortAnnotationsByTextPosition(a,b) {
			if(!_.isEmpty(a['position']) && !_.isEmpty(b['position']) ) {
				return a['position'].y - b['position'].y || a['position'].x - b['position'].x;
			}
			return 0;
		}
	    
	    function getPublicDigestById(id) {
	    	return httpService.httpGet("publicAPI/getDigest/"+id);
	    }
	    
	    function getPublicDocById(id,tsId,dId,aId) {
	    	var servideUrl = "publicAPI/getDigestDoc/"+id+"/"+tsId+"/"+dId;
	    	if(aId) {
	    		servideUrl = servideUrl+"/"+aId;
	    	}
	    	return httpService.httpGet(servideUrl);
	    }
	    
	    function getGlobalSettings() {
	    	CommonService.getKeyValuesForVDVCColorCodeType().then(function(resp){
	    		var appdata = appData.getAppData();
	    		var numiciImage, numiciLink, numiciHeaderTxt, numiciFooterTxt;
				if(resp.status == 200 && resp.data.Status) {
					var VDVCColorCodes  = resp.data.listAppKeyValues;
		 			numiciImage = _.findWhere(VDVCColorCodes, {key: "NumiciImage"});
		 			numiciLink = _.findWhere(VDVCColorCodes, {key: "NumiciLink"});
		 			numiciHeaderTxt = _.findWhere(VDVCColorCodes, {key: "NumiciHeaderText"});
		 			numiciFooterTxt = _.findWhere(VDVCColorCodes, {key: "NumiciFooterText"});
 			  	}
	 			appdata["numiciImage"] = numiciImage && numiciImage.value ? numiciImage.value : "https://app.numici.com/app/assets/icons/Numici_logo-N-in_Blue.jpg";
	 			appdata["numiciLink"] = numiciLink && numiciLink.value ? numiciLink.value : "https://www.numici.com";
	 			appdata["numiciHeaderTxt"] = numiciHeaderTxt && numiciHeaderTxt.value ? numiciHeaderTxt.value : "Powered by Numici";
	 			appdata["numiciFooterTxt"] = numiciFooterTxt && numiciFooterTxt.value ? numiciFooterTxt.value : "Workspace designed for Research";
        	});
	    }
	    
	    function loadEditorCss() {
	    	CommonService.getKeyValuesForVDVCColorCodeType().then(function(resp){
				if(resp.status == 200 && resp.data.Status) {
					var VDVCColorCodes  = resp.data.listAppKeyValues;
			    	var antClrCde = _.findWhere(VDVCColorCodes, {key: "Annotation"});
		     		var pdfAntClrCde = _.findWhere(VDVCColorCodes, {key: "PdfAnnotation"});
		 			var antSlctClrCde = _.findWhere(VDVCColorCodes, {key: "AnnotationSelect"});
		 			var pdfAntSlctClrCde = _.findWhere(VDVCColorCodes, {key: "PdfAnnotationSelect"});
		 			var PdfAnnotationSelectBorder = _.findWhere(VDVCColorCodes, {key: "PdfAnnotationSelectBorder"});
		 			var snippetClrCde = _.findWhere(VDVCColorCodes, {key: "Snippet"});
		 			var snippetSlctClrCde = _.findWhere(VDVCColorCodes, {key: "SnippetSelect"});
		 			var toggleStripClrCde = _.findWhere(VDVCColorCodes, {key: "ToggleStrip"});
		 			
		 			var appdata = {};
		 			appdata["antClrCde"] = antClrCde && antClrCde.value ? antClrCde.value : "rgba(255, 255, 0, 0.3);";
		 			appdata["pdfAntClrCde"] = pdfAntClrCde && pdfAntClrCde.value ? pdfAntClrCde.value : "rgba(255, 255, 0, 0.3);";
		 			appdata["antSlctClrCde"] = antSlctClrCde && antSlctClrCde.value ? antSlctClrCde.value : "rgba(255, 255, 0, 0.6);";
		 			appdata["pdfAntSlctClrCde"] = pdfAntSlctClrCde && pdfAntSlctClrCde.value ? pdfAntSlctClrCde.value : "rgba(255, 255, 0, 0.6);";
		 			appdata["PdfAnnotationSelectBorder"] = PdfAnnotationSelectBorder && PdfAnnotationSelectBorder.value ? PdfAnnotationSelectBorder.value : "rgba(255, 0, 0,1);";
		 			appdata["snippetClrCde"] = snippetClrCde && snippetClrCde.value ? snippetClrCde.value : "#cfe2f3";
		 			appdata["snippetSlctClrCde"] = snippetSlctClrCde && snippetSlctClrCde.value ? snippetSlctClrCde.value : "#cfe2f3";
		 			appdata["toggleStripClrCde"] = toggleStripClrCde && toggleStripClrCde.value ? toggleStripClrCde.value : "rgba(0, 102, 153, 1);";
			    	
			    	//temp code needs to update
		 			if(!isEditorCssLoaded) {
		 				CKEDITOR.addCss(
			 			        'body {' +
						            'word-wrap: break-word;'+
						            'padding-top: 10px;'+
						            'width: 210mm;'+
							    	'margin: 15px auto 15px auto;'+
							    	'padding: 5mm;'+
							    	'background: #fff;'+
							    	'min-height: 297mm;'+
							    	'box-shadow: rgb(170, 170, 170) 2px 2px 6px 3px;'+
						        '}'+'.cke_editable p {' +
				 			    	'line-height: 1.5;'+
				 			    	'-webkit-margin-before: 0;'+
				 			    	'-webkit-margin-after: 0;'+
				 			    '}'+'.note {' +
			 			            'background-color: '+appdata.antClrCde+';'+
			 			            'position:relative;'+
			 			        '}'+'body img {' +
			 			            'max-width: 100% !important;'+
			 			            'height:auto !important;'+
			 			        '}'+'.note.first.cmt:before {'+
			 			        	'position: absolute;top: -14px;'+
			 			        	'left: 0px;'+
			 			        	'width: 14px;'+
			 			        	'height: 14px;'+
			 			        	'text-align: center;'+
			 			        	'line-height: 14px;'+
			 			        	'pointer-events: none;'+
			 			        	'cursor: none !important;'+
			 			        	'content: "";'+
			 			        	'background: url(/app/assets/icons/bl-comment.png);'+
			 			        	'background-repeat: no-repeat;'+
			 			        	'background-size: contain;'+
			 			        '}'+'.note_slctd {'+
			 			        	'background-color:  '+appdata.antSlctClrCde+';'+
			 					'}'+'.note.first.cmt.note_slctd:before {'+
			 	 			        'background-color:  '+appdata.antSlctClrCde+';'+
			 	 	 			'}'+'.vdvc-notes-comments {\
			 						width:400px;\
			 						height:200px;\
			 						display:none;\
			 						background-color: #EFE9E9;position:absolute;\
			 						border-radius : 5px;\
			 						box-shadow : 0px 0px 5px 2px gray;\
			 						padding : 5px;\
			 					}'+'.highlighted.slct_snippet {\
			 						background: '+appdata.snippetSlctClrCde+' !important;'+
			 					'}'+'.highlighted {\
			 						background: '+appdata.snippetClrCde+';'+
			 					'}'+'.vdvc-link{\
			 						background: rgba(0,0,0,0.12);\
			 						position: relative;\
			 					}'+'a {\
									position: relative;\
								}\
								a .deep-link-from-info {\
								    width: 400px;\
								    background-color: #fff;\
								    color: #272727;\
								    text-align: left;\
			 						box-shadow: 0px 0px 5px 2px #999999;\
								    padding: 15px;\
								    position: absolute;\
								    z-index: 1;\
								    top: 100%;\
			 						font-weight:normal;\
			 						font-size: 14px;\
								    left: inherit;\
								    margin-left: -5px;\
								    transition: all 1s ease;\
			 						-moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;-o-user-select:none;\
								}\a:hover .deep-link-from-info {\
			 						cursor: default;\
								}\
			 					.deep-link {\
									color: #337ab7;\
				 				    cursor: pointer;\
				 				    white-space: nowrap;\
				 				    text-overflow: ellipsis;\
				 				    overflow: hidden;\
				 				    display: block;\
			 						text-decoration: none;\
			 				    	font-weight: bold;\
				    			}\
				    			.deep-link-from-info span{\
			 						display: inline-block;\
			 						width:100%;\
			 						white-space: normal;\
			 				    }\
			 				   .deep-link-from-info .action-bar{\
			 						position: absolute;\
			 						right: 0px;\
			 						top: 0px;\
			 						width: 50px;\
			 						padding: 5px;\
			 						color: #777;\
			 						font-size: 12px;\
			 					}\
			 					.deep-link-from-info .action-bar:hover {\
			 						color: #006699;\
			 						font-weight: bold;\
			 					}\
			 					a.cke-digest-annotate-open-in-context .cke_widget_image .cke_widget_drag_handler_container,\
			 					a.cke-digest-annotate-open-in-context .cke_widget_image .cke_image_resizer {\
			 						display: none !important;\
			 					}\
			 					a.cke-digest-doc-open-in-context {\
				 					position: absolute;\
				 					width: 15px;\
						 		    height: 15px;\
						 		    margin-left: 10px;\
						 		    margin-top: 3px;\
						 		    line-height: 16px;\
						 			text-align: center;\
						 			cursor: auto;\
						 		    content: "";\
						 		    background: url(/app/assets/icons/open-in-context.png) 0% 0% / contain no-repeat;\
			    				}\
			 					.welcome-help-topic-title {\
			 						padding: 10px 0px;\
			 						margin-left: -15px;\
						 		    margin-bottom: 5px;\
						 		    font-size: 16px;\
						 		    font-weight: bold;\
						 		    color: #069;\
						 		    border-bottom: 1px solid #069;\
			 					}'
			 					
							);
		 				
		 				isEditorCssLoaded = true;
		 			}
		 			 
		 		  
		 			  var styles = '.pdfHighlight {\
		 				    background: '+appdata.pdfAntClrCde+';\
		 				}\
		 				[class*="snippet_"] {\
		 					background: '+appdata.snippetClrCde+' !important;\
		 				}\
		 				[class*="snippet_"].selected {\
		 				  background: '+appdata.snippetSlctClrCde+' !important;\
		 				}\
		 			    .pdfHighlight.cmtActive,.pdfHighlight.cmtActive.cmt:before {\
		 			    	background-color: '+appdata.pdfAntSlctClrCde+' !important;\
		 			    	border: 1px solid '+appdata.PdfAnnotationSelectBorder+' !important;\
		 				}';
		 			  
		 			  var colorCodesStyle = $($document).find('head').find("#vdvc-color-codes");
		 			  
		 			  if(colorCodesStyle.length == 0) {
		 				 colorCodesStyle = $('<style type="text/css" id="vdvc-color-codes">');
		 				 $($document).find('head').append(colorCodesStyle);
		 			  } 
		 			  
		 			  colorCodesStyle.html(styles);
 			  	}
	    	});
 			  
	    }
	    return CommonService;
	}]);
	
})();