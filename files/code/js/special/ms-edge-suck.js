'use strict'

/*
 * Временное переопределение чека из камины, пока эдж не научится в ес6 (к осени убрать)
 */

var $check = {
	get: function(value) {
		let
			loc = location.search,
			params = {}, parts = '', nv = ''

		if (loc)
			parts = location.search.substring(1).split('&');
			for (let i = 0, pL = parts.length; i < pL; i++) {
				nv = parts[i].split('=')
				if (!nv[0]) continue;
				params[nv[0]] = nv[1] || true;
			}

		return params[value] ? params[value] : false
	}
}
