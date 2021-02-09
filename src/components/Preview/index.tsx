import * as React from "react";
import { CoreContext } from "../../App";
import { loadDefaultVersion } from "../../loader/cdnLoader";
import { getCompileSrc } from "../../parser/jsParser";
import {Lib} from "../../common/lib" 
export interface IPreviewProps {}

export function Preview(props: IPreviewProps) {
  const [playground, setPlayground] = React.useState("");
  const coreContext = React.useContext(CoreContext);
  React.useEffect( () => {
    loadDefaultVersion('react');

  

    let dll = getCompileSrc(coreContext.coreState.js);

    const systemjs = `<script src="https://cdn.jsdelivr.net/npm/systemjs@6.8.3/dist/system.min.js"></script>`;
    const html = coreContext.coreState.html;
    const library = {
      imports: {
        lodash: "https://cdn.jsdelivr.net/npm/lodash@4.17.20/lodash.min.js",
        vue: "https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/vue.min.js",
      },
    };
    const f = `
    <html>
        <head>
            <!-- 加载systemjs -->
            ${systemjs}

            <!-- 加载依赖 -->
            <script type="systemjs-importmap">
                ${JSON.stringify(library)}
            </script>

        
    
    </head>
    <body>
        <style>
        ${coreContext.coreState.css}
        </style>
       ${html}
       <script>
       // core runner
           async function run() {
               ${dll}
           }
           run();
       </script>
    </body>
    
    
    </html>`;
    const s = URL.createObjectURL(new Blob([f], { type: "text/html" }));
    setPlayground(s);
    return () => {
      URL.revokeObjectURL(s);
    };
  }, [coreContext]);
  return <iframe
    src={playground}
    style={{  width: "100%", height: "100%" }}
  ></iframe>;
}
