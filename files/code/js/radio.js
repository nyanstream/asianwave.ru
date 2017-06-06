'use strict'

/*
 * Домены
 */

var domain = {
	'aw': 'asianwave.ru',
	'mr': 'myradio24.com',
	'vk': 'vk.com'
}

/*
 * Дополнение к камине
 */

$make.balloon = function(elem, text, pos) {
	let to = elem.dataset

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
 */

;(() => {
	let
		mainCont = $make.qs('.radio'),
		errorBox = $make.qs('.error-box'),
		err = !1

	if (!$ls.test()) {
		mainCont.classList.add('error')
		errorBox.innerHTML = `<p>${getString('err_ls')}</p><br><p>${getString('err_ls_pls')}`
		err = !0
	}

	if (err) errorBox.innerHTML += `<p>${getString('err_end')}</p><p><br>${getString('tnx')}! :3</p>`
})()

/*
 * Детект хрома
 */

;(() => {
	let
		chrExtBtn = $make.qs('.right li a[href*="--chrome"]'),
		isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor),
		isOpera = /OPR\//.test(navigator.userAgent)

	if (chrExtBtn) { // на случай, если опять забуду, что поменял класс элемента
		if (!isChrome) chrExtBtn.style.display = 'none';
		if (isOpera) {
			let icon = chrExtBtn.firstChild

			icon.classList.remove('icon-chrome')
			icon.classList.add('icon-opera')
			chrExtBtn.setAttribute('href', '/app--opera')
			chrExtBtn.setAttribute('title', getString('ext_opera'))
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
	port: () => {
		return $ls.get('aw_radioPoint') ? points[$ls.get('aw_radioPoint')].port : points['jp'].port
	},
	name: () => {
		return $ls.get('aw_radioPoint') ? points[$ls.get('aw_radioPoint')].name : points['jp'].name
	},
	srv: () => {
		return $ls.get('aw_radioPoint') ? points[$ls.get('aw_radioPoint')].srv : points['jp'].srv
	},
	key: () => {
		return $ls.get('aw_radioPoint') || 'jp'
	}
}

/*
 * Инициация радивы
 */

function getRadioSrc() { return `https://listen${$currentPoint.srv()}.${domain.mr}/${$currentPoint.port()}` }

var
	radio = new Audio(getRadioSrc()),
	radioVol = $ls.get('aw_radioVolume') || 20

radio.preload = 'none'
radio.autoplay = false
radio.controls = false

radio.toggle = function() {
	let pp_icon = radioCtrl_pp.firstChild.classList

	if (this.paused) {
		this.load()
		pp_icon.add('loading')

		this.addEventListener('error', function _fnc() {
			pp_icon.remove('loading'); return
			this.removeEventListener(e.type, _fnc)
		})

		this.addEventListener('canplaythrough', function _fnc(e) {
			pp_icon.remove('loading')
			this.play()

			pp_icon.toggle('icon-pause', true)
			pp_icon.toggle('icon-play', false)

			this.removeEventListener(e.type, _fnc)
		})
	} else {
		this.pause()

		pp_icon.toggle('icon-pause', false)
		pp_icon.toggle('icon-play', true)
	}
}

radio.toPoint = function(point) {
	$ls.set('aw_radioOnPause', this.paused)
	$ls.set('aw_radioPoint', point)

	this.src = getRadioSrc()
	this.load()

	if ($ls.get('aw_radioOnPause') == 'false') { this.play() }
	$ls.rm('aw_radioOnPause')

	$loadInfo.state()
}

/*
 * Инициация плеера и методов управления им
 */

var
	player = $make.qs('.player'),
	radioCtrl_pp = player.querySelector('[data-ctrl="playpause"]'),
	radioCtrl_vol = player.querySelector('[data-ctrl="volume"]'),
	pointButton = player.querySelectorAll('.player-change button')

radioCtrl_pp.onclick = function() { radio.toggle() }

radioCtrl_vol.value = radioVol
radio.volume = radioVol/100

/*
 * @HACK текущая громкость пишется в CSS-переменную
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
	pointButton.forEach((button, i) => {
		button.addEventListener('click', (e) => {
			let clickedButt = e.target || e.srcElement;
			clickedButt.classList.add('active');

			for (let i = 0; i < pointButton.length; i++) {
				if (clickedButt.dataset.point !== pointButton[i].dataset.point) {
					pointButton[i].classList.remove('active');
				}
			}
		})
	})
})()

/*
 * Фича автостарта плеера для огнелиса (и хрома с флагом).
 */

;(() => {
	let
		asMenu = $make.qs('menu[type="context"]#autostart menuitem'),
		asLSItem = 'aw_radioAutostart',
		autostphr = getString('player_autostart') + ': '

	switch ($ls.get(asLSItem)) {
		case '0':
			asMenu.setAttribute('label', autostphr + '\u2716'); break
		case '1':
			asMenu.setAttribute('label', autostphr + '\u2713')
			radio.toggle(); break
		case 'null':
		default:
			$ls.set(asLSItem, 0)
	}

	asMenu.addEventListener('click', () => {
		if ($ls.get(asLSItem) == '0') {
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
 * @TODO сделать файлик плейлиста со всеми станциями сразу
 */

var $parse = {
	schedule: (data) => {
		let
			streamsched = $make.qs('.schedule'),
			tableBody = ''

		let
			dayToday = moment().dayOfYear(),
			unixNow = moment().unix()

		streamsched.textContent = ''

		if (data == 'fail') return;

		let nextAirs = data.filter((e) => e[0] > unixNow)

		data.forEach((item) => {
			if (item[0] == data[data.length - 1][0]) return; // пропуск последнего элемента с пасхалкой

			let
				newsсhedData = `${moment.unix(item[0]).format('D MMMM')}<br>${moment.unix(item[0]).format('HH:mm')} &ndash; ${moment.unix(item[1]).format('HH:mm')}</td>`,
				nazvaniue = ''

			let
				dayOfS = moment.unix(item[0]).dayOfYear(),
				dayofE = moment.unix(item[1]).dayOfYear(),
				toNow = moment.unix(item[1]).toNow(true)

			if (item[3])
				nazvaniue = $make.link(item[3], item[2], ['e', 'html'])
				else nazvaniue = $make.xss(item[2])

			if ((dayOfS - dayToday) < -1 || item[0] < unixNow) {
				return
			} else if (item[0] < unixNow && unixNow < item[1]) {
				tableBody += $make.elem('tr', `<td>${newsсhedData}<td><b>Сейчас (ещё ${ moment.unix(item[1]).toNow(true)}):</b><br>${nazvaniue}</td>`, 'air--current', ['html'])
			} else if (item[0] > unixNow && item[0] == nextAirs[0][0]) {
				tableBody += $make.elem('tr', `<td>${newsсhedData}<td><b>Далее через ${moment.unix(item[0]).toNow(true)}:</b><br>${nazvaniue}</td>`, 'air--next', ['html'])
			} else if (dayOfS > dayToday) {
				tableBody += $make.elem('tr', `<td>${newsсhedData}<td>${nazvaniue}</td></tr>`, 'air--notToday', ['html'])
			} else {
				tableBody += $make.elem('tr', `<td>${newsсhedData}<td>${nazvaniue}</td>`, '', ['html'])
			}
		})

		if (tableBody)
			streamsched.innerHTML = $make.elem('table', `${$make.elem('caption', getString('airs_schedule'), '', ['html'])}<tbody>${tableBody}</tbody>`, '', ['html']) + $make.elem('div', getString('local_time_note'), 'aside-note', ['html'])
			else return
	},
	vk_news: (data) => {
		let
			vkNews = $make.qs('.vk-news'),
			newsBody = ''

		if (data == 'fail') {
			vkNews.classList.add('api-err')
			vkNews.textContent = ''
			vkNews.appendChild($make.elem('p', getString('err_api')))
			return
		} else {
		 	if (vkNews.classList.contains('api-err'))
				vkNews.classList.remove('api-err')
	  }

		data['posts'].forEach((post) => {
			if (post['pin'] == 1) return;

			var
				postImgLink = '', isCopy = '', postLinkS = '',
				postImg = post['pic']

			if (postImg) {
				var postImgElem = $make.elem('img')

				postImgElem.setAttribute('src', postImg['small'])
				postImgElem.setAttribute('alt', '')

				if (postImg['big'])
					postImgLink = $make.link(postImg['big'], postImgElem.outerHTML, ['e', 'html'])
					else postImgLink = $make.link(postImg['small'], postImgElem.outerHTML, ['e', 'html'])
			}

			var
				postText = post['text'].replace(/\n/g, '<br>'),
				pLR = /\[(.*?)\]/,
				postLinkR = postText.match(new RegExp(pLR, 'g'))

			if (postLinkR) {
				postLinkR.forEach((link) => {
					postLinkS = link.split('|')
					postText = postText.replace(pLR, $make.link(`https://${domain.vk}/${postLinkS[0].replace(/\[/g, '')}`, postLinkS[1].replace(/]/g, ''), ['e', 'html']))
				})
			}

			var
				vkPostMetaLink = $make.link(`https://${domain.vk}/wall-${data['com']['id']}_${post['id']}`, moment.unix(post['time']).format('D MMMM YYYY в HH:mm'), ['e', 'html'])

			if (post['type'] == 'copy') {
				isCopy = ' is-repost'
				vkPostMetaLink += ` <span title="${getString('vk_repost')}">\u2935</a>`
			}

			var
				vkPost = $make.elem('div', '', 'vk-post' + isCopy),
				vkPostMeta = $make.elem('div', vkPostMetaLink, 'vk-post-meta'),
				vkPostBody = $make.elem('div', `${postImgLink}<p>${postText}</p>`, 'vk-post-body')

			vkPost.appendChild(vkPostMeta)
			vkPost.appendChild(vkPostBody)

			newsBody += vkPost.outerHTML;
		})

		if (vkNews.innerHTML != newsBody) {
			vkNews.textContent = ''
			vkNews.innerHTML = newsBody
		}
	},
	mr24: (data) => {
		let
			stateBox = $make.qs('.radio-state'),
			stateBoxBody = '', linksBoxBody = '', plBoxBody = '',
			liveBox = $make.qs('.radio-live'),
			liveBoxBody = '',
			songsBox = $make.qs('.songs-box'),
			songsTableBody = ''

		stateBox.textContent = ''
		liveBox.textContent = ''
		songsBox.textContent = ''

		if (data == 'fail') {
			liveBox.appendChild($make.elem('p', getString('err_api_radio'), 'radio--pe')); return
		}

		let	current = data['song']

		/* Блок с выводом текущего трека */

		let
			currentSplit = current.split(' - '),
			currentA = currentSplit[0],
			currentS = currentSplit[1]

		if (!currentS) currentS = '';

		stateBoxBody = $make.elem('div', `<p title="${getString('song_current_track')}: ${$make.xss(currentS)}">${$make.xss(currentS)}</p><p title="${getString('song_current_artist')}: '${$make.xss(currentA)}">${$make.xss(currentA)}</p>`, 'current radio--pe')

		$make.balloon(stateBoxBody, getString('song_current'), 'down')

		/* Блок с выводом состояния прямого эфира (в остальных случаях скрыт) */

		let
			currRJ = $make.elem('div', `<p>${getString('rj_current')}:</p><p>${$make.xss(data['djname'])}</p>`, 'curr-rj radio--pe'),
			currLstn = $make.elem('div', $make.xss(data['listeners']), 'curr-lstn radio--pe')

		$make.balloon(currLstn, getString('listeners_current'), 'left')

		//currRJ.classList.add('radio--pe')
		//currLstn.classList.add('radio--pe')

		if (data['djname'].toLowerCase() != 'auto-dj') {
			liveBox.appendChild(currRJ)
			liveBox.appendChild(currLstn)
		}

		/* Блоки со ссылками на текущий трек и на загрузку "плейлиста" */

		let
			srchVK = $make.link(`https://${domain.vk}/audio?q=${encodeURIComponent(current)}`, '<i class="icon icon-vk"></i>', ['e']),
			srchGo = $make.link(`https://encrypted.google.com/#newwindow=1&q=${encodeURIComponent(current)}`, '<i class="icon icon-google"></i>', ['e'])

		//srchVK.setAttribute('title', `${getString('song_search_in')} VK`)
		//srchGo.setAttribute('title', `${getString('song_search_in')} Google`)

		linksBoxBody = $make.elem('div', '', 'search radio--pe')
		linksBoxBody.appendChild(srchVK)
		linksBoxBody.appendChild(srchGo)

		$make.balloon(linksBoxBody, getString('song_search'), 'left')

		let plLink = $make.link('', '<i class="icon icon-music"></i>')

		plLink.setAttribute('href', `data:audio/x-mpegurl;charset=utf-8;base64,${window.btoa(radio.src + '\n')}`)
		plLink.setAttribute('download', `Asian Wave ${$currentPoint.name()}.m3u`)

		plBoxBody = $make.elem('div', plLink.outerHTML, 'dlm3u radio--pe')

		$make.balloon(plBoxBody, getString('playlist_dl'), 'left')

		/* Блок с выводом недавних треков */

		let
			lastSongs = data['songs'].reverse(),
			numOfSongs = lastSongs.length

		if (numOfSongs >= 10) numOfSongs = (lastSongs.length - 1) / 2;

		for (let i = 0; i < numOfSongs; i++) {
			songsTableBody += `<tr><td>${$make.xss(lastSongs[i][0])}</td><td>${$make.xss(lastSongs[i][1].replace(' - ', ' – '))}</td></tr>`
		}

		stateBox.appendChild(stateBoxBody)
		stateBox.appendChild(linksBoxBody)
		stateBox.appendChild(plBoxBody)

		songsBox.innerHTML = $make.elem('table', `<caption>${getString('past_songs')}:</caption><tbody>${songsTableBody}</tbody>`, '', ['html']) + $make.elem('div', getString('msk_time_note'), 'aside-note', ['html'])
	},
	noti: (data) => {
		let notiEl = $make.qs('.noti')

		if (data == 'fail' || data[0] == null) { notiEl.style.display = 'none'; return }

		let text = data[0], id = data[1]

		let
			notiClose = $make.elem('button', getString('close').toLowerCase(), 'noti-close'),
			notiContent = $make.elem('div', `<p>${getString('noti')}:</p><p>${text}</p>`, 'noti-content'),
			notiItems = []

		notiEl.textContent = ''

		if (notiContent.querySelector('a[href]')) {
			let notiLinks = notiContent.querySelectorAll('a[href]')

			notiLinks.forEach((link) => {
				link.setAttribute('target', '_blank')
				if (link.getAttribute('href').indexOf('http') == 0) link.setAttribute('rel', 'nofollow noopener')
			})
		}

		notiEl.appendChild(notiContent)
		notiEl.appendChild(notiClose)

		if ($ls.get('aw_noti')) notiItems = JSON.parse($ls.get('aw_noti'))

		if (notiItems.indexOf(id) == -1)
			notiEl.style.display = 'block'
			else notiEl.style.display = 'none'

		notiClose.addEventListener('click', () => {
			notiItems[notiItems.length] = id
			$ls.set('aw_noti', JSON.stringify(notiItems))
			notiEl.style.display = 'none'
		});
	}
}

/*
 * Запросы к API
 */

var API = {
	'sched': '/api/radio-sched.json',
	'noti': '/api/noti.json',
	'vk_news': '/api/vk-info.json'
}

if ($check.debug()) {
	let API_keys = Object.keys(API)
	API_keys.forEach((key) => { API[key] = 'https://' + domain.aw + API[key] })
}

function doFetch(url, handler, ifFail) {
	let fetchOptions = { cache: 'no-store' }

	if (!ifFail) ifFail = 'fail';

	fetch(`${url}?t=${Date.now()}`, fetchOptions).then((response) => {
		response.json().then((data) => {
			handler(data)
		})
	}).catch((error) => {
		handler(ifFail)
	})
}

var $loadInfo = {
	state: () => {
		doFetch(`https://${domain.mr}/users/${$currentPoint.port()}/status.json`, $parse.mr24)
	},
	sched: () => {
		doFetch(API.sched, $parse.schedule)
	},
	vk_news: () => {
		doFetch(API.vk_news, $parse.vk_news)
	},
	noti: () => {
		doFetch(API.noti, $parse.noti)
	},
	full: function() {
		let thisKeys = Object.keys(this)
		for (let i = 0; i < thisKeys.length - 1; i++) this[thisKeys[i]]()
	}
}

/*
 * Инициация всего-всего при загрузке страницы
 * в первом цикле на базе данных со страницы инициируются Поинты
 * @TODO найти более умные тултипы, эти не перемещаются в другое место при ресайзе страницы
 */

document.addEventListener('DOMContentLoaded', () => {
	let	getPoint = $check.get('point')
	if (getPoint && Object.keys(points).indexOf(getPoint) > -1) { radio.toPoint(getPoint) }

	//$make.balloon(pointButton[0].parentElement, 'Список потоков', 'down')
	//if (isMobile.any) radioCtrl_pp.parentElement.classList.add('on-mobile')

	pointButton.forEach((pointBtn) => {
		let
			data = pointBtn.dataset,
			pointData = points[data.point]

		/*
		 * Свистелка для кастомного текста переключателя поинта
		 * пример: data-point-custom='ua;Ukraine'
		 */

		if (!data.pointCustom) {
			pointBtn.textContent = data.point
			$make.balloon(pointBtn, '\u00AB' + pointData.name + '\u00BB', 'down')
		} else {
			let dataCus = data.pointCustom.split(';')
			pointBtn.textContent = dataCus[0]
			if (dataCus[1]) $make.balloon(pointBtn, '\u00AB' + dataCus[1] + '\u00BB', 'down')
		}

		if (data.point == $currentPoint.key())
			pointBtn.classList.add('active');

		pointBtn.addEventListener('click', function() {
			radio.toPoint(this.dataset.point)
		})
	})

	$loadInfo.full()
	let
		aw_timer_state = setInterval(() => { $loadInfo.state() }, 5000),
		aw_timer_other = setInterval(() => {
			$loadInfo.sched()
			$loadInfo.vk_news()
			$loadInfo.noti()
		}, 30000);
})
