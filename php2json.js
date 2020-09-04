/**
 * 将php文件数据转为为JSON或者JS
 * {param1} filePath php文件地址路径（包含文件名字）
 * {param2} path 写入的新的文件路径（只有路径不包含文件名字）
 * {param3} name 写入的新的文件名字（不需要包含后缀,缺省为传入php文件同名）
 * {param4} type 写入的新的文件类型 1:js  2：json  缺省为js
 */
const fs = require('fs');

const filePath = process.argv[2];
const path = process.argv[3];
const fileName = process.argv[4];

let type = 1;
if (process.argv[5]){
    type = process.argv[5];
}

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
        str = php2json(str);
        
        if (type === 1){
            // to js
            fileType = '.js';
            str = 'export default ' + str ;
        }else if (type === 2){
            // to json
            fileType = '.json';
        }
        
        if (fileName){
            newName = fileName
        }

        let newFilePath = path + newName + fileType;
        write(newFilePath, str)
        //console.log(str)
    }
})

function php2json(params) {
    let str = params.replace(/=>/g,":")
    str = str.replace(/\[/g,"{")
    str = str.replace(/\]/g,"}")
    return str
}

function getFileName(string) {
    let arr1 = string.split("//");
    let index = arr1[arr1.length-1].indexOf('.');
    return arr1[arr1.length-1].substr(0, index);
}

function write(path, content) {
    fs.writeFile(path, content, function (error) {
        if (error) {
          console.log(error)
        } else {
          console.log('write success')
        }
    })
}