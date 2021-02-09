export async function fetchJson<T>(url:string){
    const res = await fetch(url);
    return await res.json() as Promise<T>;
}

export async function fetchText(url:string){
    const res = await fetch(url);
    return await res.text();
}