import MarkdownIt from "markdown-it";

export class TextBundle {
	info: any;
	text: string;

	constructor(info: any, text: string) {
		this.info = info;
		this.text = text;
	}

	static fromPath(path: string): TextBundle {
		const decoder = new TextDecoder("utf-8");
		const bundleText = decoder.decode(Deno.readFileSync(`${path}/text.md`));
		const bundleInfo = JSON.parse(decoder.decode(Deno.readFileSync(`${path}/info.json`)));
		return new TextBundle(bundleInfo, bundleText);
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
