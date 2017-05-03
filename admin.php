<?php
	if(isset($_POST['auth'])) {
		header('Location: https://www.youtube.com/watch?v=CkvUAl7Y4mw', true, 301);
	}
?>
<!DOCTYPE HTML>
<html><head>
	<meta charset="utf-8">
	<title>Авторизация</title>
	<meta name="robots" content="noindex, follow">
</head><body>
	<form name="login" action="" method="post">
	<p>
		<label for="login">Имя пользователя или e-mail<br>
		<input type="text" name="login" size="40" required></label>
	</p>
	<p>
		<label for="pass">Пароль<br>
		<input type="password" name="pass" size="40" required></label>
	</p>
	<p>
		<input type="submit" name="auth" value="Войти">
	</p>
	</form>
</body></html>
