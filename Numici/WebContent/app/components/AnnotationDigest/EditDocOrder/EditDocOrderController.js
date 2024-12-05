;(function() {
	'use strict';
angular.module('vdvcApp').controller('EditDocOrderController',
		EditDocOrderController);

	EditDocOrderController.$inject = ['$rootScope','$scope', '$state',
	        '$stateParams','$uibModalInstance', '$timeout', '$confirm', 
	        'TaskSpaceService', '_', 'appData', 'currentTaskspace', 
	        'resource','DocFactory','DeepLinkService','APIUserMessages',
	        'AnnotationDigestService'];

	function EditDocOrderController($rootScope,$scope, $state, $stateParams, 
			$uibModalInstance,$timeout, $confirm, TaskSpaceService, _, 
			appData, currentTaskspace, resource,DocFactory,DeepLinkService,
			APIUserMessages,AnnotationDigestService) {
		var edoc = this;
		var appdata = appData.getAppData();
		
		edoc.title = resource.title;
		edoc.groupBy = "";
		edoc.includeDocsWithoutSection = false;
		edoc.docorder = [];
		edoc.secorder = [];
		var nonSectionedDocs = [];
		edoc.taskSpace = angular.copy(currentTaskspace);
		edoc.selectedTaskSpaceSection = {};
		edoc.sortedObjects = {};
		edoc.sectionSortableOptions = {
				handle: '.section-sort-obj',
				update: function(e, ui) {
			    	edoc.sortedObjects.sections = edoc.secorder;
			    	/*$timeout(function() {
			    		saveTaskSpaceState();
					}, 0);*/
			    },
			    start: function() {
			    	
			    }
			};
		edoc.nonSectionedDocSortableOptions = {
				handle: '.non-sectioned-doc-sort-obj',
				update: function(e, ui) {
					edoc.sortedObjects.nonSectionedDocuments = edoc.nonSectionedDocs;
					/*$timeout(function() {
			    		saveTaskSpaceState();
					}, 0);*/
			    },
			    start: function() {
			    	
			    }
			};
		edoc.sectionedDocSortableOptions = {
				handle: '.sectioned-doc-sort-obj',
				update: function(e, ui) {
			    	edoc.sortedObjects.sectionedDocuments = edoc.selectedTaskSpaceSection.documents;
			    	/*$timeout(function() {
			    		saveTaskSpaceState();
					}, 0);*/
			    },
			    start: function() {
			    	
			    }
			};
		edoc.docSortableOptions = {
				handle: '.doc-sort-obj',
				update: function(e, ui) {
			    	edoc.sortedObjects.documents = edoc.docorder;
			    	/*$timeout(function() {
			    		saveTaskSpaceState();
					}, 0);*/
			    },
			    start: function() {
			    	
			    }
			};
		
		edoc.showSections = showSections;
		edoc.getTSSectionDocCount = getTSSectionDocCount;
		edoc.selectTaskSpaceSection = selectTaskSpaceSection;
		edoc.showSelectedTSSectionObjects = showSelectedTSSectionObjects;
		edoc.getDocIcon = getDocIcon;
		edoc.getAnnotCount = getAnnotCount;
		edoc.cancel = cancel;
		edoc.saveOrder = saveOrder;
		
		function showSections() {
			var status = false;
			if(!_.isEmpty(edoc.secorder) || !_.isEmpty(edoc.nonSectionedDocs)) {
				status = true;
			}
			return status;
		}
		
		function getTSSectionDocCount(TsSection) {
			var count = 0;
			var sectionDocs = _.where(edoc.taskSpace.objects,{"sectionId" : TsSection.id});
			if(!_.isEmpty(sectionDocs)) {
				count = sectionDocs.length;
			}
			if(count == 1) {
				return count+" Document";
			}
			return count+" Documents";
		}
		
		function selectTaskSpaceSection(TSSection) {
			edoc.selectedTaskSpaceSection = TSSection;
		}
		
		function showSelectedTSSectionObjects() {
			var status = false;
			if(!_.isEmpty(edoc.selectedTaskSpaceSection)) {
				status = true;
			}
			return status;
		}
		
		function getDocIcon(doc) {
			return DocFactory.getFileImgIcon(doc.name,doc.docType);
		}
		
		function getAnnotCount(objectInfo) {
			if(objectInfo ) {
				let count = 0;
				if(_.isNumber(objectInfo.annotCount)) {
					count = objectInfo.annotCount;
				} else if(_.isNumber(objectInfo.annotationsCount) && _.isNumber(objectInfo.highlightsCount)) {
					count = objectInfo.annotationsCount+objectInfo.highlightsCount;
				}
				if(count == 1) {
					return count+" Annotation";
				}
				return count+" Annotations";
			}
			return 0+" Annotations";
		}
		
		
		
		function cancel() {
			$uibModalInstance.dismiss("cancel");
		}
		
		function updateLink(linkObj,clientId,cb) {
			DeepLinkService.updateLink(linkObj,clientId).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					if(typeof cb == 'function') {
						cb(resp);
					}
				}
			});
		}
		
		function saveTaskSpaceState(tsState,cb) {
			TaskSpaceService.saveTaskSpaceState(tsState).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					$rootScope.$broadcast("tsStateChanged",resp.data.TaskspaceState);
					if(typeof cb == 'function') {
						cb();
					}
				}
			});
		}
		
		function prepareSecorderForSave() {
			var secorderForSave = angular.copy(edoc.secorder);
			if(edoc.includeDocsWithoutSection) {
				if(!_.isEmpty(edoc.nonSectionedDocs)) {
					var defaultSection = _.findWhere(resource.digestSettings.secorder,{"id" : null});
					if(!_.isEmpty(defaultSection)) {
						defaultSection.documents = edoc.nonSectionedDocs;
						secorderForSave.push(defaultSection);
					} else {
						defaultSection = {id : null, name: "", descrption : null,"documents" : edoc.nonSectionedDocs};
						secorderForSave.push(defaultSection);
					}
				} else {	// This situation will not come but for safety this else is added.
					var defaultSection = {"id" : null,"name" : "","description" : "","documents" : []};
					if(!_.isEmpty(defaultSection)) {
						secorderForSave.push(defaultSection);
					}
				}
			} else {
				/*var defaultSection = _.findWhere(resource.digestSettings.secorder,{"id" : null});
				if(!_.isEmpty(defaultSection)) {
					secorderForSave.push(defaultSection);
				}*/
			}
			return secorderForSave;
		}
		
		function prepareDocorderForSave() {
			var docorderForSave = angular.copy(edoc.docorder);
			return docorderForSave;
		}
		
		function saveOrder() {
			if(resource.settingsFor == "link") {
				if(edoc.groupBy == "section") {
					var secorderForSave = prepareSecorderForSave(); 
					resource.linkInfo.linkObj.properties.digestSettings.secorder = secorderForSave;
					updateLink(resource.linkInfo.linkObj,resource.digestSettings.clientId,function(resp) {
						resource.digestSettings.secorder = secorderForSave;
						$uibModalInstance.close({"linkInfo" : resp.data.Link, "action" : "update"});
					});
				} else {
					var docorderForSave = prepareDocorderForSave(); 
					resource.linkInfo.linkObj.properties.digestSettings.docorder = docorderForSave;
					updateLink(resource.linkInfo.linkObj,resource.digestSettings.clientId,function(resp) {
						resource.digestSettings.docorder = docorderForSave;
						$uibModalInstance.close({"linkInfo" : resp.data.Link, "action" : "update"});
					});
				}
			} else if(resource.settingsFor == "state") {
				if(edoc.groupBy == "section") {
					var secorderForSave = prepareSecorderForSave(); 
					resource.tsState.digestsettings.secorder = secorderForSave;
					saveTaskSpaceState(resource.tsState,function() {
						resource.digestSettings.secorder = secorderForSave;
						APIUserMessages.success("Digest settings saved successfully");
						$uibModalInstance.close(resource.tsState);
					});
				} else {
					var docorderForSave = prepareDocorderForSave(); 
					resource.tsState.digestsettings.docorder = docorderForSave;
					saveTaskSpaceState(resource.tsState,function() {
						resource.digestSettings.docorder = docorderForSave;
						APIUserMessages.success("Digest settings saved successfully");
						$uibModalInstance.close(resource.tsState);
					});
				}
			}
			
		}
		
		function init() {
			if(resource && !_.isEmpty(resource.digestSettings)) {
				if(!_.isEmpty(resource.digestSettings.groupBy)) {
					edoc.groupBy = resource.digestSettings.groupBy;
				}
				if(edoc.groupBy == "section") {
					//edoc.title = "Sort Sections / Documents Order";
					edoc.secorder = angular.copy(resource.digestSettings.secorder);
					edoc.includeDocsWithoutSection = resource.digestSettings.includeDocsWithoutSection;
					var defaultSection = _.findWhere(edoc.secorder,{"id" : null});
					if(!_.isEmpty(defaultSection)) {
						edoc.secorder = _.reject(edoc.secorder, function(sec){ 
			    			return sec.id == defaultSection.id; 
			    		});
						if(edoc.includeDocsWithoutSection && !_.isEmpty(defaultSection.documents)) {
							edoc.nonSectionedDocs = defaultSection.documents;
						}
					} else {
						defaultSection = {id : null, name: "", descrption : null};
						var defaultSectionDocuments = _.where(edoc.taskSpace.objects,{"sectionId" : defaultSection.id});
						if(defaultSectionDocuments) {
							defaultSection["documents"] = AnnotationDigestService.getStateObjects(defaultSectionDocuments);
						}
						if(edoc.includeDocsWithoutSection) {
							edoc.nonSectionedDocs = defaultSection.documents;
						}
					}
					if(!_.isEmpty(edoc.secorder)) {
						selectTaskSpaceSection(edoc.secorder[0]);
					}
				} else  {
					//edoc.title = "Sort Documents Order";
					edoc.docorder = angular.copy(resource.digestSettings.docorder);
				}
			}
		}
		init();
	}
})();
	