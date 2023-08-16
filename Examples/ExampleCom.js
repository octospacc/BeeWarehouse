#!/usr/bin/env node
const BeeWarehouse = require('../BeeWarehouse.js');
const request = require('sync-request');
const dom = require('@xmldom/xmldom').DOMParser;
const xpath = require('xpath');

let ExampleCom = BeeWarehouse.LoadScrapersFile('./ExampleCom.xml').ExampleCom;
let Info = eval(ExampleCom.Functions.GetInfo);
console.log(Info);
