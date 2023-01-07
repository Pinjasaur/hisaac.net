import { TextBundle } from "./TextBundle.ts";

import { parse } from "flags";
import slugify from "slugify";
import MarkdownIt from "markdown-it";
import { walkSync } from "fs";

const postTextBundles: TextBundle[] = [];
const postsDir = "site/blog";
const postsWalker = walkSync(postsDir);
for (const post of postsWalker) {
	if (post.path.endsWith(".textbundle")) {
		postTextBundles.push(TextBundle.fromPath(post.path));
	}
}

console.log(postTextBundles);

const parsedArgs = parse(Deno.args);

await Deno.remove("dist", { recursive: true });
await Deno.mkdir("dist", { recursive: true });
