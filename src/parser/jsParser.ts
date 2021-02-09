import { parse } from "@babel/parser";
import generate from "@babel/generator";
import { ParserOptions } from "@babel/core";
import { func } from "prop-types";

const parseOption: ParserOptions = {
  sourceType: "module",
};

const importReg = /import\s*([{\sa-z_A-Z0-9\s}]*?)\s+from\s*(["'a-zA-Z0-9'"]*);?/g;

export function getCompileSrc(code: string) {
    try{
        const ast = parse(code, parseOption);
        const output = generate(
          ast,
          {
            /* options */
          },
          code
        );
        let module = 0;
        const resultCode = output.code.replace(
          importReg,
          (match,p1,p2)=>{
              
              module+=1;
              return [`const module_${module} = await System.import(${p2});`,`const ${p1} = module_${module}.default ? module_${module}.default : module_${module}`].join("\n")
          }
        );
        console.log(resultCode)
        return resultCode;

    }catch(e){
        console.log(e)
    }


}
