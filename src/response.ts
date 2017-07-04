import IResponse from './iResponse';

enum ResponseParsingState
{
    StatusCode = 1,
    Headers = 2,
    Body = 3
};

export default class Response implements IResponse
{
    statusCode: number;
    headers: object;
    body: string;

    constructor(statusCode: number, headers: object, body: string)
    {
        this.statusCode = statusCode;
        this.headers = headers;
        this.body = body;
    }

    toString():string
    {
        let headers = '';

        for(let key in this.headers)
        {
            headers += `${key}: ${this.headers[key]}\n`;
        }

        let headersAndBody = headers || this.body ? `\n${headers}\n${this.body}` : '';

        return `${this.statusCode}${headersAndBody}`;
    }

    static parse(s:string): IResponse
    {
        let state = ResponseParsingState.StatusCode;
        let lines = s.split(/\n/);

        if(lines.length === 0) throw new SyntaxError(`Line 1: The given data is not a valid HTTP response file. Found: ${lines[0]}`);

        let statusCode:number, headers:object = {}, body:string = '';

        for(let i = 0; i < lines.length; i++)
        {
            let line = lines[i].trim();

            if(state === ResponseParsingState.StatusCode)
            {
                let matches = new RegExp(/^([\d]+)$/).exec(lines[0].trim());

                if(matches === null) throw new SyntaxError(`Line 1: Invalid HTTP response.  Expected a status code.  Found: ${lines[0]}`);

                statusCode = parseInt(matches[1]);

                state = ResponseParsingState.Headers;
            }
            else if(state == ResponseParsingState.Headers && !line)
            {
                state = ResponseParsingState.Body;
            }
            else if(state === ResponseParsingState.Headers)
            {
                let matches = new RegExp(/^([^:]+): (.*)$/).exec(lines[i].trim());

                if(matches === null) throw new SyntaxError(`Line ${i+1}: Invalid HTTP response. A header field is malformed. Found: '${lines[i]}'`);

                headers[matches[1]] = matches[2];
            }
            else if(state === ResponseParsingState.Body)
            {
                body = lines.slice(i).join('\n');
                break;
            }
            else
            {
                throw new SyntaxError(`Line ${i+1}: HTTP Response syntax error. Found: '${lines[i]}`);
            }
        }

        return new Response(statusCode, headers, body);
    }
};