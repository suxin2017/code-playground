export const getNpmSearchUrl = (moduleName: string, attributes?: string[]) =>
  `https://ofcncog2cu-dsn.algolia.net/1/indexes/npm-search/${moduleName}?${
    attributes ? `attributes=${attributes?.join(",")}` : ""
  }&x-algolia-agent=Algolia%20for%20vanilla%20JavaScript%20(lite)%203.27.1&x-algolia-application-id=OFCNCOG2CU&x-algolia-api-key=f54e21fa3a2a0160595bb058179bfb1e`;

export const CDN_URL = `https://data.jsdelivr.com/v1/package/npm/`;

export const getFileUrl = (libraryName: string, version?: string, path?: string) =>
  `https://cdn.jsdelivr.net/npm/${libraryName}${version && "@" + version}${
    path && "/" + path
  }`;

export const getNpmVersionUrl = (libraryName: string) => `${CDN_URL}${libraryName}`;

export const getFileInfoUrl = (libraryName: string, version: string) =>
  `${CDN_URL}${libraryName}${version && "@" + version}`;
