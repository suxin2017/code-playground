import * as React from "react";
import { CoreContext } from "../../App";
import { CoreEditor } from "../CoreEditor";
export interface ICssEditorProps {}

export function CssEditor(props: ICssEditorProps) {
  const coreState = React.useContext(CoreContext);
  return (
    <CoreEditor
      initValue={""}
      value={coreState.coreState.css}
      language="css"
      onChange={(editor) => {
        const currentCode = editor.getValue();
        coreState.dispatch({
          type: "css",
          code: currentCode,
        });
      }}
    ></CoreEditor>
  );
}
