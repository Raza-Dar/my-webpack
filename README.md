# Webpack learning
#https://blog.madewithlove.be/post/webpack-your-bags/

#how to run this project

clone this repository 

===================

run:

npm install

#set (.node_modules/.bin) path to your $PATH variable. 
#So you don't need to type again & agina. (I don't know how you will do it.)

then run:

webpack  #(if path is set) otherwise run:

./node_modules/.bin/webpack

and follow the rest of ReadMe.


https://blog.madewithlove.be/post/webpack-your-bags/

Key Concept from this Blog:

Code splitting is Webpack’s answer to this problematic of “Monolithic bundle” vs “Unmaintainable manual imports”. It’s the idea that you define, in your code, “split points”: areas of your code that could be easily split off into a separate file and then loaded on-demand.

That means you can wrap chunks of your code with various pieces of logic.

require.ensure([], () => {
        const Button = require('./Components/Button').default;
        const button = new Button('google.com');

        button.render('a');
    });

Note that when using require if you want the default export you need to manually grab it through.default. Reason for this is require doesn’t handle both default and normal exports so you have to specify which to return. Whereas import has a system for this in place so it knows already (eg. import foo from 'bar') vs import {baz} from 'bar').


Now in order for Webpack to know where to find the chunks when loading them with AJAX, we have to add a little line to our configuration:
path:       'builds',
filename:   'bundle.js',
publicPath: 'builds/',
The output.publicPath option tells Webpack where to find built assets from the point of view of the page(so in our case in /builds/).


This allows you to intelligently split off heavy logic in your application and only let each page require what it truly needs. Note also that we can name our split points so that instead of 1.bundle.js we have more meaningful chunk names. You can do so by passing a third argument to require.ensure.


Note: require.ensure only loads the modules, it doesn’t evaluate them.



--display-chunks --display-modules


///named chunks
What do you want to do with the named chunks? Named chunks are only useful for manually merging chunks by giving them the same name. For everything else you may want to use multiple entry points and the CommonsChunkPlugin.
You can do something like namedChunkFilename: "prefix_[name].js", but this isn't used by the runtime the load the chunk. Only chunkFilename is used. The chunk name is not available at runtime.
http://webpack.github.io/docs/multiple-entry-points.html
http://webpack.github.io/docs/optimization.html#multi-page-app


Webpack Plugins: 

Plugins differ from loaders in the sense that instead of only executing on a certain set of files, and being more of a “pipe”, they execute on all files and perform more advanced actions, that aren’t necessarily related to transformations. Webpack comes with a handful of plugins to perform all various kinds of optimizations. The one that interests us in this case is the CommonChunksPlugin: it analyzes your chunks for recurring dependencies, and extracts them somewhere else. It can be a completely separate file (like vendor.js) or it can be your main file.


You can also make common dependencies be loaded asynchronously by not providing a common chunk name and instead specifying async: true.

Webpack Production Configuration

Webpack offers a lot more plugins you can use to fine-tune your modules and chunks. There are also several user-contributed plugins that can be found on NPM and that accomplish various things.

 we don’t really have a way to dynamically retrieve the name of the compiled bundle in our simplistic app, we’ll only version assets in production? Didn’t get it?


module.exports = {
    debug:   !production,
    devtool: production ? false : 'eval',


The first setting switches loaders to and from debug mode, which means they won’t pack-in more code to let you more easily debug things in local. The second is about sourcemaps generation. Webpack has several ways to render sourcemaps, eval is just the best one in local. In production we may not really care about sourcemaps so we disable them. Now let’s add our production plugins.


if (production) {
    plugins = plugins.concat([

        // This plugin looks for similar chunks and files
        // and merges them for better caching by the user
        new webpack.optimize.DedupePlugin(),

        // This plugins optimizes chunks and modules by
        // how much they are used in your app
        new webpack.optimize.OccurenceOrderPlugin(),

        // This plugin prevents Webpack from creating chunks
        // that would be too small to be worth loading separately
        new webpack.optimize.MinChunkSizePlugin({
            minChunkSize: 51200, // ~50kb
        }),

        // This plugin minifies all the Javascript code of the final bundle
        new webpack.optimize.UglifyJsPlugin({
            mangle:   true,
            compress: {
                warnings: false, // Suppress uglification warnings
            },
        }),

        // This plugins defines various variables that we can set to false
        // in production to avoid code related to them from being compiled
        // in our final bundle
        new webpack.DefinePlugin({
            __SERVER__:      !production,
            __DEVELOPMENT__: !production,
            __DEVTOOLS__:    !production,
            'process.env':   {
                BABEL_ENV: JSON.stringify(process.env.NODE_ENV),
            },
        }),

    ]);
}


Now another aspect of production assets is ideally you’d like your assets to be versioned. Now remember when we set output.filename to bundle.js? Well there are several variables you can actually use in that option, one of which is [hash] and corresponds to a hash of the contents of the final bundle, so let’s change our code. We also want our chunks to be versioned so we’ll add an output.chunkFilename which accomplishes the same things:



Yes, yes it is, but this only happened because our app is very small. Now consider this: you didn’t have to think about what to merge, when or where. If your chunks suddenly start having more dependencies, the chunk will be moved to an async chunk instead of being merged; and if these chunks start looking too similar to be worth loading separately, they would be merged, etc. You just setup the rules, and from then on, Webpack will automatically optimize your application in the best way possible. No manual labor, no thinking about what dependencies go where or are needed where, everything is automatic.


You may have noticed I didn’t setup anything to minify our HTML and CSS, that’s because the css-loaderand html-loader already take care of that by default if the debug option we mentioned earlier is false. This is also the reason why Uglify is a separate plugin: because there is no js-loader in Webpack, since Webpack itself is the JS loader.



Extraction

npm install extract-text-webpack-plugin --save-dev
What this plugin does is exactly what I just said: gather a certain type of content from your final bundle, and pipe it elsewhere, most common use case being for CSS.

Images

the file-loader and the url-loader: - The first one will just return a URL to the asset without any particular change, allowing you in the process to version the file (this is the default behavior). - The second one will inline the asset to adata:image/jpeg;base64 URL

In reality it’s not black and white: if your background is a 2Mb image you don’t want to inline that and it would be preferable to load it separately. If on the other hand it’s a small icon of 2kb it’s better to inline it and spare the HTTP request, so let’s setup both:
$ npm install url-loader file-loader --save-dev


{
    test:   /\.(png|gif|jpe?g|svg)$/i,
    loader: 'url?limit=10000',
},
This is very powerful because it means Webpack will now intelligently optimize any concrete assets found depending on the ratio of size/HTTP requests. There are a good load of loaders you can pipe to push things even further, most common one being image-loader which will pass imagemin on all images before bundling them. It even has a ?bypassOnDebug query parameter which allows you to only do that on production. There are a lot of plugins like that, I encourage you to take a look at the list at the end of this article.




Webpack-server & Live Reloading:


 Hot module replacement or hot reload:

It’s the idea that, since Webpack knows exactly the position of each module in our dependency tree, a change in it can be represented by simply patching that part of the tree with the new file. More clearly: your changes appear live on your screen without the page reloading.
In order for HMR to be used, we need a server from which the hot assets will be served. Webpack comes with a dev-server we can leverage for that, so let’s install it:
$ npm install webpack-dev-server --save-dev


Now to run the dev server, nothing simpler, just run the following command:
$ webpack-dev-server --inline --hot


The first flag tells Webpack to inline the HMR (Hot module replacement) logic into the page (instead of presenting the page in an iframe) and the second enables HMR. Now let’s visit the web-server at http://localhost:8080/webpack-dev-server/. You’ll see your usual page, but now try to modify one of the Sass files and, magic:

You can use the webpack-dev-server as your own local server. If you plan to always use it for HMR, you can say so in your configuration:
devServer: {
    hot: true,
},

Get clean or die lintin’

If you’ve been following this tutorial closely you may have noticed something weird: why are loaders nested in module.loaders but plugins are not? That’s because there are other things you can put into module of course! Webpack doesn’t just have loaders, it also has pre-loaders and post-loaders: loaders that are executed on the code before or after our main loaders. Let’s take an example: I’m sure the code I wrote for this article is horrendous, so let’s apply ESLint to our code before we transform it:



Let’s take another example of pre-loader: for every component we currently import its stylesheet of the same name, and its template of the same name. Let’s use a pre-loader to automatically load any files bearing the same name as a module:


npm install baggage-loader --save-dev
{
    test: /\.js/,
    loader: 'baggage?[file].html=template&[file].scss',
}
This tells Webpack: if you encounter an HTML file of the same name, import it as template, and also import any Sass file of the same name. We can now change our components from this:
import $ from 'jquery';
import template from './Button.html';
import Mustache from 'mustache';
import './Button.scss';



To this:
import $ from 'jquery';
import Mustache from 'mustache';


Webpack Stats:

Want insights on what our actual dependency tree is. What we might be doing right or wrong, what are the bottlenecks of our application, etc. Now internally, Webpack knows all these things, but you have to ask him politely to show you what it knows. You can do so by generating a profile file by running the following command:
webpack --profile --json > stats.json
So go to Webpack Analyze and import your JSON file there. Now go into the Modules tab and you should see a visual representation of your dependency tree:

The redder a dot is, the more it is problematic regarding your final bundle. In our case it’s marking jQuery as problematic because it’s the heaviest of all our modules. Take a look into all the tabs, look around, you won’t learn much on our minimal application but this tool is a very important one to gain insight into your tree and final bundle. Now as I said, other services offer insight into your profile file


That’s all folks
Now I know that in my case, Webpack has completely replaced Grunt or Gulp: most of what I used them for is now handled by it, and for the rest I just use NPM scripts. Per example one common task we had in the past was converting our API documentation to HTML with Aglio, this can easily be done like so:
package.json
{
  "scripts": {
    "build": "webpack",
    "build:api": "aglio -i docs/api/index.apib -o docs/api/index.html"
  }
}


If however you have more complex tasks in your Gulp stack that are unrelated to bundling or assets, Webpack plays very nicely with other build systems. Per example here is how to integrate Webpack in Gulp:
var gulp = require('gulp');
var gutil = require('gutil');
var webpack = require('webpack');
var config = require('./webpack.config');

gulp.task('default', function(callback) {
  webpack(config, function(error, stats) {
    if (error) throw new gutil.PluginError('webpack', error);
    gutil.log('[webpack]', stats.toString());

    callback();
  });
});


And that’s pretty much it, since Webpack also has a Node API, it can easily be used in other build systems, and in any case you’ll find wrappers for it hanging a bit everywhere.


Anyway, I think that’s a good enough bird’s eye view of what Webpack can do for you. You may think we have covered a lot in this article, but we have only scratched the surface: multiple entry points, prefetching, context replacement, etc. Webpack is an impressively powerful tool, which of course comes at the cost of a more opaque configuration syntax than your traditional build tool, I won’t deny it. But once you know how to tame it, it’ll purr the sweet sound of performance right into your ear. I used it on several projects, and it offers so much power of optimization and automation that I can’t honestly picture myself going back to banging my head on what assets is needed where or when.
Resources
Webpack documentation
List of loaders
List of plugins
Sources for this article
Our Webpack configuration package

