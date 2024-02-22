(function(t){function s(i){return RegExp("(^(?:"+i+"):[ 	]*(?![ 	]))[^]+","i")}t.languages.http={"request-line":{pattern:/^(?:CONNECT|DELETE|GET|HEAD|OPTIONS|PATCH|POST|PRI|PUT|SEARCH|TRACE)\s(?:https?:\/\/|\/)\S*\sHTTP\/[\d.]+/m,inside:{method:{pattern:/^[A-Z]+\b/,alias:"property"},"request-target":{pattern:/^(\s)(?:https?:\/\/|\/)\S*(?=\s)/,lookbehind:!0,alias:"url",inside:t.languages.uri},"http-version":{pattern:/^(\s)HTTP\/[\d.]+/,lookbehind:!0,alias:"property"}}},"response-status":{pattern:/^HTTP\/[\d.]+ \d+ .+/m,inside:{"http-version":{pattern:/^HTTP\/[\d.]+/,alias:"property"},"status-code":{pattern:/^(\s)\d+(?=\s)/,lookbehind:!0,alias:"number"},"reason-phrase":{pattern:/^(\s).+/,lookbehind:!0,alias:"string"}}},header:{pattern:/^[\w-]+:.+(?:(?:\r\n?|\n)[ \t].+)*/m,inside:{"header-value":[{pattern:s("Content-Security-Policy"),lookbehind:!0,alias:["csp","languages-csp"],inside:t.languages.csp},{pattern:s("Public-Key-Pins(?:-Report-Only)?"),lookbehind:!0,alias:["hpkp","languages-hpkp"],inside:t.languages.hpkp},{pattern:s("Strict-Transport-Security"),lookbehind:!0,alias:["hsts","languages-hsts"],inside:t.languages.hsts},{pattern:s("[^:]+"),lookbehind:!0}],"header-name":{pattern:/^[^:]+/,alias:"keyword"},punctuation:/^:/}}};var n,a=t.languages,r={"application/javascript":a.javascript,"application/json":a.json||a.javascript,"application/xml":a.xml,"text/xml":a.xml,"text/html":a.html,"text/css":a.css,"text/plain":a.plain},p={"application/json":!0,"application/xml":!0};function l(i){var d=i.replace(/^[a-z]+\//,"");return"(?:"+i+"|\\w+/(?:[\\w.-]+\\+)+"+d+"(?![+\\w.-]))"}for(var e in r)if(r[e]){n=n||{};var o=p[e]?l(e):e;n[e.replace(/\//g,"-")]={pattern:RegExp("(content-type:\\s*"+o+`(?:(?:\r
?|
)[\\w-].*)*(?:\r(?:
|(?!
))|
))[^ 	\\w-][^]*`,"i"),lookbehind:!0,inside:r[e]}}n&&t.languages.insertBefore("http","header",n)})(Prism);
