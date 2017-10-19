'use strict'

/*
 * Домены
 */

var domain = {
	'aw': 'asianwave.ru',
	'vk': 'vk.com'
}

domain.radio = `ryuko.${domain.aw}`

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
 * т.н. Поинты - объекты со инфой о потоках радивы (пока только название, сервер и порт)
 * + $currentPoint - функции по взятию инфы о текущем выбранном потоке (по умолчанию выбирается ниппонский)
 */

var points = {
	'jp': {
		'name': 'Japan',
		'port': 8000,
		'id': 1
	}, 'ru': {
		'name': 'Russia',
		'port': 8010,
		'id': 2
	}, 'kr': {
		'name': 'Korea',
		'port': 8020,
		'id': 3
	}
}

var $currentPoint = {
	port: () => $ls.get('aw_radioPoint') ? points[$ls.get('aw_radioPoint')].port : points['jp'].port,
	name: () => $ls.get('aw_radioPoint') ? points[$ls.get('aw_radioPoint')].name : points['jp'].name,
	id: () => $ls.get('aw_radioPoint') ? points[$ls.get('aw_radioPoint')].id : points['jp'].id,
	key: () => $ls.get('aw_radioPoint') || 'jp'
}

/*
 * Инициация радио
 */

var getRadioSrc = () => `https://${domain.radio}/radio/${$currentPoint.port()}/listen`

var
	radio = new Audio(getRadioSrc()),
	radioVol = $ls.get('aw_radioVolume') || (isMobile.any ? 100 : 20)

radio.preload = 'none'
radio.autoplay = false
radio.controls = false

radio.toggle = function() {
	let pp_icon = radioCtrl_pp.firstChild.classList

	if (this.paused) {
		this.load()
		pp_icon.add('loading')

		this.addEventListener('error', () => {
			pp_icon.remove('loading'); return
		})

		this.addEventListener('canplaythrough', () => {
			pp_icon.remove('loading')
			this.play()

			pp_icon.toggle('icon-pause', true)
			pp_icon.toggle('icon-play', false)
		})
	} else {
		this.pause()

		pp_icon.toggle('icon-pause', false)
		pp_icon.toggle('icon-play', true)
	}
}

radio.toPoint = function(point) {
	if (!Object.keys(points).includes(point)) return;

	$ls.set('aw_radioOnPause', this.paused)
	$ls.set('aw_radioPoint', point)

	this.src = getRadioSrc()
	this.load()

	if ($ls.get('aw_radioOnPause') == 'false') { this.play() }
	$ls.rm('aw_radioOnPause')

	$make.qs(`.player-change input[value='${point}']`).checked = true

	$loadInfo.state()
}

/*
 * Инициация плеера и методов управления им
 */

var
	player = $make.qs('.player'),
	radioCtrl_pp = player.querySelector('[data-ctrl="playpause"]'),
	radioCtrl_vol = player.querySelector('[data-ctrl="volume"]'),
	pointButton = player.querySelectorAll('.player-change input')

radioCtrl_pp.onclick = function() { radio.toggle() }

radioCtrl_vol.value = radioVol
radio.volume = radioVol/100

/*
 * @HACK текущая громкость пишется в CSS-переменную
 * @TODO если когда-нибудь починят совместимость fill в браузерах, то переписать на него
 */

document.documentElement.style.setProperty('--volume', radioVol + '%')
radioCtrl_vol.addEventListener('input', e => {
	radioVol = e.target.value
	radio.volume = radioVol/100
	document.documentElement.style.setProperty('--volume', radioVol + '%')
});

radioCtrl_vol.addEventListener('change', e => {
	$ls.set('aw_radioVolume', e.target.value)
})

/*
 * Слегка модифицированный скрипт для перключения вкладок из /anime
 * Индусский код, но работает!
 */

;(() => {
	Array.from(pointButton).forEach((button, i) => {
		button.addEventListener('click', e => {
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

var scriptData = document.currentScript.dataset

var $parse = {
	schedule: data => {
		let
			streamsched = $make.qs('.schedule'),
			tableBody = ''

		let
			dayToday = moment().dayOfYear(),
			unixNow = moment().unix()

		streamsched.textContent = ''

		if (data == 'fail') return;

		let nextAirs = data.filter(e => e['s'] > unixNow)

		data.forEach(item => {
			if (item['secret'])  { return } // пропуск секретных элементов

			let
				newsсhedData = `${moment.unix(item['s']).format('D MMMM')}<br>${moment.unix(item['s']).format('HH:mm')} &ndash; ${moment.unix(item['e']).format('HH:mm')}</td>`,
				nazvaniue = ''

			let
				dayOfS = moment.unix(item['s']).dayOfYear(),
				dayofE = moment.unix(item['e']).dayOfYear()

			if (item['link']) {
				nazvaniue = $create.link(item['link'], item['title'], ['e', 'html'])
			} else { nazvaniue = $make.safe(item['title']) }

			if ((dayOfS - dayToday) < -1 || item['e'] < unixNow) {
				return
			} else if (item['s'] < unixNow && unixNow < item['e']) {
				tableBody += $create.elem('tr', `<td>${newsсhedData}</td><td><b>${getString('now')(moment.unix(item['e']).toNow(true))}:</b><br>${nazvaniue}</td>`, 'air--current', ['html'])
			} else if (item['s'] > unixNow && item['s'] == nextAirs[0]['s']) {
				tableBody += $create.elem('tr', `<td>${newsсhedData}</td><td><b>${getString('within')} ${moment.unix(item['s']).fromNow()}:</b><br>${nazvaniue}</td>`, 'air--next', ['html'])
			} else if (dayOfS > dayToday) {
				tableBody += $create.elem('tr', `<td>${newsсhedData}</td><td>${nazvaniue}</td>`, 'air--notToday', ['html'])
			} else {
				tableBody += $create.elem('tr', `<td>${newsсhedData}</td><td>${nazvaniue}</td>`, '', ['html'])
			}
		})

		if (tableBody != '') {
			streamsched.appendChild($create.elem('table', `${$create.elem('caption', getString('airs_schedule'), '', ['html'])}<tbody>${tableBody}</tbody>`, '', ['html']))
		} else { return }
	},
	vk_news: data => {
		let
			vkNews = $make.qs('.vk-news'),
			newsBody = ''

		if (data == 'fail' || !data.posts) {
			vkNews.classList.add('api-err')
			vkNews.textContent = ''
			vkNews.appendChild($create.elem('p', getString('err_api')))
			return
		} else {
			if (vkNews.classList.contains('api-err')) {
				vkNews.classList.remove('api-err')
			}
	  }

		data['posts'].forEach(post => {
			if (post['pin'] == 1) return;

			let
				postImgLink = '', isCopy = '', postLinkS = '',
				postImg = post['pic']

			if (postImg) {
				let	postImgElem = $create.elem('img')

				postImgElem.setAttribute('src', postImg['small'])
				postImgElem.setAttribute('alt', '')

				postImgLink = $create.link(postImg['big'] ? postImg['big'] : postImg['small'], '')

				postImgLink.classList.add('link2img')
				postImgLink.appendChild(postImgElem)
			}

			let
				postText = post['text'].replace(/\n/g, '<br>'),
				pLR = /\[(.*?)\]/,
				postLinkR = postText.match(new RegExp(pLR, 'g'))

			if (postText == '') return;
			if (postLinkR) {
				postLinkR.forEach(link => {
					postLinkS = link.split('|')
					postText = postText.replace(pLR, $create.link(`https://${domain.vk}/${postLinkS[0].replace(/\[/g, '')}`, postLinkS[1].replace(/]/g, ''), ['e', 'html']))
				})
			}

			let
				vkPostMetaLink = $create.link(`https://${domain.vk}/wall-${data['com']['id']}_${post['id']}`, moment.unix(post['time']).format('LLL'), ['e', 'html'])

			if (post['type'] == 'copy') {
				isCopy = ' is-repost'
				vkPostMetaLink += ` <span title="${getString('vk_repost')}">\u2935</a>`
			}

			let
				vkPost = $create.elem('div', '', 'vk-post' + isCopy),
				vkPostMeta = $create.elem('div', vkPostMetaLink, 'vk-post-meta'),
				vkPostBody = $create.elem('div', '', 'vk-post-body')

			if (postImgLink) { vkPostBody.appendChild(postImgLink) }
			vkPostBody.appendChild($create.elem('p', postText))

			vkPost.appendChild(vkPostMeta)
			vkPost.appendChild(vkPostBody)

			newsBody += vkPost.outerHTML;
		})

		if (vkNews.innerHTML != newsBody) {
			vkNews.textContent = ''
			vkNews.innerHTML = newsBody
		}
	},
	radio: data => {
		let
			stateBox = $make.qs('.radio-state'),
			stateBoxBody = '', linksBoxBody = '', plBoxBody = '',
			liveBox = $make.qs('.radio-live'),
			liveBoxBody = '',
			songsBox = $make.qs('.songs-box'),
			songsTableBody = '',
			radioErrorBox = $make.qs('.radio-error')

		stateBox.textContent = ''
		liveBox.textContent = ''
		songsBox.textContent = ''
		radioErrorBox.textContent = ''

		//console.log(data)

		if (data == 'fail') { $make.qs('.radio-error').textContent = getString('err_api_radio'); return }

		/* Блок с выводом текущего трека */

		let
			current = data['now_playing']['song'],
			currentFull = current['text'],
			currentA = current['artist'],
			currentS = current['title']

		if (!current) { currentA = '\u00af\u005c\u005f\u0028\u30c4\u0029\u005f\u002f\u00af' }
		if (!currentS) { currentS = '' }

		stateBoxBody = $create.elem('div', `<p title="${getString('song_current_track')}: ${$make.safe(currentS)}">${$make.safe(currentS)}</p><p title="${getString('song_current_artist')}: ${$make.safe(currentA)}">${$make.safe(currentA)}</p>`, 'current radio--pe')

		$create.balloon(stateBoxBody, getString('song_current'), 'down')

		/* Блоки со ссылками на текущий трек и на загрузку "плейлиста" */

		let
			srchVK = $create.link(`https://${domain.vk}/audio?q=${encodeURIComponent(currentFull)}`, '<i class="icon icon-vk"></i>', ['e']),
			srchGo = $create.link(`https://google.com/search?q=${encodeURIComponent(currentFull)}`, '<i class="icon icon-google"></i>', ['e'])

		//srchVK.setAttribute('title', `${getString('song_search_in')} VK`)
		//srchGo.setAttribute('title', `${getString('song_search_in')} Google`)

		linksBoxBody = $create.elem('div', '', 'search radio--pe')
		linksBoxBody.appendChild(srchVK)
		linksBoxBody.appendChild(srchGo)

		$create.balloon(linksBoxBody, getString('song_search'), 'left')

		/* Файл плейлиста */

		let plLink = $create.link('', '<i class="icon icon-music"></i>')

		plLink.setAttribute('href', `data:audio/x-mpegurl;charset=utf-8;base64,${window.btoa(radio.src + '\n')}`)
		plLink.setAttribute('download', `Asian Wave ${$currentPoint.name()}.m3u`)

		plBoxBody = $create.elem('div', plLink.outerHTML, 'dlm3u radio--pe')

		$create.balloon(plBoxBody, getString('playlist_dl'), 'left')

		/* Блок с выводом состояния прямого эфира (в остальных случаях скрыт) */

		// let
		// 	currRJ = $create.elem('div', `<p>${getString('rj_current')}:</p><p>${$make.safe(data['djname'])}</p>`, 'curr-rj radio--pe'),
		// 	currLstn = $create.elem('div', `<div>${$make.safe(data['listeners'])}</div>`, 'curr-lstn radio--pe')
		//
		// $create.balloon(currLstn, getString('listeners_current'), 'left')

		//currRJ.classList.add('radio--pe')
		//currLstn.classList.add('radio--pe')

		// switch (data['djname'].toLowerCase()) {
		// 	case '':
		// 	case 'auto-dj':
		// 		break
		// 	default:
		// 		liveBox.appendChild(currRJ)
		// 		liveBox.appendChild(currLstn)
		// }

		/* Блок с выводом недавних треков */

		songsTableBody = $create.elem('table')
		songsTableBody.appendChild($create.elem('caption', getString('prev_songs')))

		let
			lastSongs = data['song_history'],
			numOfSongs = lastSongs.length

		for (let i = 0; i < numOfSongs; i++) {
			let lastSongData = lastSongs[i]
			songsTableBody.appendChild($create.elem('tr', `<td>${moment.unix(lastSongData['played_at']).format('HH:mm')}</td><td>${$make.safe(lastSongData['song']['text'].replace(' - ', ' – '))}`))
		}

		stateBox.appendChild(stateBoxBody)
		stateBox.appendChild(linksBoxBody)
		stateBox.appendChild(plBoxBody)

		songsBox.appendChild(songsTableBody)
	},
	noti: data => {
		let notiEl = $make.qs('.noti')

		if (data == 'fail' || !data['enabled']) { notiEl.style.display = 'none'; return }

		let
			id = data['time'],
			text = data['text'],
			color = data['color']

		if (color) {
			notiEl.style.backgroundColor = color
		} else { notiEl.style.backgroundColor = null }

		let
			notiClose = $create.elem('button', getString('noti_hide').toLowerCase(), 'noti-close'),
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

var apiPrefix = (scriptData.apiPrefix && scriptData.apiPrefix != '') ? scriptData : 'api'

var API = {
	'api': 'api.json',
	'sched': 'radio-sched.json',
	'noti': 'noti.json',
	'vk_news': 'vk-info.json',
}

switch (location.hostname) {
	case '127.0.0.1':
	case 'localhost':
		Object.keys(API).forEach(key => {
			API[key] = `https://${domain.aw}/${apiPrefix}/${API[key]}`
		})
}

var doFetch = (url, handler, ifFail) => {
	let fetchOptions = { cache: 'no-store' }

	if (!ifFail) ifFail = 'fail';

	fetch(`${url}?t=${Date.now()}`, fetchOptions).then(response => {
		response.json().then(data => {
			handler(data)
		})
	}).catch(e => { handler(ifFail) })
}

var $loadInfo = {
	state: () => doFetch(`https://${domain.radio}/api/nowplaying/${$currentPoint.id()}`, $parse.radio),
	sched: () => doFetch(API.sched, $parse.schedule),
	vk_news: () => doFetch(API.vk_news, $parse.vk_news),
	noti: () => doFetch(API.noti, $parse.noti),
	full() {
		Object.keys(this).forEach(key => {
			if (key != 'full') this[key]()
		})
	}
}

/*
 * Инициация всего-всего при загрузке страницы
 * @TODO найти более умные тултипы, эти не перемещаются в другое место при ресайзе страницы
 */

document.addEventListener('DOMContentLoaded', () => {
	if ($ls.get('aw_l10n')) { moment.locale($ls.get('aw_l10n')) }
	if ($check.get('embed-vk')) { $make.qs('.container').classList.add('embed-vk') }

	let
		pointButtons = Array.from(pointButton),
		pointKeys = Object.keys(points)

	// doFetch(API.api, data => {
	// 	let
	// 		radio = data['radio-v2'], count = 0,
	// 		online = []
	//
	// 	Object.keys(radio).forEach((key, i) => {
	// 		if (radio[key].online == 0) {
	// 			count++; $make.qs(`.player-change input[value='${key}']`).setAttribute('disabled', '')
	// 		}
	// 	})
	//
	// 	switch (count) {
	// 		case pointKeys.length:
	// 			$make.qs('.player').classList.add('mayday'); break
	// 		case (pointKeys.length - 1):
	// 			$make.qs('.player').classList.add('only-one')
	// 	}
	// })

	let getPoint = $check.get('point')
	if (getPoint && Object.keys(points).includes(getPoint)) { radio.toPoint(getPoint) }

	//$create.balloon(pointButton[0].parentElement, 'Список потоков', 'down')

	if (isMobile.any) { radioCtrl_pp.parentElement.classList.add('on-mobile') }

	pointButtons.forEach(pointBtn => {
		let pointData = pointBtn.value

		//$create.balloon(pointBtn, '\u00AB' + points[pointData].name + '\u00BB', 'down')

		pointBtn.setAttribute('title', `${getString('radio_station')} \u00AB${points[pointData].name}\u00BB`)

		if (pointData == $currentPoint.key())
			pointBtn.checked = true;

		pointBtn.addEventListener('click', e => {
			if (!e.target.hasAttribute('disabled')) {
				radio.toPoint(e.target.value)
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
