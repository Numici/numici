<%@page import="org.activiti.engine.impl.util.json.JSONObject"%>
<%@page import=" com.vdvc.utils.Me"%>
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%
    String baseUrl =  Me.getBaseUrl();
	String wsUrl = "ws://"+Me.getHostName();
	if(baseUrl.contains("https")) {
		wsUrl = "wss://"+Me.getHostName();
	}
	JSONObject json = new JSONObject();
    json.put("apiUrl", baseUrl+"/annotateWebApi/");
    json.put("assetRoot","/client/");
    json.put("authDomain",baseUrl);
    json.put("serviceUrl",baseUrl+"/");
    json.put("release","1.82.0.222");
    json.put("appType","embedded");
    json.put("websocketUrl",wsUrl+"/annotateWebWs");
    json.put("oauthClientId","da545114-7792-11e7-90b4-b35c52774c7d");
    json.put("oauthEnabled",true);
    
    
    
%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<base href="/">
</head>
<body>
	<hypothesis-app></hypothesis-app>

	<script class="js-hypothesis-config js-hypothesis-settings" type="application/json">
    	<% out.print(json.toString()); %>
    </script>

	<script src="/client/build/boot.js"></script>
</body>
</html>
