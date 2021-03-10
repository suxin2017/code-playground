import * as React from "react";
import { editor, languages } from "monaco-editor";
import { CodeContext, LibraryContext } from "../../App";
import { CoreEditor } from "../CoreEditor";
import { Library, tsDefault } from "../../common/library";
export interface IJsEditorProps {
  jsLib:any[]
}
let oldLibrary: string[] = [];
export function JsEditor(props: IJsEditorProps) {
  const coreState = React.useContext(CodeContext);
  const { library } = React.useContext(LibraryContext);

  React.useEffect(() => {
    languages.typescript.typescriptDefaults.setCompilerOptions({
      allowJs:true,
      jsx:languages.typescript.JsxEmit.React,
      esModuleInterop: true,
      target: languages.typescript.ScriptTarget.ES2016,
      allowNonTsExtensions: true,
      moduleResolution: languages.typescript.ModuleResolutionKind.NodeJs,
      module: languages.typescript.ModuleKind.CommonJS,
      typeRoots: ["node_modules/@types"],
      allowSyntheticDefaultImports: true,
    });

  }, []);

  React.useEffect(() => {
    if (props.jsLib) {
      let t =  props.jsLib.reduce((a,b)=>{
        return [...a,Object.keys(b)[0]]
      },[])
      t.forEach(async (lib: string) => {
        if (oldLibrary.indexOf(lib) === -1) {
          (await Library.createLib(lib)).loadTypeDefined();
          console.log('加载',lib)
        }
      });
      oldLibrary = t;
    }
  }, [props.jsLib]);
  return (
    <CoreEditor
      initValue={""}
      value={coreState.coreState.js}
      language="typescript"
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
