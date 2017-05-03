<?php
	date_default_timezone_set('Europe/Moscow');
	error_reporting(0);

	include 'topsec/vars.php';

	$radioPoints = [
		['jp', 'Japan', 7934], // основной поток для радио, пока что
		['ru', 'Russia', 9759],
		['kp', 'Korea', 3799]
	];

	$imgProxy = array('https://' => 'https://images.weserv.nl/?url=ssl:');

	function get_mr24_info() {
		$APIep = $GLOBALS['APIep'];
		$radioPoints = $GLOBALS['radioPoints'];

		if (filemtime($file) < time() - 10) {

			$radio_stat = [
				'online' => '0',
				'rj' => 'Auto-DJ',
				'song' => [
					'curr' => 'You are using an old version of the extension.',
					'next' => 'You are using an old version of the extension.',
					'prev' => []],
				'listeners' => '0'];

			for ($i = 0; $i < count($radioPoints); $i++) {
				$mr24_cnt = file_get_contents($APIep['mr'] . '/users/' . $radioPoints[$i][2] . '/status.json');

				$mr24_info = json_decode($mr24_cnt);

				if (!$mr24_cnt) {
					$r_stat = null;
				} else {
					$r_online = $mr24_info->online;
					$r_rj = $mr24_info->djname;
					for ($e = 0; $e <= ((count($mr24_info->songs) - 1) / 2 - 1); $e++) { $r_prevs[$e] = $mr24_info->songs[$e]; }
					$r_listeners = $mr24_info->listeners;
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
				'radio' => $radio_stat,
				'radio-v2' => $r_json,
				'anime' => $stream_stat,
				'timestamp' => time()];

			file_put_contents(dirname(__FILE__) . '/api.json', json_encode($json_data, JSON_UNESCAPED_UNICODE));
		}
	}

	get_mr24_info();

	function get_vk_info() {
		$APIep = $GLOBALS['APIep'];
		$vkData = $GLOBALS['vkData'];
		$imgProxy = $GLOBALS['imgProxy'];

		$vk = file_get_contents($APIep['vk'] . '/wall.get?owner_id=-' . $vkData['comID'] . '&count=5&offset=1&extended=1&v=' . $vkData['api-version']);

		if (!$vk) { return false; }

		if (filemtime($vkfile) < time() - 10) {
			$vkAPI = json_decode($vk)->response;

			$vkAPI_Group = $vkAPI->groups[0];
			$vkAPI_Wall = $vkAPI->items;

			$vkPubInfo = [
				'id' => $vkAPI_Group->id,
				'url' => $vkAPI_Group->screen_name,
				'pic' => $vkAPI_Group->photo_100
			];

			for ($i = 0; $i < count($vkAPI_Wall); $i++) {
				$vkWall[$i] = [
					'id' => $vkAPI_Wall[$i]->id,
					'time' => $vkAPI_Wall[$i]->date,
					'type' => $vkAPI_Wall[$i]->post_type,
					'ad' => $vkAPI_Wall[$i]->marked_as_ads,
					'text' => $vkAPI_Wall[$i]->text
				];

				if ($vkAPI_Wall[$i]->attachments[0]->photo) {
					$vkWall[$i] += [
						'pic' => [
							'small' => strtr($vkAPI_Wall[$i]->attachments[0]->photo->photo_130, $imgProxy),
							'big' => $vkAPI_Wall[$i]->attachments[0]->photo->photo_604
						]
					];
				}

				if ($vkAPI_Wall[$i]->attachments[0]->video->photo_130) {
					$vkWall[$i] += [
						'pic' => [
							'small' => strtr($vkAPI_Wall[$i]->attachments[0]->video->photo_130, $imgProxy),
							'big' => $vkAPI_Wall[$i]->attachments[0]->video->photo_640
						]
					];
				}
			};

			$vkInfo = [
				'com' => $vkPubInfo,
				'posts' => $vkWall
			];

			file_put_contents(dirname(__FILE__) . '/vk-info.json', json_encode($vkInfo, JSON_UNESCAPED_UNICODE));
		}
	}

	get_vk_info();
?>
