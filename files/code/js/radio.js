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

$create.balloon = function(elem, text, pos) {
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
	port: () => $ls.get('aw_radioPoint') ? points[$ls.get('aw_radioPoint')].port : points['jp'].port,
	name: () => $ls.get('aw_radioPoint') ? points[$ls.get('aw_radioPoint')].name : points['jp'].name,
	srv: () => $ls.get('aw_radioPoint') ? points[$ls.get('aw_radioPoint')].srv : points['jp'].srv,
	key: () => $ls.get('aw_radioPoint') || 'jp'
}

/*
 * Инициация радивы
 */

var getRadioSrc = () => `https://listen${$currentPoint.srv()}.${domain.mr}/${$currentPoint.port()}`

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
radioCtrl_vol.addEventListener('input', (e) => {
	radioVol = e.target.value
	radio.volume = radioVol/100
	document.documentElement.style.setProperty('--volume', radioVol + '%')
});

radioCtrl_vol.addEventListener('change', (e) => {
	$ls.set('aw_radioVolume', e.target.value)
})

/*
 * Слегка модифицированный скрипт для перключения вкладок из /anime
 * Индусский код, но работает!
 */

;(function() {
	Array.from(pointButton).forEach((button, i) => {
		button.addEventListener('click', (e) => {
			let clickedButt = e.target || e.srcElement;
			clickedButt.classList.add('active');

			for (let i = 0, pbLength = pointButton.length; i < pbLength; i++) {
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

		let nextAirs = data.filter((e) => e['s'] > unixNow)

		data.forEach((item) => {
			if (item['s'] == data[data.length - 1]['s']) return; // пропуск последнего элемента с пасхалкой

			let
				newsсhedData = `${moment.unix(item['s']).format('D MMMM')}<br>${moment.unix(item['s']).format('HH:mm')} &ndash; ${moment.unix(item['e']).format('HH:mm')}</td>`,
				nazvaniue = ''

			let
				dayOfS = moment.unix(item['s']).dayOfYear(),
				dayofE = moment.unix(item['e']).dayOfYear()

			if (item['link'])
				nazvaniue = $create.link(item['link'], item['title'], ['e', 'html'])
				else nazvaniue = $make.safe(item['title'])

			if ((dayOfS - dayToday) < -1 || item['s'] < unixNow) {
				return
			} else if (item['s'] < unixNow && unixNow < item['e']) {
				tableBody += $create.elem('tr', `<td>${newsсhedData}<td><b>Сейчас (ещё ${ moment.unix(item['e']).toNow(true)}):</b><br>${nazvaniue}</td>`, 'air--current', ['html'])
			} else if (item['s'] > unixNow && item['s'] == nextAirs[0]['s']) {
				tableBody += $create.elem('tr', `<td>${newsсhedData}<td><b>Далее через ${moment.unix(item['s']).toNow(true)}:</b><br>${nazvaniue}</td>`, 'air--next', ['html'])
			} else if (dayOfS > dayToday) {
				tableBody += $create.elem('tr', `<td>${newsсhedData}<td>${nazvaniue}</td></tr>`, 'air--notToday', ['html'])
			} else {
				tableBody += $create.elem('tr', `<td>${newsсhedData}<td>${nazvaniue}</td>`, '', ['html'])
			}
		})

		if (tableBody)
			streamsched.innerHTML = $create.elem('table', `${$create.elem('caption', getString('airs_schedule'), '', ['html'])}<tbody>${tableBody}</tbody>`, '', ['html']) + $create.elem('div', getString('local_time_note'), 'aside-note', ['html'])
			else return
	},
	vk_news: (data) => {
		let
			vkNews = $make.qs('.vk-news'),
			newsBody = ''

		if (data == 'fail' || !data.posts) {
			vkNews.classList.add('api-err')
			vkNews.textContent = ''
			vkNews.appendChild($create.elem('p', getString('err_api')))
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
				var postImgElem = $create.elem('img')

				postImgElem.setAttribute('src', postImg['small'])
				postImgElem.setAttribute('alt', '')

				if (postImg['big'])
					postImgLink = $create.link(postImg['big'], postImgElem.outerHTML, ['e', 'html'])
					else postImgLink = $create.link(postImg['small'], postImgElem.outerHTML, ['e', 'html'])
			}

			var
				postText = post['text'].replace(/\n/g, '<br>'),
				pLR = /\[(.*?)\]/,
				postLinkR = postText.match(new RegExp(pLR, 'g'))

			if (postLinkR) {
				postLinkR.forEach((link) => {
					postLinkS = link.split('|')
					postText = postText.replace(pLR, $create.link(`https://${domain.vk}/${postLinkS[0].replace(/\[/g, '')}`, postLinkS[1].replace(/]/g, ''), ['e', 'html']))
				})
			}

			var
				vkPostMetaLink = $create.link(`https://${domain.vk}/wall-${data['com']['id']}_${post['id']}`, moment.unix(post['time']).format('D MMMM YYYY в HH:mm'), ['e', 'html'])

			if (post['type'] == 'copy') {
				isCopy = ' is-repost'
				vkPostMetaLink += ` <span title="${getString('vk_repost')}">\u2935</a>`
			}

			var
				vkPost = $create.elem('div', '', 'vk-post' + isCopy),
				vkPostMeta = $create.elem('div', vkPostMetaLink, 'vk-post-meta'),
				vkPostBody = $create.elem('div', `${postImgLink}<p>${postText}</p>`, 'vk-post-body')

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

		if (data == 'fail') { liveBox.appendChild($create.elem('p', getString('err_api_radio'), 'radio--pe')); return }

		let	current = data['song']

		/* Блок с выводом текущего трека */

		let
			currentSplit = current.split(' - '),
			currentA = currentSplit[0],
			currentS = currentSplit[1]

		if (!current) currentA = '\u00af\u005c\u005f\u0028\u30c4\u0029\u005f\u002f\u00af';
		if (!currentS) currentS = '';

		stateBoxBody = $create.elem('div', `<p title="${getString('song_current_track')}: ${$make.safe(currentS)}">${$make.safe(currentS)}</p><p title="${getString('song_current_artist')}: ${$make.safe(currentA)}">${$make.safe(currentA)}</p>`, 'current radio--pe')

		$create.balloon(stateBoxBody, getString('song_current'), 'down')

		/* Блок с выводом состояния прямого эфира (в остальных случаях скрыт) */

		let
			currRJ = $create.elem('div', `<p>${getString('rj_current')}:</p><p>${$make.safe(data['djname'])}</p>`, 'curr-rj radio--pe'),
			currLstn = $create.elem('div', `<div>${$make.safe(data['listeners'])}</div>`, 'curr-lstn radio--pe')

		$create.balloon(currLstn, getString('listeners_current'), 'left')

		//currRJ.classList.add('radio--pe')
		//currLstn.classList.add('radio--pe')

		switch (data['djname'].toLowerCase()) {
			case '':
			case 'auto-dj':
				break
			default:
				liveBox.appendChild(currRJ)
				liveBox.appendChild(currLstn)
		}

		/* Блоки со ссылками на текущий трек и на загрузку "плейлиста" */

		let
			srchVK = $create.link(`https://${domain.vk}/audio?q=${encodeURIComponent(current)}`, '<i class="icon icon-vk"></i>', ['e']),
			srchGo = $create.link(`https://encrypted.google.com/#newwindow=1&q=${encodeURIComponent(current)}`, '<i class="icon icon-google"></i>', ['e'])

		//srchVK.setAttribute('title', `${getString('song_search_in')} VK`)
		//srchGo.setAttribute('title', `${getString('song_search_in')} Google`)

		linksBoxBody = $create.elem('div', '', 'search radio--pe')
		linksBoxBody.appendChild(srchVK)
		linksBoxBody.appendChild(srchGo)

		$create.balloon(linksBoxBody, getString('song_search'), 'left')

		let plLink = $create.link('', '<i class="icon icon-music"></i>')

		plLink.setAttribute('href', `data:audio/x-mpegurl;charset=utf-8;base64,${window.btoa(radio.src + '\n')}`)
		plLink.setAttribute('download', `Asian Wave ${$currentPoint.name()}.m3u`)

		plBoxBody = $create.elem('div', plLink.outerHTML, 'dlm3u radio--pe')

		$create.balloon(plBoxBody, getString('playlist_dl'), 'left')

		/* Блок с выводом недавних треков */

		let
			lastSongs = data['songs'].reverse(),
			numOfSongs = lastSongs.length

		if (numOfSongs >= 10) numOfSongs = (lastSongs.length - 1) / 2;

		for (let i = 0; i < numOfSongs; i++) {
			songsTableBody += `<tr><td>${$make.safe(lastSongs[i][0])}</td><td>${$make.safe(lastSongs[i][1].replace(' - ', ' – '))}</td></tr>`
		}

		stateBox.appendChild(stateBoxBody)
		stateBox.appendChild(linksBoxBody)
		stateBox.appendChild(plBoxBody)

		songsBox.innerHTML = $create.elem('table', `<caption>${getString('prev_songs')}:</caption><tbody>${songsTableBody}</tbody>`, '', ['html']) + $create.elem('div', getString('msk_time_note'), 'aside-note', ['html'])
	},
	noti: (data) => {
		let notiEl = $make.qs('.noti')

		if (data == 'fail' || !data['enabled']) { notiEl.style.display = 'none'; return }

		let
			id = data['time'],
			text = data['text'],
			color = data['color']

		if (color)
			notiEl.style.backgroundColor = color
			else notiEl.style.backgroundColor = null

		let
			notiClose = $create.elem('button', getString('noti_close').toLowerCase(), 'noti-close'),
			notiContent = $create.elem('div', `<p>${getString('noti')}:</p><p>${text}</p>`, 'noti-content'),
			notiItems = []

		notiEl.textContent = ''

		if (notiContent.querySelector('a[href]')) {
			let notiLinks = notiContent.querySelectorAll('a[href]')

			Array.from(notiLinks).forEach((link) => {
				link.setAttribute('target', '_blank')
				if (link.getAttribute('href').indexOf('http') == 0) link.setAttribute('rel', 'nofollow noopener')
			})
		}

		notiEl.appendChild(notiContent)
		notiEl.appendChild(notiClose)

		if ($ls.get('aw_noti')) notiItems = JSON.parse($ls.get('aw_noti'))

		if (!notiItems.includes(id))
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
	'api': '/api/api.json',
	'sched': '/api/radio-sched.json',
	'noti': '/api/noti.json',
	'vk_news': '/api/vk-info.json'
}

switch (location.hostname) {
	case '127.0.0.1':
	case 'localhost':
		for (let key in API) { if (API.hasOwnProperty(key)) API[key] = `https://${domain.aw}${API[key]}` }
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
		for (let key in this) { if (this.hasOwnProperty(key) && key != 'full') this[key]() }
	}
}

/*
 * Инициация всего-всего при загрузке страницы
 * в первом цикле на базе данных со страницы инициируются Поинты
 * @TODO найти более умные тултипы, эти не перемещаются в другое место при ресайзе страницы
 */

document.addEventListener('DOMContentLoaded', () => {
	let pointButtons = Array.from(pointButton)

	doFetch(API.api, (data) => {
		let radio = data['radio-v2'], count = 0
		for (let key in radio) {
			if (radio.hasOwnProperty(key) && radio[key].online == 0) {
				count++
				pointButtons.forEach((pointBtn) => {
					if (pointBtn.dataset.point == key) pointBtn.setAttribute('disabled', '')
				})
			}
		}
		if (count == pointButtons.length) alert(`Похоже, что все станции оффлайн. Скорее всего, мы не проплатили их хостинг. Или закрылись. Или закрылся хостинг. Не знаем, что хуже, если честно. В любом случае, мы их или скоро починим, или не починим совсем. На всякий случай вооружитесь терпением!`)
	})

	let	getPoint = $check.get('point')
	if (getPoint && Object.keys(points).includes(getPoint)) { radio.toPoint(getPoint) }

	//$create.balloon(pointButton[0].parentElement, 'Список потоков', 'down')
	//if (isMobile.any) radioCtrl_pp.parentElement.classList.add('on-mobile')

	pointButtons.forEach((pointBtn) => {
		let
			data = pointBtn.dataset,
			pointData = points[data.point]

		/*
		 * Свистелка для кастомного текста переключателя поинта
		 * пример: data-point-custom='ua;Ukraine'
		 */

		if (!data.pointCustom) {
			pointBtn.textContent = data.point
			$create.balloon(pointBtn, '\u00AB' + pointData.name + '\u00BB', 'down')
		} else {
			let dataCus = data.pointCustom.split(';')
			pointBtn.textContent = dataCus[0]
			if (dataCus[1]) $create.balloon(pointBtn, '\u00AB' + dataCus[1] + '\u00BB', 'down')
		}

		if (data.point == $currentPoint.key())
			pointBtn.classList.add('active');

		pointBtn.addEventListener('click', (e) => {
			if (!e.target.hasAttribute('disabled')) {
				radio.toPoint(e.target.dataset.point)
			}
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
