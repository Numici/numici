<%
String error="";
String description=null;

if ( null != request.getParameter("error") ) {
	error = request.getParameter("error");
} else if ( null != request.getSession().getAttribute("error") ) {
	error = request.getSession().getAttribute("error").toString();
	request.getSession().removeAttribute("error");
}
if ( null != request.getParameter("error_description") ) {
	description = request.getParameter("error_description");
} else if ( null != request.getSession().getAttribute("error_description") ) {
	description = request.getSession().getAttribute("error_description").toString();
	request.getSession().removeAttribute("error_description");
}
%>
<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta http-equiv="expires" content="0"/>
		<meta name="viewport" content="width=device-width, initial-scale=1,, maximum-scale=1"/>
		
		<link rel="icon" href="app/assets/icons/numici.png?20200406-162053" type="image/png" />
		
		<link rel="stylesheet" href="angular-libs/libs/jqueryUi/jquery-ui.min.css">
		
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
		
		
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap-theme.min.css">
		
		<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css">
		
		<link rel="stylesheet" href="app/assets/cssmin/app.min-20171212-124925.css">
	</head>
	<body>
		<div class="fill" style="overflow-x: hidden;overflow-y: auto;background-image:  url('app/assets/images/analyst.jpg');">
			<!-- <div class="genMessage" style="padding: 5px;text-align: center;word-wrap: break-word;">Numici OAuth Authorization</div> -->
			<div class="loginError" style="padding: 5px;text-align: center;word-wrap: break-word;"><%= error %></div>
<% if ( null != description ) { %>
			<div class="loginError" style="padding: 5px;text-align: center;word-wrap: break-word;"><%= description %></div>
<% } %>
		</div>
		<footer>
			<div class="container" style="padding-right: 0px;padding-left: 0px;">
			  <p>Copyright&copy; 2015 Vidi Vici Technologies, Inc. All rights reserved </p>
			</div>
		</footer>
	</body>
</html>