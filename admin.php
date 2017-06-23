<?php
	$video = [
		'dQw4w9WgXcQ',
		'eGSQtWZtwvY',
		'CkvUAl7Y4mw',
		'TnxgN3xrYVE',
		'8Dq9N2-Qr-8',
		'adIf62qRoVU',
		'9NcPvmk4vfo',
		'lXMskKTw3Bc',
		'rx6w3j7cWa0',
		'wMyqQWcAuKM'
	];

	if (isset($_POST['auth'])) {
		header('Location: https://www.youtube.com/embed/' . $video[rand(0, (count($video)- 1))] . '?controls=0&showinfo=0&color=white&rel=0&autoplay=1', true, 302);
	}
?>
<!DOCTYPE HTML>
<html><head>
	<meta charset="utf-8">
	<title>Авторизация</title>
	<link rel="shortcut icon" href="/files/img/favicon.png">
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
