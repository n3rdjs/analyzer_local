const process = require('process');
const fs = require('fs');
const { staticEngine, analyzer } = require('static-engine');
const pattern1 = require('./prototype_pollution_v2');
const script = process.argv[2];
const contents = fs.readFileSync(script, 'utf8');

try {
    let engine = new staticEngine(contents, {debug : false});
    let result = engine.analyze();
    var statement1=[];
    var statement2=[];
    engine.traverse(result.ast, function (node, parent_node) {
        pattern1.prototype_pollution_statement1(node, statement1)
        pattern1.prototype_pollution_statement2(node, statement2);
    },result.ast);
    
    for (i of statement1){
        //console.log(i.range, i.expression.left.name,'=',i.expression.left.name, '[',i.expression.right.property.name,']')

        // console.log(JSON.stringify(i, null, 4));
    }
    for (i of statement2){
        //console.log(i.range, i.expression.left.object.name, '[',i.expression.left.property.name,']=', i.expression.right.name)

        //console.log(JSON.stringify(i, null, 4));
    }
    
    console.log(statement1.length);
    console.log(statement2.length);
    
    if (statement1.length > 0 && statement2.length > 0){
        id1 = [];
        id2 = [];
        for (let i in statement1){
            if (statement1[i].expression.cfg){
                id1.push(statement1[i].expression.cfg.id);
            }
        }
        for (let j in statement2){
            if (statement2[j].expression.cfg){
                id2.push(statement2[j].expression.cfg.id);
            }
        }
        let ar = analyzer.scc(result.ast, result.cfg);
        console.log("scc generation complete");
        let scc = ar.scc;
        let vt = ar.vt;
        let visit_ptr = ar.visit_ptr;
        let visited = ar.visited;
        let v = ar.v;
        var found1 = [];
        var found2 = [];
        for (let i = 0; i < scc.length; i++){
            found1[i] = [];
            found2[i] = [];
        }
        for (let i in scc){
            for (let j of scc[i]){
                for (let k in id1){
                    if (id1[k] == j){
                        let tmp = [];
                        tmp[0] = k;
                        tmp[1] = id1[k];
                        found1[i].push(tmp);
                    }
                }
            }
        }
        for (let i in scc){
            for (let j of scc[i]){
                for (let k in id2){
                    if (id2[k] == j){
                        let tmp = [];
                        tmp[0] = k;
                        tmp[1] = id2[k];
                        found2[i].push(tmp);
                    }
                }
            }
        }
        for (let i in scc){
            if (found1[i].length != 0 && scc[i].length >= 2){ //pp_v2
                if (found1[i].length * found2[i].length == 0){
                    for (let j in found1[i]){ //-> statement1[j] ( hash )
                        for (let k = 0; k < v; k++){
                            visited[visit_ptr[k]] = false;
                        }
                        dfs(i, j, found1[i][j][1]);
                    }
                }
            }
            if (found1[i].length * found2[i].length != 0){ //pp_v1
                for (let j in found1[i]){
                    for (let k in found2[i]){
                        console.log("**********Prototype Pollution v1 found!**********");
                        console.log(statement1[found1[i][j][0]].range, statement1[found1[i][j][0]].expression.left.name,'=', statement1[found1[i][j][0]].expression.left.name, '[',statement1[found1[i][j][0]].expression.right.property.name,']')
                        console.log(statement2[found2[i][k][0]].range, statement2[found2[i][k][0]].expression.left.object.name, '[',statement2[found2[i][k][0]].expression.left.property.name,']=', statement2[found2[i][k][0]].expression.right.name)
                    }
                }
            }
        }
            
        function dfs(sccptr, st1, v){
            visited[v] = true;
            if (vt[v]){
                for (let i of vt[v]){ //i: hash
                    if (visited[i]==true) continue;
                    for (let j in statement2){
                        if (statement2[j].expression.cfg.id === i){
                            console.log("**********Prototype Pollution v2 found!**********");
                            console.log(statement1[found1[sccptr][st1][0]].range, statement1[found1[sccptr][st1][0]].expression.left.name,'=', statement1[found1[sccptr][st1][0]].expression.left.name, '[',statement1[found1[sccptr][st1][0]].expression.right.property.name,']')
                            console.log(statement2[j].range, statement2[j].expression.left.object.name, '[',statement2[j].expression.left.property.name,']=', statement2[j].expression.right.name)    
                        }
                    }
                    dfs(sccptr, st1, i);
                }
            }
        }
    }
}
catch(e) {
    console.error(e);
}
