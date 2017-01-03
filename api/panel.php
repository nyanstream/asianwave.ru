<?php
	header('Content-type: text/html');
	date_default_timezone_set("Europe/Moscow");

	/* @TODO
	 * сделать красивый вывод во второй функции на пхп
	 * сделать экранирование символа "\" (пока что значение просто не срабатывает, если он есть)
	 * сделать отключение инпута удаления последнего оповещения, если его нет
	 * показывать текст оповещения, если оно есть
	 * запихнуть удаление последнего элемента расписания в пункт создания (как с нотификациями)
	 */

	/*
	 * Определение файла с расписанием
	 */

	$shed = 'streams-shed.json';
	$noti = 'noti.json';
	//$shed_arch = 'streams-shed-arch.json';

	$shed_data = json_decode(@file_get_contents($shed));

	/*
	 * Функция, преобразующая юникод в читабельный вид (в основном для дебага)
	 * стырена отсюда http://stackoverflow.com/a/6059008
	 */

	function unicodeString($str, $encoding=null) {
	if (is_null($encoding)) $encoding = ini_get('mbstring.internal_encoding');
		return preg_replace_callback('/\\\\u([0-9a-fA-F]{4})/u', function($match) use ($encoding) {
			return mb_convert_encoding(pack('H*', $match[1]), $encoding, 'UTF-16BE');
		}, $str);
	}

	/*
	 * Добавление нового элемента в расписание
	 * (и выполнение сортировки по времени старта)
	 */

	if(isset($_POST['add_air'])) {
		$time_start = strtotime($_POST['time_start']);
		$duration = $_POST['duration'] * 60;
		if (($val = intval($duration)) && ($duration > 0)) {
			$time_end = $time_start + $duration;
		} else {
			$time_end = $time_start + ($duration * -1);
		}
		$name = addcslashes($_POST['airname'], '"');
		$link = addcslashes($_POST['ellink'], '"');

		$newar = [$time_start, $time_end, json_decode('"'.$name.'"')];
		if($_POST['ellink'] != null) {
			$newar[3] = json_decode('"'.$link.'"');
		}

		$shed_data[count($shed_data)] = $newar;

		usort($shed_data, function($a, $b){
			return ($a[0] - $b[0]);
		});

		if ($newar[2] != null) {
			file_put_contents(dirname(__FILE__) . '/' . $shed, json_encode($shed_data));
		}
		//file_put_contents(dirname(__FILE__) . '/' . $shed_arch, json_encode($shed_data));
	}

	/*
	 * Удаление (пред)последнего элемента расписания
	 */

	if(isset($_POST['last_clear']) && count($shed_data) > 2) {
		unset($shed_data[count($shed_data) - 2]);
		sort($shed_data);
		usort($shed_data, function($a, $b){
			return ($a[0] - $b[0]);
		});
		file_put_contents(dirname(__FILE__) . '/' . $shed, json_encode($shed_data));
	}

	/*
	 * Удаление элементов расписания с просроченным таймштампом
	 * (плюс счётчик этих элементов, нужен для вывода на страницу)
	 */

	if(isset($_POST['expired_clear']) && count($shed_data) > 2) {
		for ($e = 1; $e <= (count($shed_data) - 2); $e++) {
			if ($shed_data[$e][1] < time()) {
				unset($shed_data[$e]);
			}
		}
		sort($shed_data);
		usort($shed_data, function($a, $b){
			return ($a[0] - $b[0]);
		});
		file_put_contents(dirname(__FILE__) . '/' . $shed, json_encode($shed_data));
	}

	//echo count($shed_data);

	for ($e = 1; $e <= (count($shed_data) - 2); $e++) {
		if ($shed_data[$e][1] < time()) {
			++$expr_count;
		}
	}

	/*
	 * Форсированная сортировка по времени старта
	 */

	if(isset($_POST['shed_force_sort'])) {
		usort($shed_data, function($a, $b){
			return ($a[0] - $b[0]);
		});
		file_put_contents(dirname(__FILE__) . '/' . $shed, json_encode($shed_data));
	}

	/*
	 * Манипулятор оповещений
	 */

	if(isset($_POST['noti_action'])) {
		$noti_text = addcslashes($_POST['noti_text'], '"');

		if (isset($_POST['noti_remove'])) {
			$noti_data = [null, null];
		} else {
			$noti_data = [json_decode('"'.$noti_text.'"'), time()];
		}

		file_put_contents(dirname(__FILE__) . '/' . $noti, json_encode($noti_data));
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
	<link rel="shortcut icon" href="/files/img/favicon.ico">
	<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto">
	<style>
		body {font-family: Roboto, Arial, sans-serif;}
		input {margin: 0 5px;}
		input[type=submit] {margin: 0 5px 0 0;}
		input[type=text], input[type=number] {padding: 2.5px;}
		input[type=text] {width: 400px;}
		input[type=number] {width: 70px;}
		label {vertical-align: middle;}
		footer {
			margin-top: 15px;
			padding-right: 5px;
			text-align: right;
			font-size: .9em;
			color: #a9a9a9;
		}
		form {margin-top: 10px;}
		form:first-child {margin-top: 0;}
		.succ {color: green;}
		samp {
			padding: 5px;
			background-color: #e4e4e4;
			line-height: 27px;
		}
		.shed-force-sort {display: none;}
		.protip {
			font-size: 0.9em;
			margin: 5px 0 0 1em;
		}
	</style>
	<?php // if(isset($_GET["succ"])) {echo '<script>document.location.href="'. $_SERVER['PHP_SELF'] .'"</script><noscript><meta refresh="0;'. $_SERVER['PHP_SELF'] .'"></noscript>';} ?>
</head><body>
	<?php // echo 'аутпут: <span class="dev">' . unicodeString(json_encode($shed_data)) . '</span><br>' ?>
	<form class="add-air" action="?succ" method="post"><fieldset>
		<legend>Добавление нового эфира</legend>
		<p><label for="time_start">Время начала:<input required type="datetime-local" name="time_start" value="2016-05-06T00:00"></label></p>
		<p style="font-size: 0.9em;"><i>Время должно быть московским.</i></p>
		<p><label for="time_end">Продолжительность (в минутах):<input required type="number" name="duration" placeholder="60"></label></p>
		<p><label for="elname">Название:<input required type="text" name="airname" placeholder="напр. Binan Koukou Chikyuu Bouei-bu LOVE! (1-2)"></label></p>
		<p><label for="ellink">Ссылка:<input type="text" name="ellink" placeholder="напр. https://shikimori.org/animes/1639"></label></p>
		<p style="margin-top: 25px;"><input type="submit" value="Создать" name="add_air"><label for="add_air"><i>Внимательно проверьте введённые данные!</i></label></p>
	</fieldset></form>
	<form class="last-clear" action="?succ" method="post"><fieldset>
		<legend>Удалить последний эфир из расписания</legend>
		<p class="lVeevod"></p>
		<p><label for="last_chear_confr">Вы точно этого хотите?<input required type="checkbox" name="last_chear_confr"></p>
		<p style="margin-top: 15px;"><input type="submit" value="Удалить" name="last_clear"></p>
	</fieldset></form>
	<form class="shed-force-sort" action="?succ" method="post"><fieldset>
		<legend>Форсированная сортировка по времени старта</legend>
		<p><label for="sf_confr">Вы точно этого хотите?<input required type="checkbox" name="sf_confr"></p>
		<p style="margin-top: 15px;"><input type="submit" value="Отсортировать" name="shed_force_sort"></p>
	</fieldset></form>
	<form class="expired-clear" action="?succ" method="post"><fieldset>
		<legend>Удалить "просроченные" эфиры из расписания</legend>
		<p><?php// echo '<samp>Просроченных эфиров'; if(($shed_data[0][1] > time()) && ($expr_count != 1)) {echo ' нет.</samp>';} else {echo ': ' . $expr_count . '</samp>';} ?></p>
		<p><?php echo '<samp>Просроченных эфиров'; if($shed_data[1][1] > time() && $expr_count = 1) {echo ' нет</samp>';} else {echo ': ' . $expr_count . '</samp>';} ?></p>
		<p><label for="expire_chear_confr">Вы точно этого хотите?<input required type="checkbox" name="expire_chear_confr"></p>
		<p style="margin-top: 15px;"><input type="submit" value="Удалить" name="expired_clear"></p>
	</fieldset></form>
	<hr>
	<form class="noti-action" action="?succ" method="post"><fieldset>
		<legend>Работа с оповещениями</legend>
		<p><label for="noti_text">Текст:<input required type="text" name="noti_text" placeholder="напр. Розыгрыш BMW M3, не пропусти!"></label></p>
		<details>
			<summary>Памятка по разметке</summary>
			<p class="protip">Для стилизации текста можно использовать <kbd>&lt;b&gt;<b>жирный шрифт</b>&lt;/b&gt;</kbd> и <kbd>&lt;i&gt;<i>курсив</i>&lt;/i&gt;</kbd>. Делить на абзацы можно с помощью <kbd>&lt;br&gt;</kbd>.<br>Ссылки должны быть вида <kbd>&lt;a href="https://..."&gt;текст&lt;/a&gt;</kbd>. В случае локальных ссылок сделует использовать <kbd>&lt;a href="/pisos"&gt;&lt;текст&lt;/a&gt;</kbd>.</p>
		</details>
		<p><label for="noti_remove">Удалить последнее оповещение?<input type="checkbox" name="noti_remove"></p>
		<p style="margin-top: 15px;"><input type="submit" value="Создать" name="noti_action"></p>
	</fieldset></form>
	<footer>
		<p>Asian Wave Control panel v0.2</p>
		<p>Последнее обновление расписания: <span class="shedTS"></span></p>
		<p>Последнее обновление оповещения: <span class="notiTS"></span></p>
		<p>Точное московское время (на момент загрузки страницы): <?php echo date('Y-m-d H:i:s', time()) ?></p>
	</footer>
	<script src="/files/code/js/libs/moment/moment.min.js" defer></script>
	<script src="/files/code/js/libs/moment/moment-ru.min.js" defer></script>
	<script type="text/javascript">
		'use strict';

		function _elem(sel) {return document.querySelector(sel)}
		function _elems(sel) {return document.querySelectorAll(sel)}

		function resetForms() {
			var f, formsEls = document.getElementsByTagName('form');

			for (f = 0; f < formsEls.length; f++) {
				formsEls[f].reset;
			}
		}

		function lastClVeevod() {
			var l, lTimeS = '<?php echo $shed_data[count($shed_data)-2][0]; ?>', lTimeE = '<?php echo $shed_data[count($shed_data)-2][1]; ?>', lAirN = '<?php echo $shed_data[count($shed_data)-2][2]; ?>', lVeevodEl = document.createElement('samp'), lVeevodElPar = _elem('.lVeevod'), lInputs = _elems('.last-clear input');

			if (lTimeS != 0) {
				lVeevodEl.textContent = 'Название: ' + lAirN + '. Начало ' + moment.unix(lTimeS).format('DD MMMM YYYY в HH:mm') + '; конец ' + moment.unix(lTimeE).format('DD MMMM YYYY в HH:mm');
			} else {
				lVeevodEl.textContent = 'Очистка не требуется';
				for (l = 0; l < lInputs.length; l++) {
					lInputs[l].setAttribute('disabled','');
				}
			}

			lVeevodElPar.appendChild(lVeevodEl);
		}

		function exprCheck() {
			var e, air_exp = <?php if($shed_data[1][1] > time() && $expr_count = 1) {echo 'false';} else {echo 'true';} ?> , exprFInputs = _elems('.expired-clear input');
			if (!air_exp) {
				for (e = 0; e < exprFInputs.length; e++) {
					exprFInputs[e].setAttribute('disabled','');
				}
			}
		}

		function toLocalTime() {
			var i, lastTS = <?php echo $shed_data[count($shed_data) - 2][1]; ?>, inputsLT = _elems('input[type*=datetime]')

			for (i = 0; i < inputsLT.length; i++) {
				//inputsLT[i].setAttribute('value', dateNow + 'T' + timeNow);
				inputsLT[i].setAttribute('value', moment.unix(lastTS).format('YYYY-MM-DDTHH:mm'));
			}
		}

		function fileUpdate() {
			var shedTS = '<?php echo @filemtime($shed) ?>', notiTS = '<?php echo @filemtime($noti) ?>', shedTSEl = _elem('.shedTS'), notiTSEl = _elem('.notiTS');

			shedTSEl.textContent = moment.unix(shedTS).from();
			notiTSEl.textContent = moment.unix(notiTS).from();
		}

		function notiDisable() {
			var notiCreateF = _elem('[name="noti_text"]'), notiSubmitBtn = _elem('[name="noti_action"]');

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
		}

		resetForms();
		exprCheck();
		lastClVeevod();
		toLocalTime();
		fileUpdate();
		notiDisable();
	</script>
	<?php endif; ?>
</body></html>
