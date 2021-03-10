import * as React from "react";
import { CodeContext, LibraryContext } from "../../App";
import { getFileUrl } from "../../common/cdn";
import { loadCDNURL, loadDefaultVersion } from "../../loader/cdnLoader";
import { getCompileSrc } from "../../parser/jsParser";
export interface IPreviewProps {
  cssLib: string[];
  jsLib: any[];
  global: boolean;
}

export function Preview(props: IPreviewProps) {
  const [playground, setPlayground] = React.useState("");
  const coreContext = React.useContext(CodeContext);
  const { library } = React.useContext(LibraryContext);

  React.useEffect(() => {

    let dll = getCompileSrc(coreContext.coreState.js);

    const systemjs = `<script src="https://cdn.jsdelivr.net/npm/systemjs@6.8.3/dist/system.min.js"></script>`;
    const html = coreContext.coreState.html;
    let libs = props.jsLib.reduce((a, b) => {
      return { ...a, ...b };
    }, {});
    // let libs = library.reduce((a, b) => {
    //   a[b] = loadCDNURL(b);
    //   return a;
    // }, {} as any);
    console.log(libs, "libs");
    const systemLibrary = {
      imports: {
        ...libs,
      },
    };
    const f = `
    <html>
        <head>
        ${props.cssLib.map((item) => {
          return `<link rel="stylesheet" href="${item}" crossorigin="anonymous"></link>`;
        })}
        <!-- 加载systemjs -->
            ${systemjs}

       
       
         


        
    
    </head>
    <body>
        <style>
        ${coreContext.coreState.css}
        </style>
       ${html}

       <!-- 加载依赖 -->
       ${
         props.global
           ? Object.keys(libs).map(
               (item) =>{
                 console.log(libs[item],'iii')
                return `<script type="text/javascript" src="${libs[item]}" crossorigin="anonymous"></script>`
               }
             ).join('\n')
           : ` <script type="systemjs-importmap">
             ${JSON.stringify(systemLibrary)}
             </script>`
       }
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
  }, [coreContext, library, props.cssLib]);
  return (
    <div     style={{ width: "100%", height: "100%" }}>
      <iframe
        src={playground}
        style={{ width: "100%", height: "100%" }}
      ></iframe>
    </div>
  );
}
