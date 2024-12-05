<%!
	String for_oauth = null;
	String next =null;
	String action = "./webMessageOauth/login";
%>
<%
String error="";

if ( null != request.getSession().getAttribute("error") ) {
	error = request.getSession().getAttribute("error").toString();
	request.getSession().removeAttribute("error");
	for_oauth = request.getParameter("for_oauth");
	next = request.getParameter("next");
	
	if(for_oauth != null && next != null) {
		action += "?for_oauth="+for_oauth+"&next="+next;
	}
}
%>
<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta http-equiv="expires" content="0"/>
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
		
		<link rel="icon" href="app/assets/icons/numici.png?20200406-162053" type="image/png" />
		
		<link rel="stylesheet" href="angular-libs/libs/jqueryUi/jquery-ui.min.css">
		
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
		
		
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap-theme.min.css">
		
		<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css">
		
		<link rel="stylesheet" href="app/assets/OAuthCss/oAuthLogin.css">
	</head>
	<body>
		<div class="container-fluid" style="padding: 0px;">
			<div class="fill" style="position: absolute;overflow-x: hidden;overflow-y: auto;background-image:  url('app/assets/images/analyst.jpg');">
				<div class="col-xs-12 login" style="position:absolute;width: 100%;top:10%;">
					<div class="row">
						<div class="col-xs-12 app-col-pad-lr-0 login-card" style="width: 75%;left: 12.5%;">
							<div class="col-xs-12 app-pad-1">
								<div class="col-xs-12 app-col-pad-lr-0 dotted-w" style="font-size: 20px;">Sign in</div>
								<div class="col-xs-12">
									<form class="form-horizontal" action="<%=action%>"  method="post" role="form">
									   <!-- <div class="genMessage" style="padding: 5px;text-align: center;word-wrap: break-word;">Numici OAuth Authorization</div> -->
									   <div class="loginError" style="padding: 5px;text-align: center;word-wrap: break-word;"><%= error %></div>
									   <div class="row dotted-w" style="font-size: 16px;">
										   	 <div class="form-group"> 
										        <label for="username" class="col-sx-12 col-sm-3 col-sm-offset-1">User ID</label>
										          <div class="col-sx-12 col-sm-8">
										          	<input type="text" name="username" id="username" class="form-control" required>
										          </div>
										    </div>
										    <div class="form-group">
										        <label for="password" class="col-sx-12 col-sm-3 col-sm-offset-1">Password</label>
										        <div class="col-sx-12 col-sm-8">
										        	<input type="password" name="password" id="password" class="form-control" required>
										        </div>  
										    </div>
									   </div>
									   <div class="row app-pad-top-1">
										   	<div class="form-actions">
										        <div class="col-xs-6 app-col-pad-lr-0"> <button type="submit" name="cancel" class="btn oAuth-login-custom-btn">CANCEL</button></div>
												<div class="col-xs-6 app-col-pad-lr-0"> <button type="submit" name="login" class="btn oAuth-login-custom-btn pull-right">SIGN IN</button></div>
										    </div>	
									   </div>
									</form>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<footer>
				<div class="container" style="padding-right: 0px;padding-left: 0px;">
				  <p>Copyright&copy; 2015 Vidi Vici Technologies, Inc. All rights reserved </p>
				</div>
			</footer>
		</div>
	</body>
</html>