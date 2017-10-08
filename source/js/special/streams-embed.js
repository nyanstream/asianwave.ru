'use strict'

moment.tz.setDefault('Europe/Moscow')

var domain = {
	'aw': 'asianwave.ru',
	'mr': 'myradio24.com'
}

var API = {
	'schedule': '/api/anime-sched.json',
	'noti': '/api/noti.json',
	//'vk_news': '/api/vk-info.json',
	//'vk_stream': '/api/vk-stream.json'
}

for (let key in API) { if (API.hasOwnProperty(key)) API[key] = `https://${domain.aw}${API[key]}` }

var
	fetchOptions = { cache: 'no-store' },
	dataCont = $make.qs('.data')

var $embed = {
	sched: () => {
		fetch(`${API.schedule}?t=${Date.now()}`, fetchOptions).then(response => {
			response.json().then(data => {
				let
					dayToday = moment().format('DDD YY'),
					dayTodayFull = moment().format('D MMMM (dddd)'),
					unixNow = moment().unix()

				dataCont.textContent = ''
				dataCont.appendChild($create.elem('p', dayTodayFull))

				data.forEach(item => {
					let
						timeS = moment.unix(item['s']),
						dayOfS = timeS.format('DDD YY'),
						timeE = moment.unix(item['e'])

						if (dayOfS == dayToday) dataCont.appendChild($create.elem('p', `<span class="sched--time">${timeS.format('HH:mm')} &ndash; ${timeE.format('HH:mm')}:</span> <span class="sched--title">${item['title']}</span>`))
				})
			})
		})
	},
	sched_next: () =>  {
		fetch(`${API.schedule}?t=${Date.now()}`, fetchOptions).then(response =>  {
			response.json().then(data => {
				let nextAirs = data.filter((e) => e['s'] > moment().unix())

				if (nextAirs.length == 0) return;

				dataCont.textContent = ''
				dataCont.appendChild($create.elem('p', `Сейчас будет:<br>${moment.unix(nextAirs[0]['s']).format('HH:mm')} &ndash; ${nextAirs[0]['title']}` ))
			})
		})
	},
	song: () => {
		let point = 7934

		//if ($check.get('song') == '') point = 7934

		fetch(`https://${domain.mr}/users/${point}/status.json?t=${Date.now()}`, fetchOptions).then(response => {
			response.json().then(data => {
				dataCont.textContent = ''
				dataCont.appendChild($create.elem('p', data['song'].replace(' - ', ' &ndash; ')))
			})
		})
	},
	time: () => {
		dataCont.textContent = `Время у стримера: ${moment().format('HH:mm:ss')}`
	}
}

;(() => {
	let
		methods = ['shed', 'next', 'song'],
		updTime = 5000

	if ($check.get('updtime')) updTime = parseFloat($check.get('updtime') + '000');

	if ($check.get('sched')) {
		dataCont.classList.add('sched')
		$embed.sched()
		setInterval(() => { $embed.sched() }, updTime)
	}
	if ($check.get('sched_next')) {
		dataCont.classList.add('sched-next')
		$embed.sched_next()
		setInterval(() => { $embed.sched_next() }, updTime)
	}
	if ($check.get('song')) {
		dataCont.classList.add('song')
		$embed.song()
		setInterval(() => { $embed.song() }, updTime)
	}
	if ($check.get('time')) {
		dataCont.classList.add('time')
		setInterval(() => { $embed.time() }, 100)
	}
})()
