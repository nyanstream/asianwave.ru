'use strict'

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

$make.tabs = function(selector) {
	let
		tabAnchors = this.qs(selector + ' li', ['a']),
		tabs = this.qs(selector + ' section', ['a'])

	tabAnchors.forEach((tabAnchor, i) => {
		if (tabAnchor.classList.contains('active')) tabs[i].style.display = 'block'

		tabAnchor.addEventListener('click', (e) => {
			let clickedAnchor = e.target || e.srcElement
			clickedAnchor.classList.add('active')

			for (let i = 0; i < tabs.length; i++) {
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
		mainCont = $make.qs('.anime'),
		ctc_text = 'боковую панель'

	closeTabsCtr.addEventListener('click', function() {
		if (!mainCont.classList.contains('notabs')) {
			mainCont.classList.add('notabs')
			this.textContent = '\u003C'
			this.setAttribute('title', 'Открыть ' + ctc_text)
		} else {
			mainCont.classList.remove('notabs')
			this.textContent = '\u00D7'
			this.setAttribute('title', 'Скрыть ' + ctc_text)
		}
	})
})()

/*
 * Старый цвет шапки
 */

;(() => {
	let
		container = $make.qs('.container'),
		chatTab = $make.qs('li[data-tab="chat"]')/*,
		metacolor = $make.qs('meta[name="theme-color"]')*/

	function oldHeadColor() {
		//metacolor.setAttribute('content', '#464646');
		container.dataset.theme = 'old-gray'
		$ls.set('aw_iamoldfag', true)
	}

	if ($ls.get('aw_iamoldfag')) {
		oldHeadColor()
		chatTab.addEventListener('dblclick', () => {
			$ls.rm('aw_iamoldfag')
			delete container.dataset.theme
		})
	} else {
		chatTab.addEventListener('dblclick', oldHeadColor);
	}
})()

/*
 * Расписание
 * @TODO пофиксить проблему нового года
 */

var scriptData = document.currentScript.dataset

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

		if (data == 'fail') { streamsсhed.appendChild($make.elem('tr', `<td>${getString('err_api')}</td>`)); return }

		let nextAirs = data.filter((e) => e[0] > unixNow)

		data.forEach((item) => {
			if (item[0] == data[data.length - 1][0]) return; // пропуск последнего элемента с пасхалкой

			let
				newsсhedData = `${moment.unix(item[0]).format('D MMMM')}<br>${moment.unix(item[0]).format('HH:mm')} &ndash; ${moment.unix(item[1]).format('HH:mm')}</td>`,
				nazvaniue = ''

			let
				dayOfS = moment.unix(item[0]).dayOfYear(),
				dayofE = moment.unix(item[1]).dayOfYear()

			if (item[3])
				nazvaniue = $make.link(item[3], item[2], ['e', 'html'])
				else nazvaniue = $make.xss(item[2])

			if ((dayOfS - dayToday) < -1) {
				return
			} else if (item[0] < unixNow && unixNow < item[1]) {
				tableBody += $make.elem('tr', `<td>${newsсhedData}<td><b>Сейчас (ещё ${ moment.unix(item[1]).toNow(true)}):</b><br>${nazvaniue}</td>`, 'air--current', ['html'])
			} else if (item[0] > unixNow && item[0] == nextAirs[0][0]) {
				tableBody += $make.elem('tr', `<td>${newsсhedData}<td><b>Далее через ${moment.unix(item[0]).toNow(true)}:</b><br>${nazvaniue}</td>`, 'air--next', ['html'])
			} else if (item[0] < unixNow) {
				tableBody += $make.elem('tr', `<td>${newsсhedData}<td>${nazvaniue}</td></tr>`, 'air--finished', ['html'])
			} else if (dayOfS > dayToday) {
				tableBody += $make.elem('tr', `<td>${newsсhedData}<td>${nazvaniue}</td></tr>`, 'air--notToday', ['html'])
			} else {
				tableBody += $make.elem('tr', `<td>${newsсhedData}<td>${nazvaniue}</td>`, '', ['html'])
			}
		})

		if (tableBody)
			streamsсhed.appendChild($make.elem('tbody', `<tr><td colspan="2">${getString('latest_update')}: ${moment().format('D MMMM, HH:mm:ss')}<br></td></tr>${tableBody}`))
			else return
	},
	vk_news: (data) => {
		let
		 	vkNews = $make.qs('.vk-news'),
		 	newsBody = $make.elem('div', '', 'news-posts')

	  vkNews.textContent = ''

	  if (data == 'fail') {
		 	vkNews.classList.add('api-err')
		 	vkNews.appendChild($make.elem('p', 'API сайта недоступно.'))
		 	return
	  } else {
		 	if (vkNews.classList.contains('api-err'))
				vkNews.classList.remove('api-err')
	  }

		let newsHeader = $make.elem('div', $make.link(`https://${domain.vk}/${data['com']['url']}`, getString('vk_com'), ['e', 'html']), 'vk-news-header')

		data['posts'].forEach((post) => {
			if (post['pin'] == 1) return;

			let
				postImgLink = '', isCopy = '', postLinkS = '',
				postImg = post['pic']

			if (postImg) {
				let postImgElem = $make.elem('img')

				postImgElem.setAttribute('src', postImg['small'])
				postImgElem.setAttribute('alt', '')

				if (postImg['big'])
					postImgLink = $make.link(postImg['big'], postImgElem.outerHTML, ['e', 'html'])
					else postImgLink = $make.link(postImg['small'], postImgElem.outerHTML, ['e', 'html'])
			}

			let
				postText = post['text'].replace(/\n/g, '<br>'),
				pLR = /\[(.*?)\]/,
				postLinkR = postText.match(new RegExp(pLR, 'g'))

			if (postLinkR) {
				postLinkR.forEach((link) => {
					postLinkS = link.split('|')
					postText = postText.replace(pLR, $make.link(`https://${domain.vk}/${postLinkS[0].replace(/\[/g, '')}`, postLinkS[1].replace(/]/g, ''), ['e', 'html']))
				})
			}

			let
				vkPostMetaLink = $make.link(`https://${domain.vk}/wall-${data['com']['id']}_${post['id']}`, moment.unix(post['time']).format('D MMMM YYYY в HH:mm'), ['e', 'html'])

			if (post['type'] == 'copy') {
				isCopy = ' is-repost'
				vkPostMetaLink += ` <span title="${getString('vk_repost')}">\u2935</a>`
			}

			let
				vkPost = $make.elem('div', '', 'vk-post' + isCopy),
				vkPostMeta = $make.elem('div', vkPostMetaLink, 'vk-post-meta'),
				vkPostBody = $make.elem('div', `${postImgLink}<p>${postText}</p>`, 'vk-post-body')

		 	vkPost.appendChild(vkPostMeta)
		 	vkPost.appendChild(vkPostBody)

		 	newsBody.innerHTML += vkPost.outerHTML;
	  })

	  vkNews.appendChild(newsHeader)
	  vkNews.appendChild(newsBody)
	},
	vk_stream: (data) => {
		let
			player = $make.qs('.player'),
			playerElem = player.querySelector('.vk-player'),
			vkPlayer = $make.elem('iframe')

		let
			backupURL = $check.get('b'),
			backupDef = scriptData.backupBydefault

		if (backupDef == '') backupDef = !0

		if (player.dataset.error == 'api')
			delete player.dataset.error;

		vkPlayer.setAttribute('allowfullscreen', '')

		playerElem.textContent = ''

		if (backupURL || backupDef) {
			let
				srcLnk = scriptData.backupPath + 'anime-backup',
				backupHash = scriptData.backupHash ? scriptData.backupHash : ''

			if (backupURL == 'jw' || backupDef == 'jw') srcLnk = srcLnk + '-jw'
			if (backupHash) backupHash = '?' + backupHash

			vkPlayer.setAttribute('src', srcLnk + '.htm' + backupHash)
			playerElem.appendChild(vkPlayer)
			return
		}

		if (data == 'fail' || !data['url']) { player.dataset.error = 'api'; return }

		vkPlayer.setAttribute('src', data['url'])
		playerElem.appendChild(vkPlayer)
	},
	noti: (data) => {
		let notiEl = $make.qs('.noti')

		if (data == 'fail' || data[0] == null) { notiEl.style.display = 'none'; return }

		let text = data[0], id = data[1]

		let
			notiClose = $make.elem('div', '\u00D7', 'noti-close'),
			notiContent = $make.elem('div', text, 'noti-content'),
			notiItems = []

		notiEl.textContent = ''

		notiClose.setAttribute('title', getString('noti_close'))

		if (notiContent.querySelector('a[href]')) {
			let notiLinks = notiContent.querySelectorAll('a[href]')

			notiLinks.forEach((link) => {
				link.setAttribute('target', '_blank')
				if (link.getAttribute('href').indexOf('http') == 0) link.setAttribute('rel', 'nofollow noopener')
			})
		}

		notiEl.appendChild(notiClose)
		notiEl.appendChild(notiContent)

		if (!$ls.test()) {
			let notiUndisable = $make.elem('div', getString('noti_ls_err'), 'noti-undis')
			notiEl.appendChild(notiUndisable)
		} else {
			if ($ls.get('aw_noti')) notiItems = JSON.parse($ls.get('aw_noti'))
			if (notiItems.indexOf(id) == -1)
				notiEl.style.display = 'block'
				else notiEl.style.display = 'none'
		}

		notiClose.addEventListener('click', () => {
			notiItems[notiItems.length] = id
			$ls.set('aw_noti', JSON.stringify(notiItems))
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
	sсhed: () => {
		doFetch(API.schedule, $parse.schedule)
	},
	noti: () => {
		doFetch(API.noti, $parse.noti)
	},
	vk_news: () => {
		doFetch(API.vk_news, $parse.vk_news)
	},
	vk_stream: () => {
		doFetch(API.vk_stream, $parse.vk_stream)
	},
	full: function() {
		var thisKeys = Object.keys(this)
		for (let i = 0; i < thisKeys.length - 1; i++) this[thisKeys[i]]()
	}
}

/*
 * Инициации
 */

document.addEventListener('DOMContentLoaded', () => {
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
	aw_logo.addEventListener('dblclick', () => { $loadInfo.vk_stream() })

	$make.tabs('.tabs')
});
