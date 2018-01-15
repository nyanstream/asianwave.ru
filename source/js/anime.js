'use strict'

/*
 * Скрипт создания табов (модифицированный)
 * Найдено здесь: https://goo.gl/lsSkEe
 */

$create.tabs = selector => {
	let
		tabAnchors = $make.qs(selector + ' [data-tab-radio]', ['a']),
		tabs = $make.qs(selector + ' [data-tab]', ['a'])

	Array.from(tabAnchors).forEach((tabAnchor, i) => {
		if (tabAnchor.classList.contains('active')) {
			tabs[i].style.display = 'block'
		}

		tabAnchor.addEventListener('click', e => {
			let clickedAnchor = e.target
			clickedAnchor.classList.add('active')

			Array.from(tabs).forEach((tab, i) => {
				if (tab.dataset.tab == clickedAnchor.dataset.tabRadio) {
					tab.style.display = 'block'
				} else {
					tab.style.display = 'none'
					tabAnchors[i].classList.remove('active')
				}
			})
		})
	})
}

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
			playerURL += 'backup-'
			switch (backup) {
				case 'vga':
					playerURL += 'vga'; break
				case 'yukku':
					playerURL += 'yukku'; break
				case 'jw':
				default:
					playerURL += 'jw'; break
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

document.addEventListener('DOMContentLoaded', () => {
	/*
	 * Проверка клиента на совместимость с сайтом
	 */

	clientTests({ containers: {
			main: $make.qs('.anime'),
			error: $make.qs('.error-box')
	}})

	/*
	 * Инициации
	 */
	
	if ($ls.get('aw_l10n')) { moment.locale($ls.get('aw_l10n')) }

	$init.player()
	$loadInfo.full()

	$create.tabs('.sidebar')

	/*
	 * Скрытие табов
	 */

	;(() => {
		let
			containerData = $make.qs('.container').dataset,
			trigger = $make.qs('button[data-js-action="sidebarTrigger"]')

		trigger.addEventListener('click', e => {
			if (!containerData.sidebarHidden || containerData.sidebarHidden == '') {
				containerData.sidebarHidden = 'true'
			} else {
				delete containerData.sidebarHidden
			}
		})
	})()

	/*
	 * Старый цвет шапки
	 */

	;(() => {
		let
		 	containerData = $make.qs('.container').dataset,
			trigger = $make.qs('[data-tab-radio="chat"]'),
			storageItemName = 'aw_anime_grayTheme'

		if ($ls.get(storageItemName) == 'true') {
			containerData.theme = 'gray'
		}

		trigger.addEventListener('dblclick', () => {
			if (!containerData.theme || containerData.theme == '') {
				containerData.theme = 'gray'
				$ls.set(storageItemName, 'true')
			} else {
				delete containerData.theme
				$ls.rm(storageItemName)
			}
		})
	})()

	/*
	 * Таймер обновления информации
	 */

	;(() => {
		let
			sitebar = $make.qs('.sidebar'),
			tabSсhed = $make.qsf('section[data-tab="sched"]', sitebar),
			tabNews = $make.qsf('section[data-tab="news"]', sitebar)

		let aw_timer = setInterval(() => {
			$loadInfo.noti()
			if (!isMobile.any || tabSсhed.style.display == 'block') { $loadInfo.schedule() }
			if (!isMobile.any || tabNews.style.display == 'block') { $loadInfo.vkNews() }
		}, 10000)
	})()

	/*
	 * Перезагрузка плеера по клику на лого в шапке
	 */

 ;(() => {
		let aw_logo = $make.qs('.top-panel .logo')
		if (aw_logo) { aw_logo.addEventListener('dblclick', $init.player) }
	})()
})
