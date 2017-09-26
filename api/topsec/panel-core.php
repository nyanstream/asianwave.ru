<?php
	include 'vars.php';

	$file = [
		'sched' => [
			'anime' => 'anime-sched.json',
			'radio' => 'radio-sched.json'
		],
		'noti' => 'noti.json'
	];

	$schedAnime = file_get_contents($file['sched']['anime']);
	$schedRadio = file_get_contents($file['sched']['radio']);
	$noti       = file_get_contents($file['noti']);

	$schedAnime_data = json_decode($schedAnime, true);
	$schedRadio_data = json_decode($schedRadio, true);
	$noti_data       = json_decode($noti, true);

	$path = getcwd();

	/*
	 * Создаются временные массивы без "секретных эфиров"
	 * Важно понимать: счётчик эфиров и последний эфир берутся именно из временного, а не из настоящего массива.
	 */

	$schedAnime_data_tmp = [];
	$schedRadio_data_tmp = [];

	foreach ($schedAnime_data as &$item) {
		if ($item['secret'] == true) { continue; }
		$schedAnime_data_tmp[count($schedAnime_data_tmp)] = $item;
	}

	foreach ($schedRadio_data as &$item) {
		if ($item['secret'] == true) { continue; }
		$schedRadio_data_tmp[count($schedRadio_data_tmp)] = $item;
	}

	$schedAnime_count  = count($schedAnime_data_tmp);
	$schedAnime_latest = $schedAnime_data_tmp[$schedAnime_count-1];

	$schedRadio_count  = count($schedRadio_data_tmp);
	$schedRadio_latest = $schedRadio_data_tmp[$schedRadio_count-1];

	/*
	 * Компановка нового элемента расписания
	 */

	function schedNew($_time, $_duration, $_title, $_link, $_is_secret) {
		$time_start = strtotime($_time);
		if ($_duration) {	$duration = $_duration * 60; } else { $duration = 3600;	}
		$time_end = $time_start + $duration;

		$title = addcslashes($_title, '"');
		$link = addcslashes($_link, '"');

		$new = [
			's' => $time_start,	'e' => $time_end,
			'title' => json_decode('"' . $title . '"')
		];

		if ($_link != null) {	$new['link'] = json_decode('"' . $link . '"');	}
		if ($_is_secret == 'on') {	$new['secret'] = true;	}

		return $new;
	}

	/*
	 * Сортировка расписания
	 */

	function shedSort($_what) {
		usort($_what, function($a, $b) { return $a['s'] - $b['s']; });
		return $_what;
	}

	/*
	 * Добавление элемента в расписание
	 */

	function addShedData($_file, $_where, $_what) {
		$path = $GLOBALS['path'];
		$_where[count($_where)] = $_what;
		$_where = shedSort($_where);
		if ($_what['title'] != null) { file_put_contents($path . '/' . $_file, json_encode($_where, JSON_UNESCAPED_UNICODE)); }
	}

	/*
	 * Удаление элемента из расписания
	 */

	function rmShedData($_file, $_where, $_item) {
		$path = $GLOBALS['path'];
		$_where_tmp = [];
		foreach($_where as $item) {
			if ($_item == $item) { unset($item); continue; }
			$_where_tmp[count($_where_tmp)] = $item;
		}
		$_where = shedSort($_where_tmp);
		file_put_contents($path . '/' . $_file, json_encode($_where, JSON_UNESCAPED_UNICODE));
	}

	if (isset($_POST['add_air'])) {
		$newAir = schedNew(
			$_POST['time_start'],
			$_POST['duration'],
			$_POST['air_name'],
			$_POST['air_link'],
			$_POST['air_is_secret']
		);

		switch ($_POST['where']) {
			case 'radio':
				addShedData($file['sched']['radio'], $schedRadio_data, $newAir); break;
			case 'anime':
				addShedData($file['sched']['anime'], $schedAnime_data, $newAir);
		}
	}

	if (isset($_POST['rm_air'])) {
		switch ($_POST['where']) {
			case 'radio':
				rmShedData($file['sched']['radio'], $schedRadio_data, $schedRadio_latest);	break;
			case 'anime':
				rmShedData($file['sched']['anime'], $schedAnime_data, $schedAnime_latest);
		}
	}

	/*
	 * Удаление элементов расписания с просроченным таймштампом
	 * (плюс счётчик этих элементов, нужен для вывода на страницу)
	 */

	function countExprs($_where) {
		$count = 0;
		foreach ($_where as $item) { if ($item['e'] < time()) $count++; }
		return $count;
	}

	function rmExprs($_file, $_where, $_time) {
		$path = $GLOBALS['path'];
		$_where_tmp = [];
		foreach ($_where as $item) {
			if ($item['e'] < $_time) { unset($item); continue; }
			$_where_tmp[count($_where_tmp)] = $item;
		}
		$_where = shedSort($_where_tmp);
		file_put_contents($path . '/' . $_file, json_encode($_where, JSON_UNESCAPED_UNICODE));
	}

	if (isset($_POST['expired_clear'])) {
		rmExprs($file['sched']['anime'], $schedAnime_data, time());
		rmExprs($file['sched']['radio'], $schedRadio_data, time());
	}

	/*
	 * Манипулятор оповещений
	 */

	function notiNew($_text, $_color) {
		$text = addcslashes($_text, '"');

		$new = [
			'enabled' => true,
			'time' => time(),
			'text' => json_decode('"' . $text . '"')
		];

		if ($_color != '#ffffff') {	$new['color'] = json_decode('"' . $_color . '"');	}

		return $new;
	}

	if (isset($_POST['noti'])) {
		if (!isset($_POST['noti_rm'])) {
			$noti_content = notiNew($_POST['noti_text'], $_POST['noti_color']);
		}	else { $noti_content = ['enabled' => false]; }

		file_put_contents($path . '/' . $file['noti'], json_encode($noti_content, JSON_UNESCAPED_UNICODE));
	}
?>
