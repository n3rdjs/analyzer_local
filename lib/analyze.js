const tmp = require('tmp');
const fs = require('fs');
const path = require('path');
const mysql = require('sync-mysql');
const { execSync } = require('child_process');
const { ncp } = require('ncp');
const { dbInfo } = require('../config');
const sendToDiscord = require('./hook');

const connection = new mysql(dbInfo);
const WPConfigBase = fs.readFileSync(path.join(__dirname, '..', 'resource', 'webpack.config.js')).toString();
const tmpBase = path.join(tmp.tmpdir, 'nerdjs');

if (!fs.existsSync(tmpBase)){
    fs.mkdirSync(tmpBase);
}

function report(result, status, module) {
    try {
        connection.query("update proto_path2_v1 set result = ?, status = ?, scantime = NULL where binary name = ?", 
        [result, status, module]);
    } catch(e) {
        console.log(e);
    }
}

function analyze(module, pattern) {

    return new Promise((resolve, reject) => {
        let WPConfig;
        let result = '', status = 10;
        let result2 = '';

        let start = new Date()
        
        const tmpdir = tmp.tmpNameSync({dir: tmpBase, prefix: module.replace(/\W/g, '_') + '_'});
        console.log(`[+] TempDir Created: ${tmpdir}`);

        ncp(path.resolve('testpack'), tmpdir, function (err) {
            if (err) throw err;

            if (pattern.webpack !== undefined && pattern.webpack.excludeAllDeps === true) {
                WPConfig = WPConfigBase.replace('%externals%', `nodeExternals({ whitelist: ['${module}'] })`);
            } else {
                WPConfig = WPConfigBase.replace('%externals%', '');
            }

            fs.writeFileSync(path.join(tmpdir, 'webpack.config.js'), WPConfig);
            fs.writeFileSync(path.join(tmpdir, 'index.js'), `require('${module}')`);

            try {
                console.log(`[+] npm install --save-dev ${module}@latest`);
                execSync(`npm install --save-dev ${module}@latest`, {
                    cwd: tmpdir,
                    timeout: 100000
                });

                console.log('[+] npm run build');
                execSync('npm run build', {
                    cwd: tmpdir,
                    timeout: 100000
                });
            } catch(e) {
                fs.rmdirSync(tmpdir, { recursive: true });
                //report(e.stack, 2, module);
                resolve(module + ' ');
                return;
            }

            try{
                var stats = fs.statSync(`${path.join(tmpdir, 'out', 'bundle.js')}`)
                var fileSizeInBytes = stats["size"]
            } catch(e){
                resolve(module + ' ');
                return;
            }

            try {
                console.log(`[+] node ${path.join('pattern', pattern.id, pattern.script)} ${path.join(tmpdir, 'out', 'bundle.js')}`);
                var start2 = new Date()
                result = execSync(`node ${path.join('pattern', pattern.id, pattern.script)} ${path.join(tmpdir, 'out', 'bundle.js')}`, {timeout:60000}).toString().trim();
                var end2 = new Date() - start2;
                console.log(result);
                var statenum = result.split('\n').slice(0, 2);
                var statenumstr = statenum[0].toString() + '/' + statenum[1].toString();
            } catch (e) {
                fs.rmdirSync(tmpdir, { recursive: true });
                //report(e.stack, 3, module);
                let end = new Date() - start;
                if (end2 == undefined){
                    resolve(module + ' ' + fileSizeInBytes + ' ' + end + ' TIMEOUT');
                }
                else {
                    resolve(module + ' ' + fileSizeInBytes + ' ' + end + ' ' + end2 + ' ERROR_on_analysis');
                }
                return;
            }

            if ( /* TODO */ result.indexOf('found') != -1) {
                sendToDiscord(module, pattern, result);
            }

            fs.rmdirSync(tmpdir, { recursive: true });
            //report(result, status, module);
            let end = new Date() - start;
            if (result.includes('found')){
                result2 = module + ' ' + fileSizeInBytes + ' ' + end + ' ' + end2 + ' ' + statenumstr + ' O';
            }
            else{
                result2 = module + ' ' + fileSizeInBytes + ' ' + end + ' ' + end2 + ' ' + statenumstr + ' X';
            }
            resolve(result2);

        });
    });
}


module.exports = analyze;
