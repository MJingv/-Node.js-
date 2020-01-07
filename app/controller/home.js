'use strict';

const Controller = require('egg').Controller;
const superagent = require('superagent');
const cheerio = require('cheerio');


class HomeController extends Controller {
	async index() {
		const {ctx, service, app} = this;
		try {
			const data = await superagent.get('https://cnodejs.org/');
			let $ = cheerio.load(data.text);
			let items = [];
			$('#topic_list .topic_title').each((idx, element) => {
				let $element = $(element);
				items.push({
					title: $element.attr('title'),
					href: $element.attr('href')
				});
			});
			ctx.body = items;
		} catch (e) {
			console.log(e);
		}
	}
}

module.exports = HomeController;
