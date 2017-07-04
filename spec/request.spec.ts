/// <reference path='../typings/globals/mocha/index.d.ts'/>
import Request from '../src/request';
import { assert as assert } from 'chai';

describe('Request', function () 
{  
    it('ToString() - method + path', function () 
    {
        let request = new Request('GET', '/path', {}, '');

        let expected = 'GET /path';

        assert.equal(request.toString(), expected);
    });

    it('ToString() - method + path + headers', function () 
    {
        let request = new Request('GET', '/path', {'Content-Type':'plain/text'}, '');

        let expected = 'GET /path\n' +
                       'Content-Type: plain/text\n\n';

        assert.equal(request.toString(), expected);
    });

    it('ToString() - method + path + body', function () 
    {
        let request = new Request('GET', '/path', {}, 'Hello, \n World!');

        let expected = 'GET /path\n\n' +
                       'Hello, \n World!';

        assert.equal(request.toString(), expected);
    });

    it('ToString() - method + path + headers + body', function () 
    {
        let request = new Request('GET', '/path', {'Content-Type':'plain/text'}, 'Hello, World!');

        let expected = 'GET /path\n' +
                       'Content-Type: plain/text\n\n' +
                       'Hello, World!';

        assert.equal(request.toString(), expected);
    });

    it('parse() - method + path', function () 
    {
        let data = 'GET /path?q=1&q=2';

        let request = Request.parse(data);

        assert.equal(request.method, 'GET');
        assert.equal(request.path, '/path?q=1&q=2');
        assert.isEmpty(request.headers);
        assert.equal(request.body.length, 0);
    });

    it('parse() - method + path + headers', function () 
    {
        let data = 'GET /path?q=1&q=2\n' +
                   'Content-Type: plain/text\n' +
                   'X-Header: X-Value';

        let request = Request.parse(data);
        
        assert.equal(request.method, 'GET');
        assert.equal(request.path, '/path?q=1&q=2');
        assert.equal(request.headers['Content-Type'], 'plain/text');
        assert.equal(request.headers['X-Header'], 'X-Value');
        assert.equal(request.body.length, 0);
    });

    it('parse() - method + path + empty body', function () 
    {
        let data = 'GET /path?q=1&q=2\n\n';

        let request = Request.parse(data);
        
        assert.equal(request.method, 'GET');
        assert.equal(request.path, '/path?q=1&q=2');
        assert.isEmpty(request.headers);
        assert.equal(request.body.length, '');
    });

    it('parse() - method + path + body', function () 
    {
        let data = 'GET /path?q=1&q=2\n\n' +
                   '  Hi there!  ';

        let request = Request.parse(data);
        
        assert.equal(request.method, 'GET');
        assert.equal(request.path, '/path?q=1&q=2');
        assert.isEmpty(request.headers);
        assert.equal(request.body, '  Hi there!  ');
    });

    it('parse() - method + path + headers + a single-line body', function () 
    {
        let data = 'GET /path?q=1&q=2\n' +
                   'Content-Type: plain/text\n\n' +
                   'Hello, World!';

        let request = Request.parse(data);
        
        assert.equal(request.method, 'GET');
        assert.equal(request.headers['Content-Type'], 'plain/text');
        assert.equal(request.body, 'Hello, World!');
    });

    it('parse() - method + path + headers + a multi-lines body', function () 
    {
        let data = 'GET /path?q=1&q=2\n' +
                   'Content-Type: plain/text\n\n' +
                   '\n\nHello, \n World!\n\n';

        let request = Request.parse(data);
        
        assert.equal(request.method, 'GET');
        assert.equal(request.headers['Content-Type'], 'plain/text');
        assert.equal(request.body, '\n\nHello, \n World!\n\n');
    });

    it('parse() - invalid', function () 
    {
        let data = 'GET: /index.html';

        assert.throw(()=>{Request.parse(data);}, SyntaxError, 'Line 1: Invalid HTTP request.  Expected a method and a path.  Found: GET: /index.html');
    });

    it('parse() - method + path + headers - invalid', function () 
    {
        let data = 'GET /path?q=1&q=2\n' +
                   'Content-Type: plain/text\n' +
                   'X-Header1 X-Value1\n' +
                   'X-Header2: X-Value2';

        assert.throw(()=>{Request.parse(data);}, SyntaxError, "Line 3: Invalid HTTP request. A header field is malformed. Found: 'X-Header1 X-Value1'");
    });
});