// npm install ohm-js
const grammar = `
Tokens {
  Tokens = Token+
  Token = comment | string | whiteSpace | symbol | integer | character
  comment = percent (~newline anyChar)* newline
  string = quote (~quote anyChar)* quote
  whiteSpace = ws+
  symbol = symbolFirst symbolMore*
  integer = num+
  character = any
  
  percent = "%"
  newline = "\\n"
  quote = "\\""
  ws = " " | "\\t"
  symbolFirst = "A" .. "Z" | "a" .. "z"
  symbolMore = num | symbolFirst
  num = "0" .. "9"
  anyChar = any
}`;

function tokenize (text) {
    var ohm = require ('ohm-js');
    var parser = ohm.grammar (grammar);
    var result = parser.match (text);
    if (result.succeeded ()) {
	console.log ("ohm matching succeeded");
	var semantics = parser.createSemantics ();
	addSem (semantics);
	var result = semantics (result).token ();
	return result;
    } else {
	console.log (diagramParser.trace (text).toString ());
	throw "Ohm matching failed";
    }
}

var btoa = require ('btoa');

function addSem (sem) {
    line = 1;
    offset = 1;
    sem.addOperation (
    "token",
    {
	Tokens: function (_1s) { return _1s.token ().join ("\n"); },
	Token: function (_1) { return _1.token (); },
	comment: function (_1, _2s, _3) { return `token comment ${btoa (_2s.token ().join (''))} line[${line}] pos[${offset}]`; },
	string: function (_1, _2, _3) { return `token string ${btoa (_2s.token ().join (''))} line[${line}] pos[${offset}]`; },
	whiteSpace: function (_1) { return _1.token (); },
	symbol: function (_1, _2s) { return `token symbol ${btoa (_1.token ())}${btoa (_2s.token ().join (''))} line[${line}] pos[${offset}]`; },
	integer : function (_1) { return `token symbol ${btoa (_1.token ())} line[${line}] pos[${offset}]`; },
	character: function (_1) { return `token character ${btoa (_1.token ())} line[${line}] pos[${offset}]`; },

        percent: function (_1) { offset += 1; return "%"; },
        newline: function (_1) { offset = 1; line += 1; return "\n"; },
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
    var text = getJSON("-");
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
