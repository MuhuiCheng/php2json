/**
 * 将php文件数据转为为JSON或者JS
 * {param1} filePath php文件夹地址路径
 * {param2} path 写入的新的文件路径
 * {param3} type 写入的新的文件类型 1:js  2：json  缺省为js
 */
const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
const newPath = process.argv[3];

let type = 1;
if (process.argv[4]){
    type = process.argv[4];
}
fileDisplay(filePath);

function readFile(filePath){
    fs.readFile(filePath, function (error, data) {
        if (error) {
        // 在这里就可以通过判断 error 来确认是否有错误发生
        console.log('read error');
        } else {
            // <Buffer 68 65 6c 6c 6f 20 6e 6f 64 65 6a 73 0d 0a>
            // 文件中存储的其实都是二进制数据 0 1
            // 这里为什么看到的不是 0 和 1 呢？原因是二进制转为 16 进制了
            // 但是无论是二进制01还是16进制，人类都不认识
            // 所以我们可以通过 toString 方法把其转为我们能认识的字符
            let str = data.toString();
            let fileType = '.js'
            let newName = getFileName(filePath)

            if (str.indexOf('<?php') === 0){
                //去除<?php return 
                str = str.substr(16, str.length);
            }
            if(str.indexOf('[') !== 0){
                str = '{' + str;
            }
            str = php2json(str);
            
            if (type === 1){
                // to js
                fileType = '.js';
                str = 'export default ' + str ;
            }else if (type === 2){
                // to json
                fileType = '.json';
            }

            let newFilePath = newPath + newName + fileType;
            write(newFilePath, str, newName)

        }
    })
}

function php2json(params) {
    let str = params.replace(/=>/g,":")
    str = str.replace(/\[/g,"{")
    str = str.replace(/\]/g,"}")
    return str
}

function getFileName(string) {
    let arr1 = string.split(filePath);
    let index = arr1[arr1.length-1].indexOf('.');
    return arr1[arr1.length-1].substr(0, index);
}

async function write(path, content, writefileName) {
    await createDir(writefileName)
    fs.writeFile(path, content, function (error) {
        if (error) {
          console.log(error)
        } else {
          console.log('write success')
        }
    })
}

async function createDir(dir) {
    let newDir = dir.split('\\');
    for (let index = 0; index < newDir.length-1; index++) {
        const element = newDir[index];
        await dirExists(path.join(newPath, element));
    }
}

/**
 * 文件遍历方法
 * @param filePath 需要遍历的文件路径
 */
function fileDisplay(filePath){
    //根据文件路径读取文件，返回文件列表
    let files = fs.readdirSync(filePath);
    if (!files) return;
    //遍历读取到的文件列表
    files.forEach(function(filename){
        //获取当前文件的绝对路径
        var filedir = path.join(filePath,filename);
        //根据文件路径获取文件信息，返回一个fs.Stats对象
        let stats = fs.statSync(filedir);
        if (!stats) return;

        var isFile = stats.isFile();//是文件
        var isDir = stats.isDirectory();//是文件夹
        if(isFile){
            readFile(filedir);
        }
        if(isDir){
            fileDisplay(filedir);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
        }
    });
}


/**
 * 读取路径信息
 * @param {string} path 路径
 */
function getStat(path){
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            if(err){
                resolve(false);
            }else{
                resolve(stats);
            }
        })
    })
}
 
/**
 * 创建路径
 * @param {string} dir 路径
 */
function mkdir(dir){
    return new Promise((resolve, reject) => {
        fs.mkdir(dir, err => {
            if(err){
                resolve(false);
            }else{
                resolve(true);
            }
        })
    })
}
 
/**
 * 路径是否存在，不存在则创建
 * @param {string} dir 路径
 */
async function dirExists(dir){
    let isExists = await getStat(dir);
    //如果该路径且不是文件，返回true
    if(isExists && isExists.isDirectory()){
        return true;
    }else if(isExists){     //如果该路径存在但是文件，返回false
        return false;
    }
    //如果该路径不存在
    let tempDir = path.parse(dir).dir;      //拿到上级路径
    //递归判断，如果上级目录也不存在，则会代码会在此处继续循环执行，直到目录存在
    let status = await dirExists(tempDir);
    let mkdirStatus;
    if(status){
        mkdirStatus = await mkdir(dir);
    }
    return mkdirStatus;
}