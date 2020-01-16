'use strict'

const fs = require('fs');
const http = require('http');
const { minify } = require('html-minifier');
const { execSync } = require('child_process');
require('dotenv').config();

const GIT_USERNAME = process.env.GIT_USERNAME;
const GIT_PASSWORD = process.env.GIT_PASSWORD;
const GIT_REPO = process.env.GIT_REPO || 'iceproofarctic';
const GIT_BRANCH =  process.env.GIT_BRANCH || 'master';

const TRIGGER_UPDATE_PATH = process.env.TRIGGER_UPDATE_PATH  || 'update';
const NODE_PORT = process.env.NODE_PORT || 3000;

const OUTPUT_PATH = '/var/www/html' + process.env.HUGO_BASE_URL;
const HUGO_BASE_URL = process.env.HUGO_BASE_URL || '';
const HUGO_FOLDER = process.env.HUGO_FOLDER || 'hugo';
const HUGO_PUBLIC_PATH = `./${GIT_REPO}/${HUGO_FOLDER}/public`;

const files = (input) => {
    fs.readdirSync(HUGO_PUBLIC_PATH + input).map(file => {
        let inputPath = HUGO_PUBLIC_PATH + input + '/' + file;
        let outputPath = OUTPUT_PATH + input + '/' + file;
        
        if(fs.statSync(inputPath).isDirectory()){
            
            if(!fs.existsSync(outputPath)){
                fs.mkdirSync(outputPath);
            }
            
            files(input + '/' + file); 
        }else {
            if(file.match(/.html/)){
                fs.writeFileSync(outputPath, minifyFile(inputPath), (err) => {
                    if(err) throw err;
                });
            }else {
                fs.copyFile(inputPath, outputPath, (err) => {
                    if(err) throw err;
                });
            }

            console.log('move: ', inputPath, '=>', outputPath);
        }
    });
};

const minifyFile = (input) => {
    console.log('minify: ', input);
    let file = fs.readFileSync(input).toString();
    return minify(file, {
        collapseWhitespace: true,
        continueOnParseError: true,
        minifyJS: true
    });
};

const update = () => {
    let timestamp = Date.now();
    try {
        execSync(
            `rm -R -f ${GIT_REPO}`,
            {cwd: __dirname, stdio: 'inherit'}
        );
    
        execSync(
            `git clone -b ${GIT_BRANCH} --single-branch https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/${GIT_USERNAME}/${GIT_REPO}.git`,
            {cwd: __dirname, stdio: 'inherit'}
        );

        execSync(
            `hugo -D --baseURL=${HUGO_BASE_URL}`,
            {cwd: __dirname + `/${GIT_REPO}/${HUGO_FOLDER}`, stdio: 'inherit'}
        );
            
        if(OUTPUT_PATH.match('/var/www/')){
            execSync(
                'rm -R -f *',
                {cwd: OUTPUT_PATH, stdio: 'inherit'}
            );
        }else {
            throw 'error: bad path';
        }

        files('');
    
        execSync(
            `rm -R -f ${GIT_REPO}`,
            {cwd: __dirname, stdio: 'inherit'}
        );
        console.log('\x1b[32m%s\x1b[0m', 'DEPLOY OK', `(${Date.now() - timestamp}ms)`);
    }catch(err){
        console.error(err);
    }
}

const server = http.createServer((req, res) => {
    let status = false;

    let url = req.url.split('/');
    for(const item of url){
        if(item == TRIGGER_UPDATE_PATH){
            status = true;
            break;
        }
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(`{"update":${status}}`);
    
    if(status){
        update();
    }
}); 

const mkdir = () => {
    let location = '/';
    for(const path of OUTPUT_PATH.split('/')){
        if(path.length == 0){continue;}

        location += path + '/';
        if(!fs.existsSync(location)){
            fs.mkdirSync(location);
        }
    }
};

mkdir();
update();
server.listen(NODE_PORT);