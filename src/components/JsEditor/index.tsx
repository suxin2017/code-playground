import * as React from "react";
import { editor, languages } from "monaco-editor";
import { CodeContext, LibraryContext } from "../../App";
import { CoreEditor } from "../CoreEditor";
import { Library, tsDefault } from "../../common/library";
export interface IJsEditorProps {}
let oldLibrary: string[] = [];
export function JsEditor(props: IJsEditorProps) {
  const coreState = React.useContext(CodeContext);
  const { library } = React.useContext(LibraryContext);

  React.useEffect(() => {
    languages.typescript.typescriptDefaults.setCompilerOptions({
      // allowJs:true,
      esModuleInterop: true,
      target: languages.typescript.ScriptTarget.ES2016,
      allowNonTsExtensions: true,
      moduleResolution: languages.typescript.ModuleResolutionKind.NodeJs,
      module: languages.typescript.ModuleKind.CommonJS,
      typeRoots: ["node_modules/@types"],
      allowSyntheticDefaultImports: true,
    });

    (async () => {
      const lib = Library.createLib("react-dom");
      (await lib).loadTypeDefined();
    })();
  }, []);

  React.useEffect(() => {
    if (library) {
      library.forEach(async (lib) => {
        if (oldLibrary.indexOf(lib) === -1) {
          (await Library.createLib(lib)).loadTypeDefined();
        }
      });
      oldLibrary = library;
    }
  }, [library]);
  return (
    <CoreEditor
      initValue={""}
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
