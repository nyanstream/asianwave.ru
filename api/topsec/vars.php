<?php
	$radioPoints = [
		['jp', 'Japan', 7934], // основной поток для радио, пока что
		['ru', 'Russia', 9759],
		['kr', 'Korea', 3799]
	];

	$APIep = [
		'vk' => 'https://api.vk.com/method',
		'vk_ac' => 'https://oauth.vk.com/access_token',
		'vk_au' => 'https://oauth.vk.com/authorize',
		'mr' => 'https://myradio24.com/users'
	];

	$vkData = [
		'comID' => 120842574, // основное
		//'comID' => 144952964, // тестовое
		'id' => 5981505,
		'api-version' => 5.63,
		'secret' => 'zc2diEfWxWmH8Sj1rm0e',
		'service' => 'b8cfe68bb8cfe68bb8ca6b63d1b894a3cabb8cfb8cfe68be02091e13d097316a0754980'
	];

	$imgProxy = array('https://' => 'https://images.weserv.nl/?url=ssl:');
?>