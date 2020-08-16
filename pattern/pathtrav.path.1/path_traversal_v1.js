const obj = {};
obj.filter_bypass1=function(node, result_array){   
    if (node.type == 'CallExpression'){                    
        if(Object.keys(node).includes('callee')&&Object.keys(node).includes('arguments')){
            if(Object.keys(node.callee).includes('property')){
                if(Object.keys(node.callee.property).includes('type')&&Object.keys(node.callee.property).includes('name')){
                    if(node.callee.property.type=='Identifier'&&node.callee.property.name=='replace'){
                        if(node.arguments[1]){
                            if(Object.keys(node.arguments[1]).includes('type')&&Object.keys(node.arguments[1]).includes('value')){
                                if(node.arguments[1].type=='Literal'&&node.arguments[1].value==''){
                                    result_array.push(node)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};
module.exports = obj;