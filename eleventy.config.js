const fs = require("fs");
const inspect = require("util").inspect;
const path = require("path");

// Official 11ty plugins
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const pluginNavigation = require("@11ty/eleventy-navigation");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

// Other node modules
const { DateTime } = require("luxon");
const beautify_html = require("js-beautify").html;

module.exports = function (eleventyConfig) {
	eleventyConfig.ignores.add("README.md");

	eleventyConfig.setServerOptions({
		module: "@11ty/eleventy-server-browsersync",
	});

	eleventyConfig.setServerPassthroughCopyBehavior("copy");
	eleventyConfig.addPassthroughCopy({ "src/public/": "/" });

	eleventyConfig.addTransform("htmlPrettify", function (content) {
		if (!this.page.outputPath || !this.page.outputPath.endsWith(".html")) {
			return content;
		}

		return beautify_html(content, {
			indent_with_tabs: true,
			end_with_newline: true,
		});
	});

	eleventyConfig.addTransform("pageAssets", function (content) {
		if (!this.page.outputPath || !this.page.outputPath.endsWith(".html")) {
			return content;
		}

		const inputDir = path.dirname(this.page.inputPath);
		const outputDir = path.dirname(this.page.outputPath);
		const inputAssetsDir = path.join(inputDir, "assets");
		const outputAssetsDir = path.join(outputDir, "assets");

		if (
			!fs.existsSync(inputAssetsDir) ||
			!fs.statSync(inputAssetsDir).isDirectory()
		) {
			return content;
		}

		fs.cpSync(inputAssetsDir, outputAssetsDir, { recursive: true });

		return content;
	});

	// Add plugins
	eleventyConfig.addPlugin(pluginRss);
	eleventyConfig.addPlugin(pluginSyntaxHighlight);
	eleventyConfig.addPlugin(pluginNavigation);
	eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

	// Return the smallest number argument
	eleventyConfig.addFilter("min", (...numbers) => {
		return Math.min.apply(null, numbers);
	});

	// Get the first `n` elements of a collection.
	eleventyConfig.addFilter("head", (array, n) => {
		if (!Array.isArray(array) || array.length === 0) {
			return [];
		}
		if (n < 0) {
			return array.slice(n);
		}
		return array.slice(0, n);
	});

	// https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
	eleventyConfig.addFilter("htmlDateString", (dateObj) => {
		return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
	});

	eleventyConfig.addFilter("readableDate", (dateObj) => {
		return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat(
			"dd LLLL yyyy"
		);
	});

	eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
		return (tags || []).filter(
			(tag) => ["all", "nav", "post", "posts"].indexOf(tag) === -1
		);
	});

	eleventyConfig.addFilter("debug", (content) => {
		return inspect(content);
	});

	eleventyConfig.addShortcode("image", imageShortcode);
	eleventyConfig.addShortcode("video", videoShortcode);
	eleventyConfig.addShortcode("audio", audioShortcode);
	eleventyConfig.addShortcode("internalLink", internalLinkShortcode);

	eleventyConfig.addShortcode("silentLoopingVideo", (src, caption) => {
		return videoShortcode(src, caption, `autoplay loop muted`);
	});

	return {
		// Pre-process *.md files with: (default: `liquid`)
		markdownTemplateEngine: "njk",

		// Pre-process *.html files with: (default: `liquid`)
		htmlTemplateEngine: "njk",

		dir: {
			input: "src",
		},
	};
};

function imageShortcode(src, alt, caption) {
	const encodedURI = encodeURI(src);
	return figure(`
		<picture>
			<source srcset="assets/${encodedURI}">
			<img alt="${alt}" src="assets/${encodedURI}">
		</picture>`,
		caption
	);
}

function videoShortcode(src, caption, attributes) {
	let type = "";
	if (src.endsWith(".mp4")) {
		type = "type='video/mp4'";
	} else if (src.endsWith(".webm")) {
		type = "type='video/webm' codecs='vp9'";
	} else if (src.endsWith(".ogg")) {
		type = "type='video/ogg'";
	}

	return figure(`
		<video ${attributes}>
			<source src="assets/${src}" ${type}>
			Your browser does not support the video tag.
		</video>`,
		caption
	);
}

function audioShortcode(src, caption) {
	return figure(`
		<audio controls>
			<source src="assets/${src}">
			Your browser does not support the audio tag.
		</audio>`,
		caption
	);
}

function figure(element, caption) {
	var html = `<figure>${element}`;
	if (caption) {
		html += `<figcaption>${caption}</figcaption>`;
	}
	html += `</figure>`;
	return html;
}

function internalLinkShortcode(fileSlug, collection) {
	// Validate the inputs
	if (collection.length < 1) {
		throw `Collection ${collection} appears to be empty`;
	}
	if (!Array.isArray(collection)) {
		throw `Collection ${collection} is not an array`;
	}
	if (typeof fileSlug !== "string") {
		throw `fileSlug ${fileSlug} is not a string`;
	}

	// Find the item in the collection that matches the filename
	const item = collection.find((item) => item.fileSlug === fileSlug);
	if (!item) {
		throw `Could not find item with fileSlug ${fileSlug} in collection ${collection}`;
	} else {
		return item.url;
	}
}
