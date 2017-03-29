var pkg = require("../package.json");
var path = require("path");
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var StringReplacePlugin = require("string-replace-webpack-plugin");

module.exports = {
	entry: {
		"pauseresume": "./src/pauseresume.js",
		"pauseresume.min": "./src/pauseresume.js",
	},
	output: {
		path: path.resolve(__dirname, "../dist"),
		filename: "[name].js",
		library:  ["eg", "pauseresume"],
		libraryTarget: "umd",
	},
	externals: [],
	devServer: {
		publicPath: "/dist/"
	},
	devtool: "source-map",
	module: {
		rules: [
			{
				test: /(\.js)$/,
				exclude: /(node_modules)/,
				loader: "babel-loader",
				query: {
					"presets": [
						[
							"es2015",
							{
								"loose": true,
								"modules": false
							}
						]
					],
					"plugins": [
						"add-module-exports"
					]
				}
			},
			{
				test: /(\.js)$/,
				loader: StringReplacePlugin.replace({
					replacements: [
						{
							pattern: /#__VERSION__#/ig,
							replacement: function (match, p1, offset, string) {
								return pkg.version;
							}
						}
					]})
			}
		]
	},
	plugins: [
		new StringReplacePlugin(),
		new UglifyJSPlugin({
			include: /\.min\.js$/,
			beautify: false,
			mangle: {
				screw_ie8: true,
				keep_fnames: true
			},
			compress: {
				screw_ie8: true,
				warnings: false
			},
			output: {
				screw_ie8: false
			},
			comments: false,
			sourceMap: true
		})
	]
};
