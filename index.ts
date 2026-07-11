import { spawn } from "bun";

const concurrency = Number(process.env.CONCURRENCY) || navigator.hardwareConcurrency
const processes: Bun.Subprocess[] = new Array(concurrency)

for (let i = 0; i < concurrency; i++) {
    processes[i] = spawn({
        cmd: ["bun", "server.ts", i.toString().padStart(2, "0")],
        stdout: "inherit",
        stderr: "inherit"
    })
}

const kill = () => processes.forEach(p => p.kill())

process.on("SIGINT", kill)
process.on("exit", kill)