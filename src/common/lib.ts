import { editor, languages } from "monaco-editor";
import * as monaco from "monaco-editor";
import {
  loadCDNFile,
  loadDefaultVersion,
  loadNpmPackageInfo,
  loadPackageCdnFiles,
  loadType,
} from "../loader/cdnLoader";
import { DefinitelyType, FileInfo, IncludedType } from "../types";

export const types = new Map();

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

const getReferenceDependencies = (sourceCode: string, path: string) => {
  const foundModules = new Set<string>();
  var match;
  if (sourceCode.indexOf("reference path") > 0) {
    // https://regex101.com/r/DaOegw/1
    const referencePathExtractionPattern = /<reference path="(.*)" \/>/gm;
    while ((match = referencePathExtractionPattern.exec(sourceCode)) !== null) {
      const relativePath = match[1];
      if (relativePath) {
        let newPath = mapRelativePath(relativePath, path);
        if (newPath) {
          foundModules.add("./" + newPath);
        }
      }
    }
  }
  return Array.from(foundModules);
};

export class Lib {
  libraryName: string;

  version?: string;

  fileList?: FileInfo;

  static default = monaco.languages.typescript.typescriptDefaults;

  static addLibraryToRuntime = (code: string, path: string) => {
    console.log("添加类型", path);
    Lib.default.addExtraLib(code, path);
    const uri = monaco.Uri.file(path);
    if (monaco.editor.getModel(uri) === null) {
      monaco.editor.createModel(code, "typescript", uri);
    }
  };

  packageInfo: any;

  type?: IncludedType | DefinitelyType;

  packageJSON?: string;

  typeDefined?: FileInfo;

  constructor(libraryName: string, version?: string) {
    this.libraryName = libraryName;
    if (version) {
      this.version = version;
    }
  }

  async load() {
    if (!this.version) {
      const lastVersion = await loadDefaultVersion(this.libraryName);
      this.version = lastVersion;
    }
    if (!this.type && !this.libraryName.startsWith("@types")) {
      this.type = await loadType(this.libraryName);
    }
    if (!this.fileList) {
      if (this.version) {
        this.fileList = await loadPackageCdnFiles(
          this.libraryName,
          this.version
        );
      } else {
        console.log("这种情况应该不会出现");
      }
    }

    return this;
  }
  async getPackageJson() {
    if (!this.packageJSON) {
      const packageJSON = await loadCDNFile(
        this.libraryName,
        this.version,
        "package.json"
      );
      this.packageJSON = packageJSON;
    }
    return this.packageJSON!;
  }

  async getPackageInfo() {
    if (!this.packageInfo) {
      this.packageInfo = await loadNpmPackageInfo(this.libraryName);
    }
    return this.packageInfo;
  }

  async getTypeDefined() {
    if (this.type?.types?.ts === "definitely-typed") {
      console.log(this.libraryName, "libararyName");
      const typeLib = new Lib(this.type.types.definitelyTyped, this.version);
      console.log(await (await typeLib.load()).getTypeDefined());
    } else {
      const rawJson = await this.getPackageJson();
      const packageJSON = JSON.parse(rawJson);
      Lib.addLibraryToRuntime(
        rawJson,
        `node_modules/${this.libraryName}/package.json`
      );

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

      console.log(rootTypePath, "rootTypePath");
      await this.getDep(rootTypePath);

      return rootTypePath;
    }
  }

  async getFile(path: string) {
    return await loadCDNFile(this.libraryName, this.version, path);
  }

  async getDep(currentPath: string) {
    if (types.has(currentPath)) {
      return;
    }
    const mainDts = await this.getFile(currentPath);

    if (mainDts) {
      let deps = parseFileForModuleReferences(mainDts);
      let referDeps = getReferenceDependencies(mainDts, currentPath);

      const typelessModule = this.libraryName.split("@types/").slice(-1);
      const wrapped = `declare module "${typelessModule}" { ${mainDts} }`;
      Lib.addLibraryToRuntime(
        wrapped,
        `node_modules/${this.libraryName}/${currentPath}`
      );

      await Promise.all(
        deps.concat(referDeps).map(async (dep) => {
          const isRelative = dep.startsWith(".");
          if (isRelative) {
            const relativePath = mapRelativePath(dep, currentPath);
            const path = relativePath.endsWith(".d.ts")
              ? relativePath
              : relativePath + ".d.ts";

            await this.getDep(path);
          } else {
            const packageJSON = JSON.parse(await this.getPackageJson());
            const dependencies = packageJSON.dependencies;

            const typeLib = new Lib(
              dep,
              dependencies[dep] === "*" ? undefined : dependencies[dep]
            );

            await (await typeLib.load()).getTypeDefined();
          }
        })
      );
    }
  }
}
