'use strict'

var hasFlash = () => {
	let hasFlash = false

	try {
		let fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash')
		if (fo) hasFlash = true
	} catch (e) {
		if (navigator.mimeTypes	&& navigator.mimeTypes['application/x-shockwave-flash'] != undefined && navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) hasFlash = true
	}

	return hasFlash
}
