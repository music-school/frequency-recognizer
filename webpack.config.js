const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, "lib/index.js"),
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "index.js",
    library: "frequencyRecognizer",
    libraryTarget: "umd",
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: "babel-loader"
      },
    ],
	},
	mode: "development",
	resolve: {
		fallback: {
			fs: false
		}
	}
}