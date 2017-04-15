<?php
	date_default_timezone_set('Europe/Moscow');
	$start = microtime(true);

	$file = 'api.json';
	$vkfile = 'vk-info.json';
	$vkstream = 'vk-stream.txt';

	$imgProxy = array('https://' => 'https://images.weserv.nl/?url=ssl:');
	
	$radioPoints = [
		['jp', 'Japan', 7934], // основной поток для радио, пока что
		['ru', 'Russia', 9759],
		['kp', 'Korea', 3799],
	];
	
	$APIep = [
		'vk' => 'https://api.vk.com/method',
		'mr' => 'https://myradio24.com'
	];

	$mr24 = file_get_contents($APIep['mr'] . '/users/' . $radioPoints[0][2] . '/status.json');
	$vk = file_get_contents($APIep['vk'] . '/wall.get?owner_id=-120842574&count=5&offset=1&extended=1');
	
	$vk_vid_ac = 'ea52019c1531745551';
	//$vk_vid = file_get_contents($APIep['vk'] . '/video.get?owner_id=-144952964&count=1&offset=0&extended=0&access_token=' . $vk_vid_ac);
	// в случае, если ключ просрочится, выполнить запрос на https://oauth.vk.com/authorize?client_id=5981505&display=popup&redirect_uri=https://oauth.vk.com/blank.html&scope=video&response_type=code для получения нового

	if (filemtime($file) < time() - 10) {
		$mr24_info = json_decode($mr24);
		
		if ($mr24 === false) {
			$radio_stat = null;
		} else {
			$radio_online = strval($mr24_info->online);
			$radio_rj = $mr24_info->djname;
			for ($i = 0; $i <= ((count($mr24_info->songs) - 1) / 2 - 1); $i++) { $radio_prevs[$i] = $mr24_info->songs[$i]; }
			$radio_listeners = strval($mr24_info->listeners);
		}

		$radio_stat = [
			'online' => $radio_online,
			'rj' => $radio_rj,
			'song' => [
				'curr' => $mr24_info->song,
				'next' => $mr24_info->nextsongs[0],
				'prev' => $radio_prevs],
			'listeners' => $radio_listeners];

		for ($i = 0; $i < count($radioPoints); $i++) {
			$mr24_cnt = file_get_contents('https://myradio24.com/users/' . $radioPoints[$i][2] . '/status.json');

			$mr24_info = json_decode($mr24_cnt);

			if (!$mr24_cnt) {
				$r_stat = null;
			} else {
				$r_online = strval($mr24_info->online);
				$r_rj = $mr24_info->djname;
				for ($e = 0; $e <= ((count($mr24_info->songs) - 1) / 2 - 1); $e++) { $r_prevs[$e] = $mr24_info->songs[$e]; }
				$r_listeners = strval($mr24_info->listeners);
			}

			$r_stat = [
				'online' => $r_online,
				'rj' => $r_rj,
				'song' => [
					'curr' => $mr24_info->song,
					'next' => $mr24_info->nextsongs[0],
					'prev' => $r_prevs],
				'listeners' => $r_listeners];

			$r_json[$radioPoints[$i][0]] = $r_stat;
		}

		/*$stream_stat = [
			'online' => $stream_online,
			'viewers' => $stream_viewers];*/
		$stream_stat = null;

		$json_data = [
			'docs' => 'docs.txt',
			'timestamp' => time(),
			'radio' => $radio_stat,
			'radio-v2' => $r_json,
			'anime' => $stream_stat];

		file_put_contents(dirname(__FILE__) . '/' . $file, json_encode($json_data, JSON_UNESCAPED_UNICODE));
	}
	
	if (filemtime($vkfile) < time() - 10) {
		$vkAPI = json_decode($vk)->response;

		$vkAPI_Group = $vkAPI->groups[0];
		$vkAPI_Wall = $vkAPI->wall;

		$vkGroup = [
			'id' => $vkAPI_Group->screen_name,
			'gid' => $vkAPI_Group->gid,
			'pic' => $vkAPI_Group->photo_medium
		];

		for ($i = 1; $i < count($vkAPI_Wall); $i++) {
			$vkWall[$i-1] = [
				'id' => $vkAPI_Wall[$i]->id,
				'time' => $vkAPI_Wall[$i]->date,
				'type' => $vkAPI_Wall[$i]->post_type,
				'ad' => $vkAPI_Wall[$i]->marked_as_ads,
				'text' => $vkAPI_Wall[$i]->text
			];

			if ($vkAPI_Wall[$i]->attachment->photo->src) {
				$vkWall[$i-1] += [
					'photo' => [
						'small' => strtr($vkAPI_Wall[$i]->attachment->photo->src, $imgProxy),
						'big' => $vkAPI_Wall[$i]->attachment->photo->src_big
					]
				];
			};
		};

		$vkInfo = [
			'com' => $vkGroup,
			'posts' => $vkWall
		];

		file_put_contents(dirname(__FILE__) . '/' . $vkfile, json_encode($vkInfo, JSON_UNESCAPED_UNICODE));
	}

	/*if (filemtime($vkstream) < time() - 10) {
		$vkAPIs = json_decode($vk_vid)->response;
		echo $vk_vid;
		file_put_contents(dirname(__FILE__) . '/' . $vkstream, $vkAPI->player);
	}*/
?>
