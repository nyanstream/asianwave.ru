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

		if (!isChrome) { chrExtBtn.parentElement.style.display = 'none' }
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
	'self':  'asianwave.ru',
	'api':   'aw-api.blyat.science',
	'nyan':  'nyan.stream',
	'vk':    'vk.com'
}

/*
 * Эндпоинты API
 */

var API = {
	'schedule': 'sched',
	'noti': 'noti',
	'vkNews': 'vk-news'
}

Object.keys(API).forEach(key => {
	API[key] = `https://${domain.api}/api/${API[key]}`
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

 let mainContainer = options.nodes.container

 let
	 errorBox =     options.nodes.errorBox,
	 errorBoxDiv =  $create.elem('div')

 let isError = false

 errorBox.textContent = ''

 if (!$ls.test()) {
	 mainContainer.classList.add('error')
	 errorBoxDiv.innerHTML = `<p>${getString('err_ls')}</p><br><p>${getString('err_ls_pls')}</p>`
	 isError = true
 }

 if (isError) {
	 errorBoxDiv.innerHTML += `<p>${getString('err_end')}</p><p><br>${getString('tnx')}! :3</p>`

	 errorBox.appendChild(errorBoxDiv)
 }
}
