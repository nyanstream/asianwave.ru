'use script'

/*
 * Парсеры для различных API и прочего (но пока только API)
 */

var $parser = {
	schedule: (data, options) => {
		options = options ? options : {}

		let
			streamSсhed = $make.qs('.schedule'),
			table = $create.elem('table'),
			tableBody = '', tableBodyTop = '',
			schedMode = options.mode ? options.mode : ''

		streamSсhed.textContent = ''

		if (data == 'fail') {
			if (schedMode != 'radio') {
				table.appendChild($create.elem('tr', `<td>${getString('err_api')}</td>`))
				streamSсhed.appendChild(table)
			}
			return
		}

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

		data.forEach(item => {
			if (item['secret']) { return } // пропуск секретных элементов

			let
				yearOfS = moment.unix(item['s']).year(),
				dayOfS = unixToDays(item['s']),
				dayofE = unixToDays(item['e'])

			let
				newsсhedData = `${yearNow != yearOfS ? yearOfS + '<br>' : ''}${moment.unix(item['s']).format('D MMMM')}<br>${moment.unix(item['s']).format('HH:mm')} &ndash; ${moment.unix(item['e']).format('HH:mm')}`,
				nazvaniue = ''

			nazvaniue = (item['link'] && item['link'] != '')
				? $create.link(item['link'], item['title'], ['e', 'html'])
				: $make.safe(item['title'])

			/*
			 * Сделать нормальную поддержку item['backup']
			 */

			nazvaniue += (item['backup'] && schedMode == 'anime')
				? ` [${getString('anime_backup')}]`
				: ''

			if ((dayOfS - dayNow) < -1) {
				/* если (день даты старта item минус текущий день) меньше -1 */
				return
			} else if (item['s'] < unixNow && unixNow < item['e']) {
				/* если (таймштамп времени начала item меньше, чем текущий Unix-таймштамп) И если (текущий Unix-таймштамп меньше, чем время окончания item) */
				tableBody += $create.elem('tr', `<td>${newsсhedData}</td><td><b>${getString('now')(moment.unix(item['e']).toNow(true))}:</b><br>${nazvaniue}</td>`, 'air--current', ['html'])
			} else if (item['s'] > unixNow && item['s'] == nextAirs[0]['s']) {
				/* если (таймштамп времени начала item больше, чем текущий Unix-таймштамп) И если (таймштамп времени начала item равен времени начала первого item из массива будущих эфиров) */
				tableBody += $create.elem('tr', `<td>${newsсhedData}</td><td><b>${getString('within')} ${moment.unix(item['s']).fromNow()}:</b><br>${nazvaniue}</td>`, 'air--next', ['html'])
			} else if (item['s'] < unixNow) {
				/* если (таймштамп времени начала item меньше, чем текущий Unix-таймштамп) */
				tableBody += (schedMode != 'radio') ? $create.elem('tr', `<td>${newsсhedData}</td><td>${nazvaniue}</td>`, 'air--finished', ['html']) : ''
			} else if (dayOfS > dayNow) {
				/* если (день даты старта item больше, чем текущий день) */
				tableBody += $create.elem('tr', `<td>${newsсhedData}</td><td>${nazvaniue}</td>`, 'air--notToday', ['html'])
			} else {
				tableBody += $create.elem('tr', `<td>${newsсhedData}</td><td>${nazvaniue}</td>`, '', ['html'])
			}
		})

		tableBodyTop = (schedMode == 'radio')
			? $create.elem('caption', getString('airs_schedule'))
			: $create.elem('thead', `<tr><td colspan="2">${getString('latest_check')}: ${moment().format('D MMMM, HH:mm:ss')}</td></tr>`)

		if (tableBody == '') {
			if (schedMode == 'radio') { return }

			tableBody += $create.elem('tr', `<td colspan="2">${getString('empty_schedule')} ¯\\_(ツ)_/¯</td>`, '', ['html'])
		}

		table.appendChild(tableBodyTop)
		table.appendChild($create.elem('tbody', tableBody))

		streamSсhed.appendChild(table)
	},
	vkNews: data => {
		let
			vkNews = $make.qs('.vk-posts'),
			vkNewsBody = $create.elem('div')

		if (data == 'fail' || !data.posts) {
			vkNews.classList.add('api-err')
			vkNews.textContent = ''
			vkNews.appendChild($create.elem('p', getString('err_api')))
			return
		} else {
			if (vkNews.classList.contains('api-err')) {
				vkNews.classList.remove('api-err')
			}
		}

		data['posts'].forEach(post => {
			if (post['pin'] == 1) { return }

			let
				postImgLink = '', isCopy = '', postLinkS = '',
				postImg = post['pic']

			if (postImg) {
				let	postImgElem = $create.elem('img')

				postImgElem.setAttribute('src', postImg['small'])
				postImgElem.setAttribute('alt', '')

				postImgLink = $create.link(postImg['big'] ? postImg['big'] : postImg['small'], '')

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
					postLinkS = link.split('|')
					postText = postText.replace(pLR, $create.link(`https://${domain.vk}/${postLinkS[0].replace(/\[/g, '')}`, postLinkS[1].replace(/]/g, ''), ['e', 'html']))
				})
			}

			let vkPostMetaLink = $create.link(`https://${domain.vk}/wall-${data['com']['id']}_${post['id']}`, moment.unix(post['time']).format('LLL'), ['e', 'html'])

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

			vkNewsBody.appendChild(vkPost)
		})

		if (vkNews.innerHTML != vkNewsBody.innerHTML) {
			vkNews.innerHTML = vkNewsBody.innerHTML
		}
	},
	noti: (data, options) => {
		options = options ? options : {}

		let notiEl = $make.qs('.noti')

		if (data == 'fail' || !data['enabled']) { notiEl.style.display = 'none'; return }

		let
			id = data['time'],
			text = data['text'],
			color = data['color'],
			notiMode = options.mode ? options.mode : ''

		notiEl.style.backgroundColor = color ? color : null

		notiEl.textContent = ''

		let
			notiContent = $create.elem('div', text, 'noti-content'),
			notiHide = $create.elem('button', '', 'noti-hide'),
			notiHideString = `${getString('hide')} ${getString('noti').toLowerCase()}`,
			notiItems = []

		if (notiMode == 'anime') {
			notiHide.setAttribute('title', notiHideString)
		} else {
			notiHide.textContent = notiHideString
		}

		if ($make.qsf('a[href]', notiContent)) {
			let notiLinks = $make.qsf('a[href]', notiContent, ['a'])

			Array.from(notiLinks).forEach(link => {
				link.setAttribute('target', '_blank')
				if (link.getAttribute('href').startsWith('http')) {
					link.setAttribute('rel', 'nofollow noopener')
				}
			})
		}

		notiEl.appendChild(notiContent)
		notiEl.appendChild(notiHide)

		if ($ls.get('aw_noti')) {
			notiItems = JSON.parse($ls.get('aw_noti'))
		}

		notiEl.style.display = notiItems.includes(id) ? 'none' : 'block'

		notiHide.addEventListener('click', () => {
			notiItems[notiItems.length] = id
			$ls.set('aw_noti', JSON.stringify(notiItems))
			notiEl.style.display = 'none'
		})
	}
}
