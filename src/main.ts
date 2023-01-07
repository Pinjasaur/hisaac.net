import { TextBundle } from "./TextBundle.ts";

import { parse } from "flags";
import slugify from "slugify";
import MarkdownIt from "markdown-it";
import { walkSync } from "fs";
import { renderFile, configure } from "eta";

const parsedArgs = parse(Deno.args);

await Deno.remove("dist", { recursive: true });
await Deno.mkdir("dist", { recursive: true });

// Configure Eta
configure({
	views: "site/templates",
})

const postsDir = "site/blog";
const postsWalker = walkSync(postsDir);

for (const post of postsWalker) {
	if (post.path.endsWith(".textbundle")) {
		// postTextBundles.push(TextBundle.fromPath(post.path));
		const bundle = TextBundle.fromPath(post.path);
		const postHTML = renderFile("base.eta", {
			title: bundle.info.title,
			description: bundle.info.date,
			content: bundle.text,
		});

		const postSlug = slugify(bundle.info.title);
		const postPath = `./dist/${postSlug}.html`;

		const postHTMLResolved = await Promise.resolve(postHTML);
		if (postHTMLResolved) {
			console.log(`Rendered ${postSlug}.html`);
			Deno.writeTextFileSync(postPath, postHTMLResolved);
		}
	}
}
