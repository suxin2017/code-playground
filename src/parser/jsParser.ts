import {transform} from '@babel/standalone';

const importReg = /import\s*([{\sa-z_A-Z0-9\s,}]*?)\s+from\s*(["'a-zA-Z0-9\-'"]*);?/g;

export function getCompileSrc(code: string) {
  try {
    const output = transform(code,{
      "presets": ["react"]
    })
    let module = 0;
    const resultCode = output.code?.replace(importReg, (match, p1, p2) => {
      module += 1;
      return [
        `const module_${module} = await System.import(${p2});`,
        `console.log(module_${module})`,
        `const ${p1} = module_${module}.default ? module_${module}.default : module_${module}`,
      ].join("\n");
    });
    console.log("result", resultCode);
    return resultCode;
  } catch (e) {
    console.log(e);
  }
}
