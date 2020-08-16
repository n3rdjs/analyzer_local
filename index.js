const path = require('path');
const fs = require('fs');
const mysql = require('sync-mysql');
const { dbInfo } = require('./config');
const analyze = require('./lib/analyze')
const name = require('all-the-package-names')

if (process.argv.length <= 2 || process.argv.length > 5) {
    console.log(`Usage: node index.js [Pattern]`);
    console.log(`   or: node index.js [Pattern] [Module Name]`);
    console.log(`   or: node index.js [Pattern] [Slice Start] [Slice End]`);
    
    return;
}

console.log(process.argv.length)
var arr = [];
if (process.argv.length == 5){
    var a = name.slice(parseInt(process.argv[3], 10),parseInt(process.argv[4], 10))
    
    for (let i = 0; i < a.length; i++){
        arr[i] = a[i];
    }
}

const pattern = JSON.parse(fs.readFileSync(path.join('pattern', process.argv[2], 'pattern.json')));
//const connection = new mysql(dbInfo);

if (process.argv.length == 4) {
    var rr = analyze(process.argv[3], pattern);
    console.log(rr);
    return;
}

var fd = fs.openSync('./result.txt', 'w');
var index = 0;
fs.write(fd, 'ModuleName FileSize TotalTime AnalysisTime PatternDetected (값이 없으면 bundling 오류)\n', 'utf-8', function (err) {
    if (err) {
        return console.log(err);
    }
});

(async function() {

    while (true) {
        //const _module = connection.query('select name from proto_path2_v1 where status = 0 order by id asc limit 1')[0]['name'].trim();
        //connection.query(`update proto_path2_v1 set status = 1 where binary name = ?`, [ _module ]);
        
        const _module = arr[index];
        console.log(`[*%d*] %s`, index, _module);
        var result = await analyze(_module, pattern);
    
        fs.write(fd, result + "\r\n", 'utf-8', function (err) {
            if (err) {
                return console.log(err);
            }
        });

        index++;
        console.log(result);
    }

})();