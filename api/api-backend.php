<?php
	date_default_timezone_set('Europe/Moscow');
	$start = microtime(true);

	$mr24 = file_get_contents('https://myradio24.com/users/7934/status.json');
	$vk = file_get_contents('https://api.vk.com/method/wall.get?owner_id=-120842574&count=5&offset=1&extended=1');

	$file = 'api.json';
	$vkfile = 'vk-info.json';

	if(filemtime($file) < time() - 10) {
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
		/*$stream_stat = [
			'online' => $stream_online,
			'viewers' => $stream_viewers];*/
		$stream_stat = null;

		$json_data = [
			'docs' => 'docs.txt',
			'timestamp' => time(),
			'radio' => $radio_stat,
			'stream' => $stream_stat];

		file_put_contents(dirname(__FILE__) . '/' . $file, json_encode($json_data, JSON_UNESCAPED_UNICODE));
	}
	
	if(filemtime($vkfile) < time() - 10) {
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
						'small' => $vkAPI_Wall[$i]->attachment->photo->src,
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
?>
