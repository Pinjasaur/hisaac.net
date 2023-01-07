import { TextBundle } from "./TextBundle.ts";

import { parse } from "flags";
import slugify from "slugify";
import MarkdownIt from "markdown-it";
import {
	copySync,
	emptyDirSync,
	ensureDirSync,
	walkSync,
} from "fs";
import { renderFile, configure } from "eta";

const parsedArgs = parse(Deno.args);

emptyDirSync("dist");
ensureDirSync("dist");

// Configure Eta
configure({
	views: "site/templates",
})

const postsDir = "site/blog";
const postsWalker = walkSync(postsDir);

ensureDirSync("dist/blog");
for (const post of postsWalker) {
	if (post.path.endsWith(".textbundle")) {
		const bundle = TextBundle.fromPath(post.path);
		const postHTML = renderFile("base.eta", {
			title: bundle.info.title,
			description: bundle.info.date,
			content: bundle.html,
		});

		const postSlug = slugify(bundle.info.title);
		const postDir = `./dist/blog/${postSlug}`;
		ensureDirSync(postDir);

		if (postHTML) {
			const postHTMLResolved = await Promise.resolve(postHTML);
			const postPath = `${postDir}/index.html`;
			Deno.writeTextFileSync(postPath, postHTMLResolved);
			console.log(`Rendered ${postSlug}.html`);

			// Copy assets if they exist
			try {
				copySync(`${post.path}/assets`, `${postDir}/assets`);
			} catch (error) {
				// Ignore error if there are no assets
				if (!!error.message.startsWith("No such file or directory (os error 2)") === false) {
					throw error;
				}
			} finally {
				console.log(`Copied assets for ${postSlug}`);
			}
		}
	}
}
