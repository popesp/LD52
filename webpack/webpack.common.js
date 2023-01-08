import CopyWebpackPlugin from "copy-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";
import {fileURLToPath} from "url";


const dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
	entry: "./src/main.ts",
	module: {
		rules: [
			{
				test: /\.ts$/u,
				use: "ts-loader",
				exclude: /node_modules/u
			},
			{
				test: /\.css$/u,
				use: ["style-loader", "css-loader"]
			}
		]
	},
	output: {
		filename: "bundle.js",
		path: path.resolve(dirname, "../dist")
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: "LD52"
		}),
		new CopyWebpackPlugin({
			patterns: [{
				from: "assets",
				to: "assets"
			}]
		})
	],
	resolve: {
		extensions: [".ts", ".js"]
	}
};
