// npm install ohm-js
const grammar = `
Tokens {
  tokens = token+
  token = comment | string | whiteSpace | symbol | integer | character
  comment = percent (~newline anyChar)* newline
  string = quote (~quote anyChar)* quote
  whiteSpace = ws+
  symbol = symbolFirst symbolMore*
  integer = num+
  character = newline | any
  
  percent = "%"
  newline = "\\n"
  quote = "\\""
  ws = " " | "\\t"
  symbolFirst = "A" .. "Z" | "a" .. "z"
  symbolMore = num | symbolFirst
  num = "0" .. "9"
  anyChar = any
}`;

var line;
var offset;

function tokenize (text) {
    var ohm = require ('ohm-js');
    var parser = ohm.grammar (grammar);
    var result = parser.match (text);
    if (result.succeeded ()) {
	var semantics = parser.createSemantics ();
	addSem (semantics);
	line = 1;
	offset = 1;
	var result = semantics (result).token ();
	return result;
    } else {
	console.log (parser.trace (text).toString ());
	throw "Ohm matching failed";
    }
}

function addSem (sem) {
    line = 1;
    offset = 1;
    sem.addOperation (
    "token",
    {
	tokens: function (_1s) { return _1s.token ().join ("\n"); },
	token: function (_1) { return _1.token (); },
	comment: function (_1, _2s, _3) { return `token comment ${encodeURIComponent (_2s.token ().join (''))} line[${line}] pos[${offset}]`; },
	string: function (_1, _2, _3) { return `token string ${encodeURIComponent (_2s.token ().join (''))} line[${line}] pos[${offset}]`; },
	whiteSpace: function (_1) { return _1.token (); },
	symbol: function (_1, _2s) { return `token symbol ${encodeURIComponent (_1.token ())}${encodeURIComponent (_2s.token ().join (''))} line[${line}] pos[${offset}]`; },
	integer : function (_1) { return `token symbol ${encodeURIComponent (_1.token ())} line[${line}] pos[${offset}]`; },
	character: function (_1) { return `token character ${encodeURIComponent (_1.token ())} line[${line}] pos[${offset}]`; },

        percent: function (_1) { offset += 1; return "%"; },
        newline: function (_1) {
	    console.log (line);
	    console.log (offset);
            offset = 1; 
            line += 1; 
            return "\n"; },
        quote: function (_1) { offset += 1; return "\""; },
        ws: function (_1) { offset += 1; return this.primitiveValue; },
        symbolFirst: function (_1) { offset += 1; return _1.token (); },
        symbolMore: function (_1) { offset += 1; return _1.token (); },
        num: function (_1) { offset += 1; return _1.token (); },
        anyChar: function (_1) { offset += 1; return _1.token (); },
	_terminal: function () { return this.primitiveValue; }
    }
    );
}

function main () {
    var text = getJSON("test.txt");
    var parsed = tokenize (text);
    return parsed;
}



var fs = require ('fs');

function getNamedFile (fname) {
    if (fname === undefined || fname === null || fname === "-") {
	return fs.readFileSync (0, 'utf-8');
    } else {
	return fs.readFileSync (fname, 'utf-8');
    }	
}

function getJSON (fname) {
    var s = getNamedFile (fname);
    return s;
    return (JSON.parse (s));
}


var result = main ();
console.log(result);
