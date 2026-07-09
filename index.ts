import * as fs from "node:fs/promises"
import * as path from "node:path"

const STATIC_DIR = path.resolve(__dirname, process.env.STATIC_DIR || "public")
const StaticFileMap = new Map<string, number>()

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

const sendFile = (filepath: string, options?: { statusCode?: number }): Response => {
    filepath = decodeURIComponent(filepath)
    let resolvedPath = path.resolve(STATIC_DIR, "." + filepath)

    if (resolvedPath == STATIC_DIR) resolvedPath = path.join(resolvedPath, "index.html")
    if (!resolvedPath.startsWith(STATIC_DIR + path.sep)) return new Response("403", { status: 403 })

    return new Response(Bun.file(resolveStaticPath(resolvedPath)), {
        status: options?.statusCode
    })
}

const server = Bun.serve({
    port: process.env.PORT || 80,

    async fetch(req) {
        switch (req.method) {
            case "GET":
                const requestURL = new URL(req.url)

                return sendFile(requestURL.pathname)

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