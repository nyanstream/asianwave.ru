<?php
	date_default_timezone_set("Europe/Moscow");
	$start = microtime(true);

	//$eientei = "http://video.eientei.org/backend/streams/running";
	//$cg = "http://api.cybergame.tv/w/streams.php?channel=asianwave";
	$mr24 = "https://myradio24.com/users/7934/status.json";
	$file = "api.json";

	if(@filemtime($file) < time() - 10) {
		//$eientei_info = json_decode(@file_get_contents($eientei));*/
		$cg_info = json_decode(@file_get_contents($cg));
		$mr24_info = json_decode(@file_get_contents($mr24));

		//$fcount = count($eientei_info);

		/*if ($eientei === false) {
			$stream_online = 0;
		} else {
			for ($i = 0; $i <= $fcount; $i++) {
				if ($eientei_info[$i]->name = "AsianWave"){
					//$stream_online = $eientei_info[1]->name;
					$stream_online = 1;
				}
			}
		}*/

		/*if ($cg === false) {
			$stream_stat = null;
		} else {
			$stream_online = $cg_info->online;
			$stream_viewers = $cg_info->viewers;
		}*/

		if ($mr24 === false) {
			$radio_stat = null;
		} else {
			$radio_online = strval($mr24_info->online);
			$radio_rj = $mr24_info->djname;
			for ($i = 0; $i <= ((count($mr24_info->songs) - 1) / 2 - 1); $i++) {$radio_prevs[$i] = $mr24_info->songs[$i];}
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

		file_put_contents(dirname(__FILE__) . '/' . $file, json_encode($json_data));
	}

	/*if ($_GET["d"] !== null) {
		header('Content-type: application/json');
		date_default_timezone_set("Europe/Moscow");
		$json_datas = array('msk_time' => date("H", time()) . ':' . date("i", time()), 'sanic' => (microtime(true) - $start));
		echo json_encode($json_datas);
	}*/
?>
