import { Button, Input, List, Modal, Radio } from "antd";
import * as React from "react";
import { LibraryContext } from "../../App";

export interface ISettingProps {
  cssLib: string[];
  setCssLib: React.Dispatch<React.SetStateAction<string[]>>;
  jsLib: any[];
  setJsLib: React.Dispatch<React.SetStateAction<any[]>>;
  global: boolean;
  setGlobal: React.Dispatch<React.SetStateAction<boolean>>;
  open?: boolean;
  onCancel?: ()=>void;
  type?: 'css' | 'js' | 'html',
  visible:boolean
}


export function Setting(props: ISettingProps) {
  const [currentCssLib, setCurrentCssLib] = React.useState("");
  const [currentJsLibName, setCurrentJsLibName] = React.useState("");
  const [currentJsLibPath, setCurrentJsLibPath] = React.useState("");
  const { dispatch } = React.useContext(LibraryContext);
  const { type = 'css' } = props;
  const title = {
    js: 'js 设置',
    css: 'css 设置',
    html: 'html 设置'
  }
  return (
    <Modal visible={props.visible} title={title[type]} footer={null} onCancel={()=>{
      props?.onCancel?.()
    }}>
      <div style={{ color: "#fff" }}>
        <div>
          <div>
            <Input
              placeholder={"样式"}
              value={currentCssLib}
              onChange={(e) => setCurrentCssLib(e.target.value)}
            ></Input>
          </div>
          <div>
            <List
              dataSource={props.cssLib}
              renderItem={item => {
                return<>
                 <List.Item>
                  {item}
                </List.Item>
                 <Button
                 onClick={() => {
                   const i = props.cssLib.indexOf(item);
                   props.cssLib.splice(i, 1);
                   props.setCssLib([
                     ...props.cssLib,
                   ]);
                 }}
               >
                 删除
             </Button>
             </>
              }}
            />
          </div>
          <Button
            onClick={() => {
              props.setCssLib([...props.cssLib, currentCssLib]);
            }}
          >
            添加样式
        </Button>
        </div>
        <div>
          <div>添加依赖</div>

          <Radio.Group value={props.global} onChange={(e) => {
            let v = e.target.value;
            props.setGlobal(v);
          }}>
            <Radio value={true}>全局引入</Radio>
            <Radio value={false}>模块引入</Radio>
          </Radio.Group>
          <div>
            <Input
              placeholder="模块名"
              value={currentJsLibName}
              onChange={(e) => setCurrentJsLibName(e.target.value)}
            />
            <Input
              placeholder="模块umd路径"
              value={currentJsLibPath}
              onChange={(e) => setCurrentJsLibPath(e.target.value)}
            />
          </div>
          <List
            dataSource={props.jsLib}
            renderItem={item => {
              let key = Object.keys(item)[0] as string;
              return <List.Item>
                {key}:{item[key]}
                <Button
                  onClick={() => {
                    const i = props.jsLib.findIndex(i => i[key] != null);
                    props.jsLib.splice(i, 1);
                    props.setJsLib([
                      ...props.jsLib,
                    ]);
                  }}
                >
                  删除
              </Button>
              </List.Item>
            }}
          />
          <Button
            onClick={() => {
              props.setJsLib([
                ...props.jsLib,
                { [currentJsLibName]: currentJsLibPath },
              ]);
            }}
          >
            添加依赖
        </Button>
        </div>
      </div>
    </Modal >

  );
}
