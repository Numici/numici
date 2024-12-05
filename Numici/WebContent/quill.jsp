<%@page import="com.vdvc.notes.notes.Document"%>
<%@page import="org.jsoup.Jsoup"%>
<%@page import="com.vdvc.ManagerFactory"%>
<%@page import="com.vdvc.core.NotesManager"%>
<%@page import="com.vidivici.services.NotesService"%>
<%@page import="java.util.Map"%>
<%@page import="com.vdvc.utils.Me"%>
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%
String docname="Select a document";
String doccontent="<p>Enter "+Me.getBaseUrl()+"/quill.jsp?d={docId}&c={clientId} in addressbar</p>";
String docId = request.getParameter("d");
String clientId = request.getParameter("c");
if ( null != docId && null != clientId ) {
	try {
		NotesManager mgr = (NotesManager) ManagerFactory.getManagerObject("notes", request);
		Document document = mgr.getDocument(clientId, docId);
		docname = document.getDisplayName();
		doccontent = mgr.getDocContent(clientId, docId);
		org.jsoup.nodes.Document jsoupDoc = Jsoup.parse(doccontent);
		doccontent = jsoupDoc.body().html();
	} catch ( Exception ex ) {
		ex.printStackTrace();
		doccontent = "Error :"+ex.getMessage();
	}
}
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js"></script>
<title><%= docname%></title>
</head> 
<body>
<div id="editor" align="center">
<%= doccontent %>
</div>
<script>
const quill = new Quill('#editor', { theme: 'snow'});
</script>

</body>
</html>