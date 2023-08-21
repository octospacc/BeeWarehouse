#!/usr/bin/env node
const BeeWarehouse = require('../../BeeWarehouse.js');

let Arguments = { "Source": "profile.php?id=100043901540898" };
let FbLikebox = BeeWarehouse.LoadBeesFile(`${__dirname}/FbLikebox.xml`).FbLikebox;

let Profile = FbLikebox.Functions.GetProfileInfo(Arguments);
console.log(Profile);

let Posts = FbLikebox.Functions.GetLatestPosts(Arguments);
console.log(Posts);
