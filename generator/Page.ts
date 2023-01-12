import { exists } from "./utils.ts";

import MarkdownIt from "markdown-it";

// deno-lint-ignore no-explicit-any
type DataObject = { [key: string]: any };

export class Page {
	title: string;
	content: string;
	assetsDir?: string;

	metadata?: DataObject;

	constructor(
		title: string,
		content: string,
		metadata: DataObject,
		assetsDir?: string,
	) {
		this.title = title;
		this.content = content;
		this.metadata = metadata;
		this.assetsDir = assetsDir;
	}

	static fromTextBundle(path: string): Page {
		const decoder = new TextDecoder("utf-8");
		const bundleText = decoder.decode(Deno.readFileSync(`${path}/text.md`));

		const bundleInfoText = decoder.decode(Deno.readFileSync(`${path}/info.json`))
		const bundleInfo = JSON.parse(bundleInfoText) as DataObject;
		const metadata = bundleInfo["net.hisaac.generator"];

		const assetsDir = `${path}/assets`;
		const assetsDirExists = exists(assetsDir);

		return new Page(
			metadata.title,
			bundleText,
			metadata,
			assetsDirExists ? assetsDir : undefined,
		)
	}

	get html(): string {
		const md = MarkdownIt({
			html: true,
			linkify: true,
			typographer: true
		});
		return md.render(this.content);
	}
}
