export type IncludedType = {
  types: {
    ts: "included";
  };
};

export type DefinitelyType = {
  types: {
    ts: "definitely-typed";
    definitelyTyped: string;
  };
};

export type File = {
  hash: string;
  name: string;
  size: number;
  time: Date;
  type: "file";
};

export type Dir = {
  name: string;
  files: File | Dir[];
  type: "file";
};
export type FileInfo = {
  default: string;
  files: File | Dir[];
};

export type AnyObj = {
  [key: string]: string;
};
