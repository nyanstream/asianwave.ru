'use strict'

/*
 * Дополнение к камине
 */

$make.balloon = function(elem, text, pos) {
	//var to = this.qs(elem).dataset
	var to = elem.dataset

	if (!to || isMobile.any) return false;

	if (text)
		to.balloon = text
		else to.balloon = ''

	if (pos)
		to.balloonPos = pos
		else to.balloonPos = 'up'
}

/*
 * Функция для проверки клиента на совместимость с сайтом (лол)
 * addClass() вместо classList.add() для всякого говна вроде старых IE
 * (инвалиды тоже люди, чо)
 */

;(function checkСompatibility() {
	var
		mainCont = document.querySelector('.radio'),
		errorBox = document.querySelector('.error-box');

	function addClass(o, c){
    var re = new RegExp('(^|\\s)' + c + '(\\s|$)', 'g')
    if (re.test(o.className)) return
    o.className = (o.className + ' ' + c).replace(/\s+/g, ' ').replace(/(^ | $)/g, '')
	}

	if (!$ls.test()) {
		addClass(mainCont, 'error')
		errorBox.innerHTML = '<p>В вашем браузере отключено сохранение данных для наго сайта, и из-за этого он не может нормально функционировать.</p><br><p>Пожалуйста, включите его.</p>'
	}

	if (!self.fetch) {
		addClass(mainCont, 'error')
		errorBox.innerHTML = '<p>Вы используете устаревший браузер, который не может обеспечить нормальную работу этого сайта.</p><br><p>Пожалуйста, скачайте более новый или обновите существующий.</p>'
	}

	if ($ls.test() || !self.fetch)
		errorBox.innerHTML += '<p>У нас круто, и это определённо будет стоить затрачанных усилий.</p><p><br>Спасибо! :3</p>'
})()

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
 * т.н. Поинты - объекты со инфой о потоках радивы (пока только название и порт)
 * + $currentPoint - функции по взятию инфы о текущем выбранном потоке (по умолчанию выбирается ниппонский)
 */

var points = {
	'jp': {
		'name': 'Japan',
		'port': 7934,
		'srv': 1
	}, 'ru': {
		'name': 'Russia',
		'port': 9759,
		'srv': 1
	}, 'kr': {
		'name': 'Korea',
		'port': 3799,
		'srv': 1
	}
}

var $currentPoint = {
	port: function() {
		return $ls.get('aw_radioPoint') ? points[$ls.get('aw_radioPoint')].port : points['jp'].port
	},
	name: function() {
		return $ls.get('aw_radioPoint') ? points[$ls.get('aw_radioPoint')].name : points['jp'].name
	},
	srv: function() {
		return $ls.get('aw_radioPoint') ? points[$ls.get('aw_radioPoint')].srv : points['jp'].srv
	},
	key: function () {
		return $ls.get('aw_radioPoint') || 'jp'
	}
}

/*
 * Инициация радивы
 * @TODO расхардкодить сервер
 */

var dmns = {
	'aw': 'asianwave.ru',
	'mr': document.currentScript.dataset.radioServer
}

var
	radio = new Audio('https://listen' + $currentPoint.srv() + '.' + dmns.mr + '/' + $currentPoint.port()),
	radioVol = $ls.get('aw_radioVolume') || 20

radio.preload = 'none'

/*
 * Инициация плеера и методов управления им
 */

var
	player = $make.qs('.player'),
	radioCtrl_pp = player.querySelector('[data-ctrl="playpause"]'),
	radioCtrl_vol = player.querySelector('[data-ctrl="volume"]'),
	pointButton = player.querySelectorAll('.player-change button')

var $ctrl = {
	changePoint: function(point) {
		$ls.set('aw_radioOnPause', radio.paused)
		//radio.src = radioServer + points[point].port
		radio.src = 'https://listen' + points[point].srv + '.' + dmns.mr + '/' + points[point].port
		radio.load()
		if ($ls.get('aw_radioOnPause') === 'false') {
			radio.play();
		}
		$ls.rm('aw_radioOnPause')
		$ls.set('aw_radioPoint', point)
		$loadInfo.state()
	},
	playPause: function() {
		var pp_icon = radioCtrl_pp.querySelector('.icon').classList

		if (radio.paused) {
			radio.pause();
			radio.load();
			radio.play();

			pp_icon.toggle('icon-pause', true)
			pp_icon.toggle('icon-play', false)
		} else {
			radio.pause();

			pp_icon.toggle('icon-pause', false)
			pp_icon.toggle('icon-play', true)
		}
	}
}

radioCtrl_pp.addEventListener('click', $ctrl.playPause)

radioCtrl_vol.value = radioVol
radio.volume = radioVol/100

/*
 * @HACK здесь текущая громкость пишется в css-переменную, для более удобного отображения в плеере
 * @TODO если когда-нибудь починят совместимость fill в браузерах, то переписать на него
 */

document.documentElement.style.setProperty('--volume', radioVol + '%')
radioCtrl_vol.addEventListener('input', function() {
	radioVol = this.value
	radio.volume = this.value/100
	document.documentElement.style.setProperty('--volume', radioVol + '%')
});

radioCtrl_vol.addEventListener('change', function() {
	if ($ls.test()) $ls.set('aw_radioVolume', this.value)
})

/*
 * Слегка модифицированный скрипт для перключения вкладок из /anime
 * Индусский код, но работает!
 */

;(function() {
	for (var i = 0; i < pointButton.length; i++) {
		pointButton[i].addEventListener('click', function(e) {
			var clickedButt = e.target || e.srcElement;
			clickedButt.classList.add('active');

			for (var i = 0; i < pointButton.length; i++) {
				if (clickedButt.dataset.point !== pointButton[i].dataset.point) {
					pointButton[i].classList.remove('active');
				}
			}
		})
	}
})()

/*
 * Фича автостарта плеера для огнелиса (и хрома с флагом).
 */

;(function() {
	var
		asMenu = $make.qs('menu[type="context"]#autostart menuitem'),
		asLSItem = 'aw_radioAutostart',
		autostphr = 'Запускать плеер при загрузке страницы: '

	switch ($ls.get(asLSItem)) {
		case 'null':
		default:
			$ls.set(asLSItem, 0)
			break
		case '0':
			asMenu.setAttribute('label', autostphr + '\u2716')
			break
		case '1':
			asMenu.setAttribute('label', autostphr + '\u2713')
			$ctrl.playPause()
			break
	}

	asMenu.addEventListener('click', function() {
		if ($ls.get(asLSItem) === '0') {
			$ls.set(asLSItem, 1)
			asMenu.setAttribute('label', autostphr + '\u2713')
		} else {
			$ls.set(asLSItem, 0)
			asMenu.setAttribute('label', autostphr + '\u2716')
		}
	})
})()

/*
 * Парсеры для различных API и прочего (но пока только API)
 * .noti() - Уведомления
 * .vk() - VK
 * .mr24() - API myradio24
 * @TODO сделать файлик плейлиста со всеми станциями сразу
 * * *
 * @TODO сделать парсер расписания эфиров
 */

var $parse = {
	noti: function(text, id) {
		var
			notiEl = $make.qs('.noti'),
			notiClose = $make.elem('button', 'закрыть', 'noti-close'),
			notiContent = $make.elem('div', '<p>Оповещение:</p><p>' + text + '</p>', 'noti-content'),
			notiItems = []

		notiEl.textContent = ''

		if (text === null || id === null) return false

		if (notiContent.querySelector('a[href]')) {
			var notiLinks = notiContent.querySelectorAll('a[href]')

			for (var i = 0; i < notiLinks.length; i++) {
				notiLinks[i].setAttribute('target', '_blank')
				if (notiLinks[i].getAttribute('href').indexOf('http') === 0) {
					notiLinks[i].setAttribute('rel', 'nofollow noopener')
				}
			}
		}

		notiEl.appendChild(notiContent)
		notiEl.appendChild(notiClose)

		if ($ls.get('aw_noti')) notiItems = JSON.parse($ls.get('aw_noti'))

		if (notiItems.indexOf(id) === -1)
			notiEl.style.display = 'block'
			else notiEl.style.display = 'none'

		notiClose.addEventListener('click', function() {
			notiItems[notiItems.length] = id
			$ls.set('aw_noti', JSON.stringify(notiItems))
			notiEl.style.display = 'none'
		});
	},
	shedule: function(data) {
		var
			streamShed = $make.qs('.shedule'),
			tableBody = '', sdata = '',
			nowTime = Math.round(new Date().getTime()/1000)

		streamShed.textContent = ''
		if (data === 'fail') return;

		for (var i = 1; i < data.length - 1; i++) {
			var
				newShedData = moment.unix(data[i][0]).format('D MMMM') + '<br>' + moment.unix(data[i][0]).format('HH:mm') + ' &ndash; ' + moment.unix(data[i][1]).format('HH:mm') + '</td>',
				nazvaniue = ''

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
				sdata = ''
			} else if (data[i][0] < nowTime) {
				sdata = ''
			} else if (moment.unix(data[i][0]).dayOfYear() > moment.unix(nowTime).dayOfYear()) {
				sdata = $make.elem('tr', '<td>' + newShedData + '<td>' + nazvaniue + '</td></tr>', 'air--notToday', ['html'])
			} else {
				sdata = $make.elem('tr', '<td>' + newShedData + '<td>' + nazvaniue + '</td>', '', ['html'])
			}

			tableBody += sdata;
		}

		if (tableBody) streamShed.innerHTML = $make.elem('table', '<caption>Расписание прямых эфиров:</caption><tbody>' + tableBody + '</tbody>', '', ['html']) + $make.elem('div', 'Время местное', 'aside-note', ['html'])
		else return
	},
	vk: function(data) {
		var
			vkNews = $make.qs('.vk-news'),
			newsBody = ''

		vkNews.textContent = ''

		if (data === 'fail') {
			vkNews.classList.add('api-err')
			vkNews.appendChild($make.elem('p', 'API сайта недоступно.'))
			return
		} else {
			if (vkNews.classList.contains('api-err')) vkNews.classList.remove('api-err')
		}

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

			newsBody += vkPost.outerHTML;
		}

		vkNews.innerHTML = newsBody;
	},
	mr24: function(data) {
		var
			stateBox = $make.qs('.radio-state'),
			stateBoxBody = '', linksBoxBody = '', plBoxBody = '',
			liveBox = $make.qs('.radio-live'),
			liveBoxBody = '',
			songsBox = $make.qs('.songs-box'),
			songsTableBody = ''

		stateBox.textContent = ''
		liveBox.textContent = ''
		songsBox.textContent = ''

		if (data === 'fail') {
			liveBox.appendChild($make.elem('p', 'Ошибка сервера радио.'))
			return
		}

		var	current = data['song']

		/* Блок с выводом текущего трека */

		var
			currentSplit = current.split(' - '),
			currentA = currentSplit[0],
			currentS = currentSplit[1]

		if (!currentS) currentS = '';

		stateBoxBody = $make.elem('div', '<p title="Трек: ' + $make.xss(currentS) + '">' + $make.xss(currentS) + '</p><p title="Автор: ' + $make.xss(currentA) + '">' + $make.xss(currentA) + '</p>', 'current')

		$make.balloon(stateBoxBody, 'Трек в эфире', 'down')

		/* Блок с выводом состояния прямого эфира (в остальных случаях скрыт) */

		var
			currRJ = $make.elem('div', '<p>Ведущий в эфире:</p><p>' + $make.xss(data['djname']) + '</p>', 'curr-rj'),
			currLstn = $make.elem('div', $make.xss(data['listeners']), 'curr-lstn')

		$make.balloon(currLstn, 'Количество слушателей', 'left')

		if (data['djname'] !== 'Auto-DJ') {
			liveBox.appendChild(currRJ)
			liveBox.appendChild(currLstn)
		}

		/* Блоки со ссылками на текущий трек и на загрузку "плейлиста" */

		var
			srchVK = $make.link('https://vk.com/audio?q=' + encodeURIComponent(current), '<i class="icon icon-vk"></i>', ['e']),
			srchGo = $make.link('https://encrypted.google.com/#newwindow=1&q=' + encodeURIComponent(current), '<i class="icon icon-google"></i>', ['e'])

		srchVK.setAttribute('title', 'Поиск трека в VK')
		srchGo.setAttribute('title', 'Поиск трека в Google')

		linksBoxBody = $make.elem('div', '', 'search')
		linksBoxBody.appendChild(srchVK)
		linksBoxBody.appendChild(srchGo)

		$make.balloon(linksBoxBody, 'Поиск трека', 'left')

		var plLink = $make.link('', '<i class="icon icon-music"></i>')

		plLink.setAttribute('href', 'data:audio/x-mpegurl;charset=utf-8;base64,' + window.btoa(radio.src + '\n'))
		plLink.setAttribute('download', 'Asian Wave ' + $currentPoint.name() + '.m3u')

		plBoxBody = $make.elem('div', plLink.outerHTML, 'dlm3u')

		$make.balloon(plBoxBody, 'Слушать во внешнем плеере', 'left')

		/* Блок с выводом недавних треков */

		var
			lastSongs = data['songs'].reverse(),
			numOfSongs = lastSongs.length

		if (numOfSongs >= 10) numOfSongs = (lastSongs.length - 1) / 2;

		for (var i = 0; i < numOfSongs; i++) {
			songsTableBody += '<tr><td>' + $make.xss(lastSongs[i][0]) + '</td><td>' + $make.xss(lastSongs[i][1].replace(' - ', ' – ')) + '</td></tr>'
		}

		stateBox.appendChild(stateBoxBody)
		stateBox.appendChild(linksBoxBody)
		stateBox.appendChild(plBoxBody)

		songsBox.innerHTML = $make.elem('table', '<caption>Ранее в эфире:</caption><tbody>' + songsTableBody + '</tbody>', '', ['html']) + $make.elem('div', 'Время московское', 'aside-note', ['html'])
	}
}

/*
 * Объявление адресов API проекта
 */

var API = {
	'shed': '/api/radio-shed.json',
	'noti': '/api/noti.json',
	'vk': '/api/vk-info.json'
}

if ($check.debug()) {
	var API_keys = Object.keys(API)
	for (var i = 0; i < API_keys.length; i++) {
		API[API_keys[i]] = 'https://' + dmns.aw + API[API_keys[i]]
	}
}

/*
 * Запросер(тм)(р)(с) v2.0 PEREMENNIE-FUNCTSII EDITION
 * .state() - инфа о радио
 * .shed() - расписание (пока неактивно)
 * .vk() - инфа с паблика ВК
 * .noti() - объявления
 * .full() - если необходимо запросить всё вместе
 */

var	fetchOptions = { cache: 'no-store' }

var $loadInfo = {
	state: function() {
		fetch('https://' + dmns.mr + '/users/' + $currentPoint.port() + '/status.json?t=' + Date.now(), fetchOptions).then(function(response) {
			response.json().then(function(data) {
				$parse.mr24(data)
			})
		}).catch(function(error) {
			$parse.mr24('fail')
		})
	},
	shed: function() {
		fetch(API.shed + '?t=' + Date.now(), fetchOptions).then(function(response) {
			response.json().then(function(data) {
				$parse.shedule(data)
			})
		}).catch(function(error) {
			$parse.shedule('fail')
		})
	},
	vk: function() {
		fetch(API.vk + '?t=' + Date.now(), fetchOptions).then(function(response) {
			response.json().then(function(data) {
				$parse.vk(data);
			})
		}).catch(function(error) {
			$parse.vk('fail')
		})
	},
	noti: function() {
		fetch(API.noti + '?t=' + Date.now(), fetchOptions).then(function(response) {
			response.json().then(function(data) {
				$parse.noti(data[0], data[1]);
			})
		}).catch(function(error) {
			$parse.noti(null, null)
		})
	},
	full: function() {
		var thisKeys = Object.keys(this)

		for(var i = 0; i < thisKeys.length - 1; i++) {
			this[thisKeys[i]]()
		}
	}
}

/*
 * Инициация всего-всего при загрузке страницы
 * в первом цикле на базе данных со страницы инициируются Поинты
 * @TODO найти более умные тултипы, эти не перемещаются в другое место при ресайзе страницы
 */

document.addEventListener('DOMContentLoaded', function() {
	var	getPoint = $check.get('point')
	if (getPoint && Object.keys(points).indexOf(getPoint) > -1) $ctrl.changePoint(getPoint);

	//$make.balloon(pointButton[0].parentElement, 'Список потоков', 'down')
	//if (isMobile.any) radioCtrl_pp.parentElement.classList.add('on-mobile')

	for (var i = 0; i < pointButton.length; i++) {
		var
			data = pointButton[i].dataset,
			pointData = points[data.point]

		/*
		 * Свистелка для кастомного текста переключателя поинта
		 * пример: data-point-custom='ua;Ukraine'
		 */

		if (!data.pointCustom) {
			pointButton[i].textContent = data.point
			$make.balloon(pointButton[i], '\u00AB' + pointData.name + '\u00BB', 'down')
		} else {
			var dataCus = data.pointCustom.split(';')
			pointButton[i].textContent = dataCus[0]
			if (dataCus[1]) $make.balloon(pointButton[i], '\u00AB' + dataCus[1] + '\u00BB', 'down')
		}

		if (data.point === $currentPoint.key())
			pointButton[i].classList.add('active');

		pointButton[i].addEventListener('click', function() {
			$ctrl.changePoint(this.dataset.point)
		})
	}

	$loadInfo.full()
	var
		aw_timer_state = setInterval(function() { $loadInfo.state() }, 5000),
		aw_timer_other = setInterval(function() {
			$loadInfo.shed()
			$loadInfo.vk()
			$loadInfo.noti()
		}, 30000);
})
