import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { JsEditor } from "./components/JsEditor";
import { Preview } from "./components/Preview";
import { CssEditor } from "./components/CssEditor";
import 'react-grid-layout/css/styles.css'
import RGL, { WidthProvider } from "react-grid-layout";
import { HtmlEditor } from "./components/HtmlEditor";
const ReactGridLayout = WidthProvider(RGL);

type CodeState = {
  js: string;
  css: string;
  html: string;
};
const CodeReducer = (
  state: CodeState,
  action: { type: "css" | "js" | "html"; code: string }
) => {
  switch (action.type) {
    case "css":
      return { ...state, css: action.code };
    case "js":
      return { ...state, js: action.code };
    case "html":
      return { ...state, html: action.code };
  }
};

const initState: CodeState = {
  js: "",
  css: "",
  html: "",
};

export const CoreContext = React.createContext<{
  coreState: CodeState;
  dispatch: React.Dispatch<{
    type: "css" | "js" | "html";
    code: string;
  }>;
}>({ coreState: initState, dispatch: () => {} });

function App() {
  const [coreState, dispatch] = React.useReducer(CodeReducer, initState);
  const layout = [
    {i: 'css', x: 0, y: 0, w: 4, h: 6,static:true },
    {i: 'js', x: 0, y: 6, w: 4, h: 6,static:true},
    {i: 'html', x: 0, y: 12, w: 4, h: 6,static:true},
    {i: 'preview', x: 4, y: 0, w: 8, h: 18,static:true}
  ];
  return (
    <CoreContext.Provider
      value={{
        coreState,
        dispatch,
      }}
    >
      <header className="playground-header">
        <div className="playground-header-title">Code Playground</div>
      </header>
      <ReactGridLayout layout={layout} className="layout" margin={[10,20]} cols={12} rowHeight={30} width={window.innerWidth} >
        <div key="html" > 
          <HtmlEditor />
        </div>
        <div key="css" >
          <CssEditor />
        </div>
        <div key="js" > 
          <JsEditor />
        </div>
        <div key="preview" style={{padding:'10px 0 0 0'}}>
          <Preview />
        </div>
      </ReactGridLayout>
    </CoreContext.Provider>
  );
}

export default App;
