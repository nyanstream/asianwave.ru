<?php
	date_default_timezone_set('Europe/Moscow');

	if (isset($_POST['expired_clear']) || isset($_POST['noti'])) { exit; }
	if (isset($_POST['add_air']) && $_POST['where'] == 'radio') { exit; }
	if (isset($_POST['rm_air']) && $_POST['where'] == 'radio') { exit; }

	include_once 'topsec/panel-core.php';
?>
<!DOCTYPE HTML>
<html lang="ru"><head>
	<meta charset="utf-8">
	<title>Asian Wave / Control panel</title>
	<meta id="viewport" content="width=device-width, initial-scale=1">
<?php if (isset($_GET['action'])) echo '<script>document.location.href="'. $_SERVER['PHP_SELF'] .'"</script><noscript><meta refresh="0; '. $_SERVER['PHP_SELF'] .'"></noscript>'; ?>
	<link rel="shortcut icon" href="/files/img/favicon.png">
	<link rel="stylesheet" href="/files/css/aw-fonts.min.css">
	<style>
		body { font-family: Roboto, Arial, sans-serif }
		input { margin: 0 5px }
		input[type=submit] { margin: 0 5px 0 0 }
		input[type=text], input[type=number] { padding: 2.5px }
		input[type=text] { width: 400px }
		input[type=number] { width: 70px }
		p label, p input { vertical-align: middle }
		form { margin-top: 10px }
		form:first-child { margin-top: 0 }
		samp {
			padding: 5px;
			background-color: #e4e4e4;
			line-height: 27px;
		}
		.omc { font-size: .8em }
	</style>
</head></body>
	<form class="add-air" action="?action" method="post"><fieldset>
		<legend>Добавление нового эфира</legend>
		<p>
			<label for="time_start">Время начала:</label>
			<input required autocomplete="off" type="datetime-local" name="time_start" value="2016-05-06T00:00">
			<br><i class="omc">Время должно быть московским.</i>
		</p>
		<p>
			<label for="duration">Продолжительность (в минутах):</label>
			<input autocomplete="off" type="number" name="duration" min="1" placeholder="60">
			<br><i class="omc">Необязательно, только если время отлично от часа.</i>
		</p>
		<p>
			<label for="air_name">Название:</label>
			<input required type="text" name="air_name" placeholder="напр. Binan Koukou Chikyuu Bouei-bu LOVE! (1-2)">
		</p>
		<p>
			<label for="air_link">Ссылка:</label>
			<input autocomplete="off" type="text" name="air_link" placeholder="напр. https://shikimori.org/animes/1639">
		</p>
		<input name="where" value="anime" checked hidden>
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
		</p>
		<p>
		<input required name="where" value="anime" checked hidden>
		<p>
			<label for="rm_air_cnf">Вы точно этого хотите?</label>
			<input required type="checkbox" name="rm_air_cnf">
		</p>
		<p style="margin-top: 15px;">
			<input type="submit" value="Удалить" name="rm_air">
		</p>
	</fieldset></form>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js" defer></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/locale/ru.js" defer></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.13/moment-timezone-with-data.min.js" defer></script>
	<script src="/files/js/kamina.min.js" defer></script>
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
					'radio': false
				}

				if (emptySched['anime']) $make.qs('.rm-air input', ['a']).forEach((input) => { input.setAttribute('disabled', '') })
			})()
		})
	</script>
</body></html>
