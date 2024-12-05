<%@page import="com.vidivici.services.BaseService"%>
<%@page import="java.util.ArrayList"%>
<%@page import="com.vidivici.services.vo.TaskspaceVO"%>
<%@page import="java.util.List"%>
<%@page import="java.util.Map"%>
<%@page import="com.vidivici.services.TaskspaceService"%>
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title>Insert title here</title>
</head>
<body>
<%
String tsListJson="";
String userId = (String) request.getAttribute("user");
Map<String, Object> userTsListMap = TaskspaceService.listAllTaskspaces(userId, true);
List<TaskspaceVO> tsList = new ArrayList<TaskspaceVO>();
System.out.println(userTsListMap.toString());
if ( userTsListMap.containsKey(BaseService.TASKSPACES_KEY) ) {
	tsList = (List<TaskspaceVO>)userTsListMap.get(BaseService.TASKSPACES_KEY);
}
System.out.println(tsList.size());
for ( int i=0; i<tsList.size(); i++ ) {
	TaskspaceVO vo = tsList.get(i);
	String tsJson = "{";
	tsJson += "\"id\":"+"\""+vo.getId()+"\",";
	tsJson += "\"name\":"+"\""+vo.getName()+"\",";
	tsJson += "\"cid\":"+"\""+vo.getClientId()+"\"";
	tsJson += "}";
	if ( i < tsList.size()-1 ) {
		tsJson += ",";
	}
	tsListJson += tsJson;
}
%>
<script type="text/javascript">
var selectedTsId;
var baseUrl = "/api/taskspace/json/";
var tsList = [<%= tsListJson %>];

var loadTS=function() {
	var listHtml="";
	tsList.forEach(t=>listHtml += "<option value="+t.id+">"+t.name+"</option>");
	document.getElementById("ts").innerHTML = listHtml;
	updateLink();
}
var updateLink=function() {
	var id=document.getElementById("ts").value;
	var ts=tsList.find(t=>t.id==id);
	var url=baseUrl+id+"/"+ts.cid;
	document.getElementById("link").href=url;
	document.getElementById("link").text="Download "+ts.name;
}
</script>
<p>Taskspace JSON download</p>
<br/>
<br/>
<label for="ts">Select Taskspace</label>
<select id="ts" onChange="updateLink();">
</select><br/><br/>
<a id="link" _target="new">download</a>
<script type="text/javascript">
loadTS();
</script>
</body>
</html>