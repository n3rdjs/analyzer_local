var path = require('path');
var nodeExternals = require('webpack-node-externals');

module.exports = {
    target: 'node',
    externals: [
        nodeExternals({
            modulesFromFile: {
                include: ['dependencies']
            }
        })
    ],
    entry: {
        main: ['./index.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, './out')
    },
    optimization: {
        minimize: false
    },
    mode: 'none', 
};