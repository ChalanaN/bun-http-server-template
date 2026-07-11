import * as fs from "node:fs/promises"
import * as path from "node:path"
import { redis } from "bun";
import { MIME_TYPES, type AllowedFileExtensions } from "./utils";

const STATIC_DIR = path.resolve(__dirname, process.env.STATIC_DIR || "public")
const StaticFileMap = new Map<string, number>()
const MEM_CACHABLE_FILES = ["html", "js", "css", "ico", "svg"]
const MEM_CACHE_TIMEOUT = 1800

// Load a static file map into memory to reduce I/O calls
;(await fs.readdir(STATIC_DIR, {
    recursive: true,
    withFileTypes: true
})).forEach(entry => entry.isFile() && StaticFileMap.set(entry.parentPath + "/" + entry.name, 0))

const resolveStaticPath = (resolvedPath: string): string => {
    if (StaticFileMap.has(resolvedPath)) return resolvedPath
    if (StaticFileMap.has(resolvedPath + ".html")) return resolvedPath + ".html"
    if (StaticFileMap.has(resolvedPath = path.join(resolvedPath, "index.html"))) return resolvedPath
    return path.join(STATIC_DIR, "404.html")
}

const sendFile = async (filepath: string, options?: ResponseInit): Promise<Response> => {
    filepath = decodeURIComponent(filepath)
    let resolvedPath = path.resolve(STATIC_DIR, "." + filepath)

    if (resolvedPath == STATIC_DIR) resolvedPath = path.join(resolvedPath, "index.html")
    if (!resolvedPath.startsWith(STATIC_DIR + path.sep)) return Promise.resolve(new Response("403", { status: 403 }))

    resolvedPath = resolveStaticPath(resolvedPath)
    let fileExtension = resolvedPath.match(/\.(\w+?)$/)?.[1]

    let fileBuf = await redis.getBuffer(`file:${resolvedPath}`)
    if (fileBuf) {
        console.log(Date.now(), "cache hit:", resolvedPath, fileBuf.length)
        return new Response(fileBuf, {
            headers: {
                "Content-Type": MIME_TYPES[fileExtension as AllowedFileExtensions] || "text/plain",
                "Content-Length": fileBuf.length.toString()
            },
            ...options
        })
    }

    let file = Bun.file(resolvedPath)

    if (fileExtension && MEM_CACHABLE_FILES.includes(fileExtension)) {
        let fileBuf = new Uint8Array(await file.arrayBuffer())
        console.log("done caching:", resolvedPath, fileBuf.length)
        redis.set(`file:${resolvedPath}`, fileBuf, "EX", MEM_CACHE_TIMEOUT)

        return new Response(fileBuf, {
            headers: {
                "Content-Type": MIME_TYPES[fileExtension as AllowedFileExtensions] || "text/plain",
                "Content-Length": file.size.toString()
            },
            ...options
        })
    }

    return new Response(file, options)
}

const server = Bun.serve({
    port: process.env.PORT || 80,

    async fetch(req) {
        switch (req.method) {
            case "GET":
                const requestURL = new URL(req.url)

                return await sendFile(requestURL.pathname)

            default:
                return new Response("405", { status: 405 })
        }
    },

    error(err) {
        if (err.code == "ENOENT") {
            return new Response("404", { status: 404 })
        } else {
            console.log(err)
            return new Response("500", { status: 500 })
        }
    }
})

console.log("server ready at:", `\x1B[34m${server.url.href}\x1B[0m`)