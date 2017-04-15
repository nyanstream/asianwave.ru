'use strict'

/*
 * Плеер
 */

var
	playerID = 'jw-player',
	player = jwplayer(playerID),
	jwSetup = {
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
		'aboutlink': '/',
		'ga': {
			'label': 'animePlayer'
		}
	}

/*
 * Детект хрома
 */

;(function() {
 	var
	 	chrExtBtn = $make.qs('.right li a[href*="--chrome"]'),
	 	isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor),
	 	isOpera = /OPR\//.test(navigator.userAgent)

 	if (chrExtBtn) { // на случай, если опять забуду, что поменял класс элемента
 		if (!isChrome) chrExtBtn.style.display = 'none';
 		if (isOpera) {
 			var icon = chrExtBtn.querySelector('.icon')

 			icon.classList.remove('icon-chrome')
 			icon.classList.add('icon-opera')
 			chrExtBtn.setAttribute('href', '/app--opera')
 			chrExtBtn.setAttribute('title', 'Раширение для Opera')
 		}
 	}
})()

/*
 * Детект поддержки флеша
 */

;(function() {
	var
		hasFlash = navigator.mimeTypes['application/x-shockwave-flash'],
		playerElem = $make.qs('.player');

	if (hasFlash) {
		//jwplayer.key = 'o0p/ORr8/SsRBOLLUAMYJizVpQMS/ZRQhf53Qw==';
		player.setup(jwSetup);
	} else {
		playerElem.classList.add('noflash');
	}
})()

/*
 * Скрипт создания табов (модифицированный)
 * Найдено здесь: https://goo.gl/lsSkEe
 */

$make.tabs = function(selector) {
	var
		tabAnchors = this.qs(selector + ' li', ['a']),
		tabs = this.qs(selector + ' section', ['a'])

	for (var i = 0; i < tabAnchors.length; i++) {
		if (tabAnchors[i].classList.contains('active')) tabs[i].style.display = 'block'

		tabAnchors[i].addEventListener('click', function(e) {
			var clickedAnchor = e.target || e.srcElement;
			clickedAnchor.classList.add('active')

			for (var i = 0; i < tabs.length; i++) {
				if (tabs[i].dataset.tab === clickedAnchor.dataset.tab) {
					tabs[i].style.display = 'block'
				} else {
					tabs[i].style.display = 'none';
					tabAnchors[i].classList.remove('active')
				}
			}
		})
	}
}

/*
 * Скрытие табов
 */
;(function () {
	var
		closeTabsCtr = $make.qs('.closeTabs'),
		mainCont = $make.qs('.anime'),
		ctc_text = 'боковую панель';

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
})()

/*
 * Старый цвет шапки
 */

;(function() {
	var
		container = $make.qs('.container'),
		nyako = $make.qs('.top-panel .logo'),
		metacolor = $make.qs('meta[name="theme-color"]');

	function _oldHeadColor() {
		metacolor.setAttribute('content', '#464646');
		container.dataset.theme = 'old-gray';
		$ls.set('aw_iamoldfag', true);
	}

	if ($ls.get('aw_iamoldfag')) {
		_oldHeadColor();
		nyako.addEventListener('dblclick', function() {
			$ls.rm('aw_iamoldfag');
			delete container.dataset.theme;
		});
	} else {
		nyako.addEventListener('dblclick', _oldHeadColor);
	}
})()

/*
 * Расписание
 * @TODO пофиксить проблему нового года
 */

function parseShedule(data) {
	var
		streamShed = $make.qs('.shedule'),
		tableBody = '', sdata = '',
		nowTime = Math.round(new Date().getTime()/1000)

	for (var i = 1; i < data.length - 1; i++) {
		var
			newShedData = moment.unix(data[i][0]).format('D MMMM') + '<br>' + moment.unix(data[i][0]).format('HH:mm') + ' &ndash; ' + moment.unix(data[i][1]).format('HH:mm') + '</td>',
			nazvaniue = '';

		if (data[i][3]) {
			nazvaniue = $make.link(data[i][3], data[i][2], ['e', 'html']);
		} else {
			nazvaniue = $make.xss(data[i][2]);
		}

		if (data[i][0] < nowTime && data[i][1] > nowTime) {
			sdata = $make.elem('tr', '<td>' + newShedData + '<td><b>Сейчас (ещё ' + moment.unix(data[i][1]).toNow(true) + '):</b><br>' + nazvaniue + '</td>', 'air--current', ['html'])
		} else if (data[i][1] > nowTime + (data[i-1][1] - data[i-1][0]) && data[i][1] < nowTime + (data[i][1] - data[i-1][0])) {
			sdata = $make.elem('tr', '<td>' + newShedData + '<td><b>Далее через ' + moment.unix(data[i][0]).toNow(true) + ':</b><br>' + nazvaniue + '</td>', 'air--next', ['html'])
		} else if ((moment.unix(data[i][0]).dayOfYear() - moment.unix(nowTime).dayOfYear()) < -1) {
			sdata = ''; // позавчерашие эфиры и старше
		} else if (data[i][0] < nowTime) {
			sdata = $make.elem('tr', '<td>' + newShedData + '<td>' + nazvaniue + '</td></tr>', 'air--finished', ['html'])
		} else if (moment.unix(data[i][0]).dayOfYear() > moment.unix(nowTime).dayOfYear()) {
			sdata = $make.elem('tr', '<td>' + newShedData + '<td>' + nazvaniue + '</td></tr>', 'air--notToday', ['html'])
		} else {
			sdata = $make.elem('tr', '<td>' + newShedData + '<td>' + nazvaniue + '</td>', '', ['html'])
		}

		tableBody += sdata;
	}

	if (tableBody) streamShed.innerHTML = '<tbody><tr><td colspan="2"><em>Время местное.</em></td></tr>' + tableBody + '</tbody>'
	else return
}

/*
 * Уведомления
 */

function notiSpawn(text, id) {
	var
		notiEl = $make.qs('.noti'),
		notiClose = $make.elem('div', '\u00D7', 'noti-close'),
		notiContent = $make.elem('div', text, 'noti-content'),
		notiItems = []

	notiEl.textContent = ''

	if (text === null || id === null) return false

	notiClose.setAttribute('title', 'Скрыть оповещение')

	if (notiContent.querySelector('a[href]')) {
		var notiLinks = notiContent.querySelectorAll('a[href]')

		for (var i = 0; i < notiLinks.length; i++) {ог
			notiLinks[i].setAttribute('target', '_blank')
			if (notiLinks[i].getAttribute('href').indexOf('http') === 0) {
				notiLinks[i].setAttribute('rel', 'nofollow noopener')
			}
		}
	}

	notiEl.appendChild(notiClose)
	notiEl.appendChild(notiContent)

	if (!$ls.test()) {
		var notiUndisable = $make.elem('div', 'Внимание! У вас отключено хранение данных, поэтому скрытие оповещения запомиинаться не будет.', 'noti-undis')
		notiEl.appendChild(notiUndisable)
	} else {
		if ($ls.get('aw_noti')) notiItems = JSON.parse($ls.get('aw_noti'))
		if (notiItems.indexOf(id) === -1)
			notiEl.style.display = 'block'
			else notiEl.style.display = 'none'
	}

	notiClose.addEventListener('click', function() {
		notiItems[notiItems.length] = id
		$ls.set('aw_noti', JSON.stringify(notiItems))
		notiEl.style.display = 'none'
	});
}

/*
 * Виджет ВК
 * @TODO переписать этот говнокод
 */

function parseVK(data) {
  var
	 	vkNews = $make.qs('.vk-news'),
	 	newsHeader = $make.elem('div', $make.link('https://vk.com/' + data['com']['id'], 'Сообщество Asian Wave в VK', ['e', 'html']), 'vk-news-header'),
	 	newsBody = $make.elem('div', '', 'news-posts')

  vkNews.textContent = ''

  // if (data === 'fail') {
	//  	vkNews.classList.add('api-err')
	//  	vkNews.appendChild($make.elem('p', 'API сайта недоступно.'))
	//  	return
  // } else {
	//  	if (vkNews.classList.contains('api-err')) vkNews.classList.remove('api-err')
  // }

  for (var dc = 0; dc < data['posts'].length; dc++) {
		var postImgLink = '', isCopy = '', postLinkS = ''

	 	if (data['posts'][dc]['photo']) {
	 		var postImg = $make.elem('img')

	 		postImg.setAttribute('src', data['posts'][dc]['photo']['small'])
	 		postImg.setAttribute('alt', '')

	 		postImgLink = $make.link(data['posts'][dc]['photo']['big'], postImg.outerHTML, ['e', 'html'])
	 	}

	 	if (data['posts'][dc]['type'] === 'copy') isCopy = ' is-copy';

		var
			postText = data['posts'][dc]['text'],
			pLR = new RegExp(/\[(.*?)\]/),
			postLinkR = postText.match(new RegExp(pLR, 'g'))

			if (postLinkR) {
				for (var i = 0; i < postLinkR.length; i++) {
					postLinkS = postLinkR[i].split('|');
					postText = postText.replace(pLR, $make.link('https://vk.com/' + postLinkS[0].replace(/\[/g, ''), postLinkS[1].replace(/]/g, ''), ['e', 'html']))
				}
			}

	 	vkNews.textContent = ''

	 	var
	 		vkPost = $make.elem('div', '', 'vk-post' + isCopy),
	 		vkPostMetaLink = $make.link('https://vk.com/wall-' + data['com']['gid'] + '_' + data['posts'][dc]['id'], moment.unix(data['posts'][dc]['time']).format('D MMMM YYYY в HH:mm'), ['e', 'html']),
	 		vkPostMeta = $make.elem('div', vkPostMetaLink, 'vk-post-meta'),
	 		vkPostBody = $make.elem('div', postImgLink + '<p>' + postText + '</p>', 'vk-post-body')

	 	vkPost.appendChild(vkPostMeta)
	 	vkPost.appendChild(vkPostBody)

	 	newsBody.innerHTML += vkPost.outerHTML;
  }

  vkNews.appendChild(newsHeader)
  vkNews.appendChild(newsBody)
 }

/*
 * Запросы к API
 */

var API = {
	'shedule': '/api/streams-shed.json',
	'noti': '/api/noti.json',
	'vk': '/api/vk-info.json'
}

if ($check.debug()) {
	var API_keys = Object.keys(API)
	for (var i = 0; i < API_keys.length; i++) {
		API[API_keys[i]] = 'https://asianwave.ru' + API[API_keys[i]]
	}
}

function loadInfo() {
	var fetchOptions = { cache: 'no-store' }

	if (self.fetch) {
		fetch(API.shedule + '?t=' + Date.now(), fetchOptions).then(function(response) {
			response.json().then(function(data) {
				parseShedule(data);
			});
		});
		fetch(API.noti + '?t=' + Date.now(), fetchOptions).then(function(response) {
			response.json().then(function(data) {
				notiSpawn(data[0], data[1]);
			});
		});
		fetch(API.vk + '?t=' + Date.now(), fetchOptions).then(function(response) {
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
	var aw_timer = setInterval(loadInfo, 30000);

	$make.tabs('.tabs');
});
