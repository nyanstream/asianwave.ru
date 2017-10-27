<?php
	date_default_timezone_set('Europe/Moscow');
	error_reporting(0);

	include 'topsec/vars.php';

	function API() {
		$file =         'radio.json';
		$APIep =        $GLOBALS['APIep'];
		$radioPoints =  $GLOBALS['radioPoints'];
		$radioStat =    [];

		if (filemtime($file) < time() - 10) {
			$radioInfo =       file_get_contents($APIep['radio'] . '/nowplaying');
			$radioInfo_data =  json_decode($radioInfo, true);

			/*
			 * Первый цикл перебирает все поинты радио, второй - станции из Азуры
			 */

			foreach ($radioPoints as $i => $point) {
				if (!$radioInfo_data) {
					$radioStat[$point['code']] = ['online' => false];
				} else {
					foreach ($radioInfo_data as $e => $station) {
						if ($point['id'] == $station['station']['id']) {
							$songsHistory = [];
							foreach ($station['song_history'] as $s => $song) {
								$songsHistory[$s] = [
									'time' => $song['played_at'],
									'name' => $song['song']['text']
								];
							}

							$radioStat[$point['code']] = [
								'online' => true,
								'song' => [
									'current' => $station['now_playing']['song']['text'],
									'next' => $station['playing_next']['song']['text'],
									'history' => $songsHistory
								],
								'listeners' => $station['listeners']['current']
							];
						}
					}
				}
			}

			$radioStatOld = [];
			foreach ($radioPoints as $i => $point) {
				$radioStatOld[$point['code']] = [
					'online' => 0,
					'rj' => 'Auto-DJ',
					'song' => [
						'curr' => 'This application is decrecated. Please update.',
						'next' => '',
					'listeners' => '']
				];
			}

			$API = [
				'radio-v3' => $radioStat,
				'radio-v2' => $radioStatOld,
				'timestamp' => time()
			];

			file_put_contents(dirname(__FILE__) . '/' . $file, json_encode($API, JSON_UNESCAPED_UNICODE));
		}
	}

	API();
?>
