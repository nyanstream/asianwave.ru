'use strict'

;(() => {
	let
		playerID = 'jw-player',
		player = jwplayer(playerID),
		playerElem = $make.qs('.player'),
		stream = $check.get('url') ? $check.get('url') : 'video.eientei.org/live/AsianWave'

		let jwSetup = {
			file: `rtmp://${stream}`,
			width: '100%', height: '100%',
			// rtmp: { 'bufferlength': 10 },
			skin: 'roundster',
			autostart: true,
			//controls: false,
			displaytitle: false,
			displaydescription: false,
			abouttext: 'Asian Wave',
			aboutlink: '/'
		}

		if (hasFlash() || isEdge) {
			player.setup(jwSetup)
		} else {
			$make.qs('.warning').style.display = 'flex'
		}
})()
