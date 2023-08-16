const fs = require('fs');
const request = require('sync-request');
const dom = require('@xmldom/xmldom').DOMParser;
const xpath = require('xpath');

const FunctToEvalString = (Funct) => Funct.toString().split('{').slice(1).join('{').split('}').slice(0, -1).join('}');

const LoadBeesText = (Xml) => {
	let Final = {};
	let Parsed = new dom().parseFromString(Xml, 'text/xml');
	let Bees = xpath.select('/bees/bee', Parsed);
	for (let Bee of Bees) {
		let Name = Bee.getAttribute('name');
		Final[Name] = {
			ApiUrl: Bee.getAttribute('apiurl'),
			Functions: {},
		};
		let Functs = xpath.select('./function', Bee);
		for (let Funct of Functs) {
			let FuncName = Funct.getAttribute('name');
			let SubFuncts = [];
			let Steps = xpath.select('./*', Funct);
			for (let Step of Steps) {
				SubFuncts = [...SubFuncts, () => {
					let StepFinal = {};
					if (Step.tagName === 'request') {
						let Res = request(Step.getAttribute('method'), `${Final[Name].ApiUrl}${Step.getAttribute('path')}`);
						// if '${Step.getAttribute('format')}' == 'HTML'
						let Body = Res.getBody('utf-8');
						let HtmlDom = new dom().parseFromString(Body);
						let Values = xpath.select('./value', Step);
						for (let Value of Values) {
							// if '${Step.getAttribute('source')}' == 'body'
							StepFinal[Value.getAttribute('name')] = xpath.select(Value.getAttribute('path'), HtmlDom).toString();
						};
					};
					return StepFinal;
				}];
			};
			Final[Name].Functions[FuncName] = () => {
				let FuncFinal = {};
				for (SubFunct of SubFuncts) {
					FuncFinal = {...FuncFinal, ...SubFunct()};
				};
				return FuncFinal;
			};
		};
	};
	return Final;
};

const LoadBeesFile = (Path) => LoadBeesText(fs.readFileSync(Path, 'utf8'));

module.exports = {
	LoadBeesText: LoadBeesText,
	LoadBeesFile: LoadBeesFile,
};
