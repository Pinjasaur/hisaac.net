import { Page } from "./Page.ts";

import { parse } from "flags";
import slugify from "slugify";
import { copySync, emptyDirSync, ensureDirSync, walkSync } from "fs";
import { renderFile, configure } from "eta";

const parsedArgs = parse(Deno.args);

// Clean dist directory
emptyDirSync("dist");
ensureDirSync("dist");
ensureDirSync("dist/blog");

// Configure Eta
configure({
	views: [
		"site/templates",
		"site/templates/includes",
		"site/templates/partials",
	],
})

const blogDir = "site/blog";
const blogDirWalker = walkSync(blogDir);
for (const item of blogDirWalker) {
	if (!item.path.endsWith(".textbundle")) { continue; }

	const blogPost = Page.fromTextBundle(item.path);
	const postHTML = renderFile("base.eta", {
		title: blogPost.title,
		description: blogPost.metadata?.description,
		date: blogPost.metadata?.date,
		content: blogPost.html,
	});

	const postSlug = slugify(blogPost.title);
	const postDir = `./dist/blog/${postSlug}`;
	ensureDirSync(postDir);

	if (!postHTML) { continue; }
	const postHTMLResolved = await Promise.resolve(postHTML);
	const postPath = `${postDir}/index.html`;
	Deno.writeTextFileSync(postPath, postHTMLResolved);
	console.log(`Rendered ${postSlug}.html`);

	// Copy assets if they exist
	if (!blogPost.assetsDir) { continue; }
	copySync(blogPost.assetsDir, `${postDir}/assets`);
	console.log(`Copied assets for ${postSlug}`);
}
