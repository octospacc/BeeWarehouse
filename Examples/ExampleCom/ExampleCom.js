#!/usr/bin/env node
const BeeWarehouse = require('../../BeeWarehouse.js');

let ExampleCom = BeeWarehouse.LoadBeesFile('./ExampleCom.xml').ExampleCom;
let Info = ExampleCom.Functions.GetInfo();
console.log(Info);
