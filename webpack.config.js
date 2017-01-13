var webpack = require('webpack');
var CleanPlugin = require('clean-webpack-plugin');
var ExtractPlugin = require('extract-text-webpack-plugin');
var production = process.env.NODE_ENV === 'production';

var plugins = [
 	// gather a certain type of content from your final bundle, and pipe it elsewhere, most common use case being for CSS 
 	//<=== where should content be piped
  	//new ExtractPlugin('[name]-[hash].css', {allChunks: true}),
  	new ExtractPlugin('bundle.css', {allChunks: true}),
	new webpack.optimize.CommonsChunkPlugin({
		// name: 'main',// Move common dependencies to our vendor file
		// filename: 'vendor.js',
		children: true, // Look for common dependencies in all children,
		minChunks: 2, // How many times a dependency must come up before being extracted
		///set this async:true flag if you want to bundle your common commponents to be bundled into seperate file 
		//and loaded asynchronously on demand.
		async: true,
	}),
];

if(production){
	plugins = plugins.concat([
		//production plugins go here

		//Clean up the builds folder
		//before compiling our final assets
		new CleanPlugin('builds'),


		//DedupePlugin:
		//This plugin looks for similar chunks and files		
		//and merge them for better caching by the user.
		new webpack.optimize.DedupePlugin(),

		//OccurenceOrderPlugin:
		//This plugin optimizes chunks and modules 
		//by how much they are used in our app. 		
		new webpack.optimize.OccurenceOrderPlugin(), 

		//MinChunkSizePlugin: 
		//This plugin prevents webpack from creating chunks 
		//that would be too small to be worth loading separately.
		new webpack.optimize.MinChunkSizePlugin({
			minChunkSize: 51200, // ~50kb
		}),

		//UglifyJsPlugin:
		//This plugin minifies all the Javascript code of the final bundle
		new webpack.optimize.UglifyJsPlugin({
			mangle: true, 
			compress: {
				warnings: false,  // Suppress uglification warnings 
			},
		}),

		//DefinePluign
		//This plugin defines various variables that we can set to false
		//in production to avoid code related to them from being compiled 
		//in our final bundle 
		new webpack.DefinePlugin({
			__SERVER__: !production, 
			__DEVELOPMENT__: !production, 
			__DEVTOOLS__: !production,
			'process.env': {
				BABEL_ENV: JSON.stringify(process.env.NODE_ENV)
			},
		})
	]);
}

module.exports = {
 	entry: './src',
 	output: {
 		path: 'builds', 
 		filename: production ? '[name]-[hash].js' : 'bundle.js',
 		chunkFilename: '[name]-[chunkhash].js', //set this to create named chuncks 
 		publicPath: 'builds/', ///WE need to tell webpack from where to load our chunks..
 	},
 // 	devServer: {
 // 		inline: true,
	//     hot: true,
	// },
 	plugins: plugins,
 	module: {
 		debug: !production, //production=true; means they won’t pack-in more code to let you more easily debug things in local
 		devTools: production ? false : 'eval', //sourcemaps generation...  In production we may not really care about sourcemaps so we disable them. 		
        preLoaders: [
        	{

        		//This tells Webpack: if you encounter an HTML file of the same name, 
        		//import it as template, and also import any Sass file of the same name.         		
        		test: /\.js/,
        		//loader: 'baggage?[file].html=template&[file].scss',
        		//or
        		loader: 'baggage',
        		query: {
        			'[file].html':'template',
        			'[file].scss':'',
        		}
        	}
        ],
 		loaders: [
 			{
 				test: /\.js/, 
 				loader: 'babel',
 				include: __dirname +'/src'
 			},
			{
				// When you encounter SCSS files, parse them with node-sass, 
  				// then return the results as a string of CSS
  				// for now we’ll use a loader called the style-loader + 
  				// +which takes a piece of CSS and injects it into the page dynamically.
			    test:    /\.scss/,
                loader: ExtractPlugin.extract('style', 'css!sass'),

			   	//loader: 'style!css!sass',
			    // Or
			    //loaders: ['style', 'css', 'sass'],
			},
			{
			    test:   /\.html/,
			    loader: 'html',
			}, 
			{
				test: /\.(png|gif|jpe?g|svg)$/i,
				loader: 'url', 
				//loader'url?limit=10000'
				query: {
					limit: 10000,
				},
			},
 		]
 	}
}