<!DOCTYPE html>
<html data-ng-app="vdvcApp" data-ng-controller="AppController">
<head>

<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta http-equiv="expires" content="0"/>
<meta name="viewport" content="width=device-width, initial-scale=1,, maximum-scale=1"/>

<base href="/">

<title data-ng-if="PageTitle == companyName"></title>
<title data-ng-if="PageTitle != companyName">{{PageTitle}}</title>

<link rel="icon" href="app/assets/icons/numici.png?20200406-162053" type="image/png" />

<link rel="stylesheet" href="angular-libs/libs/jqueryUi/jquery-ui.min.css">

<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">


<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap-theme.min.css">

<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">

<link rel='stylesheet' href="//cdnjs.cloudflare.com/ajax/libs/angular-loading-bar/0.9.0/loading-bar.min.css" type='text/css' media='all' />

<link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/angular_material/0.11.2/angular-material.min.css">

<link rel="stylesheet" href="angular-libs/animate.css">
<link rel="stylesheet" href="angular-libs/select.min.css">

<link rel="stylesheet" href="angular-libs/awesome-bootstrap-checkbox.css">

<link rel="stylesheet" href="angular-libs/toaster.min.css">

<link rel="stylesheet" href="angular-libs/xeditable.min.css">

<link rel="stylesheet" href="angular-libs/colorpicker.css">

<!-- <link rel="stylesheet" href="app/assets/css/bootstrap-cust.css">

<link rel="stylesheet" href="app/assets/css/app.css"> -->

<link rel="stylesheet" href="angular-libs/libs/angularCanvasViewer/CanvasViewer.css">
<link rel="stylesheet" href="app/assets/cssmin/app.min-20230714-151520.css">
<link rel="stylesheet" href="angular-libs/libs/pdfjs-dist/web/pdf_viewer.css?20210616-175811">
<link type="text/css" rel="stylesheet" href="angular-libs/angular-flash.min.css" />
<link href="https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,600i,700,700i,800,800i|Roboto:100,100i,300,300i,400,400i,500,500i,700,700i,900,900i" rel="stylesheet">
<style type="text/css">
	body {
        font-family: 'Roboto',sans-serif !important;
    }	
    
    
    .doc-viewr .doc-container .comment-wrap,
    .email-document-wrap .comment-wrap {
    	overflow: hidden;
    }
    .comment-wrap .tab-content {
    	height: calc(100% - 95px);
    }
    
    .comment-wrap .tab-pane {
    	height: 100%;
    }
    
    .comment-wrap .nav-tabs>li.active>a,
    .comment-wrap .nav-tabs>li.active>a:focus,  
    .comment-wrap .nav-tabs>li.active>a:hover {
	    color: #fff;
	    cursor: default;
	    background-color: #069;
	    border: 1px solid #ddd;
	    border-bottom-color: transparent !important;
    }
    
    @media print {
    	a[href]:after { content: none !important; }
	}
    
</style>
</head>
<!-- <body data-ng-app="vdvcApp" style="background-color: #EEEEEE;" class="layout-row" data-layout="column"> -->

<body data-bs-breakpoint data-orientation-change data-window-resize data-fit-window-to-popup style="background-color: #EEEEEE;" class="layout-row" data-layout="column">

	<div class="row full">
		<div data-ui-view data-name="nav"></div>
		<div class="full" data-ui-view data-name="content" style="position: relative;"></div>
	</div>
	<div class="loading-bar-container"></div>
<script type="text/javascript" src="resources/js/libs/jquery/jquery-1.10.2.js"></script>
<script type="text/javascript" src="angular-libs/libs/jqueryUi/jquery-ui.min.js"></script>
<script type="text/javascript" src="angular-libs/libs/jqueryTouch/jquery.ui.touch-punch.min.js"></script>

<script type="text/javascript" src="angular-libs/libs/UAParser/ua-parser.min.js"></script>

<script type="text/javascript" src="angular-libs/libs/jqueryMobile/jquery.mobile.custom.min.js"></script>


<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.5/js/bootstrap.min.js"></script>

<script type="text/javascript" src="resources/js/Utils/TextHighlighter.js"></script>
<script type="text/javascript" src="angular-libs/angular.min-1.4.7.js"></script>
<script type="text/javascript" src="angular-libs/underscore-min.js?20211103-221756"></script>
<script type="text/javascript" src="angular-libs/underscore.string.min.js"></script>
<script type="text/javascript"> _.mixin(s.exports()) </script>
<!-- <script type="text/javascript" src="angular-libs/angular-ui-router.min.js"></script> -->
<script type="text/javascript" src="angular-libs/angular-ui-router.min-0.3.1.js"></script>
<script type="text/javascript" src="angular-libs/angular-cookies-1.6.1.js"></script>
<script type="text/javascript" src="angular-libs/angular-flash.js?20210309-201545"></script>
<script type="text/javascript" src="angular-libs/libs/showdown/showdown.min.js"></script>
<script type="text/javascript" src="angular-libs/libs/turndown/turndown.js"></script>
<script type="text/javascript" src="angular-libs/libs/turndown/turndown-plugin-gfm.js"></script>

<script type="text/javascript" src="angular-libs/libs/angularMarkdownFilter/markdown.js"></script>
<script type="text/javascript" src="angular-libs/libs/turndown/angular-turndown.js?20210616-175811"></script>


<script type="text/javascript" src="angular-libs/angular-animate.js"></script>
<script type="text/javascript" src="angular-libs/angular-sanitize.js"></script>
<script type="text/javascript" src="angular-libs/angular-aria.js"></script>
<script type="text/javascript" src="angular-libs/angular-resource.js"></script>
<script type="text/javascript" src="angular-libs/ui-bootstrap-tpls-2.1.3.min.js"></script>

<script type="text/javascript" src="angular-libs/angular-filter.min.js"></script>

<script type="text/javascript" src="angular-libs/angular-inview.js"></script>
<script type='text/javascript' src="//cdnjs.cloudflare.com/ajax/libs/angular-loading-bar/0.9.0/loading-bar.min.js"></script>

<script type="text/javascript" src="angular-libs/toaster.min.js?20170303-201545"></script>

<script type="text/javascript" src="angular-libs/libs/angularDND/angular-dragdrop.min.js"></script>
<!-- <script src="https://rawgithub.com/angular-ui/ui-sortable/master/src/sortable.js"></script> -->
<script src="angular-libs/sortable.js"></script>
<!-- <script type="text/javascript" src="angular-libs/animate.js"></script> -->

<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js"></script>
<script src="angular-libs/angular-moment.js"></script>

<script src="angular-libs/libs/webSockets/angular-websocket.min.js"></script>

<script type="text/javascript" src="angular-libs/libs/timezone/jstz.min.js"></script>

<script src="https://ajax.googleapis.com/ajax/libs/angular_material/0.11.2/angular-material.min.js"></script>

<script type="text/javascript" src="angular-libs/angular-scroll.min.js"></script>

<script src="//cdn.ckeditor.com/4.6.2/full/ckeditor.js"></script> 

<script type="text/javascript" src="angular-libs/libs/angularCanvasViewer/CanvasViewer.js"></script>
<script type="text/javascript" src="angular-libs/libs/angularCanvasViewer/FormatReader.js"></script>

<script type="text/javascript" src="angular-libs/libs/pageslider/angular-pageslide-directive.js"></script>
<!-- <script type="text/javascript" src="resources/js/ckeditor/ckeditor.js"></script> -->







<script type="text/javascript" src="angular-libs/ng-file-upload-all.min.js?20170303-201545"></script>

<script type="text/javascript" src="angular-libs/angular-confirm.min.js?20170303-201545"></script>

<script type="text/javascript" src="angular-libs/xeditable.min.js?20170303-201545"></script>


<script type="text/javascript" src="angular-libs/libs/pdfjs-dist/build/pdf.js?20210616-175811"></script>
<script type="text/javascript">
pdfjsLib.GlobalWorkerOptions.workerSrc = './angular-libs/libs/pdfjs-dist/build/pdf.worker.js?20210616-175811';
</script>
<script type="text/javascript" src="angular-libs/libs/pdfjs-dist/web/pdf_viewer.js?20210616-175811"></script>

<!-- <script type="text/javascript" src="angular-libs/libs/pdfLibs/fabric.js?20170303-201545"></script> -->


<script type="text/javascript" src="angular-libs/select.min.js?20170303-201545"></script>

<script type="text/javascript" src="angular-libs/libs/elastic.js?20170303-201545"></script>

<script type="text/javascript" src="angular-libs/libs/copyToClipboard/angular-clipboard.js?20170303-201545"></script>

<script type="text/javascript" src="angular-libs/angular-local-storage.min.js?20170303-201545"></script>

<script type="text/javascript" src="angular-libs/bootstrap-colorpicker-module.js?20170303-201545"></script>


<script type="text/ng-template" id="typeahead-item.html">
      <div class="typeahead-group-header" ng-if="match.model.firstInGroup">{{match.model.group}}</div>
      <a ui-sref="docview({ docId: match.model.ID })" ng-if="match.model.group=='Document'">
        <span ng-bind-html ="match.label | uibTypeaheadHighlight:query"></span>
      </a>
	  <a class='nf' ui-sref="docview({ docId: match.model.ID })"  ng-if="match.model.group =='News'" 
	     ng-mouseenter ="match.model.scope.showNews($event,match.model)" ng-mouseleave="match.model.scope.hideNews()">
        <span ng-bind-html ="match.label | uibTypeaheadHighlight:query"></span>
      </a> 
      <a ui-sref="docview({ docId: match.model.ID })"  ng-if="match.model.group !='News' && match.model.group !='Document'">
        <span ng-bind-html ="match.label | uibTypeaheadHighlight:query"></span>
      </a> 
</script>

 
<script type="text/javascript" src="resources/js/rangy/rangy-core.js?20170303-201545"></script>

<script type="text/javascript" src="resources/js/rangy/rangy-classapplier.js?20170303-201545"></script>

<script type="text/javascript" src="resources/js/rangy/rangy-textrange.js?20170303-201545"></script>

<script type="text/javascript" src="resources/js/rangy/rangy-highlighter.js?20170303-201545"></script>

<!-- <script type="text/javascript" src="public/compressed/numici.min-20171201-21269.js"></script> -->

<script src="https://accounts.google.com/gsi/client" async defer></script>
<script src="angular-libs/libs/juiceClient/juice.build.js?20170303-201546"></script>

<script>
  window.iFrameResizer = {
    targetOrigin: 'https://www.numici.com',
    onReady: function() {
    	try {
    		document.body.style.height ="auto";
    		document.body.style.paddingBottom = "20px";
    	} catch (e) {
			// TODO: handle exception
		}
    }
  }
</script>
<script type="text/javascript" src="resources/js/iframeResizer/iframeResizer.contentWindow.min.js?20170303-201545"></script>
<script src="angular-libs/libs/uuidv4/uuidv4.min.js?20211028-101755"></script>

<script type="text/javascript" src="public/uncompressed/numici-20241129-185730.js"></script>


</body>
</html>