/// <reference path='../typings/globals/mocha/index.d.ts'/>
import Response from '../src/response';
import { assert as assert } from 'chai';

describe('Response', function () 
{  
    it('ToString() - statusCode', function () 
    {
        let response = new Response(200, {}, '');

        let expected = '200';

        assert.equal(response.toString(), expected);
    });

    it('ToString() - statusCode - headers', function () 
    {
        let response = new Response(200, {'Content-Type': 'plain/text', 'X-Header': 'X-Value'}, '');

        let expected = '200\n' +
                       'Content-Type: plain/text\n' +
                       'X-Header: X-Value\n\n';

        assert.equal(response.toString(), expected);
    });

    it('ToString() - statusCode - body', function () 
    {
        let response = new Response(200, {}, 'Hi there!');

        let expected = '200\n\n' +
                       'Hi there!';

        assert.equal(response.toString(), expected);
    });

    it('ToString() - statusCode - headers - body', function () 
    {
        let response = new Response(200, {'Content-Type': 'plain/text', 'X-Header': 'X-Value'}, 'Hi \n there!');

        let expected = '200\n' +
                       'Content-Type: plain/text\n' +
                       'X-Header: X-Value\n\n' +
                       'Hi \n there!';

        assert.equal(response.toString(), expected);
    });

    it('parse() - statusCode', function () 
    {
        let data = '200';

        let response = Response.parse(data);

        assert.equal(response.statusCode, 200);
        assert.isEmpty(response.headers);
        assert.equal(response.body.length, 0);
    });

    it('parse() - statusCode + headers', function () 
    {
        let data = '200\n' +
                   'Content-Type: plain/text\n' +
                   'X-Header: X-Value';

        let response = Response.parse(data);

        assert.equal(response.statusCode, 200);
        assert.equal(response.headers['Content-Type'], 'plain/text');
        assert.equal(response.headers['X-Header'], 'X-Value');
        assert.equal(response.body.length, 0);
    });

    it('parse() - statusCode + body', function () 
    {
        let data = '200\n\n' +
                   'Hi threre';

        let response = Response.parse(data);

        assert.equal(response.statusCode, 200);
        assert.isEmpty(response.headers);
        assert.equal(response.body, 'Hi threre');
    });

    it('parse() - statusCode + headers + empty body', function () 
    {
        let data = '200\n' +
                   'Content-Type: plain/text\n' +
                   'X-Header: X-Value\n\n';

        let response = Response.parse(data);

        assert.equal(response.statusCode, 200);
        assert.equal(response.headers['Content-Type'], 'plain/text');
        assert.equal(response.headers['X-Header'], 'X-Value');
        assert.equal(response.body.length, 0);
    });

    it('parse() - statusCode + headers + a single-line body', function () 
    {
        let data = '200\n' +
                   'Content-Type: plain/text\n\n' +
                   ' Hi there! ';

        let response = Response.parse(data);

        assert.equal(response.statusCode, 200);
        assert.equal(response.headers['Content-Type'], 'plain/text');
        assert.equal(response.body, ' Hi there! ');
    });

    it('parse() - statusCode + headers + a multi-lines body', function () 
    {
        let data = '200\n' +
                   'Content-Type: plain/text\n\n' +
                   ' \n\n Hi \n\n there! \n\n ';

        let response = Response.parse(data);

        assert.equal(response.statusCode, 200);
        assert.equal(response.headers['Content-Type'], 'plain/text');
        assert.equal(response.body, ' \n\n Hi \n\n there! \n\n ');
    });

    it('parse() - statusCode - invalid', function () 
    {
        let data = '200X';

        assert.throw(()=>{Response.parse(data);}, SyntaxError, 'Line 1: Invalid HTTP response.  Expected a status code.  Found: 200X');
    });

    it('parse() - statusCode + headers - invalid', function () 
    {
        let data = '200\n' +
                   'Content-Type: plain/text\n' +
                   'X-Header1 X-Value1\n' +
                   'X-Header2: X-Value2';

        assert.throw(()=>{Response.parse(data);}, SyntaxError, "Line 3: Invalid HTTP response. A header field is malformed. Found: \'X-Header1 X-Value1\'");
    });
});