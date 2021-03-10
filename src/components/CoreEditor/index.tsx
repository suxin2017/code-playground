import * as React from "react";
import { editor, languages, Uri } from "monaco-editor";
import { debounce } from "lodash";
import styles from "./index.module.css";
import SettingIcon from "./icon/setting.svg";
import { CodeContext } from "../../App";

import("monaco-themes/themes/Night Owl.json").then((data) => {
  // @ts-ignore
  editor.defineTheme("N", data);
  editor.setTheme("N");
});

export interface ICoreEditorProps {
  initValue: string;
  language: string;
  value?:string;
  onChange?: (instance: editor.IStandaloneCodeEditor) => void;
  onSettingClick?: ()=>void;
}

export function CoreEditor(props: ICoreEditorProps) {
  const { value,initValue, language } = props;
  const coreState = React.useContext(CodeContext);
  const ref = React.useRef<HTMLDivElement>(null);
  const editorRef = React.useRef<editor.IStandaloneCodeEditor>();

  React.useEffect(() => {
    if (ref.current && !editorRef.current) {
      const model = editor.createModel(
        initValue,
        language,
        Uri.parse(`file:///main.${language === 'typescript' ? 'tsx' : language}`)
      );
      editorRef.current = editor.create(ref.current!, {
        // value: initValue,
        language: language,
        automaticLayout: true,
        fontSize: 16,
        lineNumbers: "off",
        minimap: {
          enabled: false,
        },
        model,
      });
      editorRef.current.onDidChangeModelContent(
        debounce(function (e) {
          props?.onChange?.(editorRef.current!);
        }, 2000)
      );
    }
  }, []);

  React.useEffect(()=>{
    if(value && coreState.coreState.once){
      editorRef.current?.getModel()?.setValue(value);
    }
  },[coreState.coreState.once])

  return (
    <div className={styles.editor}>
      <div className={styles.header}>
        <span>{language}</span>
      
      </div>
      <div
        ref={ref}
        style={{ width: "100%", height: "calc(100% - 24px)" }}
      ></div>
    </div>
  );
}
