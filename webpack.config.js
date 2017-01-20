var webpack = require("webpack");

module.exports = {
	entry: {
		"eg.pauseResume": "./src/index.js",
		"eg.pauseResume.min": "./src/index.js",
		"eg.pauseResume.test": "./test/unit/js/test.js"
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
