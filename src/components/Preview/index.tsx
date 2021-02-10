import * as React from "react";
import { CodeContext, LibraryContext } from "../../App";
import { getFileUrl } from "../../common/cdn";
import { loadCDNURL, loadDefaultVersion } from "../../loader/cdnLoader";
import { getCompileSrc } from "../../parser/jsParser";
export interface IPreviewProps {}

export function Preview(props: IPreviewProps) {
  const [playground, setPlayground] = React.useState("");
  const coreContext = React.useContext(CodeContext);
  const { library } = React.useContext(LibraryContext);

  React.useEffect(() => {
    loadDefaultVersion("react");

    let dll = getCompileSrc(coreContext.coreState.js);

    const systemjs = `<script src="https://cdn.jsdelivr.net/npm/systemjs@6.8.3/dist/system.min.js"></script>`;
    const html = coreContext.coreState.html;
    let libs = library.reduce((a, b) => {
      a[b] = loadCDNURL(b);
      return a;
    }, {} as any);
    console.log(libs, "libs");
    const systemLibrary = {
      imports: {
        ...libs,
      },
    };
    const f = `
    <html>
        <head>
            <!-- 加载systemjs -->
            ${systemjs}

            <!-- 加载依赖 -->
            <script type="systemjs-importmap">
                ${JSON.stringify(systemLibrary)}
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
  }, [coreContext, library]);
  return (
    <div>
      {JSON.stringify(library)}
      <iframe
        src={playground}
        style={{ width: "100%", height: "100%" }}
      ></iframe>
    </div>
  );
}
