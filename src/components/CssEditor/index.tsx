import * as React from "react";
import { CodeContext } from "../../App";
import { CoreEditor } from "../CoreEditor";
export interface ICssEditorProps {}

export function CssEditor(props: ICssEditorProps) {
  const coreState = React.useContext(CodeContext)
  return (
      <CoreEditor initValue={''} language='css' onChange={editor=>{
        const currentCode = editor.getValue();
        coreState.dispatch({
          type:'css',
          code:currentCode
        })
      }}></CoreEditor>
  );
}
