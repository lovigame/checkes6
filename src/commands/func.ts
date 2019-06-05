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
              let type = path.extname(filepath);
              if(type && type === '.js'){
                let data = fs.readFileSync(filepath,'utf-8');
                let obj = getSignPos(data);
                let n = 0;
                // fs.writeFileSync('C:/Users/admin/Desktop/tooltest/file2/test.js',data,'utf-8');
                  while(n<CheckArgs.length){
                    
                    if(hasCheckArgs(data,CheckArgs[n],obj)){
                      console.error('err  ','文件 '+filepath+' 包含'+CheckArgs[n]);
                      hasErr = true;
                      return;
                    }
                    n++;
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


function hasCheckArgs(str,Args,obj){
  let idx = str.indexOf(Args);
  
  if(idx === -1){
    return false;
  }
  while(idx > -1){
    for(let i=0;i<obj.sq.length;i++){
      if(obj.sq[i] > idx){
        if(i/2 === 1){
          
          return true;
          
        }
      }
    }
    for(let j=0;j<obj.dq.length;j++){
      if(obj.dq[j] > idx){
        if(j/2 === 1){
          return true;
          
        }
      }
    }
    idx = str.indexOf(Args,idx + 1);
  }
  return false;
  
}

function getSignPos(str){
  let obj={
    sq:[],
    dq:[]
  }
  for(var i=0;i<str.length;++i){
    if(str[i] === "'"){
      obj.sq.push(i);
    }
    if(str[i] === '"'){
      obj.dq.push(i);
    }
  }
  return obj;
}



