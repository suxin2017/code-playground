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
  window.history.pushState(null, "", "?" + stringify({ p: newState }));
  return newState;
};

const initState: CodeState = {
  js: "",
  css: "",
  html: "",
};

export const CoreContext = React.createContext<{
  coreState: CodeState;
  dispatch: React.Dispatch<{
    type: "css" | "js" | "html" | "all";
    code: string;
    codeState?: CodeState;
  }>;
}>({ coreState: initState, dispatch: () => {} });

function App() {
  const [coreState, dispatch] = React.useReducer(CodeReducer, initState);
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
      } catch (e) {
        console.error("json", e);
      }
    }
  }, []);
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
          <JsEditor />
        </div>
        <div key="preview" style={{ padding: "10px 0 0 0" }}>
          <Preview />
        </div>
      </ReactGridLayout>
    </CoreContext.Provider>
  );
}

export default App;
