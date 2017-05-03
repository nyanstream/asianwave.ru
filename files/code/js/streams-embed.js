'use strict'

var dmns = {
	'aw': 'asianwave.ru',
	'mr': 'myradio24.com'
}

var API = {
	'shedule': '/api/streams-shed.json',
	//'noti': '/api/noti.json',
	//'vk_news': '/api/vk-info.json',
	//'vk_stream': '/api/vk-stream.json'
}

if ($check.debug()) {
	var API_keys = Object.keys(API)
	API_keys.forEach(function(key) { API[key] = 'https://' + dmns.aw + API[key] })
}

var
	fetchOptions = { cache: 'no-store' },
	dataCont = $make.qs('.data')

var $embed = {
	shed: function() {
		fetch(API.shedule + '?t=' + Date.now(), fetchOptions).then(function(response) {
			response.json().then(function(data) {
				var
					momentT = moment().tz('Europe/Moscow'),
					dayToday = momentT.dayOfYear(),
					dayTodayFull = momentT.format('D MMMM (dddd)'),
					unixNow = momentT.unix()

				dataCont.appendChild($make.elem('p', dayTodayFull))

				data.forEach(function(item) {
					var
						timeS = moment.unix(item[0]).tz('Europe/Moscow'),
						dayOfS = timeS.dayOfYear(),
						timeE = moment.unix(item[1]).tz('Europe/Moscow')

					var newShedData = timeS.format('HH:mm') + ' &ndash; ' + timeE.format('HH:mm') + ': ' + item[2]

					if (dayOfS == dayToday) dataCont.appendChild($make.elem('p', newShedData))
				})
			})
		})
	},
	song: function() {
		var point = 7934

		//if ($check.get('song') == '') point = 7934

		fetch('https://' + dmns.mr + '/users/' + point + '/status.json?t=' + Date.now(), fetchOptions).then(function(response) {
			response.json().then(function(data) {
				dataCont.textContent = ''
				dataCont.appendChild($make.elem('p', data['song'].replace(' - ', ' &ndash; ')))
			})
		})
	}
}

;(function () {
	if ($check.get('shed')) {
		dataCont.classList.add('shed')
		$embed.shed()
	}
	if ($check.get('song')) {
		dataCont.classList.add('song')
		$embed.song()
		setInterval(function() { $embed.song() }, 5000)
	}
	if ($check.get('time')) {
		dataCont.classList.add('time')
		setInterval(function() { dataCont.textContent = 'Время сейчас: ' + moment().format('HH:mm:ss') }, 100)
	}
})()
