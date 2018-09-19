'use strict'

/*
 * Проверка клиента на совместимость с сайтом
 */

clientTests({ nodes: {
	container:  $make.qs('.radio'),
	errorBox:   $make.qs('.error-box')
}})

$check.mediaSession = () => ('mediaSession' in navigator)

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
	mu: {
		name: 'Music',
		port: 8000,
		mr24port: 7934,
		id: 1,
	},

	ta: {
		name: 'Talk',
		port: 8010,
		mr24port: 7934,
		id: 2,
	}
}

void (() => {
	let storageCurrentPointItemName = 'aw_radioPoint'

	window.$currentPoint = {
		port: () => $ls.get(storageCurrentPointItemName)
			? points[$ls.get(storageCurrentPointItemName)].port
			: points[STRINGS.defaultPoint].port,
		mr24port: () => $ls.get(storageCurrentPointItemName)
			? points[$ls.get(storageCurrentPointItemName)].mr24port
			: points[STRINGS.defaultPoint].mr24port,
		name: () => $ls.get(storageCurrentPointItemName)
			? points[$ls.get(storageCurrentPointItemName)].name
			: points[STRINGS.defaultPoint].name,
		id: () => $ls.get(storageCurrentPointItemName)
			? points[$ls.get(storageCurrentPointItemName)].id
			: points[STRINGS.defaultPoint].id,
		key: () => $ls.get(storageCurrentPointItemName) || STRINGS.defaultPoint,
		// orderType: () => $ls.get(storageCurrentPointItemName)
		// 	? points[$ls.get(storageCurrentPointItemName)].crutch.orderType
		// 	: points[STRINGS.defaultPoint].crutch.orderType
	}
})()

/*
 * Инициация радио
 */

let player = $make.qs('.player')

DOMAINS.radio = `ryuko.${DOMAINS.self}`

var getRadioSrc = () => `https://${DOMAINS.radio}/radio/${$currentPoint.port()}/listen`

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

		if ($check.mediaSession()) {
			navigator.mediaSession.playbackState = 'playing'
		}
	} else {
		this.pause()
		btnData.state = 'stop'

		if ($check.mediaSession()) {
			navigator.mediaSession.playbackState = 'paused'
		}
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
	radioCtrl_pp =   $make.qsf('[data-js-action="changePlayerState"]', player),
	radioCtrl_vol =  $make.qsf('[data-js-action="changeVolume"]', player),
	pointButtons =   $make.qsf('.player-change button', player, ['a'])

/*
 * Парсер API азуры
 * @TODO сделать файлик плейлиста со всеми станциями сразу
 */

var $init = {
	radio: ({ data = {}, fetchFailed = false, errorData = false }) => {
		let
			stateBox = $make.qs('.radio-state'),
			stateBoxBody = '', linksBoxBody = '', plBoxBody = '',
			liveBox = $make.qs('.radio-live'),
			liveBoxBody = '',
			orderBox = $make.qs('.radio-order'),
			songsBox = $make.qs('.songs-box'),
			songsTableBody = '',
			radioErrorBox = $make.qs('.radio-error')

		stateBox.textContent = ''
		liveBox.textContent = ''
		songsBox.textContent = ''
		radioErrorBox.textContent = ''
		orderBox.textContent = ''

		if (fetchFailed || !('now_playing' in data)) {
			radioErrorBox.textContent = getString('err_api_radio'); return
		}

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

		if ($check.mediaSession()) {
			navigator.mediaSession.metadata = new MediaMetadata({
				title: currentS,
				artist: currentA,
				album: `Asian Wave ${$currentPoint.name()}`
			})
		}

		/* Блоки со ссылками на текущий трек и на загрузку "плейлиста" */

		let
			srchVK = $create.link(`https://${DOMAINS.vk}/audio?q=${encodeURIComponent(currentFull)}`, '<i class="fa fa-vk"></i>', '', ['e']),
			srchGo = $create.link(`https://google.com/search?q=${encodeURIComponent(currentFull)}`, '<i class="fa fa-google"></i>', '', ['e'])

		//srchVK.setAttribute('title', `${getString('song_search_in')} VK`)
		//srchGo.setAttribute('title', `${getString('song_search_in')} Google`)

		linksBoxBody = $create.elem('div', '', 'search radio--pe')

		linksBoxBody.appendChild(srchVK)
		linksBoxBody.appendChild(srchGo)

		$create.balloon(linksBoxBody, getString('song_search'), 'left')

		/* Файл плейлиста */

		let plLink = $create.link('', '<i class="fa fa-music"></i>')

		plLink.setAttribute('href', `data:audio/x-mpegurl;charset=utf-8;base64,${btoa(getRadioSrc() + '\r\n')}`)
		plLink.setAttribute('download', `Asian Wave ${$currentPoint.name()}.m3u`)

		plBoxBody = $create.elem('div', plLink.outerHTML, 'dlm3u radio--pe')

		$create.balloon(plBoxBody, getString('playlist_dl'), 'left')

		/* Блок с выводом состояния прямого эфира (иначе скрыт) */

		if (data['live']['is_live'] != false) {
			let
				currRJ = $create.elem('div', `<p>${getString('rj_current')}:</p><p>${$make.safe(data['live']['streamer_name'])}</p>`, 'curr-rj radio--pe'),
				currLstn = $create.elem('div', `<div>${$make.safe(data['listeners']['unique'])}</div>`, 'curr-lstn radio--pe')

			$create.balloon(currLstn, getString('listeners_current'), 'left')

			liveBox.appendChild(currRJ)
			liveBox.appendChild(currLstn)
		}

		/* Блок с кнопкой заказа трека */

		orderBox.appendChild($create.link(`https://${DOMAINS.mr24}/?to=table&port=${$currentPoint.mr24port()}`, `<span>${getString('song_order')}</span>`, '', ['e']))

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
	radio: () => doFetch({
		fetchURL: `https://${DOMAINS.radio}/api/nowplaying/${$currentPoint.id()}`,
		handler: $init.radio
	}),

	schedule: () => doFetch({
		fetchURL: API.schedule,
		handler: $parser.schedule,
		handlerOptions: {
			disabledSections: ['latestCheck', 'emptySchedule', 'finished']
		}
	}),

	noti: () => doFetch({
		fetchURL: API.noti,
		handler: $parser.noti
	}),

	vkNews: () => doFetch({
		fetchURL: API.vkNews,
		handler: $parser.vkNews
	}),

	full() {
		Object.keys(this).forEach(key => (key != 'full') ? this[key]() : '')
	}
}

document.addEventListener('DOMContentLoaded', () => {
	/*
	 * Инициация радио
	 */

	void (() => {
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

		if ($check.mediaSession()) {
			navigator.mediaSession.setActionHandler('play', () => radio.toggle())
			navigator.mediaSession.setActionHandler('pause', () => radio.toggle())
		}
	})()

	/*
	 * Инициация всего-всего при загрузке страницы
	 * @TODO найти более умные тултипы, эти не перемещаются в другое место при ресайзе страницы
	 */

	let embedVKchecker = $check.get('embed-vk')

	void (() => {
		if ($ls.get('aw_l10n')) { moment.locale($ls.get('aw_l10n')) }
		if (embedVKchecker) { $make.qs('.container').classList.add('embed-vk') }

		/*
		 * Получение хэшей в пригодном для дальнейшей работы виде из get-параметра hash при встраивании радио в VK
		 */

		let getVKhash = () => {
			let hashs = []
			if (embedVKchecker && $check.get('hash')) {
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
		 * Если задан get-запрос "point" (или же такой хэш содержится в хэшах из VK) с ключом, который является действительным и входит в массив points, то радио при загрузке страницы автоматически переключается на нужный поток
		 * Пример: asianwave.ru/radio?point=ru или vk.com/appID#point=ru
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

		/*
		 * Слегка модифицированный скрипт для перключения вкладок из /anime
		 * Индусский код, но работает!
		 */

		pointButtons = Array.from(pointButtons)

		pointButtons.forEach((button, i) => {
			let pointData = button.value

			button.setAttribute('title', `${getString('radio_station')} \u00AB${points[pointData].name}\u00BB`)

			if (pointData == $currentPoint.key()) {
				button.classList.add('active')
			}

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

	void (() => {
		let notiHello = $make.qs('.noti[data-noti="hello"]')

		let notiItems = []

		let helloNotiString = 'hello_noti'

		let _storageNotiItemName = STRINGS.notiItem

		if ($ls.get(_storageNotiItemName)) {
			notiItems = JSON.parse($ls.get(_storageNotiItemName))
		}

		if (notiHello) {
			if (!notiItems.includes(helloNotiString)) {
				notiHello.dataset.notiIsEnabled = ''
			}

			let notiHideBtn = $make.qsf('[class*="__hide-btn"]', notiHello)

			notiHideBtn.onclick = () => {
				notiItems.push(helloNotiString)
				$ls.set(_storageNotiItemName, JSON.stringify(notiItems))

				delete notiHello.dataset.notiIsEnabled
			}
		}
	})()

	/*
	 * Таймеры
	 */

	void (() => {
		$loadInfo.full()
		let
			aw_timer_state = setInterval(() => { $loadInfo.radio() }, 5000),
			aw_timer_other = setInterval(() => {
				$loadInfo.schedule()
				$loadInfo.noti()
				if (!embedVKchecker) { $loadInfo.vkNews() }
			}, 30000)
	})()
})
