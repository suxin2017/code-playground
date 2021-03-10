import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { JsEditor } from "./components/JsEditor";
import { Preview } from "./components/Preview";
import { CssEditor } from "./components/CssEditor";
import "react-grid-layout/css/styles.css";
import RGL, { WidthProvider } from "react-grid-layout";
import { HtmlEditor } from "./components/HtmlEditor";
import { parse, stringify } from "qs";
import { Setting } from "./components/Setting";
import 'antd/dist/antd.dark.css'; 

const ReactGridLayout = WidthProvider(RGL);

type CodeState = {
  js: string;
  css: string;
  html: string;
};

const CodeReducer = (
  state: CodeState,
  action: {
    type: "css" | "js" | "html" | "all";
    code: string;
    codeState?: CodeState;
  }
) => {
  let newState = state;
  switch (action.type) {
    case "css":
      newState = { ...state, css: action.code };
      break;
    case "js":
      newState = { ...state, js: action.code };
      break;
    case "html":
      newState = { ...state, html: action.code };
      break;
    default:
      if (action.codeState) {
        newState = action.codeState;
      }
  }
  window.history.pushState(null, "", "?" + stringify({ ...getD(),p: newState }));
  return newState;
};

const initState: CodeState = {
  js: "",
  css: "",
  html: "",
};

export const CodeContext = React.createContext<{
  coreState: CodeState;
  dispatch: React.Dispatch<{
    type: "css" | "js" | "html" | "all";
    code: string;
    codeState?: CodeState;
  }>;
}>({ coreState: initState, dispatch: () => {} });

export const LibraryContext = React.createContext<{
  library: string[];
  dispatch: React.Dispatch<{
    type: "add" | "delete";
    moduleName: string;
  }>;
}>({ library: [], dispatch: () => {} });

const LibararyReducer = (
  library: string[],
  action: { type: "add" | "delete"; moduleName: string }
) => {
  const { moduleName } = action;
  let hasExist = library.indexOf(moduleName) !== -1;
  switch (action.type) {
    case "add":
      if (hasExist) {
        return library;
      }
      return [...library, action.moduleName];
    case "delete":
      if (hasExist) {
        library.splice(library.indexOf(moduleName), 1);
        return [...library];
      }
      return library;
  }
};

function getD() {
  const data = window.location.search;
  const d: any = parse(data.slice(1));
  return d;
}
function App() {
  const [coreState, dispatch] = React.useReducer(CodeReducer, initState);
  const [cssLib, setCssLib] = React.useState([] as string[]);
  const [jsLib, setJsLib] = React.useState([] as any[]);
  const [global,setGlobal] = React.useState(false);
  const [visible,setVisiblw] = React.useState(false);
  const [config, setConfig] = React.useState([
    { i: "css", x: 0, y: 0, w: 4, h: 6, static: true },
    { i: "js", x: 0, y: 0, w: 4, h: 6, static: true },
    { i: "html", x: 0, y: 6, w: 4, h: 6, static: true },
    { i: "preview", x: 4, y: 0, w: 8, h: 18, static: true },
  ]);

  React.useEffect(() => {
    const data = window.location.search;
    if (data) {
      try {
        const d: any = parse(data.slice(1));
        dispatch({
          type: "all",
          code: "",
          codeState: d.p,
        });
        console.log(d)
        if(d.cssLib){
          setCssLib(d.cssLib);
        }
        if(d.jsLib){

          setJsLib(d.jsLib);
        }
        if(d.global != null){

          setGlobal(Boolean(d.global))
        }
      } catch (e) {
        console.error("json", e);
      }
    }
  }, []);

  return (
    <CodeContext.Provider
      value={{
        coreState,
        dispatch,
      }}
    >
      <header className="playground-header">
        <div className="playground-header-title">Code Playground</div>
        <span className="setting" onClick={()=>{
          setVisiblw(true);
        }}></span>
      </header>
      <div style={{ display: "flex" }}>
        <Setting
        visible={visible}
        onCancel={()=>{
          setVisiblw(false)
        }}
          cssLib={cssLib}
          setCssLib={(args) => {
            window.history.pushState(null, "", "?" + stringify({ ...getD(),cssLib:args }));
            setCssLib(args);
          }}
          global={global}
          setGlobal={(args)=>{
            window.history.pushState(null,"","?"+stringify({...getD(),global:args}))
            setGlobal(args)
          }}
          jsLib={jsLib}
          setJsLib={(args) => {
            window.history.pushState(null, "", "?" + stringify({ ...getD(),jsLib:args }));
            setJsLib(args);
          }}
        ></Setting>
        <div style={{ flexGrow: 1 }}>
          <ReactGridLayout
            layout={config}
            className="layout"
            margin={[10, 20]}
            cols={12}
            rowHeight={30}
            width={window.innerWidth}
          >
            <div key="html">
              <HtmlEditor />
            </div>
            <div key="css">
              <CssEditor />
            </div>
            <div key="js">
              <JsEditor jsLib={jsLib} />
            </div>
            <div key="preview" style={{ padding: "10px 0 0 0" }}>
              <Preview cssLib={cssLib} jsLib={jsLib} global={global}/>
            </div>
          </ReactGridLayout>
        </div>
      </div>
      
    </CodeContext.Provider>
  );
}

export default App;
