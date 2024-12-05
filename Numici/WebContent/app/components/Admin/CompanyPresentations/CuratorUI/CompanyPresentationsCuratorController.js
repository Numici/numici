;(function(){
	'use strict';
	angular.module("vdvcApp").
	directive('loadIframe', ['$compile', 'BuildForm',function ($compile, BuildForm) {
	  return {
	    restrict: 'E',
	    template: function(tElem, tAttrs) {
	    	var iframeTemplate = BuildForm.getForm() + BuildForm.getIframe();
	    	tElem.append(iframeTemplate);
	    },
	    link: function(scope, el, attr){
	    	
	    	var submitted = false;
	    	try{
	    		var iframe = el.find('iframe');
		    	if(iframe) {
		    		iframe[0].onload = function(){
		    			if (!submitted) {
		    				el.find('button[type="submit"]').click();
		                }
		                submitted = true;
		    			
			    	};	
		    	}
	    	} catch(e) {
	    		
	    	}
	    }
	  }
	}]).factory('BuildForm', BuildForm);
	
	function BuildForm() {
		 var bf =  {
				 getForm: getForm,
				 getIframe: getIframe
		 };
		 
		 return bf;
		 function getForm() {
			 return generateForm('api/presentations/getDocument',bf.params);
		 }
	
		  function generateForm(path, params, method) {
		    method = method || "post"; // Set method to post by default if not specified.
	
		    var form = '<form action="'+ path + '" method="POST" target="hidden_iframe">';
	
		    for(var key in params) {
		      if(params.hasOwnProperty(key)) {
		        form += '<input type="hidden" name="' +key + '" value="' + params[key] + '" />'
		      }
		    }
	
		    form += '<button type="submit" style="display:none;">Submit</button></form>';
		    return form;
		  }
		  
		  function getIframe() {
		    return '<iframe  width="100%"  src="about:blank" name="hidden_iframe"'+ 
		    'style="max-width: 100%;border: none;min-height: 100%;height: 100%;overflow: auto;background: #fff;"></iframe>';
		  }
	}
	
	angular.module("vdvcApp").controller("CompanyPresentationsCuratorController",CompanyPresentationsCuratorController);
	
	CompanyPresentationsCuratorController.$inject = ['$scope','CompanyPresentationService','$compile','SecFilingService','MessageService','_','$state',
	                  			 '$stateParams','$uibModal', '$timeout','$confirm','$sce','AdvSearchService','BuildForm','$filter'];
	
	function CompanyPresentationsCuratorController($scope,CompanyPresentationService,$compile,SecFilingService,MessageService,_,$state,
			 $stateParams,$uibModal,$timeout,$confirm,$sce,AdvSearchService,BuildForm,$filter){
		
		$scope.$on("$destroy",function handleDestroyEvent() {
			BuildForm.params = {};
		});
		
		var curatorCtrl = this;
		
		var cpPromise;
		var searchByFilters = true;
		var dateAttributes = CompanyPresentationService.attrDateFields;
		
		curatorCtrl.tickersList = [];
		curatorCtrl.types = {};
		curatorCtrl.filters = angular.copy(CompanyPresentationService.filters);
		curatorCtrl.rulesPageConfig = angular.copy(CompanyPresentationService.rulesPageConfig);
		curatorCtrl.headers = angular.copy(CompanyPresentationService.headers);
		
		curatorCtrl.dtObj = {
				"maxDate":	new Date(),
		    	"start" : null,
		    	"end" : new Date()
		};
		curatorCtrl.reqDateFormat = "YYYY-MM-DD";
		curatorCtrl.displayFormat = "YYYY-MM-DD";
		curatorCtrl.results = [];
		curatorCtrl.selectedDoc = {};
		curatorCtrl.resultCount = {};
		curatorCtrl.sortedField = "date";
		curatorCtrl.tickerFocused = tickerFocused;
		curatorCtrl.tickerDeFocused = tickerDeFocused;
		curatorCtrl.refreshTickerInfo = refreshTickerInfo;
		curatorCtrl.onPrsntTypeSelect = onPrsntTypeSelect;
		curatorCtrl.getResults = getResults;
		curatorCtrl.reset = reset;
		//curatorCtrl.getKeywordResults = getKeywordResults;
		curatorCtrl.getSortIcon = getSortIcon;
		curatorCtrl.sortBy = sortBy;
		curatorCtrl.prev = prev;
		curatorCtrl.next = next;
		curatorCtrl.onFilterChange = onFilterChange;
		curatorCtrl.showAttributes = showAttributes;
		curatorCtrl.onSelectTimeFrame = onSelectTimeFrame;
		curatorCtrl.clearDateRange = clearDateRange;
		curatorCtrl.applyDateRange = applyDateRange;
		curatorCtrl.closeDateRange = closeDateRange;
		curatorCtrl.showDetails = showDetails;
		curatorCtrl.prsntTypesFromList = prsntTypesFromList;
		curatorCtrl.isSelected = isSelected;
		//Rules 
		curatorCtrl.ruleQueryString = null;
		curatorCtrl.selectedRule = null;
		curatorCtrl.esRulesList =null;
		curatorCtrl.onRuleSelect = onRuleSelect;
		curatorCtrl.addOrEditRule = addOrEditRule;
		curatorCtrl.orderRules = orderRules;
		curatorCtrl.applyRuels = applyRuels;
		curatorCtrl.unClassifyAll = unClassifyAll;
		
		curatorCtrl.getAttributeValue = getAttributeValue;
		
		curatorCtrl.custStartDateErrMsg = "";
		curatorCtrl.custEndDateErrMsg = "";
		curatorCtrl.today = function() {
			curatorCtrl.dt = new Date();
		};
		curatorCtrl.today();
		curatorCtrl.custTimeFrame = false;
		
		curatorCtrl.ModifiedDtModel = angular.copy(AdvSearchService.ModifiedDtModel);
		curatorCtrl.timeframes = [{
			"timeAgo": "Any",
			"id": "Any",
			"label": "Any",
			"date": null
		},{
			"timeAgo": "1 Day",
			"id": "1_Day",
			"label": "1 Day",
			"date": moment().subtract(1, "days").format(curatorCtrl.reqDateFormat)
		},{
			"timeAgo": "1 Week",
			"id": "1_Week",
			"label": "1 Week",
			"date": moment().subtract(1, "weeks").format(curatorCtrl.reqDateFormat)
		},{
			"timeAgo": "1 Month",
			"id": "1_Month",
			"label": "1 Month",
			"date": moment().subtract(1, "months").format(curatorCtrl.reqDateFormat)
		},{
			"timeAgo": "3 Months",
			"id": "3_Montths",
			"label": "3 Months",
			"date": moment().subtract(3, "months").format(curatorCtrl.reqDateFormat)
		},{
			"timeAgo": "1 Year",
			"id": "1_Year",
			"label": "1 Year",
			"date": moment().subtract(1, "years").format(curatorCtrl.reqDateFormat)
		},{
			"timeAgo": "3 Years",
			"id": "3_Years",
			"label": "3 Years",
			"date": moment().subtract(3, "years").format(curatorCtrl.reqDateFormat)
		},{
			"timeAgo": "Custom",
			"id": "Custom",
			"label" : "Custom",
			"date": moment(curatorCtrl.dtObj.start).format(curatorCtrl.displayFormat)+" :: "+moment(curatorCtrl.dtObj.end).format(curatorCtrl.displayFormat)
		}];
		
		curatorCtrl.timeFrameDate = {"selected":curatorCtrl.timeframes[0]};
		
		curatorCtrl.ModifiedCrawlDtModel = angular.copy(AdvSearchService.ModifiedDtModel);
		curatorCtrl.prevModifiedCrawlDtModel = angular.copy(AdvSearchService.ModifiedDtModel);
		curatorCtrl.custCrawlTimeFrame = false;
		curatorCtrl.crawlDtObj = {
				"maxDate":	new Date(),
		    	"start" : null,
		    	"end" : null
		};
		curatorCtrl.custCrawlStartDateErrMsg = "";
		curatorCtrl.custCrawlEndDateErrMsg = "";
		curatorCtrl.crawlTimeFrames = angular.copy(curatorCtrl.timeframes);
		
		curatorCtrl.crawlTimeFrameDate = {"selected":curatorCtrl.crawlTimeFrames[0]};
		curatorCtrl.prevCrawlTFValue = {"selected":curatorCtrl.crawlTimeFrames[0]};
		curatorCtrl.onSelectCrawlTimeFrame = onSelectCrawlTimeFrame;
		curatorCtrl.cancelCrawlDateRange = cancelCrawlDateRange;
		curatorCtrl.clearCrawlDateRange = clearCrawlDateRange;
		curatorCtrl.applyCrawlDateRange = applyCrawlDateRange;
		curatorCtrl.enableGoBtn = enableGoBtn;
		
		function enableGoBtn() {
			var status = true;
			if(!curatorCtrl.custTimeFrame && !curatorCtrl.custCrawlTimeFrame) {
				status = false;
			}
			return status;
		}
		
		function prsntTypesFromList (rslt) {
			if(rslt.type == "unclassified") {
				return angular.copy(CompanyPresentationService.prsntTypes_U);
			} else {
				return angular.copy(CompanyPresentationService.prsntTypes);
			}
		}
		
		function isSelected(cprslt) {
			var flag = false;
			
			if(cprslt.id) {
				flag = (cprslt.id == curatorCtrl.selectedDoc.id);
			} else {
				flag = (cprslt.attributes["_id"] == curatorCtrl.selectedDoc.attributes["_id"]);
			}
			
			return flag;
		}
		
		function onSelectTimeFrame (timeframe) {
			
			curatorCtrl.ModifiedDtModel = angular.copy(AdvSearchService.ModifiedDtModel);
			
			curatorCtrl.custTimeFrame = false;
			
			if (timeframe.label == "Custom") {
				curatorCtrl.custTimeFrame = true;
				
				curatorCtrl.ModifiedDtModel.datePublished.fromDate = moment(curatorCtrl.dtObj.start).format(curatorCtrl.reqDateFormat);
		    	curatorCtrl.ModifiedDtModel.datePublished.toDate = moment(curatorCtrl.dtObj.end).format(curatorCtrl.reqDateFormat);
		    	
		    	var from = moment(curatorCtrl.dtObj.start).isValid() ?  moment(curatorCtrl.dtObj.start).format(curatorCtrl.displayFormat) : " ";
		    	var to = moment(curatorCtrl.dtObj.end).isValid() ? moment(curatorCtrl.dtObj.end).format(curatorCtrl.displayFormat) : " ";
		    	
		    	curatorCtrl.timeFrameDate.selected.timeAgo = from+" :: "+to;
		    	
				curatorCtrl.timeFrameDate.selected = timeframe;
				
			} else {
				curatorCtrl.clearDateRange();
				curatorCtrl.timeFrameDate.selected = timeframe;
				curatorCtrl.ModifiedDtModel.datePublished.fromDate = timeframe.date;
			}
		}
		
		function clearDateRange () {
	    	curatorCtrl.dtObj.start = null;
	    	curatorCtrl.dtObj.end = new Date();
	    	
	    	curatorCtrl.ModifiedDtModel = angular.copy(AdvSearchService.ModifiedDtModel);
	    }
	    
		function applyDateRange () {
	    	curatorCtrl.ModifiedDtModel.datePublished.fromDate = moment(curatorCtrl.dtObj.start).format(curatorCtrl.reqDateFormat);
	    	curatorCtrl.ModifiedDtModel.datePublished.toDate = moment(curatorCtrl.dtObj.end).format(curatorCtrl.reqDateFormat);
	    	
	    	var from = "";
	    	var to = "";
	    	
	    	if(typeof curatorCtrl.dtObj.start != "undefined"){
	    		
	    		if(new Date(curatorCtrl.dtObj.start).getTime()<=new Date().getTime()){
	    			from = moment(curatorCtrl.dtObj.start).isValid() ?  moment(curatorCtrl.dtObj.start).format(curatorCtrl.displayFormat) : " ";
		    		curatorCtrl.custStartDateErrMsg = "";
	    		}else{
	    			curatorCtrl.custStartDateErrMsg = "'From' date can't be future date.";
		    		return false;
	    		}
	    		
	    	}else{
	    		
	    		curatorCtrl.custStartDateErrMsg = "Please enter valid 'From' date (YYYY-MM-DD).";
   			return false;
	    		
	    	}
	    	if(curatorCtrl.dtObj.end){
	    		if(new Date(curatorCtrl.dtObj.end).getTime()<=new Date().getTime()){
		    		to = moment(curatorCtrl.dtObj.end).isValid() ? moment(curatorCtrl.dtObj.end).format(curatorCtrl.displayFormat) : " ";
		    		curatorCtrl.custEndDateErrMsg = "";
	    		}else{
	    			curatorCtrl.custEndDateErrMsg = "'To' date can't be future date.";
		    		return false;
	    		}
	    	}else{
	    		curatorCtrl.custEndDateErrMsg = "Please enter valid 'To' date (YYYY-MM-DD).";
	    		return false;
	    	}
	    	
	    	if(curatorCtrl.dtObj.end){
	    		
	    		if(curatorCtrl.dtObj.start == null){
	    			from = to;
	    		}else if(new Date(curatorCtrl.dtObj.start).getTime() > new Date(curatorCtrl.dtObj.end).getTime()){
	    			curatorCtrl.custStartDateErrMsg = "'From' date should not be after 'To' date.";
		    		return false;
	    		}
	    		curatorCtrl.timeFrameDate.selected.timeAgo = from+" :: "+to;
	    	}
	    	
	    	curatorCtrl.custTimeFrame = false;
	    }
	    
	    function closeDateRange () {
	    	curatorCtrl.custTimeFrame = false;
	    }
	    
	    
	    function onSelectCrawlTimeFrame (timeframe) {
	    	curatorCtrl.custCrawlStartDateErrMsg = "";
			curatorCtrl.custCrawlEndDateErrMsg = "";
			
			//curatorCtrl.ModifiedCrawlDtModel = angular.copy(AdvSearchService.ModifiedDtModel);
			
			curatorCtrl.crawlTimeFrameDate.selected = timeframe;
			if (timeframe.label == "Custom") {
				/*curatorCtrl.crawlDtObj.start = null;
		    	curatorCtrl.crawlDtObj.end = null;
				if(curatorCtrl.crawlTimeFrameDate.selected.timeAgo) {
					delete curatorCtrl.crawlTimeFrameDate.selected.timeAgo;
				}*/
				
				if (curatorCtrl.prevModifiedCrawlDtModel.datePublished && !curatorCtrl.prevModifiedCrawlDtModel.datePublished.fromDate && !curatorCtrl.prevModifiedCrawlDtModel.datePublished.toDate) {
					curatorCtrl.crawlTimeFrameDate.selected.timeAgo = "Custom";
					curatorCtrl.crawlDtObj.start = null;
			    	curatorCtrl.crawlDtObj.end = null;
					curatorCtrl.ModifiedCrawlDtModel = angular.copy(AdvSearchService.ModifiedDtModel);
				}
				if (curatorCtrl.prevModifiedCrawlDtModel.datePublished && curatorCtrl.prevModifiedCrawlDtModel.datePublished.fromDate) {
					curatorCtrl.crawlDtObj.start = new Date(curatorCtrl.prevModifiedCrawlDtModel.datePublished.fromDate);
					curatorCtrl.ModifiedCrawlDtModel.datePublished.fromDate = curatorCtrl.prevModifiedCrawlDtModel.datePublished.fromDate;
			    }
				if (curatorCtrl.prevModifiedCrawlDtModel.datePublished && curatorCtrl.prevModifiedCrawlDtModel.datePublished.toDate) {
					curatorCtrl.crawlDtObj.end = new Date(curatorCtrl.prevModifiedCrawlDtModel.datePublished.toDate);
					curatorCtrl.ModifiedCrawlDtModel.datePublished.toDate = curatorCtrl.prevModifiedCrawlDtModel.datePublished.toDate;
				}
				curatorCtrl.custCrawlTimeFrame = true;
			} else {
				curatorCtrl.prevCrawlTFValue.selected = angular.copy(timeframe);
				curatorCtrl.clearDateRange();
				curatorCtrl.ModifiedCrawlDtModel.datePublished.fromDate = timeframe.date;
				curatorCtrl.custCrawlTimeFrame = false;
			}
		}
	    
	    function cancelCrawlDateRange () {
	    	if(!_.isEmpty(curatorCtrl.prevCrawlTFValue.selected) && curatorCtrl.prevCrawlTFValue.selected.timeAgo) {
	    		curatorCtrl.crawlTimeFrameDate.selected.timeAgo = curatorCtrl.prevCrawlTFValue.selected.timeAgo;
	    	}
	    	if (curatorCtrl.prevModifiedCrawlDtModel.datePublished && curatorCtrl.prevModifiedCrawlDtModel.datePublished.fromDate) {
				curatorCtrl.crawlDtObj.start = new Date(curatorCtrl.prevModifiedCrawlDtModel.datePublished.fromDate);
				curatorCtrl.ModifiedCrawlDtModel.datePublished.fromDate = curatorCtrl.prevModifiedCrawlDtModel.datePublished.fromDate;
		    }
			if (curatorCtrl.prevModifiedCrawlDtModel.datePublished && curatorCtrl.prevModifiedCrawlDtModel.datePublished.toDate) {
				curatorCtrl.crawlDtObj.end = new Date(curatorCtrl.prevModifiedCrawlDtModel.datePublished.toDate);
				curatorCtrl.ModifiedCrawlDtModel.datePublished.toDate = curatorCtrl.prevModifiedCrawlDtModel.datePublished.toDate;
			}
	    	curatorCtrl.custCrawlTimeFrame = false;
	    };
	    
	    function clearCrawlDateRange () {
	    	curatorCtrl.crawlDtObj.start = null;
	    	curatorCtrl.crawlDtObj.end = null;
	    	curatorCtrl.crawlTimeFrameDate.selected.timeAgo = "Custom";
			//curatorCtrl.prevCrawlTFValue = {"selected":""};
	    	curatorCtrl.ModifiedCrawlDtModel = angular.copy(AdvSearchService.ModifiedDtModel);
	    	//curatorCtrl.prevModifiedCrawlDtModel = angular.copy(AdvSearchService.ModifiedDtModel);
	    }
	    
		function applyCrawlDateRange () {
			if(!curatorCtrl.crawlDtObj.start && !curatorCtrl.crawlDtObj.end){
				curatorCtrl.custCrawlEndDateErrMsg = "Please select atleast one of the dates; else click on 'CANCEL'";
	    		return false;
	    	}
			var from = "";
	    	var to = "";
	    	
	    	if(typeof curatorCtrl.crawlDtObj.start != "undefined"){
	    		if(new Date(curatorCtrl.crawlDtObj.start).getTime()<=new Date().getTime()){
	    			from = moment(curatorCtrl.crawlDtObj.start).isValid() ?  moment(curatorCtrl.crawlDtObj.start).format(curatorCtrl.displayFormat) : " ";
		    		curatorCtrl.custCrawlStartDateErrMsg = "";
	    		}else{
	    			curatorCtrl.custCrawlStartDateErrMsg = "'From' date can't be future date.";
		    		return false;
	    		}
	    	}else{
	    		curatorCtrl.custCrawlStartDateErrMsg = "Please enter valid 'From' date (YYYY-MM-DD).";
	    		return false;
	    	}
	    	if(typeof curatorCtrl.crawlDtObj.end != "undefined"){
	    		if(new Date(curatorCtrl.crawlDtObj.end).getTime()<=new Date().getTime()){
		    		to = moment(curatorCtrl.crawlDtObj.end).isValid() ? moment(curatorCtrl.crawlDtObj.end).format(curatorCtrl.displayFormat) : " ";
		    		curatorCtrl.custCrawlEndDateErrMsg = "";
	    		}else{
	    			curatorCtrl.custCrawlEndDateErrMsg = "'To' date can't be future date.";
		    		return false;
	    		}
	    	}else{
	    		curatorCtrl.custCrawlEndDateErrMsg = "Please enter valid 'To' date (YYYY-MM-DD).";
	    		return false;
	    	}
	    	
	    	if(curatorCtrl.crawlDtObj.end){
	    		if(curatorCtrl.crawlDtObj.start == null){
	    			//from = to;
	    		}else if(new Date(curatorCtrl.crawlDtObj.start).getTime() > new Date(curatorCtrl.crawlDtObj.end).getTime()){
	    			curatorCtrl.custCrawlStartDateErrMsg = "'From' date should not be after 'To' date.";
		    		return false;
	    		}
	    	}
	    	
	    	curatorCtrl.custCrawlStartDateErrMsg = "";
			curatorCtrl.custCrawlEndDateErrMsg = "";
			if(curatorCtrl.crawlDtObj.start && curatorCtrl.crawlDtObj.end){
				curatorCtrl.crawlTimeFrameDate.selected["timeAgo"] = from+" :: "+to;
				curatorCtrl.prevCrawlTFValue.selected["timeAgo"] = from+" :: "+to;
    		} else if (!curatorCtrl.crawlDtObj.start && curatorCtrl.crawlDtObj.end){
    			curatorCtrl.crawlTimeFrameDate.selected["timeAgo"] = "ToDate : "+to;
    			curatorCtrl.prevCrawlTFValue.selected["timeAgo"] = "ToDate : "+to;
    		} else if (curatorCtrl.crawlDtObj.start && !curatorCtrl.crawlDtObj.end) {
    			curatorCtrl.crawlTimeFrameDate.selected["timeAgo"] = "FromDate : "+from;
    			curatorCtrl.prevCrawlTFValue.selected["timeAgo"] = "FromDate : "+from;
    		}
			
			if(curatorCtrl.crawlDtObj.start != null && typeof curatorCtrl.crawlDtObj.start != "undefined") {
				curatorCtrl.ModifiedCrawlDtModel.datePublished.fromDate = moment(curatorCtrl.crawlDtObj.start).format(curatorCtrl.reqDateFormat);
				curatorCtrl.prevModifiedCrawlDtModel.datePublished.fromDate = moment(curatorCtrl.crawlDtObj.start).format(curatorCtrl.reqDateFormat);
			}
			if(curatorCtrl.crawlDtObj.end != null && typeof curatorCtrl.crawlDtObj.end != "undefined") {
				curatorCtrl.ModifiedCrawlDtModel.datePublished.toDate = moment(curatorCtrl.crawlDtObj.end).format(curatorCtrl.reqDateFormat);
				curatorCtrl.prevModifiedCrawlDtModel.datePublished.toDate = moment(curatorCtrl.crawlDtObj.end).format(curatorCtrl.reqDateFormat);
			}
			curatorCtrl.custCrawlTimeFrame = false;
	    }
	    	       
		function tickerFocused(event){
			$("#TICKERS").addClass("ticker-expand");
		}
		
		function tickerDeFocused(event,mode){
			$("#TICKERS").removeClass("ticker-expand");
			if(mode) {
				onFilterChange();
			}
		}
		
		function refreshTickerInfo(searchKey) {
			if(!_.isEmpty(searchKey)) {
				SecFilingService.getCompaniesList({"searchTxt":searchKey}).then(function(resp){
			    	if(resp.status == 200 && resp.data.Status) {
			    		curatorCtrl.tickersList = resp.data.Company;
			        }
			    });
			}  
		}
		
		function markPresentation(type,cpDoc,changes) {
			
			CompanyPresentationService.getRuleEngineStatus().then(function(es) {
				if(es.status == 200 && es.data.Status) {
	  				if(!CompanyPresentationService.isRuleEngineRunning(es.data.RuleEngineTask)) {
	  					CompanyPresentationService.markCompanyPresentation(changes).then(function(resp) {
	  						if(resp.status == 200 && resp.data.Status && resp.data.Changed) {
	  							if(!_.isArray(cpDoc.comments)) {
	  								cpDoc.comments = [];
	  							}
	  							
	  							if(!_.isArray(cpDoc.prevTypes)) {
	  								cpDoc.prevTypes = [];
	  							}
	  							cpDoc.comments.push(changes.comment);
	  							cpDoc.prevTypes.push(cpDoc.type);
	  							cpDoc.type = type;
	  							cpDoc.subCategory = changes.subCategory;
	  						}
	  					})["finally"](function(){
	  						curatorCtrl.types[cpDoc.uid] = cpDoc.type;
	  					});
	  				}
	  			}
			});
		}
		
		function saveRule(rule) {
			CompanyPresentationService.getRuleEngineStatus().then(function(es) {
				if(es.status == 200 && es.data.Status) {
	  				if(!CompanyPresentationService.isRuleEngineRunning(es.data.RuleEngineTask)) {
	  					CompanyPresentationService.saveRule(rule).then(function(resp) {
	  						if(resp.status == 200 && resp.data.Status) {
	  							if(_.isEmpty(rule.id)) {
	  								curatorCtrl.selectedRule = resp.data.Rule;
	  								curatorCtrl.esRulesList.push(curatorCtrl.selectedRule);
	  							} else {
	  								
	  								var index = _.findIndex(curatorCtrl.esRulesList, function (item) { 
	  									return item.id == rule.id 
	  								});
	  								
	  								if(index !== -1) {
	  									curatorCtrl.selectedRule = resp.data.Rule;
	  									curatorCtrl.esRulesList[index] = curatorCtrl.selectedRule;
	  								}
	  							}
	  							curatorCtrl.onRuleSelect();
	  						}
	  					});
	  				}
	  			}
			});
		}
		
		function onPrsntTypeSelect(type,id) {
			var cpDoc = _.findWhere(curatorCtrl.results, {"id": id});
			
			if(cpDoc && cpDoc.type != type) {
				
				var modalInstance = $uibModal.open({
				      animation: true,
				      templateUrl: 'app/components/Admin/CompanyPresentations/MarkPresentation/MarkCompanyPresentationModal.html',
				      controller: 'MarkCompanyPresentationController',
				      appendTo : $('.rootContainer'),
				      controllerAs: 'mrkcp',
				      backdrop: 'static',
				      size:"lg",
				      resolve: {
				    	  cpObj : function() {
				    		  return {
				    			  "type" : type,
				    			  "obj" : cpDoc
				    		  };
				    	  }
				      }
				    });
				
				modalInstance.result.then(function (data) {
					markPresentation(type,cpDoc,data.changes);
				}, function () {
					curatorCtrl.types[id] = cpDoc.type;
				});
				
				
				/*if(type == "maybe") {
					var changes = {
							"type" : type,
							"comment" : ""
					};
					if(cpDoc.id) {
						changes["id"] = cpDoc.id;
					} else {
						if(cpDoc.attributes && cpDoc.attributes._id) {
							changes["esid"] = cpDoc.attributes._id;
						}
					}
					markPresentation(type,cpDoc,changes);
				} else {
					
				}*/
			}
		}
		
		function preview() {
			var postdata = {};
			postdata.ruleParts = curatorCtrl.selectedRule.ruleParts;
			postdata.pageSize = curatorCtrl.rulesPageConfig.pageSize;
			postdata.pageNo = curatorCtrl.rulesPageConfig.pageNo;
			
			curatorCtrl.loader = true;
			CompanyPresentationService.applyRule(postdata).then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					processCPResponse(resp);
				}
			})['finally'](function() {
				curatorCtrl.loader = false;
			});
		}
		
		function processQuery() {
			var query = angular.copy(curatorCtrl.filters);
			var tkrs = [];
			if(query.tickers && query.tickers.length > 0) {
				for(var i=0;i<query.tickers.length;i++) {
					tkrs.push(query.tickers[i]['ticker']);
				}
				
				query.tickers = tkrs;
			} else {
				delete query.tickers;
			}
			
			if (!searchByFilters && _.isString(query.query) && !_.isEmpty(query.query)) {
	    		
	    		if(_.startsWith(query.query,"~")) {
	    			query.queryString = _.strRight(query.query,"~");
	    			delete query.query;
	    		} else if(query.query.indexOf('"') != -1 && query.query.indexOf('~') != -1) {
	    			var n = query.query.split('~');
		    		if(n.length >= 2){
		    			query.query = n[0];
		    			if (_.isEmpty( n[0])) {
		    				MessageService.showErrorMessage("PROXIMITY_VAL_ERR");
		    				return false;
		    			} else {
		    				 var re = new RegExp(/\w+\s\w+/);
		    				if (!_.isEmpty( n[0]) && !isNaN(n[1]) && n[0].match(re)) {
			    				query.proximity =  n[1].trim();
			    			}else {
			    				MessageService.showErrorMessage("PROXIMITY_VAL_ERR");
			    				return false;
			    			}
		    			}
		    		}
	    		}
	    	} else {
	    		delete query.query;
	    	}
			
			if(query.sort) {
				var keys = [];
				for(var k in query.sort) keys.push(k);
				query.sortColumn = keys[0];
				query.sortAsc = query.sort[keys[0]];
				delete query.sort;
			}
			if (curatorCtrl.ModifiedDtModel.datePublished.fromDate || curatorCtrl.ModifiedDtModel.datePublished.toDate) {
				var date = angular.copy(curatorCtrl.ModifiedDtModel);
				date.datePublished.timeframe = curatorCtrl.timeFrameDate.selected.id;
				if (date.datePublished.fromDate) {
					query["from"] = date.datePublished.fromDate;
				}
				if (date.datePublished.toDate) {
					query["to"] = date.datePublished.toDate;
				} 
			}
			
			if (curatorCtrl.ModifiedCrawlDtModel.datePublished.fromDate || curatorCtrl.ModifiedCrawlDtModel.datePublished.toDate) {
				var date = angular.copy(curatorCtrl.ModifiedCrawlDtModel);
				date.datePublished.timeframe = curatorCtrl.crawlTimeFrameDate.selected.id;
				if (date.datePublished.fromDate) {
					query["crawledFrom"] = date.datePublished.fromDate;
				}
				if (date.datePublished.toDate) {
					query["crawledTo"] = date.datePublished.toDate;
				} 
			}
			
			return query;
		}
		
		function resetPage() {
			curatorCtrl.filters.pageNo = 0;
			curatorCtrl.rulesPageConfig.pageNo = 1;
		}
		
		function processCPResponse(resp) {
			var rslts = resp.data.Results;
			if(rslts) {
				for(var i=0;i < rslts.length;i++) {
					var id = rslts[i]['id'];
					if(_.isEmpty(id)) {
						id = rslts[i]['attributes']['_id'];
					}
					rslts[i]['uid'] = id;
					curatorCtrl.types[id] = rslts[i]['type'];
					rslts[i]["docName"] = rslts[i]["docName"] ? decodeURIComponent(rslts[i]["docName"]) : rslts[i]["docName"];
				}
			}
			curatorCtrl.results = rslts;
			curatorCtrl.resultCount.Total = resp.data.Total;
			
			var pn = curatorCtrl.rulesPageConfig.pageNo - 1;
			
			if(searchByFilters) {
				pn = curatorCtrl.filters.pageNo;
			} 
			var _from = ((pn)*curatorCtrl.filters.pageSize);
			var _to = ((pn)*curatorCtrl.filters.pageSize)+curatorCtrl.results.length;
			curatorCtrl.resultCount.range = _from +" - "+_to+" of "+curatorCtrl.resultCount.Total;
			if(!_.isEmpty(curatorCtrl.results)) {
				curatorCtrl.selectedDoc = curatorCtrl.results[0];
				renderView();
			}
		}
		
		curatorCtrl.docOnSelect = function(doc) {
			curatorCtrl.selectedDoc = doc;
			renderView();
		};
		
		curatorCtrl.trustSrc = function() {
			if(curatorCtrl.selectedDoc && curatorCtrl.selectedDoc.url) {
				var url = "api/presentations/getDocument?url="+encodeURI(curatorCtrl.selectedDoc.url);
				return $sce.trustAsResourceUrl(url);
			} else {
				return "";
			}
			
		};
		
		function clearView() {
			var divElement = angular.element(document.querySelector('.cont'));
			divElement.empty();
		}
		
		function hasWhiteSpace(s) {
			  return /\s/g.test(s);
		}
		
		function renderView() {
			clearView();
			if(curatorCtrl.selectedDoc && curatorCtrl.selectedDoc.attributes) {
				/*var url = curatorCtrl.selectedDoc.url;
				if(hasWhiteSpace(url)) {
					url = encodeURI(url);
				}*/
				
				var eid = curatorCtrl.selectedDoc.attributes["_id"];
				BuildForm.params = {
						eid : eid
				};
			}
			var divElement = angular.element(document.querySelector('.cont'));
			var template = '<load-iframe></load-iframe>';
		    var appendHtml = $compile(template)($scope);
		    divElement.append(appendHtml);
		}
		
		function resetRules() {
			curatorCtrl.selectedRule = null;
			curatorCtrl.ruleQueryString = null;
			curatorCtrl.rulesPageConfig = angular.copy(CompanyPresentationService.rulesPageConfig);
			curatorCtrl.esRulesList = _.reject(curatorCtrl.esRulesList, function(rule){ 
    			return rule.id == null; 
    		});
		}
		
		function getResults(reset) {
			
			if(reset) {
				resetPage();
			}
			
			resetRules();
			
			curatorCtrl.loader = true;
			searchByFilters = true;
			var query = processQuery();
			curatorCtrl.results = [];
			curatorCtrl.types = {};
			cpPromise = CompanyPresentationService.getCompanyPresentations(query);
			cpPromise.then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					processCPResponse(resp);
				}
			})['finally'](function() {
				curatorCtrl.loader = false;
			});
		}
		
		function reset() {
			$state.reload();
		}
		
		/*function getKeywordResults(reset) {
			if(reset) {
				resetPage();
			}
			curatorCtrl.loader = true;
			searchByFilters = false;
			var query = processQuery();
			cpPromise = CompanyPresentationService.getCPByKeyword(query);
			cpPromise.then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					processCPResponse(resp);
				}
			})['finally'](function() {
				curatorCtrl.loader = false;
			});
		}*/
		
		function getSortIcon (field) {
			if (curatorCtrl.filters.sort[field]) {
				return 'fa-caret-up';
			} else if (!curatorCtrl.filters.sort[field]) {
				return 'fa-caret-down';
			}
		}
		
		function sortBy (field) {
			var sortOption = {};
			if (curatorCtrl.filters.sort[field]) {
				sortOption[field] = !curatorCtrl.filters.sort[field];
			} else {
				sortOption[field] = true;
			}
			curatorCtrl.sortedField = field;
			curatorCtrl.filters.sort = sortOption;
			
			if(searchByFilters) {
				getResults();
			} else {
				//getKeywordResults();
			}
		}
		
		function prev() {
			
			if(searchByFilters) {
				if(curatorCtrl.filters.pageNo > 0) {
					curatorCtrl.filters.pageNo = (curatorCtrl.filters.pageNo-1);
					getResults();
				}
			} else {
				if(curatorCtrl.rulesPageConfig.pageNo > 1) {
					curatorCtrl.rulesPageConfig.pageNo = (curatorCtrl.rulesPageConfig.pageNo-1);
					preview();
				}
			}
		}
		
		function next() {
			if(searchByFilters) {
				if(curatorCtrl.results.length == curatorCtrl.filters.pageSize) {
					curatorCtrl.filters.pageNo = (curatorCtrl.filters.pageNo+1);
					getResults();
				}
			} else {
				if(curatorCtrl.results.length == curatorCtrl.rulesPageConfig.pageSize) {
					curatorCtrl.rulesPageConfig.pageNo = (curatorCtrl.rulesPageConfig.pageNo+1);
					preview();
				}
			}
		}
		
		function onFilterChange() {
			//curatorCtrl.filters.pageNo = 1;
		}
		
		function showAttributes(rslt,key) {
			_.each(curatorCtrl.results, function(result) {
				if(rslt.id !== result.id && result.show) {
					result.show = !result.show;
				}
			});
			rslt.show = !rslt.show;
		}
		
		function showDetails(rslt) {
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/Admin/CompanyPresentations/CuratorUI/CPDetailsModal.html',
			      controller: 'CPDetailsController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'cpd',
			      backdrop: 'static',
			      size: "lg",
			      resolve: {
			    	  cpObj : function() {
			    		  return angular.copy(rslt);
			    	  }
			      }
			});
		}
		
		//rules 
		
		function getRulesByOrder() {
			CompanyPresentationService.getRulesByOrder().then(function(resp) {
				if(resp.status == 200 && resp.data.Status) {
					curatorCtrl.esRulesList = _.map(resp.data.Rules,function(rule) {
						return rule.EsRule;
					});
				}
			});
		}
		
		function getRuleQuery() {
			if(!_.isEmpty(curatorCtrl.selectedRule)) {
				CompanyPresentationService.ruleToquery(curatorCtrl.selectedRule).then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						curatorCtrl.ruleQueryString = resp.data.Query;
					}
				});
			}
		}
		
		function onRuleSelect($event) {
			
			searchByFilters = false;
			resetPage();
			curatorCtrl.results = [];
			curatorCtrl.types = {};
			curatorCtrl.selectedDoc = {};
			curatorCtrl.resultCount = {};
			if(curatorCtrl.selectedRule) {
				preview();
			}
			getRuleQuery();
		}
		
		
		function saveOrEditCallback(ESrule) {
			if(!_.isEmpty(ESrule)) {
				curatorCtrl.selectedRule = ESrule;
				var index = _.findIndex(curatorCtrl.esRulesList, function (item) { 
					return item.id == ESrule.id 
				});
				
				if(index !== -1) {
					curatorCtrl.esRulesList[index] = curatorCtrl.selectedRule;
				} else {
					curatorCtrl.esRulesList.push(curatorCtrl.selectedRule);
				}
				
				curatorCtrl.onRuleSelect();
			}	
		}
		
		function filterDocCallback(ESrule) {
			if(_.isEmpty(ESrule.ruleName)) {
				ESrule.ruleName = "Unsaved Rule";
			}
			
			curatorCtrl.selectedRule = ESrule;
			curatorCtrl.onRuleSelect();
		}
		
		function deleteRuleCallback (rule) {
			MessageService.showSuccessMessage("RULE_DELETE",[rule.ruleName]);
			curatorCtrl.esRulesList = _.without(
					curatorCtrl.esRulesList, 
						_.findWhere(curatorCtrl.esRulesList, {
						  id: rule.id
						})
					);
			
			if(!_.isEmpty(curatorCtrl.esRulesList)) {
				curatorCtrl.selectedRule = curatorCtrl.esRulesList[0];
				curatorCtrl.onRuleSelect();
			} else {
				curatorCtrl.selectedRule = {};
				getResults(true);
			}
			
		}
		
		function addOrEditRule(event,rule) {
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/Admin/CompanyPresentations/AddOrEditRule/AddOrEditRule.html',
			      controller: 'AddOrEditRuleController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'AddOrEditRuleCtrl',
			      backdrop: 'static',
			      size:"lg",
			      resolve: {
			    	  EsRule : function() {
			    		  return angular.copy(rule);
			    	  }
			      }
			    });
			
			modalInstance.result.then(function (data) {
				if(data.type === "filter") {
					filterDocCallback(data.rule);
				}
				
				if(data.type === "save") {
					saveOrEditCallback(data.rule);
				}
				
				if(data.type === "delete") {
					deleteRuleCallback(rule);
				}
			});
		}
		
		function orderRules(event) {
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/Admin/CompanyPresentations/OrderRules/CompanyPresentationsOrderRules.html',
			      controller: 'CompanyPresentationsOrderRulesController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'orderRuleCtrl',
			      backdrop: 'static',
			      size:"lg",
			      resolve: {
			    	  cpRules : function() {
			    		  return CompanyPresentationService.getRulesByOrder().then(function(resp) {
			  				if(resp.status == 200 && resp.data.Status) {
			  					return angular.copy(resp.data.Rules);
							} else {
								return [];
							}
						});
			    	  }
			      }
			    });
			
			modalInstance.result.then(function (status) {
				if(status) {
					getRulesByOrder();
				}
			});
		}
		
		function applyRuels(event) {
			var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'app/components/Admin/CompanyPresentations/ApplyRules/CompanyPresentationsRulesModal.html',
			      controller: 'CompanyPresentationsRulesModalController',
			      appendTo : $('.rootContainer'),
			      controllerAs: 'applyRuleCtrl',
			      backdrop: 'static',
			      size:"lg",
			      resolve: {
			    	  cpRules : function() {
			    		  return CompanyPresentationService.getRulesByOrder().then(function(resp) {
			  				if(resp.status == 200 && resp.data.Status) {
			  					return angular.copy(resp.data.Rules);
							} else {
								return [];
							}
						});
			    	  }
			      }
			    });
			
			modalInstance.result.then(function (status) {
				if(status) {
					reset();
				}
			});
		}
		
		function unClassifyAll() {
			$confirm({text: "Do you want to mark all Company Presentations as Unclassified ?"})
	        .then(function() {
				CompanyPresentationService.markUnclassify().then(function(resp) {
					if(resp.status == 200 && resp.data.Status) {
						$state.reload();
			        }
				});
		    });
		}
		
		function getAttributeValue(key,value) {
			if(_.contains(dateAttributes, key)) {
				return $filter('date')(value);
			} else {
				return value;
			}
		}
		
		function initController() {
			getResults();
			getRulesByOrder();
		}
		
		initController();
	}
	
})();