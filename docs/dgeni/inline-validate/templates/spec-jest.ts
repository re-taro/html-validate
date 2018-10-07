import HtmlValidate from '{$ doc.fileInfo.docRoot $}/../src/htmlvalidate';

const markup = {};
{%- for validation in doc.validations %}
markup["{$ validation.name $}"] = `{$ validation.markup $}`;
{%- endfor %}

describe('{$ doc.fileInfo.fullpath $}', () => {
{%- for validation in doc.validations %}
	it('inline validation: {$ validation.name $}', () => {
		const htmlvalidate = new HtmlValidate({$ validation.config | dump $});
		const report = htmlvalidate.validateString(markup["{$ validation.name $}"]);
		expect(report.results).toMatchSnapshot();
	});
{%- endfor %}
});
