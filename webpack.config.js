var webpack = require("webpack");

module.exports = {
	entry: {
		"pauseresume": "./src/pauseresume.js",
		"pauseresume.min": "./src/pauseresume.js",
		"pauseresume.test": "./test/unit/js/test.js"
	},
	output: {
		path: __dirname + "/dist",
		filename: "[name].js",
		library: ["eg", "PauseResume"],
		libraryTarget: "umd"
	},
	externals: [
		{"jquery": '$'}
	],
	devServer: {
		publicPath: "/dist/"
	},
	devtool: "source-map",
	module: {
		rules: [{
			test: /\.js$/,
			exclude: /node_modules/,
			loader: "babel-loader",
			options: {
		  		presets: ["es2015"]
			}
		}]
	},
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			include: /\.min\.js$/,
			minimize: true
		})
	]
};
