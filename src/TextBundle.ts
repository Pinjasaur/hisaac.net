import MarkdownIt from "markdown-it";
import { walkSync } from "fs";

export interface Post {
	info: any;
	text: string;
	assets: string[];
}

export class TextBundle implements Post {
	info: any;
	text: string;
	assets: string[];

	constructor(info: any, text: string, assets: string[] = []) {
		this.info = info;
		this.text = text;
		this.assets = assets;
	}

	static fromPath(path: string): TextBundle {
		const decoder = new TextDecoder("utf-8");
		const bundleText = decoder.decode(Deno.readFileSync(`${path}/text.md`));
		const bundleInfo = JSON.parse(decoder.decode(Deno.readFileSync(`${path}/info.json`)));

		const bundleAssets: string[] = [];

		try {
			const bundleAssetsDir = `${path}/assets`;
			const bundleAssetsWalker = walkSync(bundleAssetsDir, { includeDirs: false });
			for (const asset of bundleAssetsWalker) {
				bundleAssets.push(asset.path);
			}
		} catch (error) {
			if (!!error.message.startsWith("No such file or directory (os error 2)") === false) {
				throw error;
			}
		}

		return new TextBundle(bundleInfo, bundleText, bundleAssets);
	}

	get html(): string {
		const md = MarkdownIt({
			html: true,
			linkify: true,
			typographer: true
		});
		return md.render(this.text);
	}
}
