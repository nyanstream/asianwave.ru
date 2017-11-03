'use strict'

var playerInit = options => {
	let embed = $create.elem('embed')

	embed.setAttribute('src', `${options.file}.swf`)
	embed.setAttribute('flashvars', options.vars)
	embed.setAttribute('wmode', options.wmode)

	embed.setAttribute('type', 'application/x-shockwave-flash')
	embed.setAttribute('quality', 'best')
	embed.setAttribute('scale', 'noscale')
	embed.setAttribute('browserzoom', 'noscale')
	embed.setAttribute('menu', false)
	embed.setAttribute('allowfullscreen', true)
	embed.setAttribute('pluginspage', 'https://get.adobe.com/ru/flashplayer/')

	if (hasFlash() || isEdge) {
		$make.qs('.player').appendChild(embed)
	} else {
		document.body.classList.add('no-flash')
	}
}
