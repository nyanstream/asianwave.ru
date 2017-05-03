'use strict'

/*
 * Детект хрома
 */

;(function() {
 	var
	 	chrExtBtn = $make.qs('.right li a[href*="--chrome"]'),
	 	isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor),
	 	isOpera = /OPR\//.test(navigator.userAgent)

 	if (chrExtBtn) { // на случай, если опять забуду, что поменял класс элемента
 		if (!isChrome) chrExtBtn.style.display = 'none';
 		if (isOpera) {
 			var icon = chrExtBtn.querySelector('.icon')

 			icon.classList.remove('icon-chrome')
 			icon.classList.add('icon-opera')
 			chrExtBtn.setAttribute('href', '/app--opera')
 			chrExtBtn.setAttribute('title', 'Раширение для Opera')
 		}
 	}
})()

/*
 * Скрипт создания табов (модифицированный)
 * Найдено здесь: https://goo.gl/lsSkEe
 */

$make.tabs = function(selector) {
	var
		tabAnchors = this.qs(selector + ' li', ['a']),
		tabs = this.qs(selector + ' section', ['a'])

	for (var i = 0; i < tabAnchors.length; i++) {
		if (tabAnchors[i].classList.contains('active')) tabs[i].style.display = 'block'

		tabAnchors[i].addEventListener('click', function(e) {
			var clickedAnchor = e.target || e.srcElement
			clickedAnchor.classList.add('active')

			for (var i = 0; i < tabs.length; i++) {
				if (tabs[i].dataset.tab == clickedAnchor.dataset.tab) {
					tabs[i].style.display = 'block'
				} else {
					tabs[i].style.display = 'none'
					tabAnchors[i].classList.remove('active')
				}
			}
		})
	}
}

/*
 * Скрытие табов
 */

;(function () {
	var
		closeTabsCtr = $make.qs('.closeTabs'),
		mainCont = $make.qs('.anime'),
		ctc_text = 'боковую панель'

	function closeTabs() {
		if (!mainCont.classList.contains('notabs')) {
			mainCont.classList.add('notabs')
			this.textContent = '\u003C'
			this.setAttribute('title', 'Открыть ' + ctc_text)
		} else {
			mainCont.classList.remove('notabs')
			this.textContent = '\u00D7'
			this.setAttribute('title', 'Скрыть ' + ctc_text)
		}
	}

	closeTabsCtr.addEventListener('click', closeTabs);
})()

/*
 * Старый цвет шапки
 */

;(function() {
	var
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
		chatTab.addEventListener('dblclick', function() {
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
	shedule: function(data) {
		/*
		 * @TODO пофиксить проблему нового года
 		 * @TODO добавить время обновления
		 */

		var
			streamShed = $make.qs('.shedule'),
			tableBody = ''

		var
			dayToday = moment().dayOfYear(),
			unixNow = moment().unix()

		streamShed.textContent = ''

		if (data == 'fail') {
			streamShed.appendChild($make.elem('tr', '<td>API сайта недоступно</td>'))
			return
		}

		var nextAirs = data.filter(function(e) { return e[0] > unixNow })

		data.forEach(function(item) {
			if (item[0] == data[data.length - 1][0]) return; // пропуск последнего элемента с пасхалкой

			var
				newShedData = moment.unix(item[0]).format('D MMMM') + '<br>' + moment.unix(item[0]).format('HH:mm') + ' &ndash; ' + moment.unix(item[1]).format('HH:mm') + '</td>',
				nazvaniue = ''

			var
				dayOfS = moment.unix(item[0]).dayOfYear(),
				dayofE = moment.unix(item[1]).dayOfYear()

			if (item[3])
				nazvaniue = $make.link(item[3], item[2], ['e', 'html'])
				else nazvaniue = $make.xss(item[2])

			if ((dayOfS - dayToday) < -1) {
				return
			} else if (item[0] < unixNow && unixNow < item[1]) {
				tableBody += $make.elem('tr', '<td>' + newShedData + '<td><b>Сейчас (ещё ' + moment.unix(item[1]).toNow(true) + '):</b><br>' + nazvaniue + '</td>', 'air--current', ['html'])
			} else if (item[0] > unixNow && item[0] == nextAirs[0][0]) {
				tableBody += $make.elem('tr', '<td>' + newShedData + '<td><b>Далее через ' + moment.unix(item[0]).toNow(true) + ':</b><br>' + nazvaniue + '</td>', 'air--next', ['html'])
			} else if (item[0] < unixNow) {
				tableBody += $make.elem('tr', '<td>' + newShedData + '<td>' + nazvaniue + '</td></tr>', 'air--finished', ['html'])
			} else if (dayOfS > dayToday) {
				tableBody += $make.elem('tr', '<td>' + newShedData + '<td>' + nazvaniue + '</td></tr>', 'air--notToday', ['html'])
			} else {
				tableBody += $make.elem('tr', '<td>' + newShedData + '<td>' + nazvaniue + '</td>', '', ['html'])
			}
		})

		if (tableBody)
			streamShed.innerHTML = '<tbody><tr><td colspan="2"><em>Время местное.</em></td></tr>' + tableBody + '</tbody>'
			else return
	},
	vk_news: function(data) {
		var
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

		var newsHeader = $make.elem('div', $make.link('https://vk.com/' + data['com']['url'], 'Сообщество Asian Wave в VK', ['e', 'html']), 'vk-news-header')

		data['posts'].forEach(function(post) {
			var
				postImgLink = '', isCopy = '', postLinkS = '',
				postImg = post['pic']

			if (postImg) {
				var postImgElem = $make.elem('img')

				postImgElem.setAttribute('src', postImg['small'])
				postImgElem.setAttribute('alt', '')

				if (postImg['big'])
					postImgLink = $make.link(postImg['big'], postImgElem.outerHTML, ['e', 'html'])
					else postImgLink = $make.link(postImg['small'], postImgElem.outerHTML, ['e', 'html'])
			}

		 	if (post['type'] == 'copy') isCopy = ' is-repost';

			var
				postText = post['text'].replace(/\n/g, '<br>'),
				pLR = new RegExp(/\[(.*?)\]/),
				postLinkR = postText.match(new RegExp(pLR, 'g'))

				if (postLinkR) {
					postLinkR.forEach(function(link) {
						postLinkS = link.split('|')
						postText = postText.replace(pLR, $make.link('https://vk.com/' + postLinkS[0].replace(/\[/g, ''), postLinkS[1].replace(/]/g, ''), ['e', 'html']))
					})
				}

		 	vkNews.textContent = ''

		 	var
		 		vkPost = $make.elem('div', '', 'vk-post' + isCopy),
		 		vkPostMetaLink = $make.link('https://vk.com/wall-' + data['com']['id'] + '_' + post['id'], moment.unix(post['time']).format('D MMMM YYYY в HH:mm'), ['e', 'html']),
		 		vkPostMeta = $make.elem('div', vkPostMetaLink, 'vk-post-meta'),
		 		vkPostBody = $make.elem('div', postImgLink + '<p>' + postText + '</p>', 'vk-post-body')

		 	vkPost.appendChild(vkPostMeta)
		 	vkPost.appendChild(vkPostBody)

		 	newsBody.innerHTML += vkPost.outerHTML;
	  })

	  vkNews.appendChild(newsHeader)
	  vkNews.appendChild(newsBody)
	},
	vk_stream: function(data) {
		var
			player = $make.qs('.player'),
			playerElem = player.querySelector('.vk-player'),
			vkPlayer = $make.elem('iframe')

		if (player.dataset.error == 'api')
			delete player.dataset.error;

		vkPlayer.setAttribute('allowfullscreen', '')

		if ($check.get('b')) {
			var
				srcLnk = scriptData.backupPath + 'anime-backup',
				backupHash = scriptData.backupHash ? scriptData.backupHash : ''

			if ($check.get('b') == 'jw') srcLnk = srcLnk + '-jw'
			if (backupHash) backupHash = '?' + backupHash

			vkPlayer.setAttribute('src', srcLnk + '.htm' + backupHash)
			playerElem.appendChild(vkPlayer)
			return
		}

		playerElem.textContent = ''

		if (data == 'fail' || !data['url']) {
			player.dataset.error = 'api'
			return
		}

		vkPlayer.setAttribute('src', data['url'])
		playerElem.appendChild(vkPlayer)
	},
	noti: function(text, id) {
		if (text == null || id == null) return;

		var
			notiEl = $make.qs('.noti'),
			notiClose = $make.elem('div', '\u00D7', 'noti-close'),
			notiContent = $make.elem('div', text, 'noti-content'),
			notiItems = []

		notiEl.textContent = ''

		notiClose.setAttribute('title', 'Скрыть оповещение')

		if (notiContent.querySelector('a[href]')) {
			var notiLinks = notiContent.querySelectorAll('a[href]')

			notiLinks.forEach(function(link) {
				link.setAttribute('target', '_blank')
				if (link.getAttribute('href').indexOf('http') == 0)
					link.setAttribute('rel', 'nofollow noopener')
			})
		}

		notiEl.appendChild(notiClose)
		notiEl.appendChild(notiContent)

		if (!$ls.test()) {
			var notiUndisable = $make.elem('div', 'Внимание! У вас отключено хранение данных, поэтому скрытие оповещения запомиинаться не будет.', 'noti-undis')
			notiEl.appendChild(notiUndisable)
		} else {
			if ($ls.get('aw_noti')) notiItems = JSON.parse($ls.get('aw_noti'))
			if (notiItems.indexOf(id) == -1)
				notiEl.style.display = 'block'
				else notiEl.style.display = 'none'
		}

		notiClose.addEventListener('click', function() {
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
	'shedule': '/api/streams-shed.json',
	'noti': '/api/noti.json',
	'vk_news': '/api/vk-info.json',
	'vk_stream': '/api/vk-stream.json'
}

if ($check.debug()) {
	var API_keys = Object.keys(API)
	API_keys.forEach(function(key) { API[key] = 'https://asianwave.ru' + API[key] })
}

var fetchOptions = { cache: 'no-store' }

var $loadInfo = {
	shed: function() {
		fetch(API.shedule + '?t=' + Date.now(), fetchOptions).then(function(response) {
			response.json().then(function(data) {
				$parse.shedule(data)
			})
		}).catch(function(error) {
			$parse.shedule('fail')
		})
	},
	noti: function() {
		fetch(API.noti + '?t=' + Date.now(), fetchOptions).then(function(response) {
			response.json().then(function(data) {
				$parse.noti(data[0], data[1])
			})
		}).catch(function(error) {
			$parse.noti(null, null)
		})
	},
	vk_news: function() {
		fetch(API.vk_news + '?t=' + Date.now(), fetchOptions).then(function(response) {
			response.json().then(function(data) {
				$parse.vk_news(data)
			})
		}).catch(function(error) {
			$parse.vk_news('fail')
		})
	},
	vk_stream: function() {
		fetch(API.vk_stream + '?t=' + Date.now()).then(function(response) {
			response.json().then(function(data) {
				$parse.vk_stream(data)
			})
		}).catch(function(error) {
			$parse.vk_stream('fail')
		})
	},
	full: function() {
		var thisKeys = Object.keys(this)
		for (var i = 0; i < thisKeys.length - 1; i++) this[thisKeys[i]]()
	}
}

/*
 * Инициации
 */

document.addEventListener('DOMContentLoaded', function() {
	$loadInfo.full()

	var
		tabs = $make.qs('.tabs'),
		tabShed = tabs.querySelector('section[data-tab="shed"]'),
		tabNews = tabs.querySelector('section[data-tab="news"]')

	var aw_timer = setInterval(function() {
			$loadInfo.noti()
			if (tabShed.style.display == 'block') $loadInfo.shed()
			if (tabNews.style.display == 'block') $loadInfo.vk_news()
		}, 5000)

	var aw_logo = $make.qs('.top-panel .logo')
	aw_logo.addEventListener('dblclick', function() {
		$loadInfo.vk_stream()
	})

	$make.tabs('.tabs')
});
