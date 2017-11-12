'use strict'

/*
 * Детект хрома
 */

;(() => {
	let
		isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor),
		isOpera = /OPR\//.test(navigator.userAgent)

	try {
		let chrExtBtn = $make.qs('.right li a[href*="--chrome"]')

		if (!isChrome) { chrExtBtn.style.display = 'none' }
		if (isOpera) {
			let icon = chrExtBtn.firstChild

			icon.classList.remove('icon-chrome')
			icon.classList.add('icon-opera')
			chrExtBtn.setAttribute('href', '/app--opera')
			chrExtBtn.setAttribute('title', getString('ext_opera'))
		}
	} catch (e) {}
})()

/*
 * Используемые домены
 */

var domain = {
	'aw': 'asianwave.ru',
	'vk': 'vk.com'
}

/*
 * Эндпоинты API
 */

var API = {
	'scheduleAnime': 'anime-sched.json',
	'scheduleRadio': 'radio-sched.json',
	'noti': 'noti.json',
	'vkNews': 'vk-info.json',
	'vkStream': 'vk-stream.json'
}

Object.keys(API).forEach(key => {
	API[key] = `/api/${API[key]}`

	switch (location.hostname) {
		case '127.0.0.1':
		case 'localhost':
			API[key] = `https://${domain.aw}${API[key]}`
	}
})

/*
 * Функция для запросов к API
 */

var doFetch = options => {
	let fetchOptions = { cache: 'no-store' }

	let
		fetchURL =        options.URL,
		handler =         options.handler,
		handlerOptions =  options.handlerOptions ? options.handlerOptions : {},
		failData =        options.failData ? options.failData : 'fail'

	fetch(`${fetchURL}?t=${Date.now()}`, fetchOptions).then(response => {
		response.json().then(data => {
			handler(data, handlerOptions)
		})
	}).catch(e => { handler(failData) })
}
/*
 * Функция для проверки клиента на совместимость с сайтом
 */

var clientTests = options => {
	if (!options) { return }

	let
		mainCont = options.containers.main,
		errorBox = options.containers.error,
		err = !1

	if (!$ls.test()) {
		mainCont.classList.add('error')
		errorBox.innerHTML = `<p>${getString('err_ls')}</p><br><p>${getString('err_ls_pls')}`
		err = !0
	}

	if (err) {
		errorBox.innerHTML += `<p>${getString('err_end')}</p><p><br>${getString('tnx')}! :3</p>`
	}
}
