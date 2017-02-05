'use strict';

/*
	* Некоторые функции для устранения повторов
*/

function _elem(qS) { return document.querySelector(qS) }
function _ls(ls_item) { return localStorage.getItem(ls_item) }
function _ls_rm(ls_item) { return localStorage.removeItem(ls_item) }
function _ls_set(ls_item, ls_item_var) { return localStorage.setItem(ls_item, ls_item_var) }
function _extLink(link, text) { return '<a href="' + _xss(link) + '" target="_blank" rel="nofollow noopener">' + _xss(text) + '</a>' }

/*
	* Проверка на фрейм
*/

if (window.self == window.top) {
	document.body.innerHTML = '<p class="noframe"><a href="/radio">\u00af\u005c\u005f\u0028\u30c4\u0029\u005f\u002f\u00af</a></p>';
}

/*
	* Проверка работы хранилища данных
*/

function lsTest() {
	var ls_test = 'test';
	try {
		_ls_set(ls_test, ls_test);
		_ls_rm(ls_test);
		return true;
	} catch(e) {
		return false;
	}
}

/*
	* функция для склонения слов от числительных.
	* Взято здесь: https://gist.github.com/ivan1911/5327202#gistcomment-1669858
*/

function declOfNum(number, titles) {
	var titles, number = Math.abs(number), cases = [2, 0, 1, 1, 1, 2];
	return number + ' ' + titles[(number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5]];
}

/*
	* Установка порта радио, дефолтной громкости (на уровне 40%) и URL для сайта хостинга радио (разбито просто потому что)
*/

const stream_port = 7934, stream_srv = 1;

var stream_vol,	stream_vol_def = 40,
		mr24url_1 = 'myra', mr24url_2 = 'dio24.c', mr24url_3 = 'om',
		mr24url = mr24url_1 + mr24url_2 + mr24url_3;

/*
	* Берёт из "хранилища" значение громкости и устанавливает его в переменную.
	* Если значение пустое - то создаёт его, беря дефолтную громкость.
*/

if (lsTest() == true) {
	if (_ls('ppaw_plvolume') == null) {
		_ls_set('ppaw_plvolume', stream_vol_def);
		steram_vol = stream_vol_def;
	} else {
		steram_vol = _ls('ppaw_plvolume');
	}
} else {
	steram_vol = stream_vol_def;
	console.log('Локальное хранилище отключено!');
}

/*
* Создание в фоне аудио-элемента с потоком.
* (ну и ещё кнопочку для скачивания плейлиста создаёт)
*/

var stream,	stream_src, steram_vol,
		m3upl = _elem('.player-song.playlist .m3u-pl');

stream_src = 'https://listen' + stream_srv + '.' + mr24url + '/' + stream_port;
stream = new Audio(stream_src);

stream.preload = 'none';
stream.volume = steram_vol/100;

m3upl.setAttribute('href', 'data:audio/x-mpegurl;charset=utf-8;base64,' + window.btoa(stream_src+'\n'));
m3upl.setAttribute('download', 'Asian Wave.m3u');

/*
	* функция для кнопки плея/паузы.
*/

var container = _elem('.player-container'),
		ctrl_ctrl = _elem('.player-elem.controls'),
		//ctrl_player_reload = _elem('.player-elem.reload'),
		ctrl_pp = _elem('.player-ctrl.playpause'),
		ctrl_pp_ic = _elem('.player-ctrl.playpause i.icon'),
		ctrl_autostart = _elem('.aw-autostart-option'),
		ctrl_vol = _elem('.player-ctrl.volume'),
		ctrl_vol_mute = _elem('.player-ctrl.mute'),
		ctrl_vol_mute_ic = _elem('.player-ctrl.mute i.icon'),
		ctrl_vol_mute_ic_state = 'icon-volume-up';

function st_playpause() {
	if (stream.paused) {
		stream.pause();
		stream.load();
		stream.play();

		ctrl_pp_ic.classList.toggle('icon-pause', true);
		ctrl_pp_ic.classList.toggle('icon-play', false);
	} else {
		stream.pause();

		ctrl_pp_ic.classList.toggle('icon-pause', false);
		ctrl_pp_ic.classList.toggle('icon-play', true);
	}
}

/*
	* функция для фичи автостарта для огнелиса (и хрома, с включенным флагом).
*/

if (lsTest() == true) {
	var autostphr = 'Автостартовать плеер при загрузке:\u0020';

	switch (_ls('ppaw_autostart')) {
		case 'null':
		default:
			_ls_set('ppaw_autostart', 0);
			break;
		case '0':
			ctrl_autostart.setAttribute('label', autostphr + '\u2716');
			break;
		case '1':
			ctrl_autostart.setAttribute('label', autostphr + '\u2713');
			st_playpause();
			break;
	}

	function st_autostart() { // just for future dev // опция автостарта плеера для огнелиса
		switch (_ls('ppaw_autostart')) {
			case '0':
				_ls_set('ppaw_autostart', 1);
				ctrl_autostart.setAttribute('label', autostphr + '\u2713');
				break;
			case '1':
			default:
				_ls_set('ppaw_autostart', 0);
				ctrl_autostart.setAttribute('label', autostphr + '\u2716');
				break;
		}
	}

	ctrl_autostart.addEventListener('click', st_autostart);
}

/*
	* Слушатель событий для кнопок
*/

ctrl_pp.addEventListener('click', st_playpause);
ctrl_vol_mute.addEventListener('click', function() {
	if (stream.muted) {
			stream.muted = false;
			ctrl_vol.value = steram_vol;
			ctrl_vol_mute_ic.classList.toggle('icon-volume-off', false);
			ctrl_vol_mute_ic.classList.toggle(ctrl_vol_mute_ic_state, true);
	} else {
			stream.muted = true;
			ctrl_vol.value = 0;
			ctrl_vol_mute_ic.classList.toggle('icon-volume-off', true);
			ctrl_vol_mute_ic.classList.toggle(ctrl_vol_mute_ic_state, false);
	}
});

ctrl_vol.value = steram_vol;
ctrl_vol.addEventListener('input', function() {
	if (this.value != 0) {
		stream.muted = false;
		ctrl_vol_mute_ic.classList.toggle('icon-volume-off', false);
		ctrl_vol_mute_ic.classList.toggle(ctrl_vol_mute_ic_state, true);
	} else {
		stream.muted = true;
		ctrl_vol_mute_ic.classList.toggle('icon-volume-off', true);
		ctrl_vol_mute_ic.classList.toggle(ctrl_vol_mute_ic_state, false);
	}

	steram_vol = this.value;
	stream.volume = this.value/100;
});

ctrl_vol.addEventListener('change', function() {
	if (lsTest()) { _ls_set('ppaw_plvolume', this.value) }
});

/*
	* Если плеер открыт с мобильного - происходит небольшая кастомизация.
*/

if (isMobile.any && !ctrl_ctrl.classList.contains('mobile')) {
	ctrl_ctrl.classList.add('mobile');
}

var mr24info = 'https://' + mr24url + '/users/' + stream_port + '/status.json',
		song_elem = _elem('.player-song.song'),
		dj_elem = _elem('.player-elem.djname'),
		listeners_elem = _elem('.player-elem.listeners'),
		srch_main = _elem('.player-song.search'),
		srch_vk = srch_main.querySelector('.srch-vk'),
		srch_google = srch_main.querySelector('.srch-google'),
		data_song, data_dj, data_listeners, slsh = 'челове';

/*
	* Функция, которая запрашивает инфу в плеер с серверов MyRadio24
*/

function loadInfo() {
	if (self.fetch) {
		window.fetch(mr24info, {cache: 'no-cache'}).then(function(response) {
			if (response.status !== 200) {
				console.log('Ошибка сервера радио!');
				return;
			}
			response.json().then(function(data) {
				if (data['online'] != 0) {
						var data_song = data['song'],	data_last_song = data['songs'],	data_next_song = data['nextsongs'],	data_dj = data['djname'],	data_listeners = data['listeners'];

						//var data_dj = 'rj major & rj banzan', data_listeners = 10000, // loel debuh

						// console.log(data_last_song.length);
						// console.log(data_last_song[9][1]);

						if (container.classList.contains('offline')) {
							container.classList.remove('offline');
						} if (!container.classList.contains('online')) {
							container.classList.add('online');
						}

						song_elem.textContent = data_song;

						srch_vk.setAttribute('href', 'https://vk.com/audio?q=' + encodeURIComponent(data_song));
						srch_google.setAttribute('href', 'https://google.com/#q=' + encodeURIComponent(data_song));

						if (data_dj == 'Auto-DJ') {
							song_elem.setAttribute('title', 'Играющий сейчас трек. Далее: \u00AB'+data_next_song+'\u00BB');
							dj_elem.setAttribute('title', 'Вещает автодиджей');
							dj_elem.textContent = 'Asian Wave Radio';
						} else {
							dj_elem.setAttribute('title', 'Кто-то вещает, ничего себе!');
							song_elem.setAttribute('title', 'Играющий сейчас трек');
							dj_elem.textContent = data_dj;
						}

						listeners_elem.textContent = data_listeners;
						if (data_listeners == 0) {
							listeners_elem.setAttribute('title', 'В данный момент радио никто не слушает \u003a\u0028');
						} else {
							listeners_elem.setAttribute('title', 'Сейчас радио слушает ' + declOfNum(data_listeners, [slsh+'к', slsh+'ка', slsh+'к']));
						}
					}	else {
						song_elem.textContent = 'Радио оффлайн';

						if (container.classList.contains('online')) {
							container.classList.remove('online');
						} if (!container.classList.contains('offline')) {
							container.classList.add('offline');
						}
				}
			});
		});
	} else {
		song_elem.innerHTML = 'Для работы плеера необходим ' + _extLink('https://vk.com/badbrowser.php', 'современный браузер') + '.';
		if (!container.classList.contains('offline')) {
			container.classList.add('offline');
		}
		clearInterval(pp_timer);
	}
}

document.addEventListener('DOMContentLoaded', loadInfo);
var pp_timer = setInterval(loadInfo, 5000);
