<?php
	header('Content-type: text/html');
	date_default_timezone_set("Europe/Moscow");

	/* @TODO
	 * сделать экранирование символа "\" (пока что значение просто не срабатывает, если он есть)
	 * запихнуть удаление последнего элемента расписания в пункт создания (как с нотификациями)
	 */

	/*
	 * Определение файла с расписанием
	 */

	$anime_shed = 'streams-shed.json';
	$radio_shed = 'radio-shed.json';
	$noti = 'noti.json';
	//$shed_arch = 'streams-shed-arch.json';

	$shedAnime = json_decode(@file_get_contents($anime_shed));
	$shedRadio = json_decode(@file_get_contents($radio_shed));
	$noti_cnt = json_decode(@file_get_contents($noti));

	/*
	 * Функция для преобразования юникода в читабельный вид (в основном для дебага)
	 * стырена отсюда http://stackoverflow.com/a/6059008
	 */

	function unicodeString($str, $encoding = null) {
		if (is_null($encoding)) $encoding = ini_get('mbstring.internal_encoding');
			return preg_replace_callback('/\\\\u([0-9a-fA-F]{4})/u', function($match) use ($encoding) {
				return mb_convert_encoding(pack('H*', $match[1]), $encoding, 'UTF-16BE');
			}, $str);
	}
	
	/*
	 * Функция для сортировки эфиров
	 */

	function shedSort($f_what) {
		usort($f_what, function($a, $b) { return ($a[0] - $b[0]); });
		return $f_what;
	}
	
	/*
	 * Функция для добавления эфира в расписание
	 */
	
	function addShedData($f_file, $f_where, $f_what) {
		$f_where[count($f_where)] = $f_what;
		$f_where = shedSort($f_where);
		if ($f_what[2] != null) { file_put_contents(dirname(__FILE__) . '/' . $f_file, json_encode($f_where, JSON_UNESCAPED_UNICODE)); }
	}
	
	/*
	 * Функция для добавления эфира в расписание
	 */

	function rmShedData($f_file, $f_where) {
		if (count($f_where) > 2) {
			unset($f_where[count($f_where) - 2]);
			sort($f_where);
			$f_where = shedSort($f_where);
			file_put_contents(dirname(__FILE__) . '/' . $f_file, json_encode($f_where, JSON_UNESCAPED_UNICODE));
		} else return;		
	}

	/*
	 * Добавление нового элемента в расписание
	 * (и выполнение сортировки по времени старта)
	 */

	if (isset($_POST['add_air'])) {
		$time_start = strtotime($_POST['time_start']);

		if ($_POST['duration']) { $duration = $_POST['duration'] * 60; } else { $duration = 3600; }

		if (($val = intval($duration)) && ($duration > 0)) { $time_end = $time_start + $duration; }
		else { $time_end = $time_start + ($duration * -1); }

		$name = addcslashes($_POST['airname'], '"');
		$link = addcslashes($_POST['ellink'], '"');

		$newar = [$time_start, $time_end, json_decode('"'.$name.'"')];
		if ($_POST['ellink'] != null) { $newar[3] = json_decode('"'.$link.'"'); }

		switch ($_POST['where']) {
			case 'radio':
				addShedData($radio_shed, $shedRadio, $newar);
				break;
			case 'anime':
			default:
				addShedData($anime_shed, $shedAnime, $newar);
		}
	}

	/*
	 * Удаление (пред)последнего элемента расписания
	 */

	if (isset($_POST['last_clear'])) {
		rmShedData($anime_shed, $shedAnime);
	}

	/*
	 * Удаление элементов расписания с просроченным таймштампом
	 * (плюс счётчик этих элементов, нужен для вывода на страницу)
	 */

	if (isset($_POST['expired_clear']) && count($shedAnime) > 2) {
		for ($e = 1; $e <= (count($shedAnime) - 2); $e++) {
			if ($shedAnime[$e][1] < time()) { unset($shedAnime[$e]); }
		}
		sort($shedAnime);
		usort($shedAnime, function($a, $b){ return ($a[0] - $b[0]); });
		file_put_contents(dirname(__FILE__) . '/' . $anime_shed, json_encode($shedAnime, JSON_UNESCAPED_UNICODE));
	}

	//echo count($shedAnime);

	for ($e = 1; $e <= (count($shedAnime) - 2); $e++) {
		if ($shedAnime[$e][1] < time()) { ++$expr_count; }
	}

	/*
	 * Форсированная сортировка по времени старта
	 */

	if (isset($_POST['shed_force_sort'])) {
		usort($shedAnime, function($a, $b) { return ($a[0] - $b[0]); });
		file_put_contents(dirname(__FILE__) . '/' . $anime_shed, json_encode($shedAnime));
	}

	/*
	 * Манипулятор оповещений
	 */

	if (isset($_POST['noti_action'])) {
		$noti_text = addcslashes($_POST['noti_text'], '"');

		if (isset($_POST['noti_remove'])) {	$noti_data = [null, null]; }
		else { $noti_data = [json_decode('"'.$noti_text.'"'), time()]; }

		file_put_contents(dirname(__FILE__) . '/' . $noti, json_encode($noti_data, JSON_UNESCAPED_UNICODE));
	}
?>
<!DOCTYPE HTML>
<html lang="ru"><head>
	<?php if (isset($_GET["succ"])) : ?>
		<?php echo '<script>document.location.href="'. $_SERVER['PHP_SELF'] .'"</script><noscript><meta refresh="0;'. $_SERVER['PHP_SELF'] .'"></noscript></head><body><p><a href="">Если редирект не произошёл, то нажми сюда.</a></p>'; ?>
	<?php else: ?>
	<meta charset="utf-8">
	<title>Asian Wave / Control panel</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="shortcut icon" href="/files/img/favicon.png">
	<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto">
	<style>
		body { font-family: Roboto, Arial, sans-serif; }
		input { margin: 0 5px; }
		input[type=submit] { margin: 0 5px 0 0; }
		input[type=text], input[type=number] { padding: 2.5px; }
		input[type=text] { width: 400px; }
		input[type=number] { width: 70px; }
		p label, p input { vertical-align: middle; }
		footer {
			margin-top: 15px;
			padding-right: 5px;
			text-align: right;
			font-size: .9em;
			color: #a9a9a9;
		}
		form { margin-top: 10px; }
		form:first-child { margin-top: 0; }
		.succ { color: green; }
		samp {
			padding: 5px;
			background-color: #e4e4e4;
			line-height: 27px;
		}
		.shed-force-sort { display: none; }
		details summary { cursor: pointer; }
		.protip {
			font-size: .9em;
			margin: 5px 0 0 1em;
		}
		.maliyText { font-size: .9em; }
		.ocheMaliyText { font-size: .8em; }
	</style>
</head><body>
	<form class="add-air" action="?succ" method="post"><fieldset>
		<legend>Добавление нового эфира</legend>
		<p>
			<label for="time_start">Время начала:</label>
			<input required type="datetime-local" name="time_start" value="2016-05-06T00:00">
			<br><i class="ocheMaliyText">Время должно быть московским.</i>
		</p>
		<p>
			<label for="time_end">Продолжительность (в минутах):</label>
			<input type="number" name="duration" min="1" placeholder="60">
			<br><i class="ocheMaliyText">Не обязательно, только если время отлично от часа.</i>
		</p>
		<p>
			<label for="elname">Название:</label>
			<input required type="text" name="airname" placeholder="напр. Binan Koukou Chikyuu Bouei-bu LOVE! (1-2)">
		</p>
		<p>
			<label for="ellink">Ссылка:</label>
			<input type="text" name="ellink" placeholder="напр. https://shikimori.org/animes/1639">
		</p>
		<p>
			<label for="where">Куда добавлять эфир:</label>
			<input name="where" type="radio" value="anime" checked> anime
			<input name="where" type="radio" value="radio"> radio
		</p>
		<p style="margin-top: 25px;">
			<input type="submit" value="Создать" name="add_air">
			<label for="add_air"><i>Внимательно проверьте введённые данные!</i></label>
		</p>
	</fieldset></form>
	<form class="last-clear" action="?succ" method="post"><fieldset>
		<legend>Удалить последний эфир из расписания</legend>
		<p>
			<?php echo '<samp>'; if ($shedAnime[count($shedAnime)-2][0] !== 0) { echo 'Название: <q>' . $shedAnime[count($shedAnime)-2][2] . '</q>. Начало ' . date('Y-m-d в H:i', $shedAnime[count($shedAnime)-2][0]) . '; конец ' . date('Y-m-d в H:i', $shedAnime[count($shedAnime)-2][1]); } else { echo 'Очистка не требуется'; } echo '.</samp>' ?>
		</p>
		<p>
			<label for="last_chear_confr">Вы точно этого хотите?</label>
			<input required type="checkbox" name="last_chear_confr">
		</p>
		<p style="margin-top: 15px;">
			<input type="submit" value="Удалить" name="last_clear">
		</p>
	</fieldset></form>
	<form class="shed-force-sort" action="?succ" method="post"><fieldset>
		<legend>Форсированная сортировка по времени старта</legend>
		<p>
			<label for="sf_confr">Вы точно этого хотите?</label>
			<input required type="checkbox" name="sf_confr">
		</p>
		<p style="margin-top: 15px;">
			<input type="submit" value="Отсортировать" name="shed_force_sort">
		</p>
	</fieldset></form>
	<form class="expired-clear" action="?succ" method="post"><fieldset>
		<legend>Удалить "просроченные" эфиры из расписания</legend>
		<p>
			<?php echo '<samp>Просроченных эфиров'; if ($shedAnime[1][1] > time() && $expr_count = 1) { echo ' нет</samp>'; } else { echo ': ' . $expr_count . '</samp>'; } ?>
		</p>
		<p>
			<label for="expire_chear_confr">Вы точно этого хотите?</label>
			<input required type="checkbox" name="expire_chear_confr">
		</p>
		<p style="margin-top: 15px;">
			<input type="submit" value="Удалить" name="expired_clear">
		</p>
	</fieldset></form>
	<hr>
	<form class="noti-action" action="?succ" method="post"><fieldset>
		<legend>Работа с оповещениями</legend>
		<p class="maliyText">
			<?php if (isset($noti_cnt[0])) { echo 'Текущее оповещение: <samp>' . htmlspecialchars($noti_cnt[0]) . '</samp>'; }  ?>
		</p>
		<p>
			<label for="noti_text">Текст:</label>
			<input required type="text" name="noti_text" placeholder="напр. Розыгрыш BMW M3, не пропусти!">
		</p>
		<details>
			<summary>Памятка по разметке</summary>
			<p class="protip">Для стилизации текста можно использовать <kbd>&lt;b&gt;<b>жирный шрифт</b>&lt;/b&gt;</kbd> и <kbd>&lt;i&gt;<i>курсив</i>&lt;/i&gt;</kbd>, деление на абзацы с помощью <kbd>&lt;br&gt;</kbd>.<br>Ссылки должны быть вида <kbd>&lt;a href="https://..."&gt;текст&lt;/a&gt;</kbd>. В случае локальных ссылок сделует использовать <kbd>&lt;a href="/pisos"&gt;&lt;текст&lt;/a&gt;</kbd>.</p>
		</details>
		<p>
			<label for="noti_remove">Удалить последнее оповещение?</label>
			<input type="checkbox" name="noti_remove" <?php if (!isset($noti_cnt[0])) { echo ' disabled'; } ?>>
		</p>
		<p style="margin-top: 15px;">
			<input type="submit" value="Создать" name="noti_action">
		</p>
	</fieldset></form>
	<footer>
		<p>Asian Wave Control panel v0.3</p>
		<p>Последнее обновление расписания /radio: <span class="shedRadioTS"></span></p>
		<p>Последнее обновление расписания /anime: <span class="shedAnimeTS"></span></p>
		<p>Последнее обновление оповещения: <span class="notiTS"></span></p>
		<p>Точное московское время (на момент загрузки страницы): <?php echo date('Y-m-d H:i:s', time()) ?></p>
	</footer>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/locale/ru.js"></script>
	<script type="text/javascript">
		'use strict'

		function _elem(sel) { return document.querySelector(sel) }
		function _elems(sel) { return document.querySelectorAll(sel) }

		;(function resetForms() {
			let formsEls = _elems('form')
			for (let i = 0; i < formsEls.length; i++) {	formsEls[i].reset }
		})();

		;(function lastClVeevod() {
			let
				lTimeS = '<?php echo $shedAnime[count($shedAnime)-2][0]; ?>',
				lInputs = _elems('.last-clear input')

			if (lTimeS = 0) {
				for (let i = 0; i < lInputs.length; i++) {
					lInputs[i].setAttribute('disabled', '');
				}
			}
		})();

		;(function exprCheck() {
			let
				air_exp = <?php if ($shedAnime[1][1] > time() && $expr_count = 1) { echo 'false'; } else { echo 'true'; } ?>,
				exprFInputs = _elems('.expired-clear input')

			if (!air_exp) {
				for (let i = 0; i < exprFInputs.length; i++) {
					exprFInputs[i].setAttribute('disabled', '');
				}
			}
		})();

		;(function toLocalTime() {
			let
				lastTS = <?php echo $shedAnime[count($shedAnime) - 2][1]; ?>,
				inputsLT = _elems('input[type*=datetime]')

			for (let i = 0; i < inputsLT.length; i++) {
				inputsLT[i].setAttribute('value', moment.unix(lastTS).format('YYYY-MM-DDTHH:mm'));
			}
		})();

		;(function fileUpdate() {
			let
				shedRadioTS = '<?php echo @filemtime($radio_shed) ?>',
				shedAnimeTS = '<?php echo @filemtime($anime_shed) ?>',
				notiTS = '<?php echo @filemtime($noti) ?>'

			_elem('.shedRadioTS').textContent = moment.unix(shedRadioTS).from()
			_elem('.shedAnimeTS').textContent = moment.unix(shedAnimeTS).from()
			_elem('.notiTS').textContent = moment.unix(notiTS).from()
		})();

		;(function notiDisable() {
			let
				notiCreateF = _elem('[name="noti_text"]'),
				notiSubmitBtn = _elem('[name="noti_action"]')

			document.querySelector('[name="noti_remove"]').addEventListener('change', function() {
				if (this.checked) {
					notiCreateF.setAttribute('disabled', '');
					notiCreateF.value = '';
					notiSubmitBtn.value = 'Удалить';
				} else if (!this.checked && notiCreateF.hasAttribute('disabled')) {
					notiCreateF.removeAttribute('disabled');
					notiSubmitBtn.value = 'Создать';
				}
			});
		})();
	</script>
	<?php endif; ?>
</body></html>
