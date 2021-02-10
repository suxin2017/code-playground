import {
  getNpmVersionUrl,
  getFileInfoUrl,
  getFileUrl,
  getNpmSearchUrl,
} from "../common/cdn";
import { fetchJson, fetchText } from "../common/fetch";
import { DefinitelyType, FileInfo, IncludedType } from "../types";

export async function loadDefaultVersion(libraryName: string) {
  const version = await fetchJson<{
    tags: { latest: string; next: string };
    versions: string[];
  }>(getNpmVersionUrl(libraryName));
  return version?.tags?.latest;
}

export async function loadPackageCdnFiles(
  libraryName: string,
  version: string
) {
  const packageInfo = await fetchJson<FileInfo>(
    getFileInfoUrl(libraryName, version)
  );
  return packageInfo;
}

export async function loadDefaultPackageFiles(libraryName: string) {
  const lastVersion = await loadDefaultVersion(libraryName);
  const filesInfo = await loadPackageCdnFiles(libraryName, lastVersion);
  return filesInfo;
}

export async function loadNpmPackageInfo(libraryName: string) {
  const npmPackageInfo = await fetchJson(getNpmSearchUrl(libraryName));
  return npmPackageInfo;
}

export async function loadCDNFile(
  libraryName: string,
  version?: string,
  path?: string
) {
  const fileContent = await fetchText(getFileUrl(libraryName, version, path));
  return fileContent;
}

export function loadCDNURL(
  libraryName: string,
  version?: string,
  path?: string
) {
  return getFileUrl(libraryName, version, path);
}

export async function loadType(moduleName: string) {
  const moduleTypeInfo = await fetchJson<IncludedType | DefinitelyType>(
    getNpmSearchUrl(moduleName, ["types"])
  );

  return moduleTypeInfo.types;
}
