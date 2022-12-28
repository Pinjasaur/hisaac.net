const path = require("path");
// https://nodejs.org/api/util.html#util_util_inspect_object_options
const inspect = require("util").inspect;

const { DateTime } = require("luxon");

const Image = require("@11ty/eleventy-img");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginNavigation = require("@11ty/eleventy-navigation");
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

module.exports = function (eleventyConfig) {
	eleventyConfig.ignores.add("README.md");

	// Copy the `img` and `css` folders to the output
	eleventyConfig.setServerPassthroughCopyBehavior("copy");
	eleventyConfig.addPassthroughCopy({ "src/public/": "/" });

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
		return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat(
			"yyyy-LL-dd"
		);
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
	eleventyConfig.addShortcode("link", linkShortcode);

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
	// Prepends the image src with the full directory inputPath
	let imageSrc = `${path.dirname(this.page.inputPath)}/${src}`;

	let options = {
		outputDir: path.dirname(this.page.outputPath),
		urlPath: this.page.url,
	};

	if (imageSrc.endsWith(".gif") || imageSrc.endsWith(".webp")) {
		options.formats = ["webp"];
		options.sharpOptions = {
			animated: true,
			limitInputPixels: false,
		};
	}

	Image(imageSrc, options);

	let imageAttributes = {
		alt,
		loading: "lazy",
		decoding: "async",
	};

	let metadata = Image.statsSync(imageSrc, options);
	let imageHTML = Image.generateHTML(metadata, imageAttributes);

	if (caption) {
		return `
			<figure>
				${imageHTML}
				<figcaption>${caption}</figcaption>
			</figure>
		`;
	} else {
		return `
			<figure>
				${imageHTML}
			</figure>
		`;
	}
}

function linkShortcode(collection, fileSlug) {
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
