import { TemplateExtractor } from './template';

describe('TemplateExtractor', function(){

	const expect = require('chai').expect;

	describe('extractObjectProperty()', () => {

		it('should extract templates from object property', () => {
			const te = TemplateExtractor.fromString('foo({template: "<b>foo</b>"})');
			expect(te.extractObjectProperty('template')).to.deep.equal([
				{data: '<b>foo</b>', filename: null, line: 1, column: 16},
			]);
		});

		it('should handle single quotes', () => {
			const te = TemplateExtractor.fromString('foo({template: \'<b>foo</b>\'})');
			expect(te.extractObjectProperty('template')).to.deep.equal([
				{data: '<b>foo</b>', filename: null, line: 1, column: 16},
			]);
		});

		it('should handle double quotes', () => {
			const te = TemplateExtractor.fromString('foo({template: "<b>foo</b>"})');
			expect(te.extractObjectProperty('template')).to.deep.equal([
				{data: '<b>foo</b>', filename: null, line: 1, column: 16},
			]);
		});

		it('should handle template literal', () => {
			const te = TemplateExtractor.fromString('foo({template: `<b>${foo}</b>`})');
			expect(te.extractObjectProperty('template')).to.deep.equal([
				{data: '<b>      </b>', filename: null, line: 1, column: 16},
			]);
		});

		it('should handle tagged template', () => {
			const te = TemplateExtractor.fromString('foo({template: foo`<b>${foo}</b>`})');
			expect(te.extractObjectProperty('template')).to.deep.equal([
				{data: '<b>      </b>', filename: null, line: 1, column: 19},
			]);
		});

	});

	it('should extract from file', () => {
		const te = TemplateExtractor.fromFilename('test-files/extract.js');
		expect(te.extractObjectProperty('template')).to.deep.equal([
			{data: '<p>foo</i>', filename: null, line: 4, column: 13},
			{data: '<b>foo</b>', filename: null, line: 9, column: 12},
			{data: '<p>foo</p>', filename: null, line: 13, column: 12},
		]);
	});

});
