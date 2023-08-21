const fs = require('fs');
const request = require('sync-request');
const dom = require('@xmldom/xmldom').DOMParser;
const xpath = require('xpath');

const FormatMacrosInText = (Text) => {
	//console.log('`' + Text.replaceAll('{', '${Macros.').replaceAll('}', '({})}') + '`');
	return ('`' + Text.replaceAll('{', '${Macros.').replaceAll('}', '({})}') + '`');
};

const GetStepValues = (Step, Parent, Reqs) => {
	let StepFinal = {};
	let Macros = Reqs.Macros;
	let Values = xpath.select('./*', Step);
	for (let Value of Values) {
		// if '${Step.getAttribute('source').toLowerCase()}' === 'body'
		if (Value.tagName.toLowerCase() === 'value') {
			StepFinal[Value.getAttribute('name')] = xpath.select(eval(FormatMacrosInText(Value.getAttribute('path'))), Reqs.Html/*HtmlDom*/).toString();
		} else
		if (Value.tagName.toLowerCase() === 'items') {
			StepFinal = {...StepFinal, ...GetStepValues(Value, Step, Reqs)};
		};
	};
	return StepFinal;
};

const LoadBeesText = (Xml) => {
	let [Final, Macros] = [{}, {}];
	let Parsed = new dom().parseFromString(Xml, 'text/xml');
	let Bees = xpath.select('/bees/bee', Parsed);
	for (let Bee of Bees) {
		let Name = Bee.getAttribute('name');
		Final[Name] = {
			ApiUrl: Bee.getAttribute('apiurl'),
			Functions: {},
		};
		let Sets = xpath.select('//set', Bee);
		for (let Set_ of Sets) {
			//let ArgsList = Set_.getAttribute('').split(' ');
			//if (ArgsList[0]) {
				Macros[Set_.getAttribute('name')] = (Args) => {
					//console.log(eval('`' + Set_.getAttribute('value').replaceAll('{', '${Args.') + '`'));
					eval('`' + Set_.getAttribute('value').replaceAll('{', '${Args.') + '`');
				};
			//};
		};
		let Functs = xpath.select('./function', Bee);
		for (let Funct of Functs) {
			let FuncName = Funct.getAttribute('name');
			let SubFuncts = [];
			let Steps = xpath.select('./*', Funct);
			for (let Step of Steps) {
				SubFuncts = [...SubFuncts, (Args) => {
					let StepFinal = {};
					for (let Arg in Args) {
						Macros[Arg] = () => Args[Arg];
					};
					if (Step.tagName.toLowerCase() === 'request') {
						let Res = request(Step.getAttribute('method'), Final[Name].ApiUrl + eval(FormatMacrosInText(Step.getAttribute('path'))));
						// if '${Step.getAttribute('format').toLowerCase()}' === 'html'
						let Body = Res.getBody('utf-8');
						let HtmlDom = new dom().parseFromString(Body);
						//let Values = xpath.select('./value', Step);
						StepFinal = GetStepValues(Step, null, {Html: HtmlDom, Macros: Macros});
					};
					return StepFinal;
				}];
			};
			Final[Name].Functions[FuncName] = (Args) => {
				let FuncFinal = {};
				for (SubFunct of SubFuncts) {
					FuncFinal = {...FuncFinal, ...SubFunct(Args)};
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
