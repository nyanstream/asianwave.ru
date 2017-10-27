'use strict'

var initAdminPanel = PHP_data => {
	let data = PHP_data

	let hide = elem => elem.style.display = 'none'

	moment.tz.setDefault(data.timezone)
	Array.from($make.qs('form', ['a'])).forEach(form => { form.reset() })

	try {
		let
			needChangeTime = (data.schedAnimeCount > 0) ? 'true' : 'false',
			newTime = data.schedAnimeLatest.end

		if (needChangeTime) $make.qs('.add-air input[type*=datetime]').setAttribute('value', moment.unix(newTime).format('YYYY-MM-DDTHH:mm'))
	} catch (e) { hide($make.qs('.add-air')) }

	try {
		let emptySched = {
			anime: (data.schedAnimeCount == 0) ? true : false,
			radio: (data.schedRadioCount == 0) ? true : false
		}

		let
			animeInfoEl = $make.qs('.rm-air .info-anime'),
			radioInfoEl = $make.qs('.rm-air .info-radio')

		if (animeInfoEl) {
			if (data.schedAnimeCount > 0 && animeInfoEl) {
				animeInfoEl.innerHTML = `Название: <q>${data.schedAnimeLatest.title}</q>. Начало ${moment.unix(data.schedAnimeLatest.start).format('LLL')}; Конец: ${moment.unix(data.schedAnimeLatest.end).format('LLL')}`
			} else { animeInfoEl.textContent = 'Расписание пустое' }
		}

		if (radioInfoEl) {
			if (data.schedRadioCount > 0) {
				radioInfoEl.innerHTML = `Название: <q>${data.schedRadioLatest.title}</q>. Начало ${moment.unix(data.schedRadioLatest.start).format('LLL')}; Конец: ${moment.unix(data.schedRadioLatest.end).format('LLL')}`
			} else { radioInfoEl.textContent = 'Расписание пустое' }
		}

		Object.keys(emptySched).forEach(key => {
			if (emptySched[key]) { $make.qs(`.rm-air input[type="radio"][value="${key}"]`).setAttribute('disabled', '') }
		})

		let
			schedsNames = Object.keys(emptySched),
			emptyScheds = schedsNames.filter(key => emptySched[key] == true)

		if (schedsNames.length == emptyScheds.length) {
			Array.from($make.qs('.rm-air input', ['a'])).forEach(input => { input.setAttribute('disabled', '') })
		}
	} catch (e) { hide($make.qs('.rm-air')) }

	try {
		let exprsSched = {
			anime: data.schedAnimeCountExpr,
			radio: data.schedRadioCountExpr
		}

		if (!$make.qs('.expired-clear')) { throw 42 }

		$make.qs('.expired-clear .count').innerHTML = `Всего просроченных эфиров: ${exprsSched['anime'] + exprsSched['radio']}; ${exprsSched['anime']} в /anime, ${exprsSched['radio']} в /radio.`

		if (exprsSched['anime'] + exprsSched['radio'] == 0) {
			Array.from($make.qs('.expired-clear input', ['a'])).forEach(input => {
				input.setAttribute('disabled', '')
			})
		}
	} catch (e) { hide($make.qs('.expired-clear')) }

	try {
		let vkLink = $make.qs('.vk-link p')
		if (!vkLink) { throw 42 }

		vkLink.appendChild($create.link(`${data.vk.URL}?client_id=${data.vk.appID}&display=page&redirect_uri=https://${data.server}/api/${data.vk.api}&scope=video,offline&response_type=code&state=vk-get-code`, 'Просто нажми сюда', ['e']))
	} catch (e) { hide($make.qs('.vk-link')) }

	try {
		if (!$make.qs('.noti')) { throw 42 }

		let
			notiCreateF =        $make.qs('.noti input#noti_text'),
			notiCreateC =        $make.qs('.noti input#noti_color'),
			notiSubmitBtn =      $make.qs('.noti input[type="submit"]'),
			notiSubmitBtnText =  'Создать'

		if (data.noti.enabled == true) {
			let
				notiTextElemRoot = $make.qs('.noti .noti-text'),
				notiTextElem = $create.elem('samp', data.noti.text, '', ['s']),
				notiTextElemText = document.createTextNode('Текущее оповещение: ')

			if (data.noti.color) {
				notiTextElem.style.backgroundColor = data.noti.color
			}

			notiTextElemRoot.appendChild(notiTextElemText)
			notiTextElemRoot.appendChild(notiTextElem)

			notiSubmitBtn.value = 'Заменить'
			notiSubmitBtnText = 'Заменить'
		}

		$make.qs('.noti input#noti_rm').addEventListener('change', e => {
			let _this = e.target

			if (_this.checked) {
				notiCreateF.setAttribute('disabled', '')
				notiCreateC.setAttribute('disabled', '')
				notiCreateF.value = ''
				notiSubmitBtn.value = 'Удалить'
			} else if (!_this.checked && notiCreateF.hasAttribute('disabled') && notiCreateC.hasAttribute('disabled')) {
				notiCreateF.removeAttribute('disabled')
				notiCreateC.removeAttribute('disabled', '')
				notiSubmitBtn.value = notiSubmitBtnText
			}
		})
	} catch (e) { hide($make.qs('.noti')) }

	try {
		let
			tsAnime =      parseInt(data.ts.anime),
			tsRadio =      parseInt(data.ts.radio),
			tsNoti =       parseInt(data.ts.noti),
			currentTime =  parseInt(data.ts.current)

		let
			tsAnimeElem =    $make.qs('footer .tsAnime'),
			tsRadioElem =    $make.qs('footer .tsRadio'),
			tsNotiElem =     $make.qs('footer .tsNoti'),
			tsCurrentElem =  $make.qs('footer .tsCurrent')

		if (tsAnimeElem) { tsAnimeElem.textContent = moment.unix(tsAnime).from() }
		if (tsRadioElem) { tsRadioElem.textContent = moment.unix(tsRadio).from() }
		if (tsNotiElem) { tsNotiElem.textContent = moment.unix(tsNoti).from() }

		if (tsCurrentElem) {
			setInterval(() => {
				tsCurrentElem.textContent = moment.unix(currentTime).format('LL LTS')
				++currentTime
			}, 1000)
		}
	} catch (e) {}
}
