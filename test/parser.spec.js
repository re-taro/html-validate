'use strict';

var expect = require('chai').expect;
var HtmlLint = require('../src/htmllint');

describe('parser', function(){

	var events;
	var htmllint;

	before(function(){
		htmllint = new HtmlLint();
		htmllint.addListener('*', function(event){
			if ( ['tag:open', 'tag:close'].indexOf(event.event) >= 0 ){
				events.push({
					event: event.event,
					tagName: event.target ? event.target.tagName : undefined,
				});
			}
			if ( ['attr'].indexOf(event.event) >= 0 ){
				events.push({
					event: event.event,
					key: event.key,
					value: event.value,
				});
			}
		});
	});

	beforeEach(function(){
		events = [];
	});

	describe('should parse elements', function(){

		it('simple element', function(){
			expect(htmllint.string('<div></div>')).to.be.true;
			expect(events).to.have.lengthOf(2);
			expect(events[0]).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events[1]).to.deep.equal({event: 'tag:close', tagName: 'div'});
		});

		it('with numbers', function(){
			expect(htmllint.string('<h1></h1>')).to.be.true;
			expect(events).to.have.lengthOf(2);
			expect(events[0]).to.deep.equal({event: 'tag:open', tagName: 'h1'});
			expect(events[1]).to.deep.equal({event: 'tag:close', tagName: 'h1'});
		});

		it('with dashes', function(){
			expect(htmllint.string('<foo-bar></foo-bar>')).to.be.true;
			expect(events).to.have.lengthOf(2);
			expect(events[0]).to.deep.equal({event: 'tag:open', tagName: 'foo-bar'});
			expect(events[1]).to.deep.equal({event: 'tag:close', tagName: 'foo-bar'});
		});

		it('elements closed on wrong order', function(){
			expect(htmllint.string('<div><p></div></p>')).to.be.true;
			expect(events).to.have.lengthOf(4);
			expect(events[0]).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events[1]).to.deep.equal({event: 'tag:open', tagName: 'p'});
			expect(events[2]).to.deep.equal({event: 'tag:close', tagName: 'div'});
			expect(events[3]).to.deep.equal({event: 'tag:close', tagName: 'p'});
		});

		it('self-closing elements', function(){
			expect(htmllint.string('<input/>')).to.be.true;
		});

		it('void elements', function(){
			expect(htmllint.string('<input>')).to.be.true;
		});

		it('with text node', function(){
			expect(htmllint.string('<p>Lorem ipsum</p>')).to.be.true;
		});

		it('with trailing text', function(){
			expect(htmllint.string('<p>Lorem ipsum</p>\n')).to.be.true;
		});

	});

	describe('should parse attributes', function(){

		it('with single quotes', function(){
			expect(htmllint.string('<div foo=\'bar\'></div>')).to.be.true;
			expect(events).to.have.lengthOf(3);
			expect(events[0]).to.deep.equal({event: 'attr', key: 'foo', value: 'bar'});
			expect(events[1]).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events[2]).to.deep.equal({event: 'tag:close', tagName: 'div'});
		});

		it('with double quote', function(){
			expect(htmllint.string('<div foo="bar"></div>')).to.be.true;
			expect(events).to.have.lengthOf(3);
			expect(events[0]).to.deep.equal({event: 'attr', key: 'foo', value: 'bar'});
			expect(events[1]).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events[2]).to.deep.equal({event: 'tag:close', tagName: 'div'});
		});

		it('with nested quotes', function(){
			expect(htmllint.string('<div foo=\'"\' bar="\'"></div>')).to.be.true;
			expect(events).to.have.lengthOf(4);
			expect(events[0]).to.deep.equal({event: 'attr', key: 'foo', value: '"'});
			expect(events[1]).to.deep.equal({event: 'attr', key: 'bar', value: "'"});
			expect(events[2]).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events[3]).to.deep.equal({event: 'tag:close', tagName: 'div'});
		});

		it('without value', function(){
			expect(htmllint.string('<div foo></div>')).to.be.true;
			expect(events).to.have.lengthOf(3);
			expect(events[0]).to.deep.equal({event: 'attr', key: 'foo', value: undefined});
			expect(events[1]).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events[2]).to.deep.equal({event: 'tag:close', tagName: 'div'});
		});

		it('with dashes', function(){
			expect(htmllint.string('<div foo-bar-baz></div>')).to.be.true;
			expect(events).to.have.lengthOf(3);
			expect(events[0]).to.deep.equal({event: 'attr', key: 'foo-bar-baz', value: undefined});
			expect(events[1]).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events[2]).to.deep.equal({event: 'tag:close', tagName: 'div'});
		});

		it('with spaces inside', function(){
			expect(htmllint.string('<div class="foo bar baz"></div>')).to.be.true;
			expect(events).to.have.lengthOf(3);
			expect(events[0]).to.deep.equal({event: 'attr', key: 'class', value: 'foo bar baz'});
			expect(events[1]).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events[2]).to.deep.equal({event: 'tag:close', tagName: 'div'});
		});

		it('with multiple attributes', function(){
			expect(htmllint.string('<div foo="bar" spam="ham"></div>')).to.be.true;
			expect(events).to.have.lengthOf(4);
			expect(events[0]).to.deep.equal({event: 'attr', key: 'foo', value: 'bar'});
			expect(events[1]).to.deep.equal({event: 'attr', key: 'spam', value: 'ham'});
			expect(events[2]).to.deep.equal({event: 'tag:open', tagName: 'div'});
			expect(events[3]).to.deep.equal({event: 'tag:close', tagName: 'div'});
		});

	});

});
