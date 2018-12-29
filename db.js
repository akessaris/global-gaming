const mongoose = require('mongoose');

// is the environment variable, NODE_ENV, set to PRODUCTION?
// console.log("process.env.NODE_ENV = " + process.env.NODE_ENV);

let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 const fs = require('fs');
 const path = require('path');
 const fn = path.join(__dirname, 'config.json');
 const data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 const conf = JSON.parse(data);
 dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
 dbconf = 'mongodb://localhost/gg';
}
console.log('connecting to ' + dbconf);
mongoose.connect(dbconf, {useNewUrlParser: true});
