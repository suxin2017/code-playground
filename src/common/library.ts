import * as monaco from "monaco-editor";
import { loadCDNFile, loadType } from "../loader/cdnLoader";

export const tsDefineds: string[] = [];

export const tsDefault = monaco.languages.typescript.typescriptDefaults;

export const getNodeModulePath = (name: string, path: string) =>
  `node_modules/${name}/${path}`;
export const getFileNodeModulePath = (name: string, path: string) =>
  `file:///${getNodeModulePath(name, path)}`;

const getReferenceDependencies = (sourceCode: string, path: string) => {
  const foundModules = new Set<string>();
  var match;
  if (sourceCode.indexOf("reference path") > 0) {
    // https://regex101.com/r/DaOegw/1
    const referencePathExtractionPattern = /<reference path="(.*)" \/>/gm;
    while ((match = referencePathExtractionPattern.exec(sourceCode)) !== null) {
      const relativePath = match[1];
      if (relativePath) {
        console.log(relativePath, path);
        foundModules.add(
          relativePath.startsWith(".") ? relativePath : "./" + relativePath
        );
      }
    }
  }
  return Array.from(foundModules);
};

//** A really dumb version of path.resolve */
const mapRelativePath = (moduleDeclaration: string, currentPath: string) => {
  // https://stackoverflow.com/questions/14780350/convert-relative-path-to-absolute-using-javascript
  function absolute(base: string, relative: string) {
    if (!base) return relative;

    const stack = base.split("/");
    const parts = relative.split("/");
    stack.pop(); // remove current file name (or empty string)

    for (var i = 0; i < parts.length; i++) {
      if (parts[i] == ".") continue;
      if (parts[i] == "..") stack.pop();
      else stack.push(parts[i]);
    }
    return stack.join("/");
  }

  return absolute(currentPath, moduleDeclaration);
};

const parseFileForModuleReferences = (sourceCode: string) => {
  // https://regex101.com/r/Jxa3KX/4
  const requirePattern = /(const|let|var)(.|\n)*? require\(('|")(.*)('|")\);?$/gm;
  // this handle ths 'from' imports  https://regex101.com/r/hdEpzO/4
  const es6Pattern = /(import|export)((?!from)(?!require)(.|\n))*?(from|require\()\s?('|")(.*)('|")\)?;?$/gm;
  // https://regex101.com/r/hdEpzO/8
  const es6ImportOnly = /import\s+?\(?('|")(.*)('|")\)?;?/gm;

  const foundModules = new Set<string>();
  var match;

  while ((match = es6Pattern.exec(sourceCode)) !== null) {
    if (match[6]) foundModules.add(match[6]);
  }

  while ((match = requirePattern.exec(sourceCode)) !== null) {
    if (match[5]) foundModules.add(match[5]);
  }

  while ((match = es6ImportOnly.exec(sourceCode)) !== null) {
    if (match[2]) foundModules.add(match[2]);
  }

  return Array.from(foundModules);
};

// 添加动态库
function addLibraryToRuntime(code: string, path: string) {
  console.log("添加类型", path);
  tsDefault.addExtraLib(code, path);
  const uri = monaco.Uri.file(path);
  if (monaco.editor.getModel(uri) === null) {
    monaco.editor.createModel(code, "typescript", uri);
  }
}

type LibraryType =
  | {
      ts: "included";
    }
  | {
      ts: "definitely-typed";
      definitelyTyped: string;
    };
export class Library {
  type: LibraryType;
  name: string;
  version?: string;
  packageJson?: string;

  constructor(name: string, typs: LibraryType, version?: string) {
    this.name = name;
    this.type = typs;
    this.version = version;
  }

  static async createLib(name: string, version?: string) {
    let libType: LibraryType = { ts: "included" };
    if (!name.startsWith("@types")) {
      libType = await loadType(name);
    }

    return new Library(name, libType, version);
  }

  async loadTypeDefined() {
    // 由于外部定义的类型
    if (this.type?.ts === "definitely-typed") {
      const definiteLib = Library.createLib(this.type.definitelyTyped);
      (await definiteLib).loadTypeDefined();
    } else {
      const rawJson = await this.getPackageJson();
      const packageJSON = JSON.parse(rawJson);
      // non-inferred route
      let rootTypePath =
        packageJSON.typing || packageJSON.typings || packageJSON.types;

      // package main is custom
      if (
        !rootTypePath &&
        typeof packageJSON.main === "string" &&
        packageJSON.main.indexOf(".js") > 0
      ) {
        rootTypePath = packageJSON.main.replace(/js$/, "d.ts");
      }

      // Final fallback, to have got here it must have passed in algolia
      if (!rootTypePath || rootTypePath === "index") {
        rootTypePath = "index.d.ts";
      }

      await this.loadDepTsDefined(rootTypePath);
    }
  }
  async getFile(path: string) {
    return await loadCDNFile(this.name, this.version, path);
  }
  async loadDepTsDefined(currentPath: string) {
    const modulePath = this.getLibPath(currentPath);

    if (tsDefineds.indexOf(modulePath) !== -1) {
      return;
    }
    tsDefineds.push(modulePath);
    const context = await this.getFile(currentPath);
    const tsContext = this.getLibContext(context);
    addLibraryToRuntime(tsContext, modulePath);

    let importDeps = parseFileForModuleReferences(context);
    let referDeps = getReferenceDependencies(context, currentPath);
    importDeps.concat(referDeps).map(async (dep) => {
      const isRelative = dep.startsWith(".");
      if (isRelative) {
        const relativePath = mapRelativePath(dep, currentPath);
        console.log(relativePath);
        const path = relativePath.endsWith(".d.ts")
          ? relativePath
          : relativePath + ".d.ts";

        await this.loadDepTsDefined(path);
      } else {
        const depTypeLib = Library.createLib(dep);
        (await depTypeLib).loadTypeDefined();
      }
    });
  }

  getLibPath(path: string) {
    if (this.name.startsWith("@types")) {
      return getFileNodeModulePath(this.name, path);
    }
    return getNodeModulePath(this.name, path);
  }

  getLibContext(context: string) {
    if (this.name.startsWith("@types")) {
      return context;
    }
    return context;
    // return `declare module "${this.name}" { ${context} }`;
  }

  async getPackageJson() {
    if (!this.packageJson) {
      const packageJson = await loadCDNFile(
        this.name,
        this.version,
        "package.json"
      );
      this.packageJson = packageJson;
      addLibraryToRuntime(packageJson, this.getLibPath("package.json"));
    }
    return this.packageJson!;
  }
}
