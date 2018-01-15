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
 * т.н. Поинты - объекты со инфой о потоках радивы (пока только название, порт и id радио в Азуре)
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

;(() => {
	let storageCurrentPointItemName = 'aw_radioPoint'

	window.$currentPoint = {
		port: () => $ls.get(storageCurrentPointItemName)
			? points[$ls.get(storageCurrentPointItemName)].port
			: points['jp'].port,
		name: () => $ls.get(storageCurrentPointItemName)
			? points[$ls.get(storageCurrentPointItemName)].name
			: points['jp'].name,
		id: () => $ls.get(storageCurrentPointItemName)
			? points[$ls.get(storageCurrentPointItemName)].id
			: points['jp'].id,
		key: () => $ls.get(storageCurrentPointItemName) || 'jp'
	}
})()

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
	let btnData = radioCtrl_pp.dataset

	if (this.paused) {
		this.load()
		btnData.state = 'loading'

		this.addEventListener('error', () => {
			btnData.state = 'stop'; return
		})

		this.addEventListener('canplay', () => {
			this.play()
			btnData.state = 'play'
		})
	} else {
		this.pause()
		btnData.state = 'stop'
	}
}

radio.toPoint = function(point) {
	if (!Object.keys(points).includes(point)) { return }

	$ls.set('aw_radioOnPause', this.paused)
	$ls.set('aw_radioPoint', point) // айтем должен быть такой же, как в переменной storageCurrentPointItemName

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
	player =         $make.qs('.player'),
	radioCtrl_pp =   $make.qsf('[data-ctrl="playpause"]', player),
	radioCtrl_vol =  $make.qsf('[data-ctrl="volume"]', player),
	pointButtons =   $make.qsf('.player-change button', player, ['a'])

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
			srchVK = $create.link(`https://${domain.vk}/audio?q=${encodeURIComponent(currentFull)}`, '<i class="icon icon-vk"></i>', '', ['e']),
			srchGo = $create.link(`https://google.com/search?q=${encodeURIComponent(currentFull)}`, '<i class="icon icon-google"></i>', '', ['e'])

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
	noti: () => doFetch({ URL: API.noti, handler: $parser.noti, handlerOptions: { mode: 'radio' } }),
	vkNews: () => doFetch({ URL: API.vkNews, handler: $parser.vkNews }),
	full() {
		Object.keys(this).forEach(key => (key != 'full') ? this[key]() : '')
	}
}

document.addEventListener('DOMContentLoaded', () => {
	/*
	 * Проверка клиента на совместимость с сайтом
	 */

	clientTests({
		containers: {
			main: $make.qs('.radio'),
			error: $make.qs('.error-box')
		}
	})

	/*
	 * Инициация радио
	 */

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
	 * Инициация всего-всего при загрузке страницы
	 * @TODO найти более умные тултипы, эти не перемещаются в другое место при ресайзе страницы
	 */

	 let embedVkChecker = $check.get('embed-vk')

	;(() => {
		if ($ls.get('aw_l10n')) { moment.locale($ls.get('aw_l10n')) }
		if (embedVkChecker) { $make.qs('.container').classList.add('embed-vk') }

		/*
		 * Слегка модифицированный скрипт для перключения вкладок из /anime
		 * Индусский код, но работает!
		 */

		pointButtons = Array.from(pointButtons)

		pointButtons.forEach((button, i) => {
			let pointData = button.value

			button.setAttribute('title', `${getString('radio_station')} \u00AB${points[pointData].name}\u00BB`)

			if (pointData == $currentPoint.key()) { button.classList.add('active') }

			button.addEventListener('click', e => {
				let clickedButt = e.target

				if (!clickedButt.hasAttribute('disabled')) {
					radio.toPoint(e.target.value)
				} else { return }

				clickedButt.classList.add('active')

				pointButtons.forEach(pointButton => {
					if (clickedButt.value !== pointButton.value) {
						pointButton.classList.remove('active')
					}
				})
			})
		})

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
		// 	let pointKeys = Object.keys(points)
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
	})()

	//$create.balloon(pointButton[0].parentElement, 'Список потоков', 'down')

	if (isMobile.any) { $make.qs('.player-controls').classList.add('on-mobile') }

	// pointButtons.forEach(pointBtn => {
	// 	let pointData = pointBtn.value
  //
	// 	pointBtn.setAttribute('title', `${getString('radio_station')} \u00AB${points[pointData].name}\u00BB`)
  //
	// 	if (pointData == $currentPoint.key()) { pointBtn.classList.add('active') }
  //
	// 	pointBtn.addEventListener('click', e => {
	// 		if (!e.target.hasAttribute('disabled')) {
	// 			radio.toPoint(e.target.value)
	// 		}
	// 	})
	// })

	/*
	 * Таймеры
	 */

	;(() => {
		$loadInfo.full()
		let
			aw_timer_state = setInterval(() => { $loadInfo.radio() }, 5000),
			aw_timer_other = setInterval(() => {
				$loadInfo.schedule()
				$loadInfo.noti()
				if (!embedVkChecker) { $loadInfo.vkNews() }
			}, 30000)
	 })()
})
