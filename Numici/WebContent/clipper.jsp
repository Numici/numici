<%@page import="java.util.Calendar"%>
<%@page import="org.apache.commons.io.FileUtils"%>
<%@page import="java.io.File"%>
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%!
	public static String clip(String url) {
		File outFile=null;
		try {
			outFile = File.createTempFile("cipper-out", ".html");
			//String nodejs="/usr/share/.nvm/versions/node/v8.11.4/bin/node";
			//String testjs="/home/ec2-user/test.js";
			String nodejs="node";
			String testjs="c:/temp/test.js";
			ProcessBuilder pb = new ProcessBuilder(nodejs, testjs, url);
			pb.redirectOutput(outFile);
			System.out.print(Calendar.getInstance().getTime());
			Process process = pb.start();
			try {
				process.waitFor();
				System.out.print("exit code: " + process.exitValue());
				System.out.print(Calendar.getInstance().getTime());
			} catch ( Exception ex ) {
				return "<p>Expected error: " + ex.getMessage() +"</p>";
			}
System.out.println(outFile.getAbsolutePath());
			String out = "<html>"+FileUtils.readFileToString(outFile)+"</html>";
			return out;
		} catch ( Exception ex ) {
			return "<p>Expected error: " + ex.getMessage() +"</p>";
		} finally {
//			try { outFile.delete(); } catch ( Exception e1 ) {}
		}
	}
%>
<%
String submit=request.getParameter("Submit");
String url=request.getParameter("url");
if ( null == submit ) {
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title>Readbility Test</title>
</head>
<form method="post" >
<table>
<tr><td align="right">Link:</td><td align=Left><input name="url" type="text"></td></tr>
<tr><td align="right"></td><td align=Center><input name="Submit" type="submit" value="Clip"></td></tr>
</table>
</form>
<body>

</body>
</html>
<% } else { 
	String cliptext = clip(url);
	response.getWriter().print(cliptext);
}
%>

