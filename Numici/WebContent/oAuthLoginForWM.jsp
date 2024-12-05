<%@ page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1"%>
<%@ page import="com.vdv.integration.google.GoogleUtil"%>
<%@ page import="com.vdvc.integration.slack.SlackUtil"%>
<%@ page import="com.vidivici.services.MaintenanceService"%>
<%@ page import="com.vidivici.services.vo.MaintenanceScheduleVO"%>
<%@ page import="com.vdvc.utils.Me"%>
<%@ page import="org.codehaus.jackson.map.SerializationConfig"%>
<%@ page import="org.codehaus.jackson.map.ObjectMapper"%>
<%@ page import="org.activiti.engine.impl.util.json.JSONObject"%>
<%@ page import="java.util.Map"%>
<%
	String json = "";
	String error = "";
	String resourcepath =  Me.getBaseUrl();
	ObjectMapper mapper = new ObjectMapper();
	mapper.disable(SerializationConfig.Feature.WRITE_NULL_PROPERTIES);
	if ( null != request.getSession().getAttribute("error") ) {
		error = request.getSession().getAttribute("error").toString();
		request.getSession().removeAttribute("error");
	}
	
	String signInUrl = SlackUtil.getExtSigninURL();
	String googleSignInUrl = GoogleUtil.getExtSigninUrl();
	Map<String, Object> schedule = MaintenanceService.getActiveSchedule(null);
	if(null != schedule && null != schedule.get("Schedule")) {
		try {
			MaintenanceScheduleVO vo = (MaintenanceScheduleVO)schedule.get("Schedule");
			json = mapper.defaultPrettyPrintingWriter().writeValueAsString(vo); 
		} catch ( Exception ex ) {
			return ;
		}
	}
%>

<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta http-equiv="expires" content="0" />
		<meta name="viewport"
			content="width=device-width, initial-scale=1, maximum-scale=1" />
		<title>Numici Authorization</title>
		<link rel="icon"
			href="<%=resourcepath %>/app/assets/icons/numici.png?20200406-162053"
			type="image/png" />
		
		<link rel="stylesheet"
			href="<%=resourcepath %>/angular-libs/libs/jqueryUi/jquery-ui.min.css">
		
		<link rel="stylesheet"
			href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
		
		
		<link rel="stylesheet"
			href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap-theme.min.css">
		
		<link rel="stylesheet"
			href="//maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css">
		
		<link rel="stylesheet"
			href="<%=resourcepath %>/app/assets/OAuthCss/oAuthLogin.css?20170303-201551">
		<style type="text/css">
		#actSch {
			margin: 10px 0px;
		    text-align: center;
		    color: red !important;
		    background-color: #ff0 !important;
		    border-color: #ff0 !important;
		    background-image: none !important;
		    border-radius: 15px !important;
		    padding: 10px;
		}
		   
		</style>
		<script type="text/javascript"
			src="<%=resourcepath %>/resources/js/libs/jquery/jquery-1.10.2.js"></script>
		<script type="text/javascript" src="https://accounts.google.com/gsi/client"></script>
		<script class="js-hypothesis-config js-hypothesis-settings" type="application/json">
    	  <% if(null != json) {
		    		  out.print(json.toString());
		    	  } %>
		</script>
		<script type="text/javascript" src="<%=resourcepath %>/resources/js/extensionLogin/main.js?09022021"></script>
		<script>
			function goToRegisterPage() {
				var urlParams = new URLSearchParams(window.location.search);
				var origin = urlParams.get('origin');
				var response_mode = urlParams.get('response_mode');
				var response_type = urlParams.get('response_type');
				var state = urlParams.get('state');
				var version = urlParams.get('version');
				var queryParams = "?origin="+origin+"&response_mode="+response_mode+"&response_type="+response_type+"&state="+state+"&version="+version;
				var stringUrl = '<%=resourcepath+"/reguserfromext"%>';
				stringUrl = stringUrl+queryParams;
				location.href = stringUrl;
			}
		</script>
	</head>
	<body>
		<div class="container-fluid full" style="padding: 0px;">
			<div class="fill"
				style="position: relative; overflow-x: hidden; overflow-y: auto; background-image: url('/app/assets/images/analyst.jpg'); min-height: 480px; background-size: cover;">
				
				<div class="cookieError" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60%; text-align: center; min-height: 200px; background: #ffffffad; color: #fff; padding: 5em 20px;display: none;">
	
					<div class="col-xs-12">
						<img src="/app/assets/icons/Numici-Logo-Long-In-Blue.png"
							alt="numici"
							style="background: #fff; border-radius: 14px; height: 75px;">
					</div>
					<div class="col-xs-12">
						<div
							style="padding: 5px; word-wrap: break-word; color: red; font-size: 14px;">
							"Your Browser settings are set to "Block cookies". To use Numici,
							you will need to add "<span id="host"></span>" to the section "Sites that can
							always use cookies" in Browser Settings"</div>
					</div>
		        </div>
				
				<div class="col-xs-12 login"
					style="position: absolute; width: 100%; min-height: 380px; top: 50%; transform: translateY(-50%)">
					<div class="row">
					    <div  class="col-xs-12 message-container">
						</div>
						<div class="col-xs-12 app-col-pad-lr-0 login-card"
							style="width: 95%; left: 50%; max-width: 555px; transform: translateX(-50%);">
							
							<div class="col-xs-12 app-pad-3">
								<!-- <div class="col-xs-12 app-col-pad-lr-0 dotted-w"
									style="font-size: 20px;text-align: center;">Sign in</div> -->
								<div class="col-xs-12">
									<form class="form-horizontal"
										action="<%=resourcepath %>/webMessageOauth/login" method="post"
										role="form">
										<!-- <div class="genMessage"
											style="padding: 5px; text-align: center; word-wrap: break-word;">Numici
											OAuth Authorization</div> -->
										<div class="loginError"
											style="padding: 5px; text-align: center; word-wrap: break-word; color: red;"><%= error %></div>
										<div class="googleError row">
											
										</div>
										<div class="row" style="font-size: 16px;">
											<div class="form-group username-group">
												<label for="username"
													class="col-xs-3">User ID</label>
												<div class="col-xs-9">
													<input type="text" name="username" id="username"
														class="form-control" required>
												</div>
											</div>
											<div class="form-group password-group">
												<label for="password"
													class="col-xs-3">Password</label>
												<div class="col-xs-9">
													<input type="password" name="password" id="password"
														class="form-control" required>
												</div>
											</div>
											<div class="row app-pad-top-1">
												<div class="form-actions" style="padding: 0px 15px;">
													<div class="col-xs-6 app-col-pad-lr-0">
														<!-- <button type="button" onClick="Util.close()" name="cancel"
															class="btn oAuth-login-custom-btn">CANCEL</button> -->
													</div>
													<div class="col-xs-6 app-col-pad-lr-0">
														<button type="submit" name="login"
															class="btn oAuth-login-custom-btn pull-right">
															SIGN IN
														</button>
													</div>
												</div>
											</div>
										</div>
										<div class="row sign-in-divider" style="margin: 10px 0;">OR</div>
										<div class="row app-pad-top-3"
											style="text-align: center; margin-top: 10px;">
											<div class="form-actions">
												<div class="col-xs-12" style="display: flex;flex-direction: row;align-items: center;padding: 0px;">
													<div id="customGoogleSignIn" class="customGoogleSignIn"
														data-uib-tooltip="Google"
														data-tooltip-append-to-body='true'
														data-tooltip-placement="auto"
														data-url="<%=googleSignInUrl%>">
														<span class="icon"></span>
													</div>
													<div class="customSlackSignIn" id="customSlackSignIn"
														data-uib-tooltip="Slack" data-tooltip-append-to-body='true'
														data-tooltip-placement="auto"
														data-url="<%=signInUrl%>">
														<%-- <a href="<%=signInUrl%>">
																<span class="icon" onclick="Util.SigninWithSlack();"></span>
															</a> --%>
														<span class="icon"
															style="background-size: 60px; transform: scale(1); background-position: center;"></span>
													</div>
												</div>
											</div>
										</div>
									</form>
								</div>
								<div class="col-xs-12 dotted-w" style="margin: 20px 0px;"></div>
								<div class="row">
									<div class="col-xs-6 new-to-numici-label"> New to numici ?</div>
									<div class="col-xs-6"> <button type="button" class='btn register-btn' onClick="goToRegisterPage()">REGISTER</button></div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<footer>
					<div class="container"
						style="padding-right: 0px; padding-left: 0px;">
						<p>Copyright&copy; 2016 - 2023 Numici. All rights reserved</p>
					</div>
				</footer>
			</div>
		</div>
	</body>
</html>