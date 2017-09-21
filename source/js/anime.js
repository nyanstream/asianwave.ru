'use strict'

/*
 * @TODO visibilityjs
 */

/*
 * Домены
 */

var domain = {
	'aw': 'asianwave.ru',
	'vk': 'vk.com'
}

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
 * Скрипт создания табов (модифицированный)
 * Найдено здесь: https://goo.gl/lsSkEe
 */

$create.tabs = function(selector) {
	let
		tabAnchors = $make.qs(selector + ' li', ['a']),
		tabs = $make.qs(selector + ' section', ['a'])

	Array.from(tabAnchors).forEach((tabAnchor, i) => {
		if (tabAnchor.classList.contains('active')) tabs[i].style.display = 'block'

		tabAnchor.addEventListener('click', (e) => {
			let clickedAnchor = e.target
			clickedAnchor.classList.add('active')

			for (let i = 0, tabsLength = tabs.length; i < tabsLength; i++) {
				if (tabs[i].dataset.tab == clickedAnchor.dataset.tab) {
					tabs[i].style.display = 'block'
				} else {
					tabs[i].style.display = 'none'
					tabAnchors[i].classList.remove('active')
				}
			}
		})
	})
}

/*
 * Скрытие табов
 */

;(() => {
	let
		closeTabsCtr = $make.qs('.closeTabs'),
		mainCont = $make.qs('.anime').classList

	closeTabsCtr.addEventListener('click', (e) => {
		let _this = e.target

		if (!mainCont.contains('no-tabs')) {
			mainCont.add('no-tabs')
			_this.textContent = '\u003C'
			_this.setAttribute('title', getString('tabs_show'))
		} else {
			mainCont.remove('no-tabs')
			_this.textContent = '\u00D7'
			_this.setAttribute('title', getString('tabs_hide'))
		}
	})
})()

/*
 * Старый цвет шапки
 */

;(() => {
	let
		root = document.documentElement.dataset,
		chatTab = $make.qs('li[data-tab="chat"]')

	if ($ls.test() && $ls.get('aw_iamoldfag'))
		root.theme = 'old-gray'

	chatTab.addEventListener('dblclick', () => {
		if (!root.theme) {
			root.theme = 'old-gray'
			if ($ls.test()) { $ls.set('aw_iamoldfag', '1') }
		} else {
			delete root.theme
			if ($ls.test()) { $ls.rm('aw_iamoldfag') }
		}
	})
})()

/*
 * Инициация плеера
 */

var scriptData = document.currentScript.dataset

var $init = {
	player: () => {
		let
			player = $make.qs('.player'),
			playerEmbed = player.querySelector('.embed'),
			playerFrame = $create.elem('iframe'),
			playerPath = scriptData.playerPath,
			playerHash = scriptData.playerHash ? '?' + encodeURIComponent(scriptData.playerHash) : '',
			playerURL = 'anime-'

		playerEmbed.textContent = ''

		let backup = $check.get('b') || scriptData.backupBydefault
		if (backup == '') backup = true

		if (backup)
			playerURL = `${playerURL}backup${((backup == 'jw') ? '-jw' : '')}`
			else playerURL = playerURL + 'main'

		playerFrame.setAttribute('allowfullscreen', '')
		playerFrame.setAttribute('src', `${playerPath}${playerURL}.html${playerHash}`)
		playerEmbed.appendChild(playerFrame)
	}
}

/*
 * Расписание
 * @TODO пофиксить проблему нового года
 */

var $parse = {
	schedule: (data) => {
		/*
		 * @TODO пофиксить проблему нового года
		 */

		let
			streamsсhed = $make.qs('.schedule'),
			tableBody = '', td = ''

		let
			dayToday = moment().dayOfYear(),
			unixNow = moment().unix()

		streamsсhed.textContent = ''

		if (data == 'fail') { streamsсhed.appendChild($create.elem('tr', `<td>${getString('err_api')}</td>`)); return }

		let nextAirs = data.filter((e) => e['s'] > unixNow)

		data.forEach((item) => {
			if (item['secret']) return; // пропуск элемента с пасхалкой

			let
				newsсhedData = `${moment.unix(item['s']).format('D MMMM')}<br>${moment.unix(item['s']).format('HH:mm')} &ndash; ${moment.unix(item['e']).format('HH:mm')}</td>`,
				nazvaniue = ''

			let
				dayOfS = moment.unix(item['s']).dayOfYear(),
				dayofE = moment.unix(item['e']).dayOfYear()

			if (item['link'])
				nazvaniue = $create.link(item['link'], item['title'], ['e', 'html'])
				else nazvaniue = $make.safe(item['title'])

			if ((dayOfS - dayToday) < -1) {
				return
			} else if (item['s'] < unixNow && unixNow < item['e']) {
				tableBody += $create.elem('tr', `<td>${newsсhedData}<td><b>Сейчас (ещё ${ moment.unix(item['e']).toNow(true)}):</b><br>${nazvaniue}</td>`, 'air--current', ['html'])
			} else if (item['s'] > unixNow && item['s'] == nextAirs[0]['s']) {
				tableBody += $create.elem('tr', `<td>${newsсhedData}<td><b>Далее через ${moment.unix(item['s']).toNow(true)}:</b><br>${nazvaniue}</td>`, 'air--next', ['html'])
			} else if (item['s'] < unixNow) {
				tableBody += $create.elem('tr', `<td>${newsсhedData}<td>${nazvaniue}</td></tr>`, 'air--finished', ['html'])
			} else if (dayOfS > dayToday) {
				tableBody += $create.elem('tr', `<td>${newsсhedData}<td>${nazvaniue}</td></tr>`, 'air--notToday', ['html'])
			} else {
				tableBody += $create.elem('tr', `<td>${newsсhedData}</td><td>${nazvaniue}</td>`, '', ['html'])
			}
		})

		if (tableBody == '') tableBody += $create.elem('tr', '<td colspan="2">Расписание пустое ¯\\_(ツ)_/¯</td>', '', ['html'])

		streamsсhed.appendChild($create.elem('tbody', `<tr><td colspan="2">${getString('latest_check')}: ${moment().format('D MMMM, HH:mm:ss')}</td></tr>${tableBody}`))
	},
	vk_news: (data) => {
		let
		 	vkNews = $make.qs('.vk-news'),
		 	newsBody = $create.elem('div', '', 'news-posts')

	  vkNews.textContent = ''

	  if (data == 'fail' || !data.posts) {
		 	vkNews.classList.add('api-err')
		 	vkNews.appendChild($create.elem('p', getString('err_api')))
		 	return
	  } else {
		 	if (vkNews.classList.contains('api-err'))
				vkNews.classList.remove('api-err')
	  }

		let newsHeader = $create.elem('div', $create.link(`https://${domain.vk}/${data['com']['url']}`, getString('vk_com'), ['e', 'html']), 'vk-news-header')

		data['posts'].forEach((post) => {
			if (post['pin'] == 1) return;

			let
				postImgLink = '', isCopy = '', postLinkS = '',
				postImg = post['pic']

			if (postImg) {
				let postImgElem = $create.elem('img')

				postImgElem.setAttribute('src', postImg['small'])
				postImgElem.setAttribute('alt', '')

				if (postImg['big'])
					postImgLink = $create.link(postImg['big'], postImgElem.outerHTML, ['e', 'html'])
					else postImgLink = $create.link(postImg['small'], postImgElem.outerHTML, ['e', 'html'])
			}

			let
				postText = post['text'].replace(/\n/g, '<br>'),
				pLR = /\[(.*?)\]/,
				postLinkR = postText.match(new RegExp(pLR, 'g'))

			if (postLinkR) {
				postLinkR.forEach((link) => {
					postLinkS = link.split('|')
					postText = postText.replace(pLR, $create.link(`https://${domain.vk}/${postLinkS[0].replace(/\[/g, '')}`, postLinkS[1].replace(/]/g, ''), ['e', 'html']))
				})
			}

			let
				vkPostMetaLink = $create.link(`https://${domain.vk}/wall-${data['com']['id']}_${post['id']}`, moment.unix(post['time']).format('D MMMM YYYY в HH:mm'), ['e', 'html'])

			if (post['type'] == 'copy') {
				isCopy = ' is-repost'
				vkPostMetaLink += ` <span title="${getString('vk_repost')}">\u2935</a>`
			}

			let
				vkPost = $create.elem('div', '', 'vk-post' + isCopy),
				vkPostMeta = $create.elem('div', vkPostMetaLink, 'vk-post-meta'),
				vkPostBody = $create.elem('div', `${postImgLink}<p>${postText}</p>`, 'vk-post-body')

		 	vkPost.appendChild(vkPostMeta)
		 	vkPost.appendChild(vkPostBody)

		 	newsBody.innerHTML += vkPost.outerHTML;
	  })

	  vkNews.appendChild(newsHeader)
	  vkNews.appendChild(newsBody)
	},
	// vk_stream: (data) => {
	// 	let
	// 		player = $make.qs('.player'),
	// 		playerElem = player.querySelector('.vk-player'),
	// 		playerFrame = $create.elem('iframe'),
	// 		embedLink = data['url']
	//
	// 	let
	// 		backupURL = $check.get('b'),
	// 		backupDef = scriptData.backupBydefault
	//
	// 	if (!backupURL) backupURL = false
	// 	if (backupDef == '') backupDef = true
	//
	// 	if (player.dataset.error == 'api')
	// 		delete player.dataset.error;
	//
	// 	playerFrame.setAttribute('allowfullscreen', '')
	//
	// 	playerElem.textContent = ''
	//
	// 	if (backupURL || backupDef) {
	// 		let
	// 			srcLnk = scriptData.backupPath + 'anime-backup',
	// 			backupHash = scriptData.backupHash ? scriptData.backupHash : ''
	//
	// 		if (backupURL == 'jw' || backupDef == 'jw') srcLnk = srcLnk + '-jw'
	// 		if (backupHash) backupHash = '?' + backupHash
	//
	// 		embedLink = `${srcLnk}.htm${backupHash}`
	// 	}
	//
	// 	if (data == 'fail' || !data['url']) { player.dataset.error = 'api'; return }
	//
	// 	playerFrame.setAttribute('src', embedLink)
	// 	playerElem.appendChild(playerFrame)
	// },
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
			notiClose = $create.elem('div', '\u00D7', 'noti-close'),
			notiContent = $create.elem('div', text, 'noti-content'),
			notiItems = []

		notiEl.textContent = ''

		notiClose.setAttribute('title', getString('noti_close'))

		if (notiContent.querySelector('a[href]')) {
			let notiLinks = notiContent.querySelectorAll('a[href]')

			Array.from(notiLinks).forEach((link) => {
				link.setAttribute('target', '_blank')
				if (link.getAttribute('href').indexOf('http') == 0) link.setAttribute('rel', 'nofollow noopener')
			})
		}

		notiEl.appendChild(notiClose)
		notiEl.appendChild(notiContent)

		if (!$ls.test()) {
			let notiUndisable = $create.elem('div', getString('noti_ls_err'), 'noti-undis')
			notiEl.appendChild(notiUndisable)
		} else {
			if ($ls.get('aw_noti')) notiItems = JSON.parse($ls.get('aw_noti'))
			if (!notiItems.includes(id))
				notiEl.style.display = 'block'
				else notiEl.style.display = 'none'
		}

		notiClose.addEventListener('click', () => {
			notiItems[notiItems.length] = id
			if ($ls.test()) { $ls.set('aw_noti', JSON.stringify(notiItems)) }
			notiEl.style.display = 'none'
		})
	}
}

/*
 * Запросы к API
 */

var API = {
	'schedule': '/api/anime-sched.json',
	'noti': '/api/noti.json',
	'vk_news': '/api/vk-info.json',
	'vk_stream': '/api/vk-stream.json'
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
	sсhed: () => {
		doFetch(API.schedule, $parse.schedule)
	},
	noti: () => {
		doFetch(API.noti, $parse.noti)
	},
	vk_news: () => {
		doFetch(API.vk_news, $parse.vk_news)
	},
	// vk_stream: () => {
	// 	doFetch(API.vk_stream, $parse.vk_stream)
	// },
	full: function() {
		for (let key in this) { if (this.hasOwnProperty(key) && key != 'full') this[key]() }
	}
}

/*
 * Инициации
 */

document.addEventListener('DOMContentLoaded', () => {
	$init.player()
	$loadInfo.full()

	let
		tabs = $make.qs('.tabs'),
		tabSсhed = tabs.querySelector('section[data-tab="sched"]'),
		tabNews = tabs.querySelector('section[data-tab="news"]')

	//$parse.noti('Нам исполняется 1 год. В честь этого мы проводим три дня марафонов на <a href="/anime">/anime</a>. Не пропусти!', 10001)

	let aw_timer = setInterval(() => {
		$loadInfo.noti()
		if (!isMobile.any || tabSсhed.style.display == 'block') $loadInfo.sсhed()
		if (!isMobile.any || tabNews.style.display == 'block') $loadInfo.vk_news()
	}, 10000)

	let aw_logo = $make.qs('.top-panel .logo')
	aw_logo.addEventListener('dblclick', $init.player)

	$create.tabs('.tabs')
})
