import MarkdownIt from "markdown-it";

// source: https://dev.to/ankittanna/how-to-create-a-type-for-complex-json-object-in-typescript-d81
export type JSONValue =
    | string
    | number
    | boolean
    | { [x: string]: JSONValue }
    | Array<JSONValue>;

export class TextBundle {
	info: JSONValue;
	text: string;

	constructor(info: JSONValue, text: string) {
		this.info = info;
		this.text = text;
	}

	static fromPath(path: string): TextBundle {
		const decoder = new TextDecoder("utf-8");
		const bundleText = decoder.decode(Deno.readFileSync(`${path}/text.md`));
		const bundleInfo: JSONValue = JSON.parse(decoder.decode(Deno.readFileSync(`${path}/info.json`)));
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
