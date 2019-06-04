import _ from "lodash";
import chalk from "chalk";
import copy from "recursive-copy";
import fs from "fs";
import ora from "ora";
import path from "path";
import prompts from "prompts";
import rimraf from "rimraf";
import through2 from "through2";
import { getLogger } from "../logger";

const logger = getLogger("checkes6");

const CheckArgs = ["let ","const ","=>","Proxy"];
export default async (args: string[]) => {
  const spanner = ora(`   正在拷贝...... `);
  const src = args[0];
  fileDisplaySync(src);
  
};




 function fileDisplaySync(filePath: string) {
   let hasErr:boolean = false;
   try {
      function ergodicFileSync(filePath: string){
        // 根据文件路径读取文件，返回一个文件列表
      let files = fs.readdirSync(filePath);
        // 遍历读取到的文件列表
        for(let i=0;i<files.length;++i){
          let filename = files[i];
          const filepath = path.join(filePath, filename);
          // 根据文件路径获取文件信息
          const stats = fs.statSync(filepath);
            const isFile = stats.isFile(); // 是否为文件
            const isDir = stats.isDirectory(); // 是否为文件夹
            if (isFile) {
              let type = getType(filepath)
              if(type && type === 'js'){
                let data = fs.readFileSync(filepath,'utf-8');
                  for(let i=0;i<CheckArgs.length;++i){
                    if(data.indexOf(CheckArgs[i]) != -1){
                      console.error('err  ','文件 '+filepath+' 包含'+CheckArgs[i]);
                      hasErr = true;
                      return;
                    }
                  }
              }
            }
            if (isDir) {
              ergodicFileSync(filepath); // 递归，如果是文件夹，就继续遍历该文件夹里面的文件；
            }
        }
      }
      ergodicFileSync(filePath);
   } catch (error) {
     console.error(error)
   }
   if(!hasErr){
    console.log("OK");
   }
   
}



/**
 * 文件遍历方法 异步
 * @param filePath 需要遍历的文件路径
 */
 async function fileDisplay(filePath: string) {

  let isFirst:boolean = true;
  let rootFileLen:number;
  let rootFiles;
  let rootIndex;
  function ergodicFile(filePath: string){
     // 根据文件路径读取文件，返回一个文件列表
    fs.readdir(filePath, (err, files) => {
      if (err) {
        console.warn(err);
        return;
      }
      // 遍历读取到的文件列表
      files.forEach((filename,index) => {
        // path.join得到当前文件的绝对路径
        const filepath = path.join(filePath, filename);
        // 根据文件路径获取文件信息
        fs.stat(filepath, (error, stats) => {
          if (error) {
            console.warn('获取文件stats失败');
            return;
          }
          const isFile = stats.isFile(); // 是否为文件
          const isDir = stats.isDirectory(); // 是否为文件夹
          if (isFile) {
            let type = getType(filepath)
            if(type && type === 'js'){
                fs.readFile(filepath,'utf-8',(err,data)=>{
                  if(err){
                    console.log(err);
                    return;
                  }
                  for(let i=0;i<CheckArgs.length;++i){
                    if(data.indexOf(CheckArgs[i]) != -1){
                      console.log('err  ','文件 '+filepath+' 包含'+CheckArgs[i]);
                    }
                  }
                  
                })
            }
          }
          if (isDir) {
            ergodicFile(filepath); // 递归，如果是文件夹，就继续遍历该文件夹里面的文件；
          }
        });
      });
    });
  }
  ergodicFile(filePath);
}





function getType(file){
  var filename=file;
  var index1=filename.lastIndexOf(".");
  var index2=filename.length;
  var type=filename.substring(index1+1,index2);
  return type;
}


// 读取文件的逻辑拉出
function fsReadDir(dir: string) {
  return new Promise<string[]>((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) reject(err);
      resolve(files);
    });
  });
}
// 获取fs.stats的逻辑拉出
function fsStat(path: string) {
  return new Promise<fs.Stats>((resolve, reject) => {
    fs.stat(path, (err, stat) => {
      if (err) reject(err);
      resolve(stat);
    });
  });
}
// 搜索文件主方法
async function fileSearch(dirPath: string) {
  const files = await fsReadDir(dirPath);
  const promises = files.map(file => {
    return fsStat(path.join(dirPath, file));
  });
  const datas = await Promise.all(promises).then(stats => {
    for (let i = 0; i < files.length; i += 1) files[i] = path.join(dirPath, files[i]);
    return { stats, files };
  });
  datas.stats.forEach(stat => {
    const isFile = stat.isFile();
    const isDir = stat.isDirectory();
    if (isDir) {
      fileSearch(datas.files[datas.stats.indexOf(stat)]);
    }
    if (isFile) console.log(datas.files[datas.stats.indexOf(stat)]);
  });
}