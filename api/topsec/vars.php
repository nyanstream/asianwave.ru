<?php
	/*
	 * Данные о поинтах радио
	 */

	$radioPoints = [
		'jp' => [
			'code' => 'jp',
			'name' => 'Japan',
			'port' => 8000,
			'id' => 1
		], 'ru' => [
			'code' => 'ru',
			'name' => 'Russia',
			'port' => 8010,
			'id' => 2
		], 'kr' => [
			'code' => 'kr',
			'name' => 'Korea',
			'port' => 8020,
			'id' => 3
		],
	];

	/*
	 * URL разлиных API
	 */

	$APIep = [
		'vk' => 'https://api.vk.com/method',
		'vk_ac' => 'https://oauth.vk.com/access_token',
		'vk_au' => 'https://oauth.vk.com/authorize',
		'radio' => 'https://ryuko.asianwave.ru/api'
	];

	/*
	 * Данные для API VK
	 */

	$vkData = [
		'comID' => 120842574, // основное
		//'comID' => 144952964, // тестовое
		'id' => 5981505,
		'api-version' => 5.63,
		'secret' => 'zc2diEfWxWmH8Sj1rm0e',
		'service' => 'b8cfe68bb8cfe68bb8ca6b63d1b894a3cabb8cfb8cfe68be02091e13d097316a0754980'
	];

	/*
	 * Прокси для картинок с VK, используемых в виджете с новостями
	 */

	$imgProxy = array('https://' => 'https://images.weserv.nl/?url=ssl:');
?>
