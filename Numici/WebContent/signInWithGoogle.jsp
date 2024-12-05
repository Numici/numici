<%@page import="org.bson.types.ObjectId"%>
<%@page import="com.vdvc.notes.notes.Folder"%>
<%@page import="java.util.HashMap"%>
<%@page import="java.util.Map"%>
<%@page import="com.vdvc.webapp.beans.LoginBean"%>
<%@page import="com.vidivici.services.UserService"%>
<%@page import="com.vdvc.integration.slack.SlackUtil"%>
<%@page import=" com.vdvc.utils.Me"%>
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%
String error="";
String resourcepath =  Me.getBaseUrl();
if ( null != request.getSession().getAttribute("error") ) {
	error = request.getSession().getAttribute("error").toString();
	request.getSession().removeAttribute("error");
}
String signInUrl = SlackUtil.getExtSigninURL();

Map<String, Object> result = new HashMap<String, Object>();
String userId = null;
Folder rootFolder = null;
ObjectId rootFolderId = null;
LoginBean loginBean = (LoginBean)request.getSession().getAttribute("loginBean");
boolean hasLogin = (null != loginBean && loginBean.isLoggedIn());
if(hasLogin) {
	UserService us = new UserService();
	result = us.getCurrentUserInfo(request);
	userId = (String)result.get("UserId");
	rootFolder = (Folder)result.get("RootFolder");
	if(rootFolder != null) {
		rootFolderId = (ObjectId)rootFolder.getId();
	}
}


%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta http-equiv="expires" content="0"/>
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
		<title>Sign-In With Google</title>
		<link rel="icon" href="<%=resourcepath %>/app/assets/icons/numici.png?20200406-162053" type="image/png" />
		
		<link rel="stylesheet" href="<%=resourcepath %>/angular-libs/libs/jqueryUi/jquery-ui.min.css">
		
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
				
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap-theme.min.css">
		
		<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css">
		
		<link rel="stylesheet" href="<%=resourcepath %>/app/assets/OAuthCss/oAuthLogin.css">
		<script type="text/javascript" src="<%=resourcepath %>/resources/js/libs/jquery/jquery-1.10.2.js"></script>
		<script type="text/javascript" src="https://apis.google.com/js/api:client.js"></script>
		
		<style type="text/css">
			a {
				color: #fff;
				text-decoration: none;
			}
			a:hover {
				color: #069;
				text-decoration: none;
			}
			.errorMessage {
			 	position: absolute;
			    width: 80%;
			    top: 50px;
			    margin: auto;
			    text-align: center;
			    min-height: 50px;
			    color: #069;
			    font-size: 14px;
			    font-weight: bold;
			    background: #fff;
			    line-height: 50px;
			    left: 10%;
			    right: 10%;
			    box-shadow: 1px 1px 10px 0px #000;
			    display: none;
			 }
			 .vdvc-form-btn {
			 	color: #fff !important;
				background: #006699 !important;
				border-radius: 0;
			 }
			 .vdvc-form-btn-muted {
				color: #000;
				background: #999 !important;
			 }
			 .vdvc-form-btn-muted:hover {
				color: #fff  !important;
				background: #006699 !important;
			 }
		</style>
		<script type="text/javascript">
			var Util = (function(){
				var pathnaemArray = window.location.pathname.split( '/' );
				var Utils = {};
				
				Utils.protocol = window.location.protocol;
				Utils.host = window.location.host;
				Utils.baseUrl = Utils.protocol+"//" +Utils.host+"/api/";
				
				//This method provides ajax get method
				Utils.ajaxGet= function(url,success, error,spinner) {
					var fullUrl = Utils.baseUrl + url;
					$.ajax({
						type : 'GET',
						contentType : 'application/json',
						url : fullUrl,
						dataType : "json",
						success : function(result, textStatus, jqXHR) {
							if ("function" == typeof success) {
								success(result);
							}
						},
						error : function(jqXHR, textStatus, errorThrown) {
							if ("function" == typeof error) {
								error();
							}
						}
					});
				};
				
				Utils.htmlAjaxGet= function(url,success, error,spinner) {
					var fullUrl = Utils.baseUrl + url;
					$.ajax({
						type : 'GET',
						contentType : 'application/json',
						url : fullUrl,
						dataType : "html",
						success : function(result, textStatus, jqXHR) {
							if ("function" == typeof success) {
								success(result);
							}
						},
						error : function(jqXHR, textStatus, errorThrown) {
							if ("function" == typeof error) {
								error();
							}
						}
					});
				};
		
				//This method provides ajax post method
				Utils.ajaxPost=function(url,input,success,failure,dataType){
					var fullUrl = Utils.baseUrl + url;
					var io = null;
					if ("string" == typeof(input)) { io = input; }
					else { io = JSON.stringify(input); }
					$.ajax({
						type : 'POST',
						contentType : 'application/json',
						url : fullUrl,
						dataType : dataType || "json",
						data : io,
						success : function(result, textStatus, jqXHR) {
							if ("function" == typeof success) {
								success(result);
							}
						},
						error : function(jqXHR, textStatus, errorThrown) {
							if ("function" == typeof failure) {
								failure();
							}
						}
					});
				};
				return Utils;
			})();
			
			function getUserInfo() {
				Util.ajaxGet("user/current",function(usrInfResp) {
					 if(usrInfResp && usrInfResp.Status) {
						 if(usrInfResp.hasLogin) {
							 window.location.href = "fldr/"+usrInfResp.RootFolder.id;
						 }
					 }
				});
			}
			
			function triggerGoogleSignIn() {
				document.getElementById('customGoogleSignIn').click();
			}
			
			function attachSignin(element) {
				console.log(element.id);
				auth2.attachClickHandler(element, {},
					function(googleUser) {
						var profile = googleUser.getBasicProfile();
						var id = profile.getId();
						var firstName = profile.getGivenName();
						var lastName = profile.getFamilyName();
						var name = profile.getName();
						var email = profile.getEmail();
						var imageUrl = profile.getImageUrl();
						var postdata = {
								"email": email,
								"name":name,
								"provision":true,
								"signInFrom": "Site"
						};
						if(firstName) {
							postdata.firstName = firstName;
						}
						if(lastName) {
							postdata.lastName = lastName;
						}
													
						Util.ajaxPost("google/login",postdata,function(response) {
							if(response) {
								getUserInfo();
							}
						},null,"html");
				   	}, function(errResponse) {
				   		console.log(JSON.stringify(errResponse, undefined, 2));
				   		if(errResponse.error === "popup_closed_by_user") {
				   			window.location.href = "/login";
				   		} else if(errResponse.error === "popup_blocked_by_browser") {
				   			$(".errorMessage").show();
				   		}
				   	}
		        );
			}
			
			function loadGoogleAuthentication(googleClientId,cb) {
				gapi.load('auth2', function(){
					// Retrieve the singleton for the GoogleAuth library and set up the client.
					auth2 = gapi.auth2.init({
						client_id: googleClientId,	//'165486286070-vm8e4hvs8dt3u73h7k1p12bu827sqb7g.apps.googleusercontent.com',
						cookiepolicy: 'single_host_origin',
						// Request scopes in addition to 'profile' and 'email'
						scope: 'profile email',
					});
					attachSignin(document.getElementById('customGoogleSignIn'));
					if(typeof cb == "function") {
						cb();
					}
				});
			}
			
			function getGoogleClicntId(cb) {
				Util.ajaxGet("google/clientid",function(response) {
					if(response && response.Status) {
						var googleClientId = response.Data;
						if(googleClientId && typeof cb == "function") {
							cb(googleClientId);
						} else {
							
						}
					}
				});
			}
			
			function logout(cb) {
				Util.htmlAjaxGet("user/logout",function(response) {
					 if(response) {
						 if(typeof cb == "function") {
							 cb();
						 }
					 }
				});
			}
			
			function initiateGoogleSignIn() {
				getGoogleClicntId(function(googleClientId) {
					loadGoogleAuthentication(googleClientId,triggerGoogleSignIn);
				});
			}
			function selectResponse(userResponse) {
				if(userResponse === "logoutAndContinue") {
					logout(function(){
						//initiateGoogleSignIn();
						window.location.reload();
					});
				} else if(userResponse === "skipAndGotoRoot") {
					window.location.href = "/fldr/<%=rootFolderId %>";
				}
			}
	    </script>
	</head>
	<body>
		<div class="container-fluid full" style="padding: 0px;">
			<div class="fill" 
				style="position:relative;overflow-x: hidden;overflow-y: auto;background-image:  url('/app/assets/images/analyst.jpg'); min-height: 480px;background-size: cover;font-size: 35px;">
				<div class="errorMessage">
					<%
				        if (hasLogin) {
				    %>
					        <div class="col-xs-12" style="padding: 15px;">
								<div class="col-xs-12" style="line-height: initial;">There is an active session available for user '<%=userId %>'.<br><br>
									Please click on 'Logout & Continue' button to continue sign-in with Google <br>
									OR<br>
									click on 'Skip & Goto Active Session' button to stop the sign-in process and access active user session.
								</div>
								<div class="col-xs-12 confirm-signed-in-btn-group" style="padding-top: 15px;">
									<button class="btn vdvc-form-btn vdvc-form-btn-muted" 
										type="button" 
										onClick="selectResponse('skipAndGotoRoot')" 
										style="float: left;">
										Skip & Goto Active Session
									</button>
									<button class="btn vdvc-form-btn" 
										type="button" 
										onClick="selectResponse('logoutAndContinue')" 
										style="float: right;">
										Logout & Continue
									</button>
								</div>
							</div>
				    <%
				        } 
				        else {
				    %>
				        	<div>Pop-ups are blocked, enable Pop-up for the site to proceed with sign-in with Google</div>
				    <%
				        }
				    %>
				</div>
				<div class="col-xs-12" 
					style="font-size:2em;text-shadow: 1px 1px 4px rgba(3, 3, 3, 0.75);text-align: center;transform: translateY(255%);">
					<a href="/login">
		        		numici
		        	</a>
		        	<div id="customGoogleSignIn" 
		        		class="customGoogleSignIn" 
		        		title="Sign-In With Google" 
		        		style="display:none;">
				      	<span class="icon"></span>
				    </div>
				</div>
			</div>
		</div>
	</body>
	
	<%
        if(hasLogin)
        {
    %>
	         <script type="text/javascript" >
	         	$(".errorMessage").show();
	         </script>
   <%
        }
        else
        {
   %>
        	<script type="text/javascript">
	        	$( document ).ready(function() {
					initiateGoogleSignIn();
				});
			</script>
    <%
        }
    %>
    
</html>