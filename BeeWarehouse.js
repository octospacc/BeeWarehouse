const fs = require('fs');
const request = require('sync-request');
const dom = require('@xmldom/xmldom').DOMParser;
const xpath = require('xpath');

const FunctToEvalString = (Funct) => Funct.toString().split('{').slice(1).join('{').split('}').slice(0, -1).join('}');

const LoadScrapersText = (Xml) => {
	let Final = {};
	let Parsed = new dom().parseFromString(Xml, 'text/xml');
	let Scrapers = xpath.select('/scrapers/scraper', Parsed);
	for (let Scraper of Scrapers) {
		if (Scraper.getAttribute('inherit')) {
			
		};
		let Name = Scraper.getAttribute('name');
		Final[Name] = {
			ApiUrl: Scraper.getAttribute('apiurl'),
			Functions: {},
		};
		let Funktions = xpath.select('./function', Scraper);
		for (let Funktion of Funktions) {
			//let Predicates = xpath.select('./*', Funktion);
			//for (let Predicate of Predicates) {
			let FuncFinal = {};
			let FuncName = Funktion.getAttribute('name');
			Final[Name].Functions[FuncName] = '';
			let Contexts = xpath.select('./context', Funktion);
			for (let Context of Contexts) {
				/*Final[Name].Functions[FuncName] += FunctToEvalString(() => {
					//let Res = fetch(`${Final[Name].ApiUrl}/${Context.getAttribute('path')}`, {
					//	method: Context.getAttribute('method'),
					//})//.then((Res) => {
					//	
					//});
				});*/
				//let Values = xpath.select('./value', Context);
				//for (let Value of Values) {
				//	FuncFinal[Value.getAttribute('name')] = 1;
				//};
				Final[Name].Functions[FuncName] += `
					let Final = {};
					let Parsed = new dom().parseFromString(\`${Context.toString()}\`, 'text/xml');
					let Values = xpath.select('/context/value', Parsed);
					//let Final = JSON.parse('${JSON.stringify(FuncFinal)}');
					let Res = request('${Context.getAttribute('method')}', '${Final[Name].ApiUrl}${Context.getAttribute('path')}');
					// if '${Context.getAttribute('format')}' == 'HTML'
					let Body = Res.getBody('utf-8');
					let HtmlDom = new dom().parseFromString(Body);
					//console.log(1, HtmlDom.toString(), 2, xpath.select('/html/body//p[1]', HtmlDom).toString());
					for (let Value of Values) {
						// if '${Context.getAttribute('source')}' == 'body'
						Final[Value.getAttribute('name')] = xpath.select(Value.getAttribute('path'), HtmlDom).toString();
					};
					Final;
				`;
			};
			//Final[Name].Functions[FuncName] = new Function(Final[Name].Functions[FuncName]);
		};
	};
	return Final;
};

const LoadScrapersFile = (Path) => LoadScrapersText(fs.readFileSync(Path, 'utf8'));

module.exports = {
	LoadScrapersText: LoadScrapersText,
	LoadScrapersFile: LoadScrapersFile,
};
