import * as React from "react";
import { editor, languages } from "monaco-editor";
import * as monaco from "monaco-editor"
import { CoreContext } from "../../App";
import { debounce } from "lodash";
import { CoreEditor } from "../CoreEditor";
import { Lib } from "../../common/lib";
import { verify } from "crypto";
export interface IJsEditorProps {}

export function JsEditor(props: IJsEditorProps) {
  const coreState = React.useContext(CoreContext);

  React.useEffect(() => {
    languages.typescript.typescriptDefaults.setCompilerOptions({
      // allowJs:true,
      esModuleInterop:true,
      target: languages.typescript.ScriptTarget.ES2016,
      allowNonTsExtensions: true,
      moduleResolution: languages.typescript.ModuleResolutionKind.NodeJs,
      module: languages.typescript.ModuleKind.CommonJS,
      typeRoots: ["node_modules/@types"],
    });
    const addLibraryToRuntime = (code: string, path: string) => {
      monaco.languages.typescript.typescriptDefaults.addExtraLib(code, path)
      const uri = monaco.Uri.file(path)
      if (monaco.editor.getModel(uri) === null) {
        monaco.editor.createModel(code, "typescript", uri)
      }
    }
    (async () => {
      const vue = await new Lib("react").load();
      await vue.getTypeDefined();

      addLibraryToRuntime(await vue.getPackageJson(),`node_modules/${vue.libraryName}/package.json`)
      
      vue.types.forEach((context,key) => {
        console.log('路径',`node_modules/${vue.libraryName}/${key}`,context)
        addLibraryToRuntime(context,`node_modules/${vue.libraryName}/${key}`)

      });
    })();

    // const array = [
    //   'index.d.ts','options.d.ts','plugin.d.ts','umd.d.ts','vnode.d.ts','vue.d.ts'
    // ]
    // fetch(`https://ofcncog2cu-dsn.algolia.net/1/indexes/npm-search/react?attributes=types&x-algolia-agent=Algolia%20for%20vanilla%20JavaScript%20(lite)%203.27.1&x-algolia-application-id=OFCNCOG2CU&x-algolia-api-key=f54e21fa3a2a0160595bb058179bfb1e`).then(res=>{
    //   res.text().then(t=>console.log(t))
    // })
    // Promise.all(array.map(i=>{
    //   return fetch(`https://cdn.jsdelivr.net/npm/vue@2.6.12/types/${i}`).then(async res=>{
    //    const text = await res.text()
    //    return {
    //      text,file:i
    //    }
    //   })
    // })).then(res=>{
    //   res.map(r=>{
    //     console.log(r.text)
    //     languages.typescript.typescriptDefaults.addExtraLib(
    //       r.text,
    //       `file:///node_modules/@types/vue/${r.file}`
    //     );
    //   })
    // })
  }, []);
  return (
    <CoreEditor
      initValue={""}
      value={coreState.coreState.js}
      language="javascript"
      onChange={(editor) => {
        const currentCode = editor.getValue();
        coreState?.dispatch?.({
          type: "js",
          code: currentCode,
        });
      }}
    ></CoreEditor>
  );
}
