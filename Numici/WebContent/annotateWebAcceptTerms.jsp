<%@page import="org.activiti.engine.impl.util.json.JSONObject"%>
<%@page import=" com.vdvc.utils.Me"%>
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%
    String resourcepath =  Me.getBaseUrl();
    String logoutUrl =  resourcepath+"/api/user/logout";
	String termsPdfUrl = resourcepath+"/resources/js/init/Vidi Vici Technologies - Click thru beta trial agreement.pdf#view=FitH&toolbar=0&scrollbar=0";
%>

<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta http-equiv="expires" content="0"/>
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
		<title>BETA LICENSE AGREEMENT</title>
		<link rel="icon" href="<%=resourcepath %>/app/assets/icons/numici.png?20200406-162053" type="image/png" />
		
		<link rel="stylesheet" href="<%=resourcepath %>/angular-libs/libs/jqueryUi/jquery-ui.min.css">
		
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
		
		
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap-theme.min.css">
		
		<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css">
		
		<link rel="stylesheet" href="<%=resourcepath %>/app/assets/OAuthCss/oAuthLogin.css">
		<script type='text/javascript' src='<%=resourcepath %>/resources/js/libs/jquery/jquery-1.10.2.js?20151009'></script> 
</head>
<body>

<form id="terms" action="<%=resourcepath %>/webMessageOauth/licence" method="post" role="form" style="height: 100%;padding: 15px;">
	<div class="modal-header">
		<h4 class="modal-title">BETA LICENSE AGREEMENT</h4>
	</div>
	<div class="modal-body" style="height: calc(100% - 125px);">
		<object width="100%" height="100%" data="<%=termsPdfUrl %>"></object>
	</div>
	<div class="modal-footer">
		<button type="submit" name="DECLINE" value="DECLINE" class="btn vdvc-form-btn vdvc-form-btn-muted">DECLINE</button>
		<button type="submit" name="ACCEPT"  value="ACCEPT" class="btn vdvc-form-btn" style="color: #fff;background: #069;">ACCEPT</button>
	</div>

</form>
<script type="text/javascript">
$(function() {
	var btnclick = false;
	$(".vdvc-form-btn").on("click",function(event) {
	    btnclick = true;
	});
	
	window.addEventListener('beforeunload', function (e) {
		if(!btnclick){
			$.get("<%=logoutUrl%>" , function(data, status){});
		}
	});
	
	try{
		window.resizeTo(screen.width,screen.height);
	}catch (e) {
		window.resizeTo(700,500);
	}
});


</script>

</body>
</html>