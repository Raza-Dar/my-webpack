import $ from 'jquery';
import Mustache from 'mustache';
// import template from './button.html';
// import './button.scss';


export default class Button{
	constructor(link) {
		// super(props);
		this.link = link;		
	}

	onClick(event){
		event.preventDefault();
		alert(this.link);
		console.log('Button Clicked');
	}

	render(node){
		const text = $(node).text();

		$(node).html(
			Mustache.render(template, {text})
		);

		$('.button').click(this.onClick.bind(this));
	}
}