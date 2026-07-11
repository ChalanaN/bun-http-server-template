export const MIME_TYPES = {
  // Audio
  "aac": "audio/aac",
  "midi": "audio/x-midi",
  "mid": "audio/x-midi",
  "mp3": "audio/mpeg",
  "oga": "audio/ogg",
  "opus": "audio/opus",
  "weba": "audio/webm",

  // Video
  "avi": "video/x-msvideo",
  "av1": "video/av1",
  "mp4": "video/mp4",
  "mpeg": "video/mpeg",
  "mpg": "video/mpeg",
  "ogv": "video/ogg",
  "ts": "video/mp2t",
  "webm": "video/webm",
  "3gp": "video/3gpp",
  "3g2": "video/3gpp2",

  // Image
  "avif": "image/avif",
  "bmp": "image/bmp",
  "gif": "image/gif",
  "ico": "image/x-icon",
  "jpeg": "image/jpeg",
  "jpg": "image/jpeg",
  "png": "image/png",
  "svg": "image/svg+xml",
  "tiff": "image/tiff",
  "tif": "image/tiff",
  "webp": "image/webp",

  // Text & Documents
  "css": "text/css",
  "csv": "text/csv",
  "html": "text/html",
  "htm": "text/html",
  "ics": "text/calendar",
  "js": "text/javascript",
  "mjs": "text/javascript",
  "txt": "text/plain",
  "pdf": "application/pdf",
  "rtf": "application/rtf",

  // Data & Application
  "bin": "application/octet-stream",
  "epub": "application/epub+zip",
  "gz": "application/gzip",
  "json": "application/json",
  "jsonld": "application/ld+json",
  "ogx": "application/ogg",
  "wasm": "application/wasm",
  "xhtml": "application/xhtml+xml",
  "xml": "application/xml",
  "zip": "application/zip",

  // Fonts
  "eot": "application/vnd.ms-fontobject",
  "otf": "font/otf",
  "ttf": "font/ttf",
  "woff": "font/woff",
  "woff2": "font/woff2",

  // 3D Models
  "gltf": "model/gltf+json",
  "glb": "model/gltf-binary"
} as const

export type AllowedFileExtensions = keyof typeof MIME_TYPES;
export type AllowedMimeType = (typeof MIME_TYPES)[AllowedFileExtensions];