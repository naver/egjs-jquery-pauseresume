var webpack = require("webpack");
var CleanWebpackPlugin = require("clean-webpack-plugin");
var WriteFilePlugin = require("write-file-webpack-plugin");
var banner = require("./config/banner");
var config = require("./config/webpack");
var path = require("path");

module.exports = function(env) {
	env = env || {};

	if(/pkgd/.test(env.mode)) {
		config.externals = [];
	}

	if(!/server/.test(env.mode)) {
		config.module.rules.push({
			test: /(\.js)$/,
			loader: "eslint-loader",
			include: path.resolve(process.cwd(), "src"),
			exclude: /(node_modules)/,
			enforce: "pre"
		});
	}

	if(env.mode === "production") {
		for(var p in config.entry) {
			config.entry[p + ".min"] = config.entry[p];
		}
		config.plugins.push(
			new CleanWebpackPlugin(["dist"], {
				root: path.resolve(__dirname),
				verbose: true,
				dry: false
			}),
			new webpack.optimize.UglifyJsPlugin({
				include: /\.min\.js$/,
				minimize: true
			}),
			new webpack.BannerPlugin(banner.common)
		);
	} else if(env.mode === "pkgd") {
		for(var p in config.entry) {
			config.entry[p + ".pkgd"] = config.entry[p];
			config.entry[p + ".pkgd.min"] = config.entry[p];
			delete config.entry[p];
		}
		config.plugins.push(
			new webpack.optimize.UglifyJsPlugin({
				include: /\.min\.js$/,
				minimize: true
			}), new webpack.BannerPlugin(banner.pkgd)
		);
	} else {
		config.plugins.push(new WriteFilePlugin());
	}

	return config;
};
