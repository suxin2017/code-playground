import * as React from "react";
import { CodeContext } from "../../App";
import { CoreEditor } from "../CoreEditor";
export interface IHtmlEditorProps {}

export function HtmlEditor(props: IHtmlEditorProps) {
  const coreState = React.useContext(CodeContext)
  return (
      <CoreEditor initValue={''} 
      value={coreState.coreState.html}
      language='html' onChange={editor=>{
        const currentCode = editor.getValue();
        coreState.dispatch({
          type:'html',
          code:currentCode
        })
      }}></CoreEditor>
  );
}
