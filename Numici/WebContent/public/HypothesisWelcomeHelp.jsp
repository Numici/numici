<%@page import="java.util.List"%>
<%@page import="java.util.ArrayList"%>
<%@page import="com.vdvc.DAOFactory"%>
<%@page import="com.vdvc.GlobalDAO"%>
<%@page import="com.vidivici.services.ExtensionPushNotifications"%>
<%@page import="com.vdvc.help.model.HelpTopic"%>
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%
String type="VDVCHelpDesc";
String key="HypothesisWelcome";
String value=null;
boolean isActive=true;
String HypothesisWelcome = "<strong>Name:</strong><p>Numici - Annotate & Converse in Context</p><br><strong>Short Description:</strong><p>Highlight, annotate and converse in context in web pages and PDF documents</p><br><strong>Detailed Description:</strong><p>Use numici extension - a customized version of the hypothesis extension - in conjunction with numici server - to highlight and annotate as well as hold private conversations in the context of web pages and PDF documents. Numici facilitates aggregation of annotations and team conversations on multiple web pages through taskspaces. A taskspace is a container for a collection of related documents and meta data for web pages. Users create a taskspace for each task or project they are working on and invite team members to join the taskspace. When annotating a web page or a PDF document on a web page, the user can choose from previously defined taskspaces (or create a new taskspace) and the annotations and conversations on the page are associated with that taskspace. When a team member with access to the taskspace goes to the web page, they are able to see the prior annotations and take part in the conversations with the team. When a new annotation is added to a taskspace, team members are also notified within the numici application. With numici-Slack integration, conversations in context are posted to the Slack channel associated with the taskspace.</p>";
try {
	GlobalDAO dao = DAOFactory.getDaoObject("global");
	HelpTopic help = dao.getHelp();
	if ( null == help ) {
		help = new HelpTopic();
		help.setTitle("Help");
	}
	if(help.isContext()) {
		List<HelpTopic> helpTopics = help.getTopics();
		for(int i = 0; i < helpTopics.size(); i++) {
			HelpTopic helpTopic = helpTopics.get(i);
			if(helpTopic.isContext() && helpTopic.getTitle().equals("HypothesisWelcome")) {
				List<HelpTopic> welcomeHelpTopics = helpTopic.getTopics();
				if(welcomeHelpTopics.size() > 0) {
					for(int j = 0; j < welcomeHelpTopics.size(); j++) {
						HelpTopic welcomeHelpTopic = welcomeHelpTopics.get(j);
						if(!welcomeHelpTopic.isContext() && welcomeHelpTopic.getTitle().equals("Welcome")) {
							HypothesisWelcome = welcomeHelpTopic.getHelpText();
							break;
						}
					}
				}
				break;
			}
		}
	}
	ExtensionPushNotifications.extentionInstalled(request);
} catch (Exception e) {
	e.printStackTrace();
}
%>
<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge" />
	<meta http-equiv="expires" content="0" />
	<meta name="viewport"
		content="width=device-width, initial-scale=1,, maximum-scale=1" />
	
	<title>Numici Welcome</title>
	
	<link rel="icon" href="app/assets/icons/numici.png?20200406-162053" type="image/png" />
	
	<link rel="stylesheet"
		href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
	
	<link rel="stylesheet"
		href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap-theme.min.css">
	
	<link rel="stylesheet"
		href="//maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css">
	<style type="text/css">
		body {
			background-color: #ffffff;
			padding: 100px 30px 15px;
			font-family: "Droid Sans","Helvetica Neue",Helvetica,Arial,sans-serif!important;
		    font-size: 14px;
		    line-height: 1.42857143;
		    -webkit-font-smoothing: antialiased!important;
		    width: 100%;
		    height: 100%;
		    background: #EEE;
		}
		
		#hypothesis-welcome-content {
			padding: 30px;
    		background: #fff;
    		overflow: auto;
			box-shadow: 3px 5px 5px 3px #aaaaaa;
			max-width: 850px;
			margin: auto;
		}
		
		.navbar {
		    border: none;
		    background-color: #FFF;
		    font-family: 'Helvetica Neue';
		    box-shadow: 0 0 6px 2px #999;
		    z-index: 1040;
		}
		
		.second-navbar {
			background-color: #EEEEEE;
			height: 50px; 
			line-height: 50px;
		}
		
		.second-navbar-top {
			top : 50px;
		}
		.cke_widget_drag_handler_container {
			display : none !important;
		}
		.cke_image_resizer {
			display : none !important;
		}
	</style>
	
</head>
	<body>
		<div class="container-fluid" style="padding: 0;">
			<nav class="navbar navbar-default navbar-fixed-top" role="navigation" >
				<div class="navbar-header col-sm-4">
					<span class="navbar-brand" style="color: #069;font-size: 25px;font-weight: 700;">numici</span>
				</div>
				<div class="col-sm-4" style="text-align: center;height: 50px;line-height: 50px;">
					<a id="tragetUrlId" class="btn btn-primary" 
						href="" 
						style="font-size: 15px !important;font-weight: bold !important;">
						TAKE ME TO THE TARGET PAGE
					</a>
				</div>
				<div class="navbar-right col-sm-4" style="padding: 8px;">
					<!-- <a id="loginUrlId" class="btn btn-primary" 
						href="login" 
						style="float: right;font-size: 15px !important;margin-right: 40px;">
						GO TO LOGIN
					</a> -->
				</div>
			</nav>	
		</div>
		<div class="container-fluid" style="padding: 0;">
			<div class="navbar-fixed-top second-navbar second-navbar-top dl-main-navbar">
				<span style="padding-left: 30px;font-size: 25px;font-weight: 700;color: #069;;">Welcome To Numici</span>
			</div>
			<div id="hypothesis-welcome-content">
				<div style="max-width: 648px; color: rgb(51, 51, 51); line-height: 1.5; margin: 0px auto; font-size: 14px;">
					<%=HypothesisWelcome%>
				</div>
			</div>
		</div>
	</body>
	<script>
		document.getElementById("tragetUrlId").style.display = "none";
		// Check browser support
		var webAnnotationUrl;
		if (typeof(Storage) !== "undefined") {
		  webAnnotationUrl = localStorage.getItem("webAnnotationUrl");
		  localStorage.removeItem("webAnnotationUrl");
		  if(webAnnotationUrl && webAnnotationUrl.length > 0) {
			  document.getElementById("tragetUrlId").href = webAnnotationUrl;
			  document.getElementById("tragetUrlId").style.display = "inline-block";
			  document.getElementById("loginUrlId").style.display = "none";
		  }
		}
		</script>
</html>
