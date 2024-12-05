<%@page import="org.activiti.engine.impl.util.json.JSONObject"%>
<%@page import="com.vdvc.utils.Me"%>
<%@page import="com.vdvc.DAOFactory"%>
<%@page import="com.vdvc.model.dao.AppKeyValuesDAO"%>
<%@page import="java.util.List"%>
<%@page import="com.vdvc.model.model.AppKeyValues"%>



<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%
    HttpSession httpsession = request.getSession();
    String resourcepath =  Me.getBaseUrl();
	JSONObject json = new JSONObject();
    json.put("code", httpsession.getAttribute("code"));
    json.put("origin",httpsession.getAttribute("redirect_uri"));
    json.put("state",httpsession.getAttribute("state"));
    String version = (String)httpsession.getAttribute("version");
    String oauthjs = resourcepath+"/resources/js/oAuth/post-auth.bundle.js?20151009";
    if(null != version) {
    	oauthjs = resourcepath+"/resources/js/oAuth/oauth-message.js?20151009";
    } 
    
    try{
    	AppKeyValuesDAO dao = (AppKeyValuesDAO) DAOFactory.getDaoObject("appkeyvalues");
    	 List<AppKeyValues> list = dao.getAppKeyValues("WebAnnotations", "ExtensionId", null, null);
    	 if(null != list && !list.isEmpty()) {
    		 AppKeyValues obj = list.get(0);
    		 if(null != obj) {
    			 json.put("extId",obj.getValue());
    		 }
    	 } 
    	 httpsession.removeAttribute("version");
    	 httpsession.removeAttribute("scope");
    	 httpsession.removeAttribute("state");
    	 httpsession.removeAttribute("redirect_uri");
    	 httpsession.removeAttribute("client_id");
    	 httpsession.removeAttribute("response_type");
    } catch(Exception e){
    	
    }
    
%>

<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta http-equiv="expires" content="0"/>
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
		
		<title>Numici Authorization completed</title>
		
		<link rel="icon" href="app/assets/icons/numici.png?20200406-162053" type="image/png" />
		<script type='text/javascript' src='<%=resourcepath %>/resources/js/libs/jquery/jquery-1.10.2.js?20151009'></script> 
		<script type='application/json' class='js-hypothesis-settings'>
			<% out.print(json.toString()); %>
		</script>
		<script type='text/javascript' src='<%=oauthjs %>'></script>
		<%-- <script type='text/javascript' src='<%=resourcepath %>/resources/js/oAuth/post-auth.bundle.js?20151009'></script> --%>
	</head>
	<body>
		
	</body>
</html>