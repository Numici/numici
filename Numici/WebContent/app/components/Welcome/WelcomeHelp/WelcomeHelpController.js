;(function(){
	
	angular.module("vdvcApp").controller("WelcomeHelpController",WelcomeHelpController);
	WelcomeHelpController.$inject = ['$scope','pendingRequests','topic','_','$uibModalInstance','$timeout','DeepLinkService','urlParser','userService','appData','LocalStorageService'];
	
	function WelcomeHelpController($scope,pendingRequests,topic,_,$uibModalInstance,$timeout,DeepLinkService,urlParser,userService,appData,LocalStorageService){
		
		var vm = this;
		var appdata = appData.getAppData();
		
		var readOnly = true;
		vm.doNotShow = false;
		vm.title = topic.title ? angular.copy(topic.title) : "Welcome";
		vm.welcomeTopic = angular.copy(topic);
		vm.content = "";
		vm.instance = null;
		
		
		function onDestroy() {
			if(CKEDITOR.instances['help-text-editor']) {
				CKEDITOR.instances['help-text-editor'].destroy();
			}
		}
		
		$scope.$on("$destroy",function handleDestroyEvent() {
			onDestroy();
		});
		
		$scope.$on("windowResized",function(event, msg){
			var t = $timeout(function() {
				var ckeId = $('.cke.cke_reset').attr("id")
				var h = "100%";
				if(ckeId === "cke_welcome-help-text-editor") {
					h = $('.cke.cke_reset').find(".cke_inner").outerHeight();
					$('.cke.cke_reset').find(".cke_contents").height(h);
				}
				if (CKEDITOR.instances['help-text-editor']) {
					CKEDITOR.instances['help-text-editor'].resize("100%",h);
				}
				$timeout.cancel(t);
			},0);
		});
		
		function ckEditorEvents(body){
			body.find("a[href^=\\#]").off("click").on("click",function(event){
				event.preventDefault();
				var nm = $(this).attr('href').replace(/^.*?(#|$)/,'');
				var  el = body.find($(this).attr("href"));
				if(el.length > 0) {
					el[0].scrollIntoView();
				} else if(body.find('[name="'+nm+'"]').length > 0){
					body.find('[name="'+nm+'"]')[0].scrollIntoView();
				}
			});
			body.find("a").off("mouseenter").on("mouseenter",function(event){
				if(typeof event.currentTarget.href != 'undefined' && this.getAttribute("href").charAt(0) == "#") {
					return false;
				}
				if(typeof event.currentTarget.href != 'undefined' && event.ctrlKey == true) {			
					$(this).css("cursor","pointer");
				}else{
					$(this).css("cursor","auto");
				}
				$('#help-link-meta-info').hide();
				vm.linkCrdInfo = {
						showLoader : true
				};
				
				if((typeof event.currentTarget.href != 'undefined') && event.ctrlKey == false) {
					
					var targetRect = event.currentTarget.getBoundingClientRect();
					
					var elem = event.currentTarget;
					var urlObj = urlParser.parseUrl(elem.href);
					
					if(urlObj.pathname && urlObj.pathname.toLowerCase() == "/vdvc/link") {
						var linkId = urlObj.searchObject.id;
						var target = elem.target;
						if(!_.isEmpty(linkId)) {
							DeepLinkService.openLink(linkId.toString()).then(function(resp) {
								if(resp.status == 200 ) {
						    		if(resp.data.Status) {
						    			processLinkInfo(resp.data.Link);
							    		vm.linkCrdInfo.target = event.currentTarget;
						    		} else {
						    			vm.linkCrdInfo.target = event.currentTarget;
						    			vm.linkCrdInfo.errorMsg = 'Either Link is invalid or deleted';
						    			vm.linkCrdInfo.showError = true;
						    		}
						    		rePositionPopOverCard(targetRect,$('#help-link-meta-info'),1000);
						    	} 
						    })['finally'](function() {
						    	hideLinkLoader();
						    });
						}
					} else{
						
						var postdata = {
							"externalUrl" : elem.href	
						};
						
						DeepLinkService.getExternalMetaTags(postdata).then(function(resp) {
							if(resp.status == 200 ) {
					    		if(resp.data.Status) {
					    			processLinkInfo(resp.data.Link);
						    		vm.linkCrdInfo.target = event.currentTarget;
					    		} else {
					    			vm.linkCrdInfo.target = event.currentTarget;
					    			vm.linkCrdInfo.errorMsg = 'Either Link is invalid or deleted';
					    			vm.linkCrdInfo.showError = true;
					    		}
					    		rePositionPopOverCard(targetRect,$('#help-link-meta-info'),1000);
					    	} 
					    })['finally'](function() {
					    	hideLinkLoader();
					    });
						
						vm.linkCrdInfo.url = elem.href;
						vm.linkCrdInfo.text = elem.href;
						vm.linkCrdInfo.target = event.currentTarget;
						hideLinkLoader();
					}
				}else{
					vm.linkCrdInfo = {};
				}
			});
		}
		
		function hideLinkLoader() {
	        var timer = $timeout(function() {
	        	if(vm.linkCrdInfo) {
	        		vm.linkCrdInfo["showLoader"]  = false;
	        	}
	        	$timeout.cancel(timer);
	        }, 100);
		}
		
		function rePositionPopOverCard(targetRect,popElement,time) {
			
			$timeout.cancel(toolBarTimer);
			var toolBarTimer = $timeout(function() {
				var frame = $("#cke_welcome-help-text-editor").find("iframe");
				var frameWidth = frame.innerWidth();
				var frameHeight = frame.outerHeight();
				var framePos = frame.offset();
				//var targetRect =target.getBoundingClientRect();
				
				var link = popElement; //$('#help-link-meta-info');
				var linkWidth = link.outerWidth();
				var linkHeight = link.outerHeight();
				if(linkWidth > frameWidth) {
					link.css({"width":frameWidth+"px"});
				}
				
				var top = (framePos.top-51)+targetRect.bottom;
				var left = ((framePos.left+8)+targetRect.left)+((targetRect.width/2)-(linkWidth/2));
				
				if(!isNaN(left)) {
					if((left+linkWidth) > (framePos.left+frameWidth)) {
						left = left - linkWidth;
					}
					if(left < framePos.left) {
						left = framePos.left+8;
					}
				}
				if(!isNaN(top)) {
					if((top+linkHeight) > (framePos.top+frameHeight)) {
						top = top - (targetRect.height+linkHeight);
					}
					if(top < framePos.top) {
						top = framePos.top;
					}
				}
				var elemCss = {
						"display":"block",
						"top" : top+'px',
						'left': left+'px'
				};
				
				link.css(elemCss);
        	},time);
		}
		
		function processLinkInfo(LinkInfo) {
			if(LinkInfo.metaInfo) {
				var info = LinkInfo.metaInfo; 
				if(info.imageUrl){
					var iw = 60,
						ih = 60,
						aspratio = 0,
						mW = 350,
						mH = 250;
					if(info.imageWidth && info.imageHeight) {
						if(info.imageWidth > mW) {
							aspratio = mW/info.imageWidth;
							iw = mW;
							ih = (aspratio*info.imageHeight);
						} else if(info.imageHeight > mH){
							aspratio = mH/info.imageHeight;
							iw = (aspratio*info.imageWidth);
							ih = mH;
						} else {
							iw = info.imageWidth;
							ih = info.imageHeight;
						}
					}
					info.iw = iw;
					info.ih = ih;
				}	
			}
			
			var showTitile = false;
			vm.linkCrdInfo = LinkInfo.info;
    		vm.linkCrdInfo.metaInfo = LinkInfo.metaInfo;
    		vm.linkCrdInfo.url = LinkInfo.url;
    		if(LinkInfo.metaInfo && LinkInfo.metaInfo.title) {
    			showTitile = true;
    		}
    		vm.linkCrdInfo.showTitle = showTitile;
		}
		
		function CreateNotes(editorId){
			var timeoutPerioad = 500;
			var t = $timeout(function() {
				try {
					vm.instance = CKEDITOR.replace( editorId,{
						readOnly: readOnly,
						width: "100%",
						language : "en",
						skin : 'moono-lisa,/resources/js/ckeditor/skins/moono-lisa/' ,
						//baseHref : context,  //var context is removed on context related changes.
						removePlugins : "stylesheetparser, elementspath,toolbar",
						resize_enabled : false,
						//allowedContent: true,
						fullPage: true,
						forceEnterMode : true
					});
				} catch(e) {
					
				}

				if (vm.instance) {
					CKEDITOR.on('instanceReady', function(evt) {
						var ckeId = $('.cke.cke_reset').attr("id")
						
						var h = "100%";
						if(ckeId === "cke_welcome-help-text-editor") {
							h = $('.cke.cke_reset').find(".cke_inner").outerHeight();
							$('.cke.cke_reset').find(".cke_contents").height(h);
						}
						 
						 if ( evt.editor && evt.editor.status == "ready") {
							 evt.editor.resize("100%",h);
							 if(ckeId === "cke_help-text-editor" || ckeId === "cke_welcome-help-text-editor") {
								 var body = evt.editor.document.getBody();
								 body.setAttribute( 'class', 'welcome-help-body' );
							 }
						 }
						 var iframe = $('.cke_wysiwyg_frame');//.contents();
						 vm.iframedoc = iframe[0].contentDocument || iframe[0].contentWindow.document;
					});
					vm.instance.on( 'contentDom', function() {
						var body = this.document.getBody();
						ckEditorEvents($(body.$));
						var editable = vm.instance.editable();
						editable.attachListener( editable, 'click', function( event ) {
							$('#help-link-meta-info').hide();
							vm.linkCrdInfo = null;
						});
					});
				}
				$timeout.cancel(t);
			},timeoutPerioad);
		}
		
		vm.close = function() {
			welcomePageSession = {};
			welcomePageSession["user"] = appdata["UserId"];
			welcomePageSession["close"] = true;
			welcomePageSession = JSON.stringify(welcomePageSession);
			LocalStorageService.setLocalStorage(LocalStorageService.WELCOME_PAGE,welcomePageSession);
			if(vm.doNotShow) {
				var postdata = {"doNotShowHelpOnLogin" : vm.doNotShow};
				userService.setDoNotShowHelpOnLogin(postdata).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						$uibModalInstance.close(resp.data.Status);
					}
				});
			} else {
				$uibModalInstance.close();
			}
		}
					
		function processContent() {
			if(!_.isEmpty(vm.welcomeTopic)) {
				_.each(vm.welcomeTopic.topics,function(topic,i){
					if(!topic.context) {
						vm.content += "<div class='welcome-help-topic-title'>"+topic.title+"</div>";
						vm.content += topic.helpText;
						vm.content += "<br><br>";
					}
				});
				CreateNotes("welcome-help-text-editor");
			}
			
		}
		
		processContent();
	}
})();