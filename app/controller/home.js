'use strict';

const Controller = require('egg').Controller;
const superagent = require('superagent');
const cheerio = require('cheerio');
const eventproxy = require('eventproxy');

const url = require('url');
const cnodeUrl = 'https://cnodejs.org/';

class HomeController extends Controller {
	//lesson3 《使用 superagent 与 cheerio 完成简单爬虫》
	async index() {
		const {ctx, service, app} = this;
		try {
			const data = await superagent.get(cnodeUrl);
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

	// lesson4《使用 eventproxy 控制并发》
	async lesson4() {
		//取出每个主题的第一条评论
		const {ctx, service, app} = this;
		try {
			const data = await superagent.get(cnodeUrl);
			let $ = cheerio.load(data.text);
			let topicUrls = [];
			$('#topic_list .topic_title').each((idx, element) => {
				let $element = $(element);
				let href = url.resolve(cnodeUrl, $element.attr('href'));// 用 url.resolve 来自动推断出完整 url
				topicUrls.push(href);
			});


			let ep = new eventproxy();
			ep.after('topic_html', topicUrls.length, (topics) => {

				topics = topics.map((topicPair) => {
					let topicUrl = topicPair[0];
					let topicHtml = topicPair[1];
					let $ = cheerio.load(topicHtml);
					return ({
						title: $('.topic_full_title').text().trim(),
						href: topicUrl,
						comment1: $('.reply_content').eq(0).text().trim()
					});
				});
				console.log('final', topics);
			});

			topicUrls.forEach(topicUrl => {
				let res = superagent.get(topicUrl);
				ep.emit('topic_html', [topicUrl, res.text]);
			});


			ctx.body = topicUrls;
		} catch (e) {
			console.log(e);
		}
	}

}

module.exports = HomeController;
