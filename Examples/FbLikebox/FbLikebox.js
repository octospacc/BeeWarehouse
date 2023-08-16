#!/usr/bin/env node
const BeeWarehouse = require('../../BeeWarehouse.js');

let Arguments = { "Source": "profile.php?id=100043901540898" };
let FbLikebox = BeeWarehouse.LoadBeesFile('./FbLikebox.xml').FbLikebox;

let Profile = ExampleCom.Functions.GetProfileInfo(Arguments);
console.log(Profile);

let Posts = ExampleCom.Functions.GetLatestPosts(Arguments);
console.log(Posts);
