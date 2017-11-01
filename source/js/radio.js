'use strict'

/*
 * Дополнение к камине для создания тултипов
 */

$create.balloon = (elem, text, pos) => {
	let to = elem.dataset

	if (!to || isMobile.any) { return }

	to.balloon = text ? text : ''
	to.balloonPos = pos ? pos : 'up'
}

/*
 * Проверка клиента на совместимость с сайтом
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

domain.radio = `ryuko.${domain.aw}`

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

	if ($ls.get('aw_radioOnPause') == 'false') {
		this.load()
		this.play()
	}

	$ls.rm('aw_radioOnPause')

	$loadInfo.radio()
}

/*
 * Инициация плеера и методов управления им
 */

var
 	player = $make.qs('.player'),
 	radioCtrl_pp = player.querySelector('[data-ctrl="playpause"]'),
 	radioCtrl_vol = player.querySelector('[data-ctrl="volume"]'),
 	pointButton = player.querySelectorAll('.player-change button')

;(() => {
	radioCtrl_pp.onclick = () => radio.toggle()

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
})()

/*
 * Слегка модифицированный скрипт для перключения вкладок из /anime
 * Индусский код, но работает!
 */

;(() => {
	Array.from(pointButton).forEach((button, i) => {
		button.addEventListener('click', e => {
			let clickedButt = e.target
			clickedButt.classList.add('active')

			for (let i = 0, pbLength = pointButton.length; i < pbLength; i++) {
				if (clickedButt.value !== pointButton[i].value) {
					pointButton[i].classList.remove('active')
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
 * Парсер API азуры
 * @TODO сделать файлик плейлиста со всеми станциями сразу
 */

var $init = {
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

		plLink.setAttribute('href', `data:audio/x-mpegurl;charset=utf-8;base64,${btoa(radio.src + '\n')}`)
		plLink.setAttribute('download', `Asian Wave ${$currentPoint.name()}.m3u`)

		plBoxBody = $create.elem('div', plLink.outerHTML, 'dlm3u radio--pe')

		$create.balloon(plBoxBody, getString('playlist_dl'), 'left')

		/* Блок с выводом состояния прямого эфира (в остальных случаях скрыт) */
		/* @TODO вернуть в том или ином виде, когда запилят фичу со стороны азуры */

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
	}
}

/*
 * Запросы к API
 */

var $loadInfo = {
	radio: () => doFetch({ URL: `https://${domain.radio}/api/nowplaying/${$currentPoint.id()}`, handler: $init.radio }),
	schedule: () => doFetch({ URL: API.scheduleRadio, handler: $parser.schedule, handlerOptions: { mode: 'radio' } }),
	noti: () => doFetch({ URL: API.noti, handler: $parser.noti }),
	vkNews: () => doFetch({ URL: API.vkNews, handler: $parser.vkNews }),
	full() {
		Object.keys(this).forEach(key => (key != 'full') ? this[key]() : '')
	}
}

/*
 * Инициация всего-всего при загрузке страницы
 * @TODO найти более умные тултипы, эти не перемещаются в другое место при ресайзе страницы
 */

document.addEventListener('DOMContentLoaded', () => {
	let embedVkChecker = $check.get('embed-vk')

	if ($ls.get('aw_l10n')) { moment.locale($ls.get('aw_l10n')) }
	if (embedVkChecker) { $make.qs('.container').classList.add('embed-vk') }

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

	/*
	 * Получение хэшей в пригодном для дальнейшей работы виде из get-параметра hash при встраивании радио в VK
	 */

	let getVKhash = () => {
		let hashs = []
		if (embedVkChecker && $check.get('hash')) {
			if ($check.get('hash') == true) { return hashs }
			hashs = decodeURIComponent($check.get('hash')).split('&')
			hashs.forEach((hash, i) => {
				let tmp = hash.split('=')
				hashs[i] = {
					'key': tmp[0],
					'value': tmp[1] ? tmp[1] : null
				}
			})
		}
		return hashs
	}

	/*
	 * Если задан get-запрос "point" (или же такой ключ содержится в хэшах из VK) с ключом, который является действительным и входит в массив points, то радио при загрузке страницы автоматически переключается на нужный поток
	 * Пример: asianwave.ru/radio?point=ru
	 */

	let getPoint = $check.get('point')
	getVKhash().forEach(hash => {
		if (hash.key == 'point' && hash.value != null) {
			getPoint = hash.value
		}
	})

	if (getPoint && Object.keys(points).includes(getPoint)) {
		radio.toPoint(getPoint)
	}

	//$create.balloon(pointButton[0].parentElement, 'Список потоков', 'down')

	if (isMobile.any) { $make.qs('.player-controls').classList.add('on-mobile') }

	pointButtons.forEach(pointBtn => {
		let pointData = pointBtn.value

		pointBtn.setAttribute('title', `${getString('radio_station')} \u00AB${points[pointData].name}\u00BB`)

		if (pointData == $currentPoint.key()) { pointBtn.classList.add('active') }

		pointBtn.addEventListener('click', e => {
			if (!e.target.hasAttribute('disabled')) {
				radio.toPoint(e.target.value)
			}
		})
	})

	$loadInfo.full()
	let
		aw_timer_state = setInterval(() => { $loadInfo.radio() }, 5000),
		aw_timer_other = setInterval(() => {
			$loadInfo.schedule()
			$loadInfo.noti()
			if (!embedVkChecker) { $loadInfo.vkNews() }
		}, 30000);
})
