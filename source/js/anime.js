'use strict'

/*
 * Проверка клиента на совместимость с сайтом
 */

;(() => {
	clientTests({
		containers: {
			main: $make.qs('.anime'),
			error: $make.qs('.error-box')
		}
	})
})()

/*
 * Скрипт создания табов (модифицированный)
 * Найдено здесь: https://goo.gl/lsSkEe
 */

$create.tabs = selector => {
	let
		tabAnchors = $make.qs(selector + ' [data-tab-radio]', ['a']),
		tabs = $make.qs(selector + ' [data-tab]', ['a'])

	Array.from(tabAnchors).forEach((tabAnchor, i) => {
		if (tabAnchor.classList.contains('active')) { tabs[i].style.display = 'block' }

		tabAnchor.addEventListener('click', e => {
			let clickedAnchor = e.target
			clickedAnchor.classList.add('active')

			for (let i = 0, tabsLength = tabs.length; i < tabsLength; i++) {
				if (tabs[i].dataset.tab == clickedAnchor.dataset.tabRadio) {
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
 * @TODO назначать класс на контейнер, символ менять через CSS
 */

;(() => {
	let
		closeTabsCtr = $make.qs('.closeTabs'),
		mainCont = $make.qs('.anime .content').classList

	closeTabsCtr.addEventListener('click', e => {
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
		rootData = document.documentElement.dataset,
		chatTab = $make.qs('[data-tab-radio="chat"]')

	if ($ls.get('aw_iamoldfag')) { rootData.theme = 'old-gray' }

	chatTab.addEventListener('dblclick', () => {
		if (!rootData.theme) {
			rootData.theme = 'old-gray'
			$ls.set('aw_iamoldfag', '1')
		} else {
			delete rootData.theme
			$ls.rm('aw_iamoldfag')
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
			playerEmbed = $make.qsf('.embed', player),
			playerFrame = $create.elem('iframe'),
			playerPath = scriptData.playerPath,
			playerHash = scriptData.playerHash ? '?' + encodeURIComponent(scriptData.playerHash) : '',
			playerURL = 'anime-'

		playerEmbed.textContent = ''

		let backup = $check.get('b') || scriptData.backupBydefault
		if (backup == '') { backup = true }

		if (backup) {
			playerURL += 'backup'
			switch (backup) {
				case 'jw':
					playerURL += '-jw'; break
				case 'yukku':
					playerURL += '-yukku'
			}
		} else { playerURL = playerURL + 'main' }

		playerFrame.setAttribute('title', getString('player'))
		playerFrame.setAttribute('allowfullscreen', '')
		playerFrame.setAttribute('src', `${playerPath}${playerURL}.htm${playerHash}`)
		playerEmbed.appendChild(playerFrame)
	}
}

/*
 * Запросы к API
 */

var $loadInfo = {
	schedule: () => doFetch({ URL: API.scheduleAnime, handler: $parser.schedule, handlerOptions: { mode: 'anime' } }),
	noti: () => doFetch({ URL: API.noti, handler: $parser.noti, handlerOptions: { mode: 'anime' } }),
	vkNews: () => doFetch({ URL: API.vkNews, handler: $parser.vkNews }),
	full() {
		Object.keys(this).forEach(key => (key != 'full') ? this[key]() : '')
	}
}

/*
 * Инициации
 */

document.addEventListener('DOMContentLoaded', () => {
	if ($ls.get('aw_l10n')) { moment.locale($ls.get('aw_l10n')) }

	$init.player()
	$loadInfo.full()

	let
		tabs = $make.qs('.tabs'),
		tabSсhed = $make.qsf('section[data-tab="sched"]', tabs),
		tabNews = $make.qsf('section[data-tab="news"]', tabs)

	let aw_timer = setInterval(() => {
		$loadInfo.noti()
		if (!isMobile.any || tabSсhed.style.display == 'block') { $loadInfo.schedule() }
		if (!isMobile.any || tabNews.style.display == 'block') { $loadInfo.vkNews() }
	}, 10000)

	let aw_logo = $make.qs('.top-panel .logo')
	aw_logo.addEventListener('dblclick', $init.player)

	$create.tabs('.tabs')
})
