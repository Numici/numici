<%@page import="com.vdvc.notes.notes.Document"%>
<%@page import="com.vdvc.ManagerFactory"%>
<%@page import="com.vdvc.core.NotesManager"%>
<%@page import="com.vidivici.services.NotesService"%>
<%@page import="java.util.Map"%>
<%@page import="com.vdvc.utils.Me"%>
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%
String docname="Select a document";
String doccontent="<p>Enter "+Me.getBaseUrl()+"/tinymce.jsp?d={docId}&c={clientId} in addressbar</p>";
String docId = request.getParameter("d");
String clientId = request.getParameter("c");
if ( null != docId && null != clientId ) {
	try {
		NotesManager mgr = (NotesManager) ManagerFactory.getManagerObject("notes", request);
		Document document = mgr.getDocument(clientId, docId);
		docname = document.getDisplayName();
		doccontent = mgr.getDocContent(clientId, docId);
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
    <script src="https://cdn.tiny.cloud/1/qagffr3pkuv17a8on1afax661irst1hbr4e6tbv888sz91jc/tinymce/6/tinymce.min.js" referrerpolicy="origin"></script>
<script>
tinymce.init({
  selector: 'textarea#basic-example',
  height: 800,
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'help', 'wordcount'
  ],
  toolbar: 'undo redo | blocks | ' +
  'bold italic backcolor | alignleft aligncenter ' +
  'alignright alignjustify | bullist numlist outdent indent | ' +
  'removeformat | help',
  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }'
});
</script>
<title><%= docname%></title>
</head> 
<body>
<textarea id="basic-example">
<%= doccontent %>
</textarea>
</body>
</html>