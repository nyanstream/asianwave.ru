'use script'

/*
 * Парсеры для различных API и прочего (но пока только API)
 */

var $parser = {
	schedule: (data, options) => {
		/*
		 * @TODO пофиксить проблему нового года
		 * @BUG на /аниме перед tbody вставляется tr
		 */

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

		let
			dayToday = moment().dayOfYear(),
			unixNow = moment().unix()

		let nextAirs = data.filter(e => e['s'] > unixNow)

		data.forEach(item => {
			if (item['secret']) { return } // пропуск секретных элементов

			let
				newsсhedData = `${moment.unix(item['s']).format('D MMMM')}<br>${moment.unix(item['s']).format('HH:mm')} &ndash; ${moment.unix(item['e']).format('HH:mm')}</td>`,
				nazvaniue = ''

			let
				dayOfS = moment.unix(item['s']).dayOfYear(),
				dayofE = moment.unix(item['e']).dayOfYear()

			nazvaniue = item['link'] ? $create.link(item['link'], item['title'], ['e', 'html']) : $make.safe(item['title'])

			if ((dayOfS - dayToday) < -1) {
				return
			} else if (item['s'] < unixNow && unixNow < item['e']) {
				tableBody += $create.elem('tr', `<td>${newsсhedData}</td><td><b>${getString('now')(moment.unix(item['e']).toNow(true))}:</b><br>${nazvaniue}</td>`, 'air--current', ['html'])
			} else if (item['s'] > unixNow && item['s'] == nextAirs[0]['s']) {
				tableBody += $create.elem('tr', `<td>${newsсhedData}</td><td><b>${getString('within')} ${moment.unix(item['s']).fromNow()}:</b><br>${nazvaniue}</td>`, 'air--next', ['html'])
			} else if (item['s'] < unixNow) {
				tableBody += (schedMode != 'radio') ? $create.elem('tr', `<td>${newsсhedData}</td><td>${nazvaniue}</td>`, 'air--finished', ['html']) : ''
			} else if (dayOfS > dayToday) {
				tableBody += $create.elem('tr', `<td>${newsсhedData}</td><td>${nazvaniue}</td>`, 'air--notToday', ['html'])
			} else {
				tableBody += $create.elem('tr', `<td>${newsсhedData}</td><td>${nazvaniue}</td>`, '', ['html'])
			}
		})

		tableBodyTop = (schedMode == 'radio')
			? $create.elem('caption', getString('airs_schedule'))
			: $create.elem('tr', `<td colspan="2">${getString('latest_check')}: ${moment().format('D MMMM, HH:mm:ss')}</td>`)

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

		if (notiContent.querySelector('a[href]')) {
			let notiLinks = notiContent.querySelectorAll('a[href]')

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
