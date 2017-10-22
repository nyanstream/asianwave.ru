'use strict'

moment.tz.setDefault('Europe/Moscow')

var
	scriptData = document.currentScript.dataset,
	apiPrefix = (scriptData.apiPrefix && scriptData.apiPrefix != '') ? scriptData : 'api'

var domain = {
	'aw': 'asianwave.ru'
}

domain.radio = `ryuko.${domain.aw}`

var API = {
	'schedule': 'anime-sched.json',
	'noti': 'noti.json',
	'vk_news': 'vk-info.json'
}

Object.keys(API).forEach(key => {
	API[key] = `/${apiPrefix}/${API[key]}`

	switch (location.hostname) {
		case '127.0.0.1':
		case 'localhost':
			API[key] = `https://${domain.aw}${API[key]}`
	}
})

var
	fetchOptions = { cache: 'no-store' },
	dataCont = $make.qs('.data')

/*
 * @TODO сделать работу cut и в обратную сторону
 */

var $embed = {
	sched: () => {
		fetch(`${API.schedule}?t=${Date.now()}`, fetchOptions).then(response => {
			response.json().then(data => {
				let
					dayToday = moment().format('DDD YY'),
					dayTodayFull = moment().format('D MMMM (dddd)'),
					hourHow = moment().format('HH'),
					unixNow = moment().unix(),
					cutToHour = false

				dataCont.textContent = ''
				dataCont.appendChild($create.elem('p', dayTodayFull))

				if ($check.get('cut')) { cutToHour = parseFloat($check.get('cut')) }

				data.forEach(item => {
					let
						timeS = moment.unix(item['s']),
						dayOfS = timeS.format('DDD YY'),
						hourOfS = timeS.format('HH'),
						timeE = moment.unix(item['e'])

					if (dayOfS == dayToday) {
						if (cutToHour && cutToHour > hourOfS) { return }

						dataCont.appendChild($create.elem('p', `<span class="sched--time">${timeS.format('HH:mm')} &ndash; ${timeE.format('HH:mm')}:</span> <span class="sched--title">${item['title']}</span>`))
					}
				})
			})
		})
	},
	schedNext: () =>  {
		fetch(`${API.schedule}?t=${Date.now()}`, fetchOptions).then(response =>  {
			response.json().then(data => {
				let nextAirs = data.filter((e) => e['s'] > moment().unix())

				if (nextAirs.length == 0) return;

				dataCont.textContent = ''
				dataCont.appendChild($create.elem('p', `Далее будет:<br>${moment.unix(nextAirs[0]['s']).format('HH:mm')} &ndash; ${nextAirs[0]['title']}` ))
			})
		})
	},
	song: () => {
		fetch(`https://${domain.radio}/api/nowplaying/1`, fetchOptions).then(response => {
			response.json().then(data => {
				let song = data['now_playing']['song']['text']

				dataCont.textContent = ''
				dataCont.appendChild($create.elem('p', song.replace(' - ', ' &ndash; ')))
			})
		})
	},
	time: () => {
		dataCont.textContent = `Время у стримера: ${moment().format('HH:mm:ss')}`
	}
}

;(() => {
	let updTime = 5000

	if ($check.get('updtime')) { updTime = parseFloat($check.get('updtime') + '000') }

	switch ($check.get('data')) {
		case 'sched':
			dataCont.classList.add('sched')
			$embed.sched()
			setInterval(() => { $embed.sched() }, updTime)
			break
		case 'sched-next':
			dataCont.classList.add('sched-next')
			$embed.schedNext()
			setInterval(() => { $embed.schedNext() }, updTime)
			break
		case 'song':
			dataCont.classList.add('song')
			$embed.song()
			setInterval(() => { $embed.song() }, updTime)
			break
		case 'time':
			dataCont.classList.add('time')
			setInterval(() => { $embed.time() }, 100)
			break
	}
})()
