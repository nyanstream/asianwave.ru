'use strict';

function _elem(qS) { return document.querySelector(qS) }
function _elems(qS) { return document.querySelectorAll(qS) }
function _ls(ls_item) { return localStorage.getItem(ls_item) }
function _ls_rm(ls_item) { return localStorage.removeItem(ls_item) }
function _ls_set(ls_item, ls_item_var) { return localStorage.setItem(ls_item, ls_item_var) }
function _xss(value) { return value.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&#34;') }
function _extLink(link, text) { return '<a href="' + _xss(link) + '" target="_blank" rel="nofollow noopener">' + _xss(text) + '</a>' }

/*
 * Детектор параметров
 * Найдено здесь: https://stackoverflow.com/a/979996
 */

// if (location.search) {
// 	var params = {}, parts, nv;
// 	parts = location.search.substring(1).split('&');
// 	for (var i = 0; i < parts.length; i++) {
// 		nv = parts[i].split('=');
// 		if (!nv[0]) continue;
// 		params[nv[0]] = nv[1] || true;
// 	}
// }

/*
 * Плеер
 */

jwplayer.key = 'o0p/ORr8/SsRBOLLUAMYJizVpQMS/ZRQhf53Qw==';

var playerID = 'jw-player', player = jwplayer(playerID);
var jwSetup = {
	'file': 'rtmp://' + document.currentScript.dataset.rtmp,
	//'image': '/files/img/anime-offline.png',
	'width': '100%', 'height': '100%',
	// 'rtmp': {
	// 	'bufferlength': 10
	// },
	'skin': 'roundster',
	'autostart': true,
	//'controls': false,
	'displaytitle': false,
	'displaydescription': false,
	'abouttext': 'Asian Wave',
	'aboutlink': '/'
};

/*
 * Детект хрома
 */

var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor), isOpera = /OPR\//.test(navigator.userAgent), chrExtBtn = _elem('.right-panel [href*="--chrome"]');

if (!isChrome) chrExtBtn.style.display = 'none';
if (isOpera) {
	chrExtBtn.querySelector('.icon').classList.remove('icon-chrome');
	chrExtBtn.querySelector('.icon').classList.add('icon-opera');
	chrExtBtn.setAttribute('href', '/app--opera');
	chrExtBtn.setAttribute('title', 'Раширение для Opera');
}

/*
 * Детект поддержки флеша
 */

var hasFlash = navigator.mimeTypes['application/x-shockwave-flash'], playerElem = _elem('.player');

if (hasFlash || hasFlash.enabledPlugin) {
	player.setup(jwSetup);
} else {
	playerElem.classList.add('noflash');
	//clearInterval(aw_timer);
}

/*
 * Тест включения локального хранилища
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
 * Скрипт создания табов (модифицированный)
 * Найдено здесь: https://goo.gl/lsSkEe
 */

function makeTabs(selector) {
	var tabAnchors = _elems(selector + ' li'), tabs = _elems(selector + ' section');

	for (var i = 0; i < tabAnchors.length; i++) {
		if (tabAnchors[i].classList.contains('active')) tabs[i].style.display = 'block';
	}

	for (var i = 0; i < tabAnchors.length; i++) {
		tabAnchors[i].addEventListener('click', function(e) {
			var clickedAnchor = e.target || e.srcElement;
			clickedAnchor.classList.add('active');

			for (var i = 0; i < tabs.length; i++) {
				if (tabs[i].dataset.tab === clickedAnchor.dataset.tab) {
					tabs[i].style.display = 'block';
				} else {
					tabs[i].style.display = 'none';
					tabAnchors[i].classList.remove('active');
				}
			}
		});
	}
}

/*
 * Скрытие табов
 */

var closeTabsCtr = _elem('.closeTabs'), mainCont = _elem('.anime'), ctc_text = 'боковую панель';

function closeTabs() {
	if (!mainCont.classList.contains('notabs')) {
		mainCont.classList.add('notabs');
		this.textContent = '\u003C';
		this.setAttribute('title', 'Открыть ' + ctc_text);
	} else {
		mainCont.classList.remove('notabs');
		this.textContent = '\u00D7';
		this.setAttribute('title', 'Скрыть ' + ctc_text);
	}
}

closeTabsCtr.addEventListener('click', closeTabs);

/*
 * Старый цвет шапки
 */

var container = _elem('.container'), nyako = _elem('.top-panel .brand img'), metacolor = _elem('meta[name="theme-color"]');

function _oldHeadColor() {
	metacolor.setAttribute('content', '#464646');
	container.dataset.theme = 'old-gray';
	_ls_set('aw_iamoldfag', true);
}

if (_ls('aw_iamoldfag')) {
	_oldHeadColor();
	nyako.addEventListener('dblclick', function() {
		_ls_rm('aw_iamoldfag');
		delete container.dataset.theme;
	});
} else {
	nyako.addEventListener('dblclick', _oldHeadColor);
}

/*
 * Расписание
 * @TODO пофиксить проблему нового года
 */

var streamShed = _elem('.shedule');

function parseShedule(data) {
	var tableBody = '', tableBodyT = '', nowTime = Math.round(new Date().getTime()/1000), sdata = '', sdataT = '';

	for (var i = 1; i < data.length - 1; i++) {
		var newShedData = moment.unix(data[i][0]).format('D MMMM') + '<br>' + moment.unix(data[i][0]).format('HH:mm') + ' &ndash; ' + moment.unix(data[i][1]).format('HH:mm') + '</td>', nazvaniue = '';

		if (data[i][3]) {
			nazvaniue = _extLink(data[i][3], data[i][2]);
		} else {
			nazvaniue = _xss(data[i][2]);
		}

		if (data[i][0] < nowTime && data[i][1] > nowTime) {
			sdata = '<tr class="air--current"><td>' + newShedData + '<td><b>Сейчас (ещё ' + moment.unix(data[i][1]).toNow(true) + '):</b><br>' + nazvaniue + '</td></tr>';
		} else if (data[i][1] > nowTime + (data[i-1][1] - data[i-1][0]) && data[i][1] < nowTime + (data[i][1] - data[i-1][0])) {
			sdata = '<tr class="air--next"><td>' + newShedData + '<td><b>Далее через ' + moment.unix(data[i][0]).toNow(true) + ':</b><br>' + nazvaniue + '</td></tr>';
		} else if ((moment.unix(data[i][0]).dayOfYear() - moment.unix(nowTime).dayOfYear()) < -1) {
			//sdata = '<tr class="air--finished air--tooOld"><td>' + newShedData + '<td>' + nazvaniue + '</td></tr>';
			sdata = '';
		} else if (data[i][0] < nowTime) {
			sdata = '<tr class="air--finished"><td>' + newShedData + '<td>' + nazvaniue + '</td></tr>';
		} else if (moment.unix(data[i][0]).dayOfYear() > moment.unix(nowTime).dayOfYear()) {
			sdata = '<tr class="air--notToday"><td>' + newShedData + '<td>' + nazvaniue + '</td></tr>';
		} else {
			sdata = '<tr><td>' + newShedData + '<td>' + nazvaniue + '</td></tr>';
		}

		tableBody += sdata;
	}

	streamShed.innerHTML = '<tbody><tr><td colspan="2"><em>Время местное.</em></td></tr>' + tableBody + '</tbody>';
}

/*
 * Уведомления
 */

var notiEl = _elem('.noti');

function notiSpawn(text, id) {
	var notiClose = document.createElement('div'), notiContent = document.createElement('div'), notiItems = [];
	notiEl.textContent = '';

	notiClose.classList.add('noti-close');
	notiClose.setAttribute('title', 'Скрыть оповещение');
	notiClose.textContent = '\u00D7';

	notiContent.classList.add('noti-content');
	notiContent.innerHTML = text;

	if (notiContent.querySelector('a[href]')) {
		var notiLinks = notiContent.querySelectorAll('a[href]');

		for (var i = 0; i < notiLinks.length; i++) {
			notiLinks[i].setAttribute('target', '_blank');
			if (notiLinks[i].getAttribute('href').indexOf('http') === 0) {
				notiLinks[i].setAttribute('rel', 'nofollow noopener');
			}
		}
	}

	notiEl.appendChild(notiClose);
	notiEl.appendChild(notiContent);

	if (!lsTest()) {
		var notiUndisable = document.createElement('div');

		notiUndisable.classList.add('noti-undis');
		notiUndisable.textContent = 'Внимание! У вас отключено хранение данных, поэтому скрытие оповещения запомиинаться не будет.';
		notiEl.appendChild(notiUndisable);
	} else {
		if (_ls('aw_noti')) notiItems = JSON.parse(_ls('aw_noti'));
		if (notiItems.indexOf(id) === -1) {
			notiEl.style.display = 'block';
		} else notiEl.style.display = 'none';
	}

	notiClose.addEventListener('click', function() {
		notiItems[notiItems.length] = id;
		_ls_set('aw_noti', JSON.stringify(notiItems));
		notiEl.style.display = 'none';
	});
}

function notiClear() {
	for (var a in localStorage) {
		if (a.indexOf('awnoti') === 0) {
			_ls_rm(a);
		}
	}
}

/*
 * Виджет ВК
 */

var vkNews = _elem('.vk-news');

function parseVK(data) {
	var newsHeader = document.createElement('div'), newsPosts = document.createElement('div'), newsBodyPhoto = '';

	newsHeader.classList.add('news-header');
	newsHeader.innerHTML = _extLink('https://vk.com/' + data['com']['id'], 'Сообщество Asian Wave в VK');

	newsPosts.classList.add('news-posts');
	for (var dc = 0; dc < data['posts'].length; dc++) {
		if (data['posts'][dc]['photo']) {
			newsBodyPhoto = '<a href="' + data['posts'][dc]['photo']['big'] + '" class="n-pic-link" target="_blank" rel="nofollow noopener"><img src="' + data['posts'][dc]['photo']['small'] + '" alt=""></a>';
		} else newsBodyPhoto = '';
		newsPosts.innerHTML += '<div class="post-meta"><a href="https://vk.com/wall-' + data['com']['gid'] + '_' + data['posts'][dc]['id'] + '" target="_blank" rel="nofollow noopener">' + moment.unix(data['posts'][dc]['time']).format('D MMMM YYYY в HH:mm') + '</div>'
		//newsPosts.innerHTML += '<div class="post-body"><p>' + data['posts'][dc]['text'] + '</p>' + newsBodyPhoto + '</div>';
		newsPosts.innerHTML += '<div class="post-body"><p>' + newsBodyPhoto + data['posts'][dc]['text'] + '</p>' + '</div>';
	}

	vkNews.innerHTML = '';
	vkNews.appendChild(newsHeader);
	vkNews.appendChild(newsPosts);
}

/*
 * Запросы к API
 */

var API = {
	'shedule': '/api/streams-shed.json',
	'noti': '/api/noti.json',
	'vk': '/api/vk-info.json'
}, API_keys = Object.keys(API);

var fetchHeaders = {cache: 'no-store'};

switch (location.hostname) {
	case '127.0.0.1':
	case 'localhost':
		for (var i = 0; i < API_keys.length; i++) {
			API[API_keys[i]] = 'https://asianwave.ru' + API[API_keys[i]]
		}
}

function loadInfo() {
	if (self.fetch) {
		fetch(API.shedule, fetchHeaders).then(function(response) {
			if (response.status !== 200) {
				streamShed.style.display = 'none';
				return;
			}
			response.json().then(function(data) {
				parseShedule(data);
			});
		});
		fetch(API.noti, fetchHeaders).then(function(response) {
			if (response.status !== 200) {
				notiEl.style.display = 'none';
				return;
			}
			response.json().then(function(data) {
				if (data[0] !== null) {
					notiSpawn(data[0], data[1]);
				} else {
					notiEl.textContent = '';
				}
			});
		});
		fetch(API.vk, fetchHeaders).then(function(response) {
			response.json().then(function(data) {
				parseVK(data);
			});
		});
	} else {
		streamShed.innerHTML = '<tbody><tr><td>Ваш браузер устарел.</td></tr></tbody>';
		clearInterval(aw_timer);
	}
}

/*
 * Инициации
 */

document.addEventListener('DOMContentLoaded', function() {
	loadInfo();
	var aw_timer = setInterval(loadInfo, 5000);

	makeTabs('.tabs');
});
