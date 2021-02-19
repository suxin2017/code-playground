import * as React from "react";
import { LibraryContext } from "../../App";

export interface ISettingProps {}

export function Setting(props: ISettingProps) {
  const [currentLib, setCurrentLib] = React.useState("");
  const { dispatch } = React.useContext(LibraryContext);
  return (
    <div>
      添加依赖
      <input
        value={currentLib}
        onChange={(e) => setCurrentLib(e.target.value)}
      ></input>
      <button
        onClick={() => {
          dispatch({
            type: "add",
            moduleName: currentLib,
          });
        }}
      >
        add
      </button>
    </div>
  );
}
