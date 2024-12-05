<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
    
    
<%
	String redirectUrl = (String)request.getAttribute("redirectUrl");
%>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title>Numici</title>

<script>
  ;(function(window) {
		window.onload = function() {
			 window.location.href = "<%=redirectUrl%>";
		};
  })(window);
  
</script>
</head>
<body>

</body>
</html>