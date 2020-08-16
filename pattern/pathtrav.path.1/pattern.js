const process = require('process');
const fs = require('fs');
const { staticEngine, analyzer } = require('static-engine');
const pattern1 = require('./path_traversal_v1');
const script = process.argv[2];
const contents = fs.readFileSync(script, 'utf8');

try {
    let engine = new staticEngine(contents, {debug : false});
    let result = engine.analyze();
    var statement1=[];
    engine.traverse(result.ast, function (node, parent_node) {
        pattern1.filter_bypass1(node, statement1)
    },result.ast);
    
    if (statement1.length > 0){
        for (i of statement1){
            console.log("**********Path Traversal v1 found!**********");
            console.log(i.range, 'replace(', i.arguments[0].name, ',', i.arguments[1].raw, ')');
        }
    }
}
catch(e) {
    console.error(e);
}
