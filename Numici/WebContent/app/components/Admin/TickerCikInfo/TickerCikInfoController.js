;(function() {
	
	angular.module("vdvcApp").controller('TickerCikInfoController',TickerCikInfoController);
	
	TickerCikInfoController.$inject = ['$scope','$state','appData','TickerCikInfoService','_','$sce','$confirm'];
		
	function TickerCikInfoController($scope,$state,appData,TickerCikInfoService,_,$sce,$confirm) {
		
		var tci = this;
		var appdata = appData.getAppData();
		$scope.$emit("PageName",{"userName":appdata.UserName,"pageName":$state.current.pageName});
		var companyUrl = {
				URLSource:null,
				URLStatus:null,
				URLUpdatedByCurator:null,
				Comment:null
			 }
		
		tci.urlUpdateTypeOptions = angular.copy(TickerCikInfoService.urlUpdateTypeOptions);
		tci.UrlUpdateSourceOptions = {};
		tci.urlFilterFixedSourceOptions = angular.copy(TickerCikInfoService.urlFilterFixedSourceOptions);
		tci.urlFilterFixedStatusOptions = angular.copy(TickerCikInfoService.urlFilterFixedStatusOptions);
		tci.urlFilterFixedCuratorOptions = angular.copy(TickerCikInfoService.urlFilterFixedCuratorOptions);
		
		tci.companyUrlsFilterOptions = angular.copy(TickerCikInfoService.companyUrlsFilterOptions);
		tci.urlFilterCuratorOptions = angular.copy(TickerCikInfoService.urlFilterCuratorOptions);
		tci.urlFilterStatusOptions = angular.copy(TickerCikInfoService.urlFilterStatusOptions);
		
		tci.showHomeUrlFilter = false;
		tci.showIRUrlFilter = false;
		tci.showCPUrlFilter = false;
		tci.showPRUrlFilter = false;
		
		
		tci.query = {};
		tci.query["pageSize"] = 50;
		tci.query["pageNo"] = 0;
		tci.query.ticker = "Exists";
		
		tci.query.homeURLStatus = "All";
		tci.query.homeURLSource = "All";
		tci.query.homeURLUpdatedByCurator = "All";
		tci.query.homeURLComment = "";
		
		tci.query.irURLStatus = "All";
		tci.query.irURLSource = "All";
		tci.query.irURLUpdatedByCurator = "All";
		tci.query.irURLComment = "";
		
		tci.query.cpURLStatus = "All";
		tci.query.cpURLSource = "All";
		tci.query.cpURLUpdatedByCurator = "All";
		tci.query.cpURLComment = "";
		
		tci.query.prURLStatus = "All";
		tci.query.prURLSource = "All";
		tci.query.prURLUpdatedByCurator = "All";
		tci.query.prURLComment = "";
		
		tci.disableCompanyUrlsFilters = false;	
		
		tci.tickerCikInfoList = [];
		tci.resultCount = {};
		tci.selctedTickerCikInfo = {};
		tci.detailsLbls = angular.copy(TickerCikInfoService.detailsLables);
		
		tci.urlUpdateStatusOptions = angular.copy(TickerCikInfoService.urlUpdateStatusOptions);
		
		tci.showAddNewCompanyUrlCard = false;
		tci.newCompanyUrlInfo = {};
		
		tci.showExpButton = true;
		tci.trustSrcUrl = "";	
		tci.loader = false;
		
		
		tci.getAllUrlSourcesList = getAllUrlSourcesList;
		tci.getUrlSourceList = getUrlSourceList;
		tci.getUrlFilterSourceOptions = getUrlFilterSourceOptions;
		
		tci.enableCompanyUrlsFilters = enableCompanyUrlsFilters;
		
		tci.getHomeUrlTooltip = getHomeUrlTooltip;
		tci.closeHomeUrlFilterDD = closeHomeUrlFilterDD;
		tci.toggleHomeUrlFilter = toggleHomeUrlFilter;
		tci.setHMUrlCriteria = setHMUrlCriteria;
		
		tci.getIRUrlTooltip = getIRUrlTooltip;
		tci.closeIRUrlFilterDD = closeIRUrlFilterDD;
		tci.toggleIRUrlFilter = toggleIRUrlFilter;
		tci.setIRUrlCriteria = setIRUrlCriteria;
		
		tci.getCPUrlTooltip = getCPUrlTooltip;
		tci.closeCPUrlFilterDD = closeCPUrlFilterDD;
		tci.toggleCPUrlFilter = toggleCPUrlFilter;
		tci.setCPUrlCriteria = setCPUrlCriteria;
		
		tci.getPRUrlTooltip = getPRUrlTooltip;
		tci.closePRUrlFilterDD = closePRUrlFilterDD;
		tci.togglePRUrlFilter = togglePRUrlFilter;
		tci.setPRUrlCriteria = setPRUrlCriteria;
		
		tci.reset = reset;
		tci.isSelected = isSelected;
		tci.isUrlSelected = isUrlSelected;
		tci.onUlrCardSelect = onUlrCardSelect;
		tci.onTciSelect = onTciSelect;
		tci.getTickerCikInfoList = getTickerCikInfoList;
		tci.prev = prev;
		tci.next = next;
		
		tci.refreshSource = refreshSource;
		tci.getUrlUpdateSourceOptions = getUrlUpdateSourceOptions;
		
		tci.showAddNewCompanyUrlBtn = showAddNewCompanyUrlBtn;
		tci.showAddNewCUCard = showAddNewCUCard;
		tci.cancelAddNewUrl = cancelAddNewUrl;
		tci.validURL = validURL;
		tci.saveNewUrl = saveNewUrl;
		
		tci.showUrlCardActions = showUrlCardActions;
		tci.deleteCompanyUrlsInfo = deleteCompanyUrlsInfo;
		tci.editCompanyUrlsInfo = editCompanyUrlsInfo;
		tci.cancelUrlEdit = cancelUrlEdit;
		tci.saveEditedUrl = saveEditedUrl;
		
		tci.openCompanyUrl = openCompanyUrl;
		tci.onLoad = onLoad;
		tci.compressCont = compressCont;
		tci.expandCont = expandCont;
		
		function processFilterSourceOptions() {
			tci.urlFilterHomeSourceOptions = angular.copy(tci.urlFilterFixedSourceOptions).concat(angular.copy(tci.UrlUpdateSourceOptions[tci.urlUpdateTypeOptions[0].value]));
			tci.urlFilterIRSourceOptions = angular.copy(tci.urlFilterFixedSourceOptions).concat(angular.copy(tci.UrlUpdateSourceOptions[tci.urlUpdateTypeOptions[1].value]));
			tci.urlFilterCPSourceOptions = angular.copy(tci.urlFilterFixedSourceOptions).concat(angular.copy(tci.UrlUpdateSourceOptions[tci.urlUpdateTypeOptions[2].value]));
			tci.urlFilterPRSourceOptions = angular.copy(tci.urlFilterFixedSourceOptions).concat(angular.copy(tci.UrlUpdateSourceOptions[tci.urlUpdateTypeOptions[3].value]));
		}
		
		function processAllUrlSourcesList(response) {
			var results = response.data.UrlSources;
			tci.UrlUpdateSourceOptions = angular.copy(results);
			processFilterSourceOptions();
			getTickerCikInfoList();
		}
		
		function getAllUrlSourcesList () {
			TickerCikInfoService.getAllUrlSourcesList().then(function(response){
				if(response.status == 200 && response.data.Status) {
					processAllUrlSourcesList (response);
				}
			});
		}
		
		function getUrlSourceList (urlType) {
			var postdata = {"urlType" : urlType};
			TickerCikInfoService.getUrlSourceList(postdata).then(function(response){
				if(response.status == 200 && response.data.Status) {
					tci.UrlUpdateSourceOptions[urlType] = response.data.UrlSource;
					processFilterSourceOptions();
				}
			});
		}
		
		function getUrlFilterSourceOptions (urlType) {
			return tci.UrlUpdateSourceOptions[urlType];
		}
		
		function enableCompanyUrlsFilters () {
			if(tci.query.companyUrls && (tci.query.companyUrls == "Exists" || tci.query.companyUrls == "All")) {
				tci.disableCompanyUrlsFilters = false;
			} else {
				tci.disableCompanyUrlsFilters = true;
				tci.hmUrlCriteria = "";
				tci.irUrlCriteria = "";
				tci.cpUrlCriteria = "";
				tci.prUrlCriteria = "";
			}
		}
		
		function getHomeUrlTooltip () {
			var tooltip = "HOME URL";
			
			if(!_.isEmpty(tci.hmUrlCriteria)) {
				tooltip = tooltip +" - "+ tci.hmUrlCriteria;
			}
			
			return tooltip;
		}
		
		function closeHomeUrlFilterDD () {
			tci.showHomeUrlFilter = false;
		}
		
		function toggleHomeUrlFilter () {
			tci.showIRUrlFilter = false;
			tci.showCPUrlFilter = false;
			tci.showPRUrlFilter = false;
			tci.showHomeUrlFilter = !tci.showHomeUrlFilter;
		}
		
		function setHMUrlCriteria () {
			tci.hmUrlCriteria = "";
			if(tci.query.homeURLSource != "All") {
				tci.hmUrlCriteria += "URL SOURCE : "+tci.query.homeURLSource;
			}
			if(tci.query.homeURLStatus != "All") {
				if(tci.query.homeURLSource != "All") {
					tci.hmUrlCriteria += " ; "
				}
				tci.hmUrlCriteria += "URL STATUS : "+tci.query.homeURLStatus;
			}
			if(tci.query.homeURLUpdatedByCurator != "All") {
				if(tci.query.homeURLSource != "All" || tci.query.homeURLStatus != "All") {
					tci.hmUrlCriteria += " ; "
				}
				tci.hmUrlCriteria += "URL MODIFIED BY CURATOR : "+tci.query.homeURLUpdatedByCurator;
			}
			if(!_.isEmpty(tci.query.homeURLComment)) {
				if(tci.query.homeURLSource != "All" || tci.query.homeURLStatus != "All" || tci.query.homeURLUpdatedByCurator != "All") {
					tci.hmUrlCriteria += " ; "
				}
				tci.hmUrlCriteria += "URL COMMENT : "+tci.query.homeURLComment;
			}
		}
		
		function getIRUrlTooltip () {
			var tooltip = "INVESTOR RELATIONS URL";
			
			if(!_.isEmpty(tci.irUrlCriteria)) {
				tooltip = tooltip +" - "+ tci.irUrlCriteria;
			}
			
			return tooltip;
		}
		
		function closeIRUrlFilterDD () {
			tci.showIRUrlFilter = false;
		}
		
		function toggleIRUrlFilter () {
			tci.showHomeUrlFilter = false;
			tci.showCPUrlFilter = false;
			tci.showPRUrlFilter = false;
			tci.showIRUrlFilter = !tci.showIRUrlFilter;
		}
		
		function setIRUrlCriteria () {
			tci.irUrlCriteria = "";
			if(tci.query.irURLSource != "All") {
				tci.irUrlCriteria += "URL SOURCE : "+tci.query.irURLSource;
			}
			if(tci.query.irURLStatus != "All") {
				if(tci.query.irURLSource != "All") {
					tci.irUrlCriteria += " ; "
				}
				tci.irUrlCriteria += "URL STATUS : "+tci.query.irURLStatus;
			}
			if(tci.query.irURLUpdatedByCurator != "All") {
				if(tci.query.irURLSource != "All" || tci.query.irURLStatus != "All") {
					tci.irUrlCriteria += " ; "
				}
				tci.irUrlCriteria += "URL MODIFIED BY CURATOR : "+tci.query.irURLUpdatedByCurator;
			}
			if(!_.isEmpty(tci.query.irURLComment)) {
				if(tci.query.irURLSource != "All" || tci.query.irURLStatus != "All" || tci.query.irURLUpdatedByCurator != "All") {
					tci.irUrlCriteria += " ; "
				}
				tci.irUrlCriteria += "URL COMMENT : "+tci.query.irURLComment;
			}
		}
		
		function getCPUrlTooltip () {
			var tooltip = "COMPANY PRESENTATIONS URL";
			
			if(!_.isEmpty(tci.cpUrlCriteria)) {
				tooltip = tooltip +" - "+ tci.cpUrlCriteria;
			}
			
			return tooltip;
		}
		
		function closeCPUrlFilterDD () {
			tci.showCPUrlFilter = false;
		}
		
		function toggleCPUrlFilter () {
			tci.showHomeUrlFilter = false;
			tci.showIRUrlFilter = false;
			tci.showPRUrlFilter = false;
			tci.showCPUrlFilter = !tci.showCPUrlFilter;
		}
		
		function setCPUrlCriteria () {
			tci.cpUrlCriteria = "";
			if(tci.query.cpURLSource != "All") {
				tci.cpUrlCriteria += "URL SOURCE : "+tci.query.cpURLSource;
			}
			if(tci.query.cpURLStatus != "All") {
				if(tci.query.cpURLSource != "All") {
					tci.cpUrlCriteria += " ; "
				}
				tci.cpUrlCriteria += "URL STATUS : "+tci.query.cpURLStatus;
			}
			if(tci.query.cpURLUpdatedByCurator != "All") {
				if(tci.query.cpURLSource != "All" || tci.query.cpURLStatus != "All") {
					tci.cpUrlCriteria += " ; "
				}
				tci.cpUrlCriteria += "URL MODIFIED BY CURATOR : "+tci.query.cpURLUpdatedByCurator;
			}
			if(!_.isEmpty(tci.query.cpURLComment)) {
				if(tci.query.cpURLSource != "All" || tci.query.cpURLStatus != "All" || tci.query.cpURLUpdatedByCurator != "All") {
					tci.cpUrlCriteria += " ; "
				}
				tci.cpUrlCriteria += "URL COMMENT : "+tci.query.cpURLComment;
			}
		}
		
		function getPRUrlTooltip () {
			var tooltip = "PRESS RELEASES URL";
			
			if(!_.isEmpty(tci.prUrlCriteria)) {
				tooltip = tooltip +" - "+ tci.prUrlCriteria;
			}
			
			return tooltip;
		}
		
		function closePRUrlFilterDD () {
			tci.showPRUrlFilter = false;
		}
		
		function togglePRUrlFilter () {
			tci.showHomeUrlFilter = false;
			tci.showIRUrlFilter = false;
			tci.showCPUrlFilter = false;
			tci.showPRUrlFilter = !tci.showPRUrlFilter;
		}
		
		function setPRUrlCriteria () {
			tci.prUrlCriteria = "";
			if(tci.query.prURLSource != "All") {
				tci.prUrlCriteria += "URL SOURCE : "+tci.query.prURLSource;
			}
			if(tci.query.prURLStatus != "All") {
				if(tci.query.prURLSource != "All") {
					tci.prUrlCriteria += " ; "
				}
				tci.prUrlCriteria += "URL STATUS : "+tci.query.prURLStatus;
			}
			if(tci.query.prURLUpdatedByCurator != "All") {
				if(tci.query.prURLSource != "All" || tci.query.prURLStatus != "All") {
					tci.prUrlCriteria += " ; "
				}
				tci.prUrlCriteria += "URL MODIFIED BY CURATOR : "+tci.query.prURLUpdatedByCurator;
			}
			if(!_.isEmpty(tci.query.prURLComment)) {
				if(tci.query.prURLSource != "All" || tci.query.prURLStatus != "All" || tci.query.prURLUpdatedByCurator != "All") {
					tci.prUrlCriteria += " ; "
				}
				tci.prUrlCriteria += "URL COMMENT : "+tci.query.prURLComment;
			}
		}
		
		function reset() {
			$state.reload();
		}
		
		function isSelected (tickerCikInfo) {
			var flag = false;
			
			if(tickerCikInfo.id) {
				flag = (tickerCikInfo.id == tci.selctedTickerCikInfo.id);
			}
			
			return flag;
		}
		
		function isUrlSelected (companyUrlsInfo) {
			var flag = false;
			
			if(companyUrlsInfo.selected) {
				flag = true;
			}
			
			return flag;
		}
		
		function setTrustSrcUrl (urlvalue) {
			if(!_.isEmpty(urlvalue)) {
				var url = "api/presentations/loadUrl?url="+encodeURIComponent(urlvalue);
			} else {
				url = "about:blank";
			}
			tci.trustSrcUrl = url;
		}
		
		function onUlrCardSelect(companyUrlInfo) {
			_.each(tci.selctedTickerCikInfo.companyUrls,function(companyUrl){
				if(companyUrl.urltype != companyUrlInfo.urltype)
				companyUrl["selected"] = false;
			});
			if(!companyUrlInfo.selected) {
				companyUrlInfo["selected"] = true;
				tci.loader = true;
				setTrustSrcUrl (companyUrlInfo.urlvalue);
			}
		} 
		
		
		
		function onTciSelect (tickerCikInfo) {
			tci.selctedTickerCikInfo = angular.copy(tickerCikInfo);
			if(!_.isEmpty(tci.selctedTickerCikInfo.companyUrls)) {
				onUlrCardSelect(tci.selctedTickerCikInfo.companyUrls[0]);
			} else {
				setTrustSrcUrl ("");
			}
			cancelAddNewUrl ();
		}
		
		function processResponse (response) {
			var results = response.data.Data;
			tci.tickerCikInfoList = results;
						
			if(response.data.Total) {
				tci.resultCount.Total = response.data.Total;
			} else {
				tci.resultCount.Total = "...";
			}
			
			var pn = tci.query.pageNo;
			
			var _from = ((pn)*tci.query.pageSize);
			var _to = ((pn)*tci.query.pageSize)+tci.tickerCikInfoList.length;
			tci.resultCount.range = _from +" - "+_to+" of "+tci.resultCount.Total;
			
			if(!_.isEmpty(tci.tickerCikInfoList)) {
				onTciSelect (tci.tickerCikInfoList[0]);
			}
		}
		
		function processQuery () {
			var postdata = {};
			
			if(tci.query.companyName && tci.query.companyName != "" && tci.query.companyName != null) {
				postdata["companyName"] = tci.query.companyName;
			}
			if(tci.query.ticker && tci.query.ticker != "" && tci.query.ticker != null) {
				postdata["tickerValue"] = tci.query.ticker;
			}
			if(tci.query.companyUrls && tci.query.companyUrls != "" && tci.query.companyUrls != "All" && tci.query.companyUrls != null) {
				postdata["companyUrls"] = tci.query.companyUrls;
			}
			
			var companyHomeUrl = angular.copy(companyUrl);
			
			if(tci.query.homeURLSource && tci.query.homeURLSource != "" && tci.query.homeURLSource != "All" && tci.query.homeURLSource != null) {
				companyHomeUrl.URLSource = tci.query.homeURLSource;
			}
			if(tci.query.homeURLStatus && tci.query.homeURLStatus != "" && tci.query.homeURLStatus != "All" && tci.query.homeURLStatus != null) {
				companyHomeUrl.URLStatus = tci.query.homeURLStatus;
			}
			if(tci.query.homeURLUpdatedByCurator != "" && tci.query.homeURLUpdatedByCurator != "All" && tci.query.homeURLUpdatedByCurator != null) {
				companyHomeUrl.URLUpdatedByCurator = tci.query.homeURLUpdatedByCurator;
			}
			if(tci.query.homeURLComment != "" && tci.query.homeURLComment != null) {
				companyHomeUrl.Comment = tci.query.homeURLComment;
			}
			
			postdata["HomeUrl"] = companyHomeUrl;
			
			var companyIrUrl = angular.copy(companyUrl);
			
			if(tci.query.irURLSource && tci.query.irURLSource != "" && tci.query.irURLSource != "All" && tci.query.irURLSource != null) {
				companyIrUrl.URLSource = tci.query.irURLSource;
			}
			if(tci.query.irURLStatus && tci.query.irURLStatus != "" && tci.query.irURLStatus != "All" && tci.query.irURLStatus != null) {
				companyIrUrl.URLStatus = tci.query.irURLStatus;
			}
			if(tci.query.irURLUpdatedByCurator != "" && tci.query.irURLUpdatedByCurator != "All" && tci.query.irURLUpdatedByCurator != null) {
				companyIrUrl.URLUpdatedByCurator = tci.query.irURLUpdatedByCurator;
			}
			if(tci.query.irURLComment != "" && tci.query.irURLComment != null) {
				companyIrUrl.Comment = tci.query.irURLComment;
			}
			
			postdata["IrUrl"] = companyIrUrl;
			
			var companyCpUrl = angular.copy(companyUrl);
			
			if(tci.query.cpURLSource && tci.query.cpURLSource != "" && tci.query.cpURLSource != "All" && tci.query.cpURLSource != null) {
				companyCpUrl.URLSource = tci.query.cpURLSource;
			}
			if(tci.query.cpURLStatus && tci.query.cpURLStatus != "" && tci.query.cpURLStatus != "All" && tci.query.cpURLStatus != null) {
				companyCpUrl.URLStatus = tci.query.cpURLStatus;
			}
			if(tci.query.cpURLUpdatedByCurator != "" && tci.query.cpURLUpdatedByCurator != "All" && tci.query.cpURLUpdatedByCurator != null) {
				companyCpUrl.URLUpdatedByCurator = tci.query.cpURLUpdatedByCurator;
			}
			if(tci.query.cpURLComment != "" && tci.query.cpURLComment != null) {
				companyCpUrl.Comment = tci.query.cpURLComment;
			}
			
			postdata["CpUrl"] = companyCpUrl;
			
			var companyPrUrl = angular.copy(companyUrl);
			
			if(tci.query.prURLSource && tci.query.prURLSource != "" && tci.query.prURLSource != "All" && tci.query.prURLSource != null) {
				companyPrUrl.URLSource = tci.query.prURLSource;
			}
			if(tci.query.prURLStatus && tci.query.prURLStatus != "" && tci.query.prURLStatus != "All" && tci.query.prURLStatus != null) {
				companyPrUrl.URLStatus = tci.query.prURLStatus;
			}
			if(tci.query.prURLUpdatedByCurator != "" && tci.query.prURLUpdatedByCurator != "All" && tci.query.prURLUpdatedByCurator != null) {
				companyPrUrl.URLUpdatedByCurator = tci.query.prURLUpdatedByCurator;
			}
			if(tci.query.prURLComment != "" && tci.query.prURLComment != null) {
				companyPrUrl.Comment = tci.query.prURLComment;
			}
			
			postdata["PrUrl"] = companyPrUrl;
			
			postdata["pageSize"] = tci.query.pageSize;
			postdata["pageNo"] = tci.query.pageNo;
			return postdata;
		}
		
		function resetPage() {
			tci.query.pageNo = 0;
		}
		
		function getTickerCikInfoList (reset) {
			if(reset) {
				resetPage();
			}
			tci.selctedTickerCikInfo = {};
			tci.trustSrcUrl = "";
			var query = processQuery();
			TickerCikInfoService.getAllTickerCikInfo(query).then(function(response){
				if(response.status == 200 && response.data.Status) {
					processResponse (response);
				}
			});
		}
		
		function prev() {
			if(tci.query.pageNo > 0) {
				tci.query.pageNo = (tci.query.pageNo-1);
				getTickerCikInfoList();
			}
			
		}
		
		function next() {
			if(tci.tickerCikInfoList.length == tci.query.pageSize) {
				tci.query.pageNo = (tci.query.pageNo+1);
				getTickerCikInfoList();
			} 
		}
		
		function refreshSource () {
			tci.newCompanyUrlInfo.urlsource = tci.UrlUpdateSourceOptions[tci.newCompanyUrlInfo.urltype.value][0];
		}
		
		function getUrlUpdateSourceOptions (urltype,search) {
			var newSupes = angular.copy(tci.UrlUpdateSourceOptions[urltype]);
		      if (search && newSupes.indexOf(search) === -1) {
		        newSupes.unshift(search+" (new)");
		      }
		      return newSupes;
		}
		
		
		function showAddNewCompanyUrlBtn () {
			var status = false;
			var tempEdittedObj = _.findWhere(tci.selctedTickerCikInfo.companyUrls,{"edited" : true});
			if(!tci.showAddNewCompanyUrlCard && _.isEmpty(tempEdittedObj) && (_.isEmpty(tci.selctedTickerCikInfo.companyUrls) || tci.selctedTickerCikInfo.companyUrls.length < TickerCikInfoService.urlUpdateTypeOptions.length)) {
				status = true;
			}
			return status;
		}
		
		function showAddNewCUCard (companyUrls) {
			tci.urlUpdateTypeOptions = [];
			var tempCompanyUrlTypes = angular.copy(TickerCikInfoService.urlUpdateTypeOptions);
			_.each(tempCompanyUrlTypes, function(companyUrlType){
				var matchedUrlObj = _.findWhere(companyUrls,{"urltype":companyUrlType.value});
				if(_.isEmpty(matchedUrlObj)) {
					tci.urlUpdateTypeOptions.push(companyUrlType);
				}
			});
			tci.newCompanyUrlInfo["urltype"] = tci.urlUpdateTypeOptions[0];
			tci.newCompanyUrlInfo["urlsource"] = tci.UrlUpdateSourceOptions[tci.newCompanyUrlInfo.urltype.value][0];
			tci.newCompanyUrlInfo["urlstatus"] = tci.urlUpdateStatusOptions[0];
			tci.showAddNewCompanyUrlCard = true;
		}
		
		function cancelAddNewUrl () {
			tci.showAddNewCompanyUrlCard = false;
			tci.newCompanyUrlInfo = {};
		}
		
		function validURL(str) {
			var pattern = new RegExp("^(http:\/\/|https:\/\/|ftp:\/\/|www.){1}([0-9A-Za-z]+\.)");
			if(!pattern.test(str)) {
				return false;
			} else {
				return true;
			}
		}
		
		function saveNewUrl () {
			if(tci.newCompanyUrlInfo.urlvalue && validURL(tci.newCompanyUrlInfo.urlvalue) && !_.isEmpty(tci.newCompanyUrlInfo.urlsource)) {
				var postdata = {};
				postdata["cik"] = tci.selctedTickerCikInfo.cik;
				postdata["urlType"] = tci.newCompanyUrlInfo.urltype.value;
				postdata["urlValue"] = tci.newCompanyUrlInfo.urlvalue;
				if(!_.isEmpty(tci.newCompanyUrlInfo.urlsource) && tci.newCompanyUrlInfo.urlsource.indexOf(" (new)")) {
					tci.newCompanyUrlInfo.urlsource = tci.newCompanyUrlInfo.urlsource.replace(" (new)",'');
				}
				postdata["urlSource"] = tci.newCompanyUrlInfo.urlsource;
				postdata["urlStatus"] = tci.newCompanyUrlInfo.urlstatus;
				if(!_.isEmpty(tci.newCompanyUrlInfo.comment)) {
					postdata["comment"] = tci.newCompanyUrlInfo.comment;
				}
				
				TickerCikInfoService.updateCompanyUrl(postdata).then(function(response){
					if(response.status == 200 && response.data.Status) {
						getUrlSourceList (tci.newCompanyUrlInfo.urltype.value);
						var tempSelectedCompany = _.findWhere(tci.tickerCikInfoList,{"id":tci.selctedTickerCikInfo.id});
						var newCompanyUrlObj = {};
						newCompanyUrlObj["urltype"] = tci.newCompanyUrlInfo.urltype.value;
						newCompanyUrlObj["urlvalue"] = tci.newCompanyUrlInfo.urlvalue;
						newCompanyUrlObj["urlsource"] = tci.newCompanyUrlInfo.urlsource;
						newCompanyUrlObj["urlstatus"] = tci.newCompanyUrlInfo.urlstatus;
						if(!_.isEmpty(tci.newCompanyUrlInfo.comment)) {
							newCompanyUrlObj["comment"] = tci.newCompanyUrlInfo.comment;
						}
						if(!_.isEmpty(tempSelectedCompany.companyUrls)) {
							tempSelectedCompany.companyUrls.push(newCompanyUrlObj);
							tci.selctedTickerCikInfo = angular.copy(tempSelectedCompany);
						} else {
							tempSelectedCompany["companyUrls"] = [];
							tempSelectedCompany.companyUrls.push(newCompanyUrlObj);
							tci.selctedTickerCikInfo = angular.copy(tempSelectedCompany);
						}
						onUlrCardSelect(tci.selctedTickerCikInfo.companyUrls[tci.selctedTickerCikInfo.companyUrls.length-1]);
						cancelAddNewUrl ();
					}
				});
			}
		}
		
		
		function deleteCompanyUrlsInfo (companyUrlsInfo) {
			var confirmText = 'Are you sure you want to delete selected URL Type "'+companyUrlsInfo.urltype+'" ?';
			$confirm({text: confirmText})
	        .then(function() {
	        	var postdata = {};
				postdata["cik"] = tci.selctedTickerCikInfo.cik;
				postdata["urlType"] = companyUrlsInfo.urltype;
				TickerCikInfoService.removeCompanyUrl(postdata).then(function(response){
					if(response.status == 200 && response.data.Status) {
						var tempSelectedCompany = _.findWhere(tci.tickerCikInfoList,{"id":tci.selctedTickerCikInfo.id});
						if(!_.isEmpty(tci.selctedTickerCikInfo.companyUrls)) {
							var tempCompanyUrls = _.without(tci.selctedTickerCikInfo.companyUrls,_.findWhere(tci.selctedTickerCikInfo.companyUrls,{"urltype":companyUrlsInfo.urltype}));
							tci.selctedTickerCikInfo.companyUrls = tempCompanyUrls;
							tempSelectedCompany.companyUrls = tempCompanyUrls;
							if(companyUrlsInfo.selected) {
								if(!_.isEmpty(tci.selctedTickerCikInfo.companyUrls)) {
									onUlrCardSelect(tci.selctedTickerCikInfo.companyUrls[0]);
								} else {
									setTrustSrcUrl ("");
								}
							}
						}
					}
				});
		    });
		}
		
		function editCompanyUrlsInfo (companyUrlsInfo) {
			companyUrlsInfo["edited"] = true;
		}
		
		function showUrlCardActions () {
			var status = true;
			var tempEdittedObj = _.findWhere(tci.selctedTickerCikInfo.companyUrls,{"edited" : true});
			if(tci.showAddNewCompanyUrlCard || !_.isEmpty(tempEdittedObj)) {
				status = false;
			}
			return status;
		}
		
		function setDefaultCompanyUrlsInfo (companyUrlsInfo) {
			var tempSelectedCompany = _.findWhere(tci.tickerCikInfoList,{"id":tci.selctedTickerCikInfo.id});
			if(!_.isEmpty(tempSelectedCompany.companyUrls)) {
				var editedUrlObject = _.findWhere(tempSelectedCompany.companyUrls,{"urltype":companyUrlsInfo.urltype});
				companyUrlsInfo.urlvalue = editedUrlObject.urlvalue;
				companyUrlsInfo.urlsource = editedUrlObject.urlsource
				companyUrlsInfo.urlstatus = editedUrlObject.urlstatus;
				companyUrlsInfo["comment"] = editedUrlObject["comment"];
			}
		}
		
		function cancelUrlEdit (companyUrlsInfo) {
			setDefaultCompanyUrlsInfo (companyUrlsInfo);
			companyUrlsInfo.edited = false;
		}
		
		function saveEditedUrl (companyUrlsInfo) {
			if(companyUrlsInfo.urlvalue && validURL(companyUrlsInfo.urlvalue) && !_.isEmpty(companyUrlsInfo.urlsource)) {
				var postdata = {};
				postdata["cik"] = tci.selctedTickerCikInfo.cik;
				postdata["urlType"] = companyUrlsInfo.urltype;
				postdata["urlValue"] = companyUrlsInfo.urlvalue;
				postdata["urlStatus"] = companyUrlsInfo.urlstatus;
				if(!_.isEmpty(companyUrlsInfo.urlsource) && companyUrlsInfo.urlsource.indexOf(" (new)")) {
					companyUrlsInfo.urlsource = companyUrlsInfo.urlsource.replace(" (new)",'');
				}
				postdata["urlSource"] = companyUrlsInfo.urlsource;
				
				if(_.isEmpty(companyUrlsInfo.comment)) {
					companyUrlsInfo.comment = "";
				}
				
				postdata["comment"] = companyUrlsInfo.comment;
				TickerCikInfoService.updateCompanyUrl(postdata).then(function(response){
					if(response.status == 200 && response.data.Status) {
						getUrlSourceList (companyUrlsInfo.urltype);
						companyUrlsInfo.edited = false;
						var tempSelectedCompany = _.findWhere(tci.tickerCikInfoList,{"id":tci.selctedTickerCikInfo.id});
						if(!_.isEmpty(tempSelectedCompany.companyUrls)) {
							var editedUrlObject = _.findWhere(tempSelectedCompany.companyUrls,{"urltype":companyUrlsInfo.urltype});
							editedUrlObject.urlstatus = companyUrlsInfo.urlstatus;
							editedUrlObject.urlsource = companyUrlsInfo.urlsource;
							editedUrlObject["comment"] = companyUrlsInfo.comment;
							if(companyUrlsInfo.selected && editedUrlObject.urlvalue != companyUrlsInfo.urlvalue) {
								editedUrlObject.urlvalue = companyUrlsInfo.urlvalue;
								tci.loader = true;
								setTrustSrcUrl (editedUrlObject.urlvalue);
							}
						}
					} else {
						setDefaultCompanyUrlsInfo (companyUrlsInfo);
					}
				});
			}
		}
		
		function openCompanyUrl () {
			return $sce.trustAsResourceUrl(tci.trustSrcUrl);
		}
		
		function onLoad () {
			var $head = $("#tci-iframe").contents().find("head"); 
			var css = '<style type="text/css">body {display:block !important;}</style>';
			$head.append(css);
			tci.loader = false;
		}
		
		function compressCont () {
			tci.showExpButton = true;
			tci.isolateCont = false;
		}
		
		function expandCont () {
			tci.showExpButton = false;
			tci.isolateCont = true;
		}
		
		getAllUrlSourcesList ();
	}
		
})();