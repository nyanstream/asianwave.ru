'use script'

/*
 * Парсеры для различных API и прочего (но пока только API)
 * Файл зависим от core.js
 */

/*
 * Вспомогательная функция, копирует контент из одной ноды в другую
 * (принцип взят здесь: stackoverflow.com/a/955914)
 */

let cloneNode = (fromNode, toNode) => {
	if (!fromNode.isEqualNode(toNode)) {
		toNode.textContent = ''
		while (fromNode.firstChild) {
			toNode.appendChild(fromNode.firstChild)
		}
	}
}

let $parser = {
	schedule: ({ data = [], options = {}, fetchFailed = false, errorData = false }) => {
		if (fetchFailed) { console.warn(errorData); return }

		let disabledSections = ('disabledSections' in options)
			? options.disabledSections
			: []

		let streamSсhed = $make.qs('.schedule')

		if (!streamSсhed.hasChildNodes()) {
			let table = $create.elem('table')

			table.appendChild($create.elem('thead'))
			table.appendChild($create.elem('tbody'))

			streamSсhed.appendChild(table)
		}

		let tableHead = $make.qsf('table thead', streamSсhed)
			tableHead.textContent = ''

		let tableBody = $make.qsf('table tbody', streamSсhed)

		let tableBodyContent = $create.elem('tbody')

		/*
		 * Ранее здесь вместо дня со времени начала эпохи Unix вычислялся номер дня в году.
		 * Это приводило к тому, что, например, если скрипт видел, что текущая дата – 2017 год, а дата item – 2018, то этот item просто-напросто не показывался, так как отсекался по первому исключению в списке if ниже.
		 */

		let unixToDays = ts => Math.floor(ts / 60 / 60 / 24)

		let
			unixNow = moment().unix(),
			yearNow = moment().year(),
			dayNow = unixToDays(unixNow)

		let nextAirs = data.filter(e => e['s'] > unixNow)

		let createTableBodyRow = (firstData, secondData, _class = '') =>
			tableBodyContent.appendChild($create.elem(
				'tr',
				`<td>${firstData}</td><td>${secondData}</td>`,
				_class
			))

		data.forEach(item => {
			if ('secret' in item && item.secret == true) { return } // пропуск секретных элементов

			/* TODO: сделать нормальную поддержку item.secret (с временем окончания "секретности", например) */

			let
				itemStartTime =  item.s
				itemEndTime =    item.e

			let
				itemStartTimeYear = moment.unix(itemStartTime).year(),
				itemStartTimeDay = unixToDays(itemStartTime)

			let newSсhedData = `${yearNow != itemStartTimeYear ? itemStartTimeYear + '<br>' : ''}${moment.unix(itemStartTime).format('D MMMM')}<br>${moment.unix(itemStartTime).format('HH:mm')} &ndash; ${moment.unix(itemEndTime).format('HH:mm')}`

			let itemTitle = ('link' in item && item.link != '')
				? $create.link(item.link, item.title, '', ['e', 'html'])
				: $make.safe(item.title)

			let _metaInfoPlayer = getInfoFromMeta('backup-player')

			if (_metaInfoPlayer && _metaInfoPlayer != '') {
				let backupPlayerLink = `?${STRINGS.playerGETparam}=` + encodeURIComponent(_metaInfoPlayer)

				itemTitle += ('backup' in item && item.backup == true)
					? ` [<a href="${backupPlayerLink}">${getString('anime_backup')}</a>]`
					: ''
			}

			if (
				!disabledSections.includes('tooOld') &&
				(itemStartTimeDay - dayNow) < -1
			) { // если (день даты старта item минус текущий день) меньше -1
				return
			} else if (
				!disabledSections.includes('current') &&
				itemStartTime < unixNow &&
				unixNow < itemEndTime
			) { // если (таймштамп времени начала item меньше, чем текущий Unix-таймштамп) И если (текущий Unix-таймштамп меньше, чем время окончания item)
				createTableBodyRow(
					newSсhedData,
					`<b>${getString('now')(moment.unix(itemEndTime).toNow(true))}:</b><br>${itemTitle}`,
					'air--current'
				)
			} else if (
				!disabledSections.includes('next') &&
				itemStartTime > unixNow &&
				itemStartTime == nextAirs[0]['s']
			) { // если (таймштамп времени начала item больше, чем текущий Unix-таймштамп) И если (таймштамп времени начала item равен времени начала первого item из массива будущих эфиров)
				createTableBodyRow(
					newSсhedData,
					`<b>${getString('within')} ${moment.unix(itemStartTime).fromNow()}:</b><br>${itemTitle}`,
					'air--next'
				)
			} else if (
				!disabledSections.includes('finished') &&
				itemStartTime < unixNow
			) { // если (таймштамп времени начала item меньше, чем текущий Unix-таймштамп)
				createTableBodyRow(
					newSсhedData,
					itemTitle,
					'air--finished'
				)
			} else if (
				!disabledSections.includes('notToday') &&
				itemStartTimeDay > dayNow
			) { // если (день даты старта item больше, чем текущий день)
				createTableBodyRow(
					newSсhedData,
					itemTitle,
					'air--notToday'
				)
			} else if (
				!disabledSections.includes('normal')
			) {
				createTableBodyRow(
					newSсhedData,
					itemTitle
				)
			}
		})

		if (!disabledSections.includes('latestCheck')) {
			tableHead.appendChild($create.elem(
				'tr',
				`<td colspan="2">${getString('latest_check')}: ${moment().format('D MMMM, HH:mm:ss')}</td>`
			))
		}

		if (
			!tableBodyContent.hasChildNodes() &&
			!disabledSections.includes('emptySchedule')
		) {
			tableBodyContent.appendChild($create.elem(
				'tr',
				`<td colspan="2">${getString('empty_schedule')} ¯\\_(ツ)_/¯</td>`
			))
		}

		if (
			disabledSections.includes('latestCheck') &&
			disabledSections.includes('emptySchedule') &&
			!tableBodyContent.hasChildNodes()
		) {
			streamSсhed.dataset.tableIsEmpty = ''
		} else {
			if ('tableIsEmpty' in streamSсhed.dataset) {
				delete streamSсhed.dataset.tableIsEmpty
			}
		}

		cloneNode(tableBodyContent, tableBody)
	},

	vkNews: ({ data = {}, fetchFailed = false, errorData = false }) => {
		let
			vkNews = $make.qs('.vk-posts'),
			vkNewsContent = $create.elem('div')

		if (fetchFailed || !('posts' in data)) {
			vkNews.classList.add('api-err')
			vkNews.textContent = ''
			vkNews.appendChild($create.elem('p', getString('err_api')))

			if (errorData) { console.warn(errorData) }

			return
		} else {
			if (vkNews.classList.contains('api-err')) {
				vkNews.classList.remove('api-err')
			}
		}

		data['posts'].forEach(post => {
			if (post['pin'] == 1) { return }

			let
				postImgLink = '', isCopy = '',
				postImg = post['pic']

			if (postImg) {
				let	postImgElem = $create.elem('img')

				postImgElem.setAttribute('src', postImg['small'])
				postImgElem.setAttribute('alt', '')

				postImgLink = $create.link(postImg['big']
					? postImg['big']
					: postImg['small'])

				postImgLink.classList.add('link2img')
				postImgLink.appendChild(postImgElem)
			}

			let
				postText = post['text'].replace(/\n/g, '<br>'),
				pLR = /\[(.*?)\]/,
				postLinkR = postText.match(new RegExp(pLR, 'g'))

			if (postText == '') { return }
			if (postLinkR) {
				postLinkR.forEach(link => {
					let postLinkTmp = link.split('|')

					postText = postText.replace(
						pLR,
						$create.link(
							`https://${DOMAINS.vk}/${postLinkTmp[0].replace(/\[/g, '')}`,
							postLinkTmp[1].replace(/]/g, ''),
							'',
							['e', 'html']
						)
					)
				})
			}

			let vkPostMetaLink = $create.link(
				`https://${DOMAINS.vk}/wall-${data['com']['id']}_${post['id']}`,
				moment.unix(post['time']).format('LLL'),
				'',
				['e', 'html']
			)

			if (post['type'] == 'copy') {
				isCopy = ' is-repost'
				vkPostMetaLink += ` <span title="${getString('vk_repost')}">\u2935</span>`
			}

			let
				vkPost = $create.elem('div', '', 'vk-post' + isCopy),
				vkPostMeta = $create.elem('div', vkPostMetaLink, 'vk-post-meta'),
				vkPostBody = $create.elem('div', '', 'vk-post-body')

			if (postImgLink) { vkPostBody.appendChild(postImgLink) }
			vkPostBody.appendChild($create.elem('p', postText))

			vkPost.appendChild(vkPostMeta)
			vkPost.appendChild(vkPostBody)

			vkNewsContent.appendChild(vkPost)
		})

		cloneNode(vkNewsContent, vkNews)
	},

	noti: ({ data = {}, options = {}, fetchFailed = false, errorData = false }) => {
		let notiElem = $make.qs('.noti[data-noti="prime"]')

		let notiItems = []

		let _storageNotiItemName = STRINGS.notiItem

		if ($storage.get(_storageNotiItemName)) {
			notiItems = JSON.parse($storage.get(_storageNotiItemName))
		}

		// @TODO: сделать удаление из хранилища всех оповещений, которые были внесены более какого-то периода (например, более двух недель) назад

		let
			notiID =     ('time' in data) ?   data.time :   '',
			notiText =   ('text' in data) ?   data.text :   '',
			notiColor =  ('color' in data) ?  data.color :  ''

		if (
			fetchFailed ||
			!('enabled' in data) ||
			data.enabled == false ||
			notiItems.includes(notiID)
		) {
			delete notiElem.dataset.notiIsEnabled
			if (errorData) { console.warn(errorData) }
			return
		} else {
			notiElem.dataset.notiIsEnabled = ''
		}

		notiElem.style.backgroundColor = notiColor ? notiColor : null

		let
			notiContent = $make.qsf('[class*="__content"]', notiElem)
			notiHideBtn = $make.qsf('[class*="__hide-btn"]', notiElem)

		let notiContentBody = $create.elem('div')

		notiContentBody.innerHTML = notiText

		if ($make.qsf('script, style, *[onload]', notiContentBody)) {
			let notiProhibitedElems = $make.qsf('script, style, *[onload]', notiContentBody, ['a'])
			notiProhibitedElems.forEach(_script => _script.remove())
		}

		if ($make.qsf('a[href]', notiContentBody)) {
			let notiLinks = $make.qsf('a[href]', notiContentBody, ['a'])

			notiLinks.forEach(link => {
				link.setAttribute('target', '_blank')
				if (link.getAttribute('href').startsWith('http')) {
					link.setAttribute('rel', 'nofollow noopener')
				}
			})
		}

		cloneNode(notiContentBody, notiContent)

		notiHideBtn.onclick = () => {
			notiItems.push(notiID)
			$storage.set(_storageNotiItemName, JSON.stringify(notiItems))

			notiElem.style.display = 'none'
			delete notiElem.dataset.notiIsEnabled
		}
	}
}
