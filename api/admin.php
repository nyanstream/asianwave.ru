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
	} else { header('HTTP/1.0 403 Forbidden'); exit; }
?>
