import './styles.scss'
// import $ from 'jquery';
//import Button from './components/button/button';

// $('body').html('Hello');

//let button = new Button('google.com');
//button.render('a');



if(document.querySelectorAll('a').length){
	require.ensure([], () => {
		const Button = require('./components/button/button').default;
		const button = new Button('abc.com');
		button.render('a');
	}, 'button');
}

if(document.querySelectorAll('h1').length){
	require.ensure([], () => {
		const Header = require('./components/header/header').default;
		const header = new Header();
		header.render('h1');
	}, 'header');
}