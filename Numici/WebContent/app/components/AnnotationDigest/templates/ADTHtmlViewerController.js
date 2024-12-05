;(function() {
	'use strict';
	
	angular.module('vdvcApp').controller('ADTHtmlViewerController',ADTHtmlViewerController);
	ADTHtmlViewerController.$inject = ['$scope','$state','$stateParams','AnnotationDigestService','_','$timeout',
	                                'appData','$compile','commonService','defautlDateFormat',
	                                'notificationEvents','DigestEventListner','TaskSpaceService',
	                                '$uibModal','DeepLinkService','APIUserMessages'];
	
	function ADTHtmlViewerController($scope,$state,$stateParams,AnnotationDigestService,_,$timeout,appData,$compile,
			commonService,defautlDateFormat,notificationEvents,DigestEventListner,TaskSpaceService,$uibModal,
			DeepLinkService,APIUserMessages) {
		var adhvc = this;
		var appdata = appData.getAppData();
		var config = ($scope.taskSpaceState && !_.isEmpty($scope.taskSpaceState.digestsettings) ? 
				angular.copy($scope.taskSpaceState.digestsettings) : 
					angular.copy(AnnotationDigestService.getDigestFilters()));
		config.sortOptions = _.isEmpty(config.sortOptions) ? {"timestamp" : "desc"} : config.sortOptions;
		config.groupBy = _.isEmpty(config.groupBy) ? "document" : config.groupBy;
		config.sortBy = _.isEmpty(config.sortBy) ? {"field": "name","order": "asc"} : config.sortBy;
		
		var notificationHandledelayTime = AnnotationDigestService.notificationHandledelayTime;
		var pendingDigestChangedUpdates = [];
		var debounceHandleDigestChangedUpdates = _.debounce(handleDigestChangedUpdates, parseInt(notificationHandledelayTime));
		var loadEvents = [notificationEvents.DIGEST_CHANGED];
		
		adhvc.numiciImage = appdata.numiciImage;
		adhvc.numiciLink = appdata.numiciLink;
		adhvc.numiciHeaderText = appdata.numiciHeaderTxt;
		adhvc.numiciFooterText = appdata.numiciFooterTxt;
		adhvc.htmlDigestContent = "";
		
		adhvc.topFunction = topFunction;
		adhvc.shareDigestLink = shareDigestLink;
		adhvc.annotationsDigest = annotationsDigest;
		
		if(appdata && !_.isEmpty(appdata.GlobalSettings)) {
			var notificationHandledelayTimeObj = _.findWhere(appdata.GlobalSettings,{key : "NotificationHandledelayTime"});
			if(!_.isEmpty(notificationHandledelayTimeObj)) {
				notificationHandledelayTime = notificationHandledelayTimeObj.value*1000;
				debounceHandleDigestChangedUpdates = _.debounce(handleDigestChangedUpdates, parseInt(notificationHandledelayTime));
			}
		}
		
		angular.element(document.querySelector('.vdst')).bind('scroll', function(evt){
			if (evt.currentTarget.scrollTop > 200) {
				$(angular.element('.vdvc-scroll-top')[0]).css('display','block');
			} else {
				$(angular.element('.vdvc-scroll-top')[0]).css('display','none');
			}
	    });
		
		$scope.$on('$destroy',function() {
			DigestEventListner.close();
			debounceHandleDigestChangedUpdates.cancel();
		});
		
		function handleDigestChangedUpdates() {
			if(pendingDigestChangedUpdates && pendingDigestChangedUpdates.length == 0) {
				return;
			}
			pendingDigestChangedUpdates.splice(0,pendingDigestChangedUpdates.length);
			adhvc.hasDigestUpdates = true;
			$scope.$digest();
		}
		
		adhvc.updateDigest = function() {
			adhvc.hasDigestUpdates = false;
			getDigestHtmlForTS();
		};
		
		loadEvents.forEach(function (event) {
		   	$scope.$on(event, function (evt, msg) {
		   		processDigestEvent(msg);
		    });
		});
		
		function processDigestEvent(msg){
			pendingDigestChangedUpdates.push(msg);
			if(pendingDigestChangedUpdates && pendingDigestChangedUpdates.length == 1) {
				debounceHandleDigestChangedUpdates();
			}
		}
		
		$scope.$on("updateDigest",function(event, msg){
			var handleActionEvents = ["DOCUMENT_INDEXED","DOCS_REMOVED","DOC_OR_SECTION_UPDATE"];
			if(msg && _.contains(handleActionEvents,msg.action)) {
				$scope.taskspace = TaskSpaceService.currentTaskspace;
				processDigestEvent(msg);
			} else {
				processDigestEvent({});
			}
		});
		
		$scope.$on("resizeDoc",function(event, msg){
			AnnotationDigestService.addBoxShadowToHtmlDigest(config.groupBy);
		});
		
		function topFunction() {
			angular.element('.vdst')[0].scrollTo(0,0);
		}
		
		function shareDigestLink(event, digestFor) {
			if(event) {
				event.stopPropagation();
			}
			var digestSettings;
			var digestFor = {"digestFor" : "AnnotationDigest"};
			digestFor["digestName"] = $scope.taskspace.name+ " Digest";
			
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/common/ShareLink/ShareLink.html',
			      controller: 'ShareLinkController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'slc',
			      backdrop: 'static',
			      size: "md",
			      resolve: {
				      taskspaceInfo: function() {
					    return {
							"tsId" : $scope.tsId,
							"tsClientId" : $scope.tsClientId
						}
					  },
				      systemSttings: function() {
					     return commonService.getNavMenuItems({type: "GlobalSettings",key:"DigestTableOfContents"}).then(function(resp) {
							if(resp.data.Status && !_.isEmpty(resp.data.listAppKeyValues)) {
								return resp.data.listAppKeyValues[0];
							} else {
								return {};
							}
						 });
					  },
			    	  settings : function() {
			    		  return TaskSpaceService.getTaskSpaceState($scope.tsClientId , $scope.tsId).then(function(resp) {
			    			  if (resp.status == 200 && resp.data.Status) {
			    				var settings = resp.data.TaskspaceState;
			    				digestSettings = settings.digestsettings;
			  					return settings;
			    			  } 
			    		  });
			    	  },
			    	  digestFor: function() {
			    		  return digestFor;
			    	  },
			    	  linkInfo: ['DeepLinkService','AnnotationDigestService','$q',function(DeepLinkService,AnnotationDigestService,$q) {
			    		  var deferred = $q.defer();
			    		  var postdata = {
	    					  "objectType" : "AnnotationDigest",
	    					  "linkObjectId" : $scope.tsId,
	    					  "clientId" : $scope.tsClientId
		    			  };
		    			  DeepLinkService.checkLinkExists(postdata).then(function(resp) {
			    			  if (resp.status == 200 && resp.data.Status) {
			    				  if(!_.isEmpty(resp.data.Link)) {
			    					  deferred.resolve(resp.data.Link);
			    				  } else {
			    					  var timer1 = $timeout(function() {
				    					  if(!_.isEmpty(digestSettings)){
				    						  digestSettings["objectId"] = $scope.tsId;
				    						  digestSettings["clientId"] = $scope.tsClientId;
				    						  digestSettings["context"] = "taskspace";
				    					  } else {
				    						  digestSettings = AnnotationDigestService.getDefaultDigestSettings($scope.tsId, $scope.tsClientId);
				    					  }
				    					  if(_.isEmpty(digestSettings.digestName)){
					    					  digestSettings["digestName"] = $scope.taskspace.name+ " Digest";  
				    					  }
				    					  var lnk = AnnotationDigestService.processLinkInfo(digestFor, $scope.tsId, $scope.tsClientId, digestSettings);
			    						  DeepLinkService.createLink(lnk).then(function(createLinkResp) {
			    							  if(createLinkResp.status == 200 && createLinkResp.data.Status) {
			    								  deferred.resolve(createLinkResp.data.Link);
			    							  }
			    						  });
			    						  $timeout.cancel(timer1);
			    					  }, 100);
			    				  }
			    			  } 
			    		  });
		    			  return deferred.promise;
			    	  }]
			      }
			});
			
			modalInstance.result.then(function (result) {
				
			});
		}
		
		function annotationsDigest(event,digestFor) {
			if(event) {
				event.stopPropagation();
			}
			
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/AnnotationDigest/create/AnnotationDigest.html',
			      controller: 'AnnotationDigestController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'ad',
			      backdrop: 'static',
			      size: "lg",
			      resolve: {
				      taskspaceInfo: function() {
					    return {
							"tsId" : $scope.tsId,
							"tsClientId" : $scope.tsClientId
						}
					  },
				      systemSttings: function() {
					     return commonService.getNavMenuItems({type: "GlobalSettings",key:"DigestTableOfContents"}).then(function(resp) {
							if(resp.data.Status && !_.isEmpty(resp.data.listAppKeyValues)) {
								return resp.data.listAppKeyValues[0];
							} else {
								return {};
							}
						 });
					  },
			    	  settings : function() {
			    		  return TaskSpaceService.getTaskSpaceState($scope.tsClientId, $scope.tsId).then(function(resp) {
			    			  if (resp.status == 200 && resp.data.Status) {
			  					return resp.data.TaskspaceState;
			    			  } 
			    		  });
			    	  },
			    	  digestFor: function() {
			    		  var data = {"digestFor" : digestFor};
			    		  if(digestFor == "AnnotationDigest") {
			    			  data["digestName"] = $scope.taskspace.name+ " Digest";
			    			  var appdata = appData.getAppData();
			    			  if(appdata.UserId == $scope.taskspace.owner) {
			    				  data["tsDefaultFolderId"] = $scope.taskspace.defaultFolderId;
			    			  }
			    		  } else if(digestFor == "settings") {
			    			  data["digestName"] = $scope.taskspace.name+ " Digest";
			    		  }
			    		  return data;
			    	  },
			    	  linkInfo: function() {
			    		  if(digestFor == "AnnotationDigest") {
			    			  var postdata = {
			    					  "objectType" : "AnnotationDigest",
			    					  "linkObjectId" : $scope.tsId,
			    					  "clientId" : $scope.tsClientId
			    			  };
			    			  return DeepLinkService.checkLinkExists(postdata).then(function(resp) {
				    			  if (resp.status == 200 && resp.data.Status) {
				    				  if(!_.isEmpty(resp.data.Link)) {
				    					  return resp.data.Link;
				    				  } else {
				    					  return {};
				    				  }
				    			  } 
				    		  }); 
			    		  } else {
			    			  return {};
			    		  }
			    	  }
			      }
			});
			
			modalInstance.result.then(function (result) {	
				config = angular.copy(result.digestsettings);
				if(result.digestsettings.save) {
					delete result.digestsettings.save;
					delete config.save;
					result.clientId = $scope.tsClientId;
					var accessedFrom = "viewDigest";
					var fromSource = "FromNumici";
					if($stateParams.digest) {
						accessedFrom = "liveDigest";
						fromSource = "FromNumici";
					}
					if(!_.isEmpty(accessedFrom)) {
						result["accessedFrom"] = accessedFrom;
					}
					if(!_.isEmpty(fromSource)) {
						result["fromSource"] = fromSource;
					}
					result["action"] = "saveDigestSettings";
					TaskSpaceService.saveTaskSpaceState(result).then(function(resp) {
						if(resp.status == 200 && resp.data.Status) {
							$scope.$emit("tsStateChanged",resp.data.TaskspaceState);
							APIUserMessages.success("Digest save success");
							getDigestHtmlForTS();
						}
					}).catch(function() {
						APIUserMessages.error("Digest save failed");
						getDigestHtmlForTS();
					});
				} else {
					delete config.save;
					getDigestHtmlForTS();
				}
			});
		}
		
	    function clearLayout(focused) {
			if(focused == "vdst") {
				var divElement = angular.element(document.querySelector('.'+focused));
				divElement.empty();
			}	
		}
	    
		function renderDocument(focused) {
			clearLayout(focused);
			var timer = $timeout(function() {
				var divElement = angular.element(document.querySelector('.'+focused));
				divElement.append(adhvc.htmlDigestContent);
				divElement[0].style.overflowY = "auto";
				var timer1 = $timeout(function() {
					if(divElement) {
						$(divElement).find('.cke_widget_drag_handler_container').css("display", "none");
						$(divElement).find('.cke_image_resizer').css("display", "none");
					}
					$timeout.cancel(timer1);
		        }, 1000);
				AnnotationDigestService.addBoxShadowToHtmlDigest(config.groupBy);
				$timeout.cancel(timer);
				adhvc.loader = false;
	        }, 1000);
		}
		
		function getDigestHtmlForTS(cb) {
			adhvc.loader = true;
			var accessedFrom = "viewDigest";
			var fromSource = "FromNumici";
			var includeDocsWithoutAnn = config.includeDocsWithoutAnn;
			if(config.groupBy != "document" && config.groupBy != "section" 
				&& config.groupBy != "tag" && config.groupBy != "taghierarchical"){
				includeDocsWithoutAnn = false;
			}
			var includeDocsWithoutSection = config.includeDocsWithoutSection;
			if(config.groupBy != "section"){
				includeDocsWithoutSection = false;
			}
			var postdata = config;
			postdata["objectId"] = $scope.tsId;
			postdata["clientId"] = $scope.tsClientId;
			postdata["context"] = "taskspace";
			postdata["includeDocsWithoutAnn"] = includeDocsWithoutAnn;
			postdata["includeDocsWithoutSection"] = includeDocsWithoutSection;
			postdata["digestFor"] = "ViewDigest";
			postdata["htmlFor"] = "viewdigest";
			postdata["transformImageUrls"] = true;
			
			if(config.groupBy == "document" && (_.isEmpty(config.docorder))) {
				postdata["docorder"] = AnnotationDigestService.getDocOrder($scope.taskspace);
			} else if(!_.isEmpty(config.docorder)) {
				postdata["docorder"] = config.docorder;
			}
			
			if(config.groupBy == "section" && (_.isEmpty(config.secorder))) {
				postdata["secorder"] = AnnotationDigestService.getSecOrder($scope.taskspace,config.includeDocsWithoutSection);
			} else if(!_.isEmpty(config.secorder)) {
				postdata["secorder"] = config.secorder;
			}
			
			if(!moment(postdata.filterOptions.endDate,defautlDateFormat,true).isValid()) {
				postdata.filterOptions.endDate = null;
			}
			
			if(!moment(postdata.filterOptions.startDate,defautlDateFormat,true).isValid()) {
				postdata.filterOptions.startDate = null;
			}
			
			if(!_.isEmpty(accessedFrom)) {
				postdata["accessedFrom"] = accessedFrom;
			}
			if(!_.isEmpty(fromSource)) {
				postdata["fromSource"] = fromSource;
			}
			AnnotationDigestService.getDigestHtmlForTS(postdata).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
	    			if(!_.isEmpty(resp.data.AnnotationDigest) && !_.isEmpty(resp.data.AnnotationDigest.digestHtml)) {
	    				adhvc.htmlDigestContent = resp.data.AnnotationDigest.digestHtml;
	    				var taskspaceId = resp.data.tsId;
	    				if(typeof cb == "function") {
		    				cb(taskspaceId);
		    			}
	    			}
	    		}
			},function(errorResp) {
				adhvc.htmlDigestContent = errorResp;
	    	})["finally"](function() {
	    		renderDocument('vdst');
			});
		}
		
		function connectDigestEventSocket(taskspaceId) {
			if(!_.isEmpty(taskspaceId) && DigestEventListner.isConnected()) {
				var socketMessage = {"taskspaceId":taskspaceId};
				DigestEventListner.sendMessage(socketMessage);
    		} else if(!_.isEmpty(taskspaceId) && !DigestEventListner.isConnected()) {
    			DigestEventListner.taskspaceId = taskspaceId;
    			DigestEventListner.reconnect();
			}
		}
		
		function init() {
			getDigestHtmlForTS(function(taskspaceId) {
				connectDigestEventSocket(taskspaceId);
			});
		}
		
		init();
	}
})();
