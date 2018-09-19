'use strict'

const IS_DEBUG_MODE =
	(
		location.hostname == '127.0.0.1' ||
		location.hostname == 'localhost'
	)


/*
 * Детект хрома
 */

const STRINGS = {
	// Название айтема в LocalStorage для локализации (langs.js)
	l10n: 'aw_l10n',

	// Название айтема в LocalStorage для нотификаций (parsers.js)
	notiItem: 'aw_noti',

	defaultPoint: 'ta'
}

/*
 * Используемые домены
 */

const DOMAINS = {
	self:  'asianwave.ru',
	api:   'aw-api.blyat.science',
	vk:    'vk.com',
	mr24:  'myradio24.com'
}

/*
 * Эндпоинты API
 */

const API = {
	schedule: 'sched',
	noti: 'noti',
	vkNews: 'vk-news'
}

Object.keys(API).forEach(key => {
	API[key] = `https://${DOMAINS.api}/api/${API[key]}`
})

/*
 * Функция для запросов к API
 */

let doFetch = ({ fetchURL, handler, handlerOptions = {}, failData = 'fail' }) =>
	fetch(`${fetchURL}?t=${Date.now()}`, { cache: 'no-store' })
		.then(response => response.json())
		.then(data => handler({
			data: data,
			options: handlerOptions
		}))
		.catch(err => handler({
			fetchFailed: true,
			errorData: err,
			options: handlerOptions
		}))

/*
 * Функция для проверки клиента на совместимость с сайтом
 */

let clientTests = ({ nodes = { container, errorBox } }) => {
	if (!nodes.container.nodeName || !nodes.errorBox.nodeName) { return }

	let
		mainContainer =      nodes.container,
		mainContainerData =  mainContainer.dataset

	let
		errorBox =     nodes.errorBox,
		errorBoxDiv =  $create.elem('div')

	let isError = false

	if ('error' in mainContainerData && mainContainerData.error == 'no-js') {
		delete mainContainer.dataset.error

		let noscriptElems = $make.qs('noscript', ['a'])
		noscriptElems.forEach(elem => elem.remove())
	}

	errorBox.textContent = ''

	if (!$ls.test()) {
		mainContainer.dataset.error = 'no-ls'
		errorBoxDiv.innerHTML = `<p>${getString('err_ls')}</p><br><p>${getString('err_ls_pls')}</p>`

		isError = true
	}

	if (isError) {
		errorBoxDiv.innerHTML += `<p>${getString('err_end')}</p><p><br>${getString('tnx')}! :3</p>`

		errorBox.appendChild(errorBoxDiv)
	}
}
