import path from "path";
import {fileURLToPath} from "url";
import {merge} from "webpack-merge";
import common from "./webpack.common.js";


const dirname = path.dirname(fileURLToPath(import.meta.url));

export default merge(common, {
	mode: "development",
	devtool: "eval-source-map",
	devServer: {
		static: {
			directory: path.join(dirname, "../dist")
		},
		hot: true
	}
});
