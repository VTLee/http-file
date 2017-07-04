import IRequest from './iRequest';

enum RequestParsingState
{
    MethodAndPath = 1,
    Headers = 2,
    Body = 3
};

export default class Request implements IRequest
{
    method: string;
    path: string;
    headers: object;
    body: string;

    constructor(method: string, path: string, headers: object, body: string)
    {
        this.method = method;
        this.path = path;
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
        
        return `${this.method} ${this.path}${headersAndBody}`;
    }

    static parse(s:string): IRequest
    {
        let state = RequestParsingState.MethodAndPath;
        let lines = s.split(/\n/);

        if(lines.length === 0) throw new SyntaxError(`Line 1: The given data is not a valid HTTP request file. Found: ${lines[0]}`);

        let method:string, path:string, headers:object = {}, body:string = '';

        for(let i = 0; i < lines.length; i++)
        {
            let line = lines[i].trim();

            if(state === RequestParsingState.MethodAndPath)
            {
                let matches = new RegExp(/^([\w]+) (.*)$/).exec(lines[0].trim());

                if(matches === null) throw new SyntaxError(`Line 1: Invalid HTTP request.  Expected a method and a path.  Found: ${lines[0]}`);

                method = matches[1];
                path = matches[2];

                state = RequestParsingState.Headers;
            }
            else if(state == RequestParsingState.Headers && !line)
            {
                state = RequestParsingState.Body;
            }
            else if(state === RequestParsingState.Headers)
            {
                let matches = new RegExp(/^([^:]+): (.*)$/).exec(lines[i].trim());

                if(matches === null) throw new SyntaxError(`Line ${i+1}: Invalid HTTP request. A header field is malformed. Found: '${lines[i]}'`);

                headers[matches[1]] = matches[2];
            }
            else if(state === RequestParsingState.Body)
            {
                body = lines.slice(i).join('\n');
                break;
            }
            else
            {
                throw new SyntaxError(`Line ${i+1}: HTTP Request syntax error. Found: '${line}'`);
            }
        }

        return new Request(method, path, headers, body);
    }
};