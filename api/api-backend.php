<?php
	date_default_timezone_set('Europe/Moscow');
	//error_reporting(0);

	include 'topsec/vars.php';

	function get_mr24_info() {
		$APIep = $GLOBALS['APIep'];
		$radioPoints = $GLOBALS['radioPoints'];

		if (filemtime($file) < time() - 10) {
			//for ($i = 0; $i < count($radioPoints); $i++) {
			foreach ($radioPoints as $i=>&$point) {
				$mr24_cnt = file_get_contents($APIep['mr'] . '/' . $point[2] . '/status.json');

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
						'next' => $mr24_info->nextsongs[0]/*,
						//'prev' => $r_prevs*/], // пока не нужно
					'listeners' => $r_listeners];

				$r_json[$point[0]] = $r_stat;
			}

			/*$stream_stat = [
				'online' => $stream_online,
				'viewers' => $stream_viewers];*/
			$stream_stat = null;

			$json_data = [
				'radio-v2' => $r_json,
				'anime' => $stream_stat,
				'timestamp' => time()];
				
			file_put_contents(dirname(__FILE__) . '/api.json', json_encode($json_data, JSON_UNESCAPED_UNICODE));
		}
	}

	get_mr24_info();
?>
