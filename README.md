# analyzer

analyze npm modules based on pattern

## Install

```bash
git clone https://github.com/n3rdjs/analyzer_local.git
npm install
npm install -g webpack webpack-cli
cd testpack
npm install
```

## Usage
* Analyze one module
```bash
node index.js [Pattern] [Module Name]
```
* Analyze all modules and save to database
```bash
node index.js [Pattern]
```
* Analyze modules based on all-the-package-names
```bash
node index.js [Pattern] [Slice Start] [Slice End]
```


## Status Code
```
0 : not scanned
1 : being scan
2 : error while pre-scan
3 : error while scan
4 : error while post-scan
10 : successfully scanned
```