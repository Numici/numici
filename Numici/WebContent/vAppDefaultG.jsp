<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="cache-control" content="max-age=0" />
<meta http-equiv="cache-control" content="no-cache" />
<meta http-equiv="expires" content="0" />
<meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
<meta http-equiv="pragma" content="no-cache" />
<title></title>

<link rel="stylesheet" href="resources/js/libs/jquery/pepper-grinder/jquery-ui.min.css"></link>

<!-- <link rel="stylesheet" href="resources/css/gray-theme/jquery-ui-1.10.3.custom.css"></link> -->
	
<!-- <link rel="stylesheet" href="//code.jquery.com/ui/1.11.0/themes/pepper-grinder/jquery-ui.css"></link> -->

<link href="resources/css/bootstrap.min.css" rel="stylesheet" media="screen">
<link href="resources/css/bootstrap-theme.min.css" rel="stylesheet" media="screen">
<link rel="stylesheet" href="resources/css/custom1.css?20160301"></link>
<link href="resources/css/c3.css" rel="stylesheet">
<link href="resources/css/jquery-te-1.4.0.css" rel="stylesheet">
<link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">
<link href="resources/js/jstree/themes/default/style.min.css" rel="stylesheet">
<style type="text/css">


.vapp-control{
  background-color: transparent;
}

.aggregates, .locked {
	background-color: rgba(125, 148, 7, 0.2);
}

body {
	overflow-x: hide;
}

.vdvc-error {
	box-shadow: 0px 0px 9px 1px red;
}

.container-fluid {
	padding-right: 0px;
	padding-left: 0px;
	margin-right: auto;
	margin-left: auto;
}

.vapp-menubar {
	box-shadow: 0px 1px 4px rgba(227, 78, 78, 0.3);
	padding-top: 5px;
	padding-bottom: 5px;
	background-color: rgba(125, 148, 7, 0.2);
	padding-right: 15px;
	padding-left: 15px;
}

/* .vapp-menubar span.icon {
	padding: 5px;
	width: 25px;
	height: 25px;
	text-align: center;
}

.vapp-menubar span:hover {
	box-shadow: 0px 1px 4px rgba(0,0,0,.3);
}

.vapp-menubar  div.vapp-menu-items {
	width: 200px;
	max-height: 300px;
	overflow-x: hidden;
	overflow-y: auto;
	display: none;
	background-color: rgb(242, 251, 247);
	box-shadow: 0px 4px 10px 4px grey;
}

div.vapp-menu-items div{
	height: 20px;
	padding-left: 8px;
	padding-right: 8px;
}

.vapp-menu-items div:hover{
	background-color: rgba(0,0,0,.2);
}

.vapp-menubar .vapp-menu {
	display: inline-table;
}
 */
.vapp-header {
	height: 90px;
}

#titleBar {
	color: white;
	background: #093855;
	height: 40px;
}

#titleBar>div {
	padding-top: 5px;
	padding-bottom: 5px;
}

.dropdown-submenu {
    position:relative;
}
.dropdown-submenu>.dropdown-menu {
    top:0;
    left:100%;
    margin-top:-6px;
    margin-left:-1px;
    -webkit-border-radius:0 6px 6px 6px;
    -moz-border-radius:0 6px 6px 6px;
    border-radius:0 6px 6px 6px;
}
.dropdown-submenu:hover>.dropdown-menu {
    display:block;
}
.dropdown-submenu>a:after {
    display:block;
    content:" ";
    float:right;
    width:0;
    height:0;
    border-color:transparent;
    border-style:solid;
    border-width:5px 0 5px 5px;
    border-left-color:#cccccc;
    margin-top:5px;
    margin-right:-10px;
}
.dropdown-submenu:hover>a:after {
    border-left-color:#ffffff;
}
.dropdown-submenu.pull-left {
    float:none;
}
.dropdown-submenu.pull-left>.dropdown-menu {
    left:-100%;
    margin-left:10px;
    -webkit-border-radius:6px 0 6px 6px;
    -moz-border-radius:6px 0 6px 6px;
    border-radius:6px 0 6px 6px;
}



.tick {
	border: 1px solid transparent;
	/*follows slide handle style for sizing purposes*/
	position: absolute;
	width: 100%;
	margin-left: -.6em;
	text-align: center;
	left: 0;
}


.container-fluid  .row {
	margin: 0;
}

#actionBar {
	margin-top: 2px;
}

.tableArea {
	overflow: scroll;
}

.tableArea table tr td {
	box-sizing: content-box;
	-webkit-box-sizing: content-box;
	-moz-box-sizing: content-box;
	border: .09em solid #CCC;
	height: 25px;
	width: 150px;
	empty-cells: show;
	line-height: 21px;
	padding: 0 4px 0 4px;
	text-align: center;
	font-size: 12px;
	vertical-align: top;
	overflow: hidden;
	outline-width: 0;
	white-space: pre-wrap;
}

.footer {
	clear: both;
	position: relative;
	z-index: 10;
	height: 3em;
	margin-top: -3em;
	text-align: center;
	height: 50px;
}

.footer>a {
	color: blue;
}

div[data-holder="user_details"] {
	text-align: right;
	padding-top: 9px !important;
	padding-right: 10px;
}

#exitVapp {
	float: left;
}

#resultArea div:first-child {
	padding-left: 0px;
}

#resultArea div:last-child {
	padding-right: 0px;
}

#Importmenu ul {
	width: 200px;
}
</style>

<script type="text/javascript" src="resources/js/libs/jquery/jquery-1.10.2.js"></script>
 
 
 

<!-- <script type="text/javascript" src="resources/js/libs/jquery/jquery-1.9.1.js"></script>	 -->
<!-- <script type="text/javascript" src="resources/js/jquery.event-trace.js"></script> -->	
<script type="text/javascript" src="resources/js/libs/bootstrap/bootstrap.min.js"></script>
 <script src="resources/js/libs/jquery/jquery-ui-1.11.0.min.js"></script>
<!-- <script type="text/javascript" src="resources/js/libs/jquery/jquery-ui-1.10.3.custom.min.js?20160301"></script> -->
<script type="text/javascript" src="resources/js/libs/chartinglibs/d3.min.js?20160301" charset="utf-8"></script>
<script type="text/javascript" src="resources/js/libs/chartinglibs/crossfilter.min.js?20160301"></script>
<script type="text/javascript" src="resources/js/libs/chartinglibs/c3.min.js?20160301"></script>
<!-- <script type="text/javascript" src="resources/js/libs/chartinglibs/c3Extensions.js?20160301"></script> -->

<link href="resources/js/appGrid/gridstack.css" rel="stylesheet">
<link href="resources/js/appGrid/gridstack-extra.css" rel="stylesheet">

<script type="text/javascript"
	src="resources/js/libs/jquery/jquery.fileupload.js?20150927"></script>

<script src="//cdn.ckeditor.com/4.4.7/full/ckeditor.js"></script>

<script type="text/javascript" src="resources/js/libs/underscore.js?20160301"></script>
<script type="text/javascript" src="resources/js/libs/numeral.js?20160301"></script>
<script type="text/javascript" src="resources/js/libs/languages.js?20160301"></script>


<script type="text/javascript" src="resources/js/appGrid/gridstack.js"></script>

<script type="text/javascript" src="resources/js/jstree/jstree.min.js?20160301"></script>

<script type="text/javascript" src="resources/js/vdvcInputs.js?20160301"></script>
<script type="text/javascript" src="resources/js/chartGenerator.js?20160301"></script>
<script type="text/javascript" src="resources/js/Utils.js?20160301"></script>
<script type="text/javascript" src="resources/js/Utils/validation.js?20160301"></script>
<script type="text/javascript" src="resources/js/Utils/dataformatter.js?20160301"></script>
<script type="text/javascript" src="resources/js/vdvcUndoRedo.js?20160301"></script>
<script type="text/javascript" src="resources/js/excelGrid.js?20160301"></script>
<script type="text/javascript" src="resources/js/AnnotationManager.js?20160301"></script>
<script type="text/javascript" src="resources/js/HistoryManager.js?20160301"></script>

<script type="text/javascript" src="resources/js/appGrid/vdvcTagManager.js?20160301"></script>

<!-- <script type="text/javascript" src="resources/js/appGrid/Control.js?20160301"></script>
<script type="text/javascript" src="resources/js/appGrid/ContainerControl.js?20160301"></script>
<script type="text/javascript" src="resources/js/appGrid/Screen.js?20160301"></script> -->


<script type="text/javascript" src="resources/js/appGrid/Control.js?20160301"></script>
<script type="text/javascript" src="resources/js/appGrid/ContainerControl.js?20160301"></script>
<script type="text/javascript" src="resources/js/appGrid/Screen.js?20160301"></script>

<script type="text/javascript" src="resources/js/appGrid/GroupControl.js?20160301"></script>
<script type="text/javascript" src="resources/js/appGrid/ChartControl.js?20160301"></script>
<script type="text/javascript" src="resources/js/appGrid/CompositeChartControl.js?20160301"></script>
<script type="text/javascript" src="resources/js/appGrid/CompositeFilterControl.js?20160301"></script>
<script type="text/javascript" src="resources/js/appGrid/VidiViciControl.js?20160301"></script>
<script type="text/javascript" src="resources/js/appGrid/LayoutControl.js?20160301"></script>
<script type="text/javascript" src="resources/js/appGrid/MenubarControl.js?20160301"></script>
<script type="text/javascript" src="resources/js/appGrid/Button.js?20160301"></script>
<script type="text/javascript" src="resources/js/appGrid/TextControl.js?20160301"></script>
<script type="text/javascript" src="resources/js/appGrid/AnnotationControl.js?20160301"></script>
<script type="text/javascript" src="resources/js/appGrid/ScalarControl.js?20160301"></script>
<script type="text/javascript" src="resources/js/appGrid/TagControl.js?20160301"></script>
<script type="text/javascript" src="resources/js/appGrid/WorkFlowDashBoardControl.js?03-30"></script>

<script type="text/javascript" src="resources/js/appGrid/ScreenFactory.js?20160301"></script>
<script type="text/javascript" src="resources/js/vappDesigner/customDesigner.js?20160301"></script>
<script type="text/javascript" src="resources/js/vappDesigner/LayoutDesigner.js?20160301"></script>
<script type="text/javascript" src="resources/js/appGrid/ControlFactory.js?20160301"></script>

<!-- <script type="text/javascript" src="resources/js/newVapp.js?20160301"></script> -->



<script type="text/javascript" src="resources/js/ImportWizard.js?20160301"></script>
<script type="text/javascript" src="resources/js/finDtaImpWizard.js?20160301"></script>
<script type="text/javascript" src="resources/js/finEdgarDataImpWizard.js?20160301"></script>
<script type="text/javascript" src="resources/js/finEdgarDataImpWizard2.js?20160301"></script>
<script type="text/javascript" src="resources/js/finBEADataImpWizard.js?20160301"></script>
<script type="text/javascript" src="resources/js/finBLSDataImpWizard.js?20160301"></script>
<script type="text/javascript" src="resources/js/form13FimportWizard.js?20160301"></script>
<script type="text/javascript" src="resources/js/dbDataImpWizard.js?20160301"></script>





<script type="text/javascript" src="resources/js/vappRunTime.js?20151123"></script>

<script type="text/javascript">

function windowController(){
	var wnd=null;
	var loadedWindows = [];
	
	this.openWindow=function(wndUrl, wndName){
		var wndObj=findWindow(wndName);
		if(wndObj !== null && wndObj.name === "vdvcBuilder"){
			wndObj.focus();
		}else{
			wnd=window.open(wndUrl,wndName);
			wnd.focus();
			loadedWindows.push(wnd);
		}
		
	};
	
	this.closeWindows=function(){
		for(var i=0;i<loadedWindows.length;i++){
			if(loadedWindows[i].closed == false){
				loadedWindows[i].close();
			}
		}
		loadedWindows=[];
	};
	this.findWindow=function(wndName){
		for (var i=0; i< loadedWindows.length; i++){
			if (loadedWindows[i].name == wndName){
				return loadedWindows[i];
			}
		}
		return null;
	};
	return this;
}



var myTimer;
var interval=600000;
var childwindows={};
var _windowController=windowController();

function sessionExpiryHandler() {
	console.log("Timer fired - redirecting to logout.jsf");
	_windowController.closeWindows();
	window.location = './logout.jsf';
}
 function resetSessionExpiry() {
	 console.log("Interval is " + interval);
	 if ( myTimer )
	 	clearInterval(myTimer);
	 myTimer = setInterval(function(){ sessionExpiryHandler(); }, interval);
	 console.log("Timer set");
 }

 function initSessionExpiry() {
	 if ( document.getElementById('interval') ) {
		 interval =  document.getElementById('interval').value;
		 console.log('Interval is found');
	 } else {
		 interval = 11*60;
		 console.log('Hidden field not found');
	 }
	 interval = interval  * 1000;
	 resetSessionExpiry();
 }
</script>

<style type="text/css">
 .ctrl-wrapper {
  	background-color: white;
 }
 
 .groupControl > .ctrl-wrapper {
  	background-color: transparent;
 }
 
 .grid-stack>.grid-stack-item>.grid-stack-item-content {
	top: 5px;
	left: 5px;
	right: 5px;
	
}

.grid-stack .grid-stack-placeholder>.placeholder-content {
	border: 2px dotted #006699;
	top: 5px;
	left: 5px;
	right: 5px;
	background-color: rgba(0, 102, 153, 0.39);
}
 
 
</style>

</head>

<body style="background-color: #999999;">
	<nav class="navbar navbar-default navbar-fixed-top" style="z-index:100;">
  		<div class="container-fluid">
  			<div class="row" id="titleBar">
				<div class="col-xs-3 " data-holder="ent_name"
					style="font-size: 18px;"></div>
				<div class="col-xs-6" data-holder="vApp_name"
					style="text-align: center; font-size: 18px;"></div>
				<div class="col-xs-2" data-holder="user_details">
					<!-- <div class="btn-group">
						<button class="btn btn-default">User Details</button>
						<button data-toggle="dropdown"
							class="btn btn-default dropdown-toggle">
							<span class="caret"></span>
						</button>
						<ul class="dropdown-menu" id="userDetails">
	
						</ul>
					</div> -->
	
				</div>
				<div class="col-xs-1" style="padding-left: 0px;">
					<button style="color: white;" id="exitVapp" class="btn btn-sm btn-primary">close</button>
				</div>
			</div>
			<div class="row vapp-menubar" >
				<div class="col-sm-4">
					<div class="btn-group" role="group" >
					<div class="dropdown">
		  			 <button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-expanded="true">
		   				 Workspace<span class="caret"></span>
		  			 </button>
					  <ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1">
					    <li role="presentation" data-id="createWsps" ><a role="menuitem" tabindex="-1" href="#">Create</a></li>
					    <li role="presentation" data-id="cloneWsps"><a role="menuitem" tabindex="-1" href="#">Clone</a></li>
					    <li role="presentation" data-id="saveWsps" ><a role="menuitem" tabindex="-1" href="#">Save</a></li>
					    <li role="presentation" data-id="compareWsps"><a role="menuitem" tabindex="-1" href="#">Compare</a></li>
					  </ul>
					</div>
				</div>
				<div class="btn-group" role="group" >
					<select data-role="workspaceList" class="form-control" style="max-width: 200px;"></select>
				</div>
				
				<button class="btn btn-default customButton" role="prevScrn" action="prev" disabled>Prev</button>
				<button class="btn btn-default customButton" role="nextScrn" action="next" disabled>Next</button>
				</div>
				
					<div class="col-xs-2" >
					<ul id="Importmenu" style="border-radius: 5px;" >
					 <li style="padding: 5px;" class="main-menu">Import
					        <ul>
					          <li data-btn-role="csvImport" style="height: 20px;" class="menu-action ">
					         	CSV<input type="file" class="file-upload" value="Import" style="position: absolute;top:0px;left: 0px;" />
					          </li>
					          <li data-btn-role="dbDataImport" class="menu-action">DB Data</li>
					          <li data-btn-role="form13fImport" class="menu-action">Form 13F</li>
					          
					          <li>Financial Data
					          	<ul>
						          <li data-btn-role="quoteHistory" class="menu-action">Quote History</li>
						          <li data-btn-role="dividendHistory" class="menu-action">Dividend History</li>
						          <li>Edgar Data
						          	<ul>
							          <li data-btn-role="balanceSheetHistory" class="menu-action">Balance Sheet</li>
							          <li data-btn-role="incomeStatementHistory" class="menu-action">Income Statement</li>
							          <li data-btn-role="cashFlowStatementHistory" class="menu-action">Cash Flow</li>
							          <li data-btn-role="valuationRatiosHistory" class="menu-action">Valuation Ratios</li>
							          <li data-btn-role="profitabilityRatiosHistory" class="menu-action">Profitability Ratios</li>
							        </ul>
						          </li>
						          <li>Edgar Data 2
						          	<ul>
							          <li data-btn-role="balanceSheetHistory2" class="menu-action">Balance Sheet</li>
							          <li data-btn-role="incomeStatementHistory2" class="menu-action">Income Statement</li>
							          <li data-btn-role="cashFlowStatementHistory2" class="menu-action">Cash Flow</li>
							          <li data-btn-role="valuationRatiosHistory2" class="menu-action">Valuation Ratios</li>
							          <li data-btn-role="profitabilityRatiosHistory2" class="menu-action">Profitability Ratios</li>
							        </ul>
						          </li>
						          <li>BEA Data
						          	<ul>
							          <li data-btn-role="beaGDPbyIndustryHistory" class="menu-action">GDP by Industry</li>
							        </ul>
						          </li>
						          <li>BLS Data
						          	<ul>
							          <li data-btn-role="blsConsumerPriceIndexHistory" class="menu-action">Consumer Price Index</li>
							          <li data-btn-role="blsProductPriceIndexHistory" class="menu-action">Product Price Index</li>
							        </ul>
						          </li>
						        </ul>
					          </li>
					        </ul>
					 </li>
					</ul>
				</div>
				
				
				
				<div class="col-sm-6">
					<div class="vdvc-vapp-menu" style="float:right;display: inline-block;"></div>	
				</div>	
				
				<!-- <div class="vapp-menu">
				<span id="createWsps" class="fa fa-th-large icon" data-toggle="tooltip" data-placement="bottom" title="create workspace"></span>
			</div> -->
			<!-- <div class="vapp-menu">
				<span id="openWsps" class="fa fa-folder-open icon" data-toggle="tooltip" data-placement="bottom" title="switch workspace"></span>
				<div class="vapp-menu-items"></div>
				
			</div> -->
  			</div>
  		</div>	
	</nav>

	<div class="container-fluid">
		<div class="row vapp-header">
		</div>
		<div class="row vapp-content">
			<div  class="vdvc-screen"  style="height:100%;width:100%;padding-left: 5px;padding-right: 5px;padding-bottom: 5px;"></div>
		</div>
		
		<!-- <div class="footer">
			<a href="" style="color: blue;">Vidi Vici Technologies- Visualize
				and Conquer (TM)</a>
		</div> -->
		
		<div class="revisionHistory"></div>
		<form id="form1">
	    	<input type="hidden" id="interval" value="<%= session.getMaxInactiveInterval()%>"/>
	    </form>
	    
    </div>
    
    
</body>
</html>
