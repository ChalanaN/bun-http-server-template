import * as path from "node:path"

const STATIC_DIR = path.resolve(__dirname, process.env.STATIC_DIR || "public")

const sendFile = (filepath: string, options?: { statusCode?: number }): Response => {
    filepath = decodeURIComponent(filepath)
    let resolvedPath = path.resolve(STATIC_DIR, "." + filepath)

    if (!resolvedPath.startsWith(STATIC_DIR + path.sep)) return new Response("403", { status: 403 })

    return new Response(Bun.file(resolvedPath), {
        status: options?.statusCode
    })
}

Bun.serve({
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