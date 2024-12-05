<%@page import="java.io.IOException"%>
<%@page import="com.vdvc.utils.Log"%>
<%@ page isErrorPage="true" language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%
if ( null != exception ) {
	try {
		Log log = new Log(Log.class);
		log.logExceptionWithCause("Unhandled exception", exception);
	} catch ( Throwable t ) {
		exception.printStackTrace();
	}
}
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title>Vidi Vici Technologies</title>
</head>
<body>
An unexpected error has occurred! Click <a href="./login.jsf">here</a> to go back. 
</body>
</html>