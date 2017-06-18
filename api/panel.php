<?php
	date_default_timezone_set('Europe/Moscow');
	include('topsec/vars.php');

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
		$_where[count($_where)] = $_what;
		$_where = shedSort($_where);
		if ($_what['title'] != null) { file_put_contents(dirname(__FILE__) . '/' . $_file, json_encode($_where, JSON_UNESCAPED_UNICODE)); }
	}

	/*
	 * Удаление элемента из расписания
	 */

	function rmShedData($_file, $_where, $_item) {
		$_where_tmp = [];
		foreach($_where as $item) {
			if ($_item == $item) { unset($item); continue; }
			$_where_tmp[count($_where_tmp)] = $item;
		}
		$_where = shedSort($_where_tmp);
		file_put_contents(dirname(__FILE__) . '/' . $_file, json_encode($_where, JSON_UNESCAPED_UNICODE));
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
		$_where_tmp = [];
		foreach ($_where as $item) {
			if ($item['e'] < $_time) { unset($item); continue; }
			$_where_tmp[count($_where_tmp)] = $item;
		}
		$_where = shedSort($_where_tmp);
		file_put_contents(dirname(__FILE__) . '/' . $_file, json_encode($_where, JSON_UNESCAPED_UNICODE));
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

		file_put_contents(dirname(__FILE__) . '/' . $file['noti'], json_encode($noti_content, JSON_UNESCAPED_UNICODE));
	}
?>
<!DOCTYPE HTML>
<html lang="ru"><head>
	<meta charset="utf-8">
	<title>Asian Wave / Control panel</title>
	<meta id="viewport" content="width=device-width, initial-scale=1">
<?php if (isset($_GET['action'])) echo '<script>document.location.href="'. $_SERVER['PHP_SELF'] .'"</script><noscript><meta refresh="0; '. $_SERVER['PHP_SELF'] .'"></noscript>'; ?>
	<link rel="shortcut icon" href="https://asianwave.ru/files/img/favicon.png">
	<link rel="stylesheet" href="https://asianwave.ru/files/css/aw-fonts.min.css">
	<style>
		body { font-family: Roboto, Arial, sans-serif }
		input { margin: 0 5px }
		input[type=submit] { margin: 0 5px 0 0 }
		input[type=text], input[type=number] { padding: 2.5px }
		input[type=text] { width: 400px }
		input[type=number] { width: 70px }
		p label, p input { vertical-align: middle }
		footer {
			margin-top: 15px;
			padding-right: 5px;
			text-align: right;
			font-size: .9em;
			color: #a9a9a9;
		}
		form { margin-top: 10px }
		form:first-child { margin-top: 0 }
		samp {
			padding: 5px;
			background-color: #e4e4e4;
			line-height: 27px;
		}
		.shed-force-sort { display: none }
		details summary { cursor: pointer }
		.maliyText { font-size: .9em }
		.omc { font-size: .8em }
	</style>
</head></body>
	<form class="add-air" action="?action" method="post"><fieldset>
		<legend>Добавление нового эфира</legend>
		<p>
			<label for="time_start">Время начала:</label>
			<input required type="datetime-local" name="time_start" value="2016-05-06T00:00">
			<br><i class="omc">Время должно быть московским.</i>
		</p>
		<p>
			<label for="duration">Продолжительность (в минутах):</label>
			<input type="number" name="duration" min="1" placeholder="60">
			<br><i class="omc">Необязательно, только если время отлично от часа.</i>
		</p>
		<p>
			<label for="air_name">Название:</label>
			<input required type="text" name="air_name" placeholder="напр. Binan Koukou Chikyuu Bouei-bu LOVE! (1-2)">
		</p>
		<p>
			<label for="air_link">Ссылка:</label>
			<input type="text" name="air_link" placeholder="напр. https://shikimori.org/animes/1639">
		</p>
		<p>
			<label for="where">Куда добавлять эфир:</label>
			<input required name="where" type="radio" value="anime" checked> anime
			<input required name="where" type="radio" value="radio"> radio
		</p>
		<p style="display: none">
			<label for="air_is_secret">Эфир секретный?</label>
			<input type="checkbox" name="air_is_secret">
			<br><i class="omc">Не отображать эфир в расписании.</i>
		</p>
		<p style="margin-top: 25px">
			<input type="submit" value="Добавить" name="add_air">
			<label for="add_air"><i>Внимательно проверьте введённые данные!</i></label>
		</p>
	</fieldset></form>
	<hr>
	<form class="rm-air" action="?action" method="post"><fieldset>
		<legend>Удалить последний эфир из расписания</legend>
		<p>
			Последний эфир на /anime: <samp><?php
				if ($schedAnime_count > 0) {
					echo 'Название: <q>' . $schedAnime_latest['title'] . '</q>. Начало ' . date('Y-m-d в H:i', $schedAnime_latest['s']) . '; конец ' . date('Y-m-d в H:i', $schedAnime_latest['e']);
				} else { echo 'Расписание пустое'; }
			?></samp><br>
			Последний эфир на /radio: <samp><?php
				if ($schedRadio_count > 0) {
					echo 'Название: <q>' . $schedRadio_latest['title'] . '</q>. Начало ' . date('Y-m-d в H:i', $schedAnime_latest['s']) . '; конец ' . date('Y-m-d в H:i', $schedRadio_latest['e']);
				} else { echo 'Расписание пустое'; }
			?></samp>
		</p>
		<p>
			<label for="where">Откуда удалять?</label>
			<input required name="where" type="radio" value="anime" checked> anime
			<input required name="where" type="radio" value="radio"> radio
		</p>
		<p>
			<label for="rm_air_cnf">Вы точно этого хотите?</label>
			<input required type="checkbox" name="rm_air_cnf">
		</p>
		<p style="margin-top: 15px;">
			<input type="submit" value="Удалить" name="rm_air">
		</p>
	</fieldset></form>
	<hr>
	<form class="expired-clear" action="?action" method="post"><fieldset>
		<legend>Удалить "просроченные" эфиры из расписания</legend>
		<p>
			<samp class="count"></samp>
		</p>
		<p>
			<label for="expire_chear_cnf">Вы точно этого хотите?</label>
			<input required type="checkbox" name="expire_chear_cnf">
		</p>
		<p style="margin-top: 15px;">
			<input type="submit" value="Удалить" name="expired_clear">
		</p>
	</fieldset></form>
	<hr>
	<fieldset>
		<legend>Обновление токена доступа ВК</legend>
			<p>
				<a href="<?php echo $APIep['vk_au'] . '?client_id=' . $vkData['id'] . '&display=page&redirect_uri=https://' . $_SERVER['SERVER_NAME'] . '/api/api-backend-vk.php&scope=video,offline&response_type=code&state=vk-get-code'; ?>" target="_blank" rel="nofollow noopener">Просто нажми сюда</a>
			</p>
	</fieldset>
	<hr>
	<form class="noti" action="?action" method="post"><fieldset>
		<legend>Работа с оповещениями</legend>
		<p class="maliyText">
			<?php
				$_nColor = (isset($noti_data['color'])) ? $_nColor = ' style="background-color: ' . $noti_data['color'] . ';"': $_nColor = '';

				if ($noti_data['enabled'] == true) echo 'Текущее оповещение: <samp' . $_nColor . '>' . htmlspecialchars($noti_data['text']) . '</samp>' . "\n";
			?>
		</p>
		<p>
			<label for="noti_text">Текст:</label>
			<input required type="text" name="noti_text" placeholder="напр. Розыгрыш BMW M3, не пропусти!">
		</p>
		<details>
			<summary>Памятка по разметке</summary>
			<p style="margin: 5px 0 0 1em" class="maliyText">Для стилизации текста можно использовать <kbd>&lt;b&gt;<b>жирный шрифт</b>&lt;/b&gt;</kbd> и <kbd>&lt;i&gt;<i>курсив</i>&lt;/i&gt;</kbd>, деление на абзацы с помощью <kbd>&lt;br&gt;</kbd>.<br>Ссылки должны быть вида <kbd>&lt;a href="https://..."&gt;текст&lt;/a&gt;</kbd>. В случае локальных ссылок следует использовать <kbd>&lt;a href="/pisos"&gt;&lt;текст&lt;/a&gt;</kbd>.</p>
		</details>
		<p>
			<label for="noti_color">Цвет фона:</label>
			<input type="color" name="noti_color" value="#ffffff">
		</p>
		<p>
			<label for="noti_rm">Удалить последнее оповещение?</label>
			<input type="checkbox" name="noti_rm" <?php if ($noti_data['enabled'] == false) { echo ' disabled'; } ?>>
		</p>
		<p style="margin-top: 15px;">
			<input type="submit" value="Создать" name="noti">
		</p>
	</fieldset></form>
	<footer>
		<p>Asian Wave Control panel v0.5</p>
		<p>Последнее обновление расписания /radio: <span class="tsOfAnime"></span></p>
		<p>Последнее обновление расписания /anime: <span class="tsOfRadio"></span></p>
		<p>Последнее обновление оповещения: <span class="tsOfNoti"></span></p>
		<p>Точное московское время (на момент загрузки страницы): <span title="Год-месяц-день час-минута-секунда"><?php echo date('Y-m-d H:i:s', time()); ?></span></p>
	</footer>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js" defer></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/locale/ru.js" defer></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.13/moment-timezone-with-data.min.js" defer></script>
	<script src="https://asianwave.ru/files/js/kamina.min.js" defer></script>
	<script type="text/javascript">
		'use strict'

		document.addEventListener('DOMContentLoaded', () => {
			moment.tz.setDefault('<?php echo date_default_timezone_get(); ?>')
			$make.qs('form', ['a']).forEach((form) => { form.reset() })

			;(() => {
				let
					needChangeTime = <?php echo ($schedAnime_count > 0) ? 'true' : 'false'; ?>,
					newTime = <?php echo ($schedAnime_latest) ? $schedAnime_latest['e'] : 0; echo "\n" ?>

				if (needChangeTime) $make.qs('.add-air input[type*=datetime]').setAttribute('value', moment.unix(newTime).format('YYYY-MM-DDTHH:mm'))
			})()

			;(() => {
				let emptySched = {
					'anime': <?php echo ($schedAnime_count == 0) ? 'true' : 'false'; ?>,
					'radio': <?php echo ($schedRadio_count == 0) ? 'true' : 'false'; echo "\n"; ?>
				}

				for (let key in emptySched) {
					if (emptySched.hasOwnProperty(key) && emptySched[key]) {
						$make.qs(`.rm-air input[type="radio"][value="${key}"]`).setAttribute('disabled', '')
					}
				}

				if (emptySched['anime'] && emptySched['radio']) $make.qs('.rm-air input', ['a']).forEach((input) => { input.setAttribute('disabled', '') })
			})()

			;(() => {
				let exprsSched = {
					'anime': <?php echo countExprs($schedAnime_data_tmp) ?>,
					'radio': <?php echo countExprs($schedRadio_data_tmp) . "\n"; ?>
				}

				$make.qs('.expired-clear .count').innerHTML = `Всего просроченных эфиров: ${exprsSched['anime'] + exprsSched['radio']}; ${exprsSched['anime']} в /anime, ${exprsSched['radio']} в /radio.`

				if (exprsSched['anime'] + exprsSched['radio'] == 0) $make.qs('.expired-clear input', ['a']).forEach((input) => { input.setAttribute('disabled', '') })
			})()

			;(() => {
				let
					notiCreateF = $make.qs('.noti input[type="text"]'),
					notiCreateC = $make.qs('.noti input[type="color"]'),
					notiSubmitBtn = $make.qs('.noti input[type="submit"]')

				$make.qs('.noti input[type="checkbox"]').addEventListener('change', function() {
					if (this.checked) {
						notiCreateF.setAttribute('disabled', '')
						notiCreateC.setAttribute('disabled', '')
						notiCreateF.value = ''
						notiSubmitBtn.value = 'Удалить'
					} else if (!this.checked && notiCreateF.hasAttribute('disabled') && notiCreateC.hasAttribute('disabled')) {
						notiCreateF.removeAttribute('disabled')
						notiCreateC.removeAttribute('disabled', '')
						notiSubmitBtn.value = 'Создать'
					}
				})
			})()

			;(() => {
				let
					tsOfRadio = <?php echo filemtime($file['sched']['radio']); ?>,
					tsOfAnime = <?php echo filemtime($file['sched']['anime']); ?>,
					tsOfNoti = <?php echo filemtime($file['noti']) . "\n"; ?>

				$make.qs('footer .tsOfRadio').textContent = moment.unix(tsOfRadio).from()
				$make.qs('footer .tsOfAnime').textContent = moment.unix(tsOfAnime).from()
				$make.qs('footer .tsOfNoti').textContent = moment.unix(tsOfNoti).from()
			})()
		})
	</script>
</body></html>
