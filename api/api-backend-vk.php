<?php
	date_default_timezone_set('Europe/Moscow');
	error_reporting(0); // отключать во время дебага (?)

	include 'topsec/vars.php';

	function get_vk_token() {
		$APIep = $GLOBALS['APIep'];
		$vkData = $GLOBALS['vkData'];

		if ($_GET['state'] === 'vk-get-code') {
			$vkGetT = file_get_contents($APIep['vk_ac'] . '?client_id=' . $vkData['id'] . '&client_secret=' . $vkData['secret'] . '&redirect_uri=https://' . $_SERVER['SERVER_NAME'] . $_SERVER['PHP_SELF'] . '&code=' . $_GET['code']);
			$vkGetTj = json_decode($vkGetT);
		} else { return false; }

		if (!$vkGetTj->access_token) { return false; }

		switch ($vkGetTj->user_id) {
			case 115127361:
			case 307130237:
				file_put_contents(dirname(__FILE__) . '/topsec/vk-token.txt', $vkGetTj->access_token);
				echo '<html><body><p>Токен получен!</p></body></html>';
			default:
				return false;
		}
	}

	get_vk_token();

	function get_vk_stream_link() {
		$APIep = $GLOBALS['APIep'];
		$vkData = $GLOBALS['vkData'];

		$vk_vid_ac = file_get_contents('topsec/vk-token.txt');

		if (!$vk_vid_ac) { return false; }

		$vk_vid = file_get_contents($APIep['vk'] . '/video.get?owner_id=-' . $vkData['comID'] . '&count=1&v=' . $vkData['api-version'] . '&access_token=' . $vk_vid_ac);
		
		if (!$vk_vid) { return false; }
		$vkAPIs = json_decode($vk_vid)->response->items[0];

		if (!$vkAPIs->width || !$vkAPIs->height) {
			$strQuality = null;
		} else { $strQuality = $vkAPIs->width . 'x' . $vkAPIs->height; }
		
		if ($vkAPIs->live_status === "started") {
			$vkIsLive = '&autoplay=1';
		} else { $vkIsLive = ''; }

		$vkStreamData = [
			'url' => $vkAPIs->player . $vkIsLive,
			'pic' => $vkAPIs->photo_800,
			'viewers' => $vkAPIs->spectators,
			'quality' => $strQuality,
			'timestamp' => time()
		];

		if (filemtime('vk-stream.json') < time() - 10) {
			file_put_contents(dirname(__FILE__) . '/vk-stream.json', json_encode($vkStreamData, JSON_UNESCAPED_UNICODE));
		}
	}

	get_vk_stream_link();
?>