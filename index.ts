import * as path from "node:path"

const STATIC_DIR = path.resolve(__dirname, process.env.STATIC_DIR || "public")

const sendFile = (filepath: string, options?: { statusCode?: number }): Response => {
    filepath = decodeURIComponent(filepath.slice(1, filepath.length))
    let resolvedPath = path.resolve(STATIC_DIR, filepath)

    if (!resolvedPath.startsWith(STATIC_DIR)) return new Response("403")

    return new Response(Bun.file(resolvedPath), {
        status: options?.statusCode
    })
}

Bun.serve({
    port: process.env.PORT || 80,

    async fetch(req) {
        const requestURL = new URL(req.url)

        console.log(requestURL.pathname)

        return sendFile(requestURL.pathname)
    },

    error(err) {
        if (err.code == "ENOENT") {
            return new Response("404")
        } else {
            console.log(err)
            return new Response("500")
        }
    }
})