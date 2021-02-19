import * as React from "react";
import { CoreContext } from "../../App";
import { CoreEditor } from "../CoreEditor";
export interface IHtmlEditorProps {}

export function HtmlEditor(props: IHtmlEditorProps) {
  const coreState = React.useContext(CoreContext)
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
