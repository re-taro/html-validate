const marked = require("marked");

/**
 * Customized version of dgeni nunjucks renderer with highlighting support
 */
module.exports = function renderMarkdown(trimIndentation) {
	const renderer = new marked.Renderer();

	// remove the leading whitespace from the code block before it gets to the
	// markdown code render function
	renderer.code = function (code, string, language) {
		const trimmedCode = trimIndentation(code);
		let renderedCode = marked.Renderer.prototype.code.call(this, trimmedCode, string, language);

		// Bug in marked - forgets to add a final newline sometimes
		if (!/\n$/.test(renderedCode)) {
			renderedCode += "\n";
		}

		// Add hljs class
		renderedCode = renderedCode.replace(/<code(?: class="(.*?)")?>/, (_, classes) => {
			if (classes) {
				return `<code class="hljs ${classes}">`;
			} else {
				return `<code class="hljs">`;
			}
		});

		return renderedCode;
	};

	// Add § link to all headings
	renderer.heading = function (text, level, raw) {
		const slug = raw
			.toLowerCase()
			.replace(/\(.*?\)/g, "")
			.replace(/[^\w]+/g, "-");
		const id = `${this.options.headerPrefix}${slug}`;
		const anchor =
			level > 1
				? ` <!-- [html-validate-disable-next wcag/h30] --><a class="anchorlink" href="#${id}" aria-hidden="true"></a>`
				: "";
		return `<h${level} id="${id}">${text}${anchor}</h${level}>`;
	};

	const render = function (content) {
		return marked(content, {
			highlight: render.highlight,
			renderer,
		});
	};

	render.highlight = null; /* default */

	return render;
};
