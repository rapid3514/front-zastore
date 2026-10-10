import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const frontendOrigin = 'http://127.0.0.1:5173'
const tunnelUrlPattern = /https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/
const viteCliPath = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url))

let viteProcess
let shuttingDown = false
let tunnelOutput = ''

const cloudflared = spawn('cloudflared', ['tunnel', '--url', frontendOrigin], {
  shell: false,
  stdio: ['inherit', 'pipe', 'pipe'],
})

function stopChild(child) {
  if (child && !child.killed) child.kill()
}

function shutdown(exitCode) {
  if (shuttingDown) return
  shuttingDown = true
  stopChild(viteProcess)
  stopChild(cloudflared)
  process.exitCode = exitCode
}

function startViteForTunnel(tunnelUrl) {
  if (viteProcess) return

  const allowedHost = new URL(tunnelUrl).hostname
  console.log(`\nCloudflare URL: ${tunnelUrl}`)
  console.log(`Vite faqat ${allowedHost} tunnel hostiga ruxsat beradi.\n`)

  viteProcess = spawn(process.execPath, [viteCliPath], {
    env: { ...process.env, VITE_DEV_ALLOWED_HOST: allowedHost },
    shell: false,
    stdio: 'inherit',
  })

  viteProcess.on('error', (error) => {
    console.error('Vite ishga tushmadi:', error)
    shutdown(1)
  })

  viteProcess.on('close', (code) => {
    if (!shuttingDown) shutdown(code ?? 1)
  })
}

function inspectTunnelOutput(data, output) {
  const message = data.toString()
  output.write(message)
  tunnelOutput = `${tunnelOutput}${message}`.slice(-8192)
  const match = tunnelOutput.match(tunnelUrlPattern)
  if (match) startViteForTunnel(match[0])
}

cloudflared.stdout.on('data', (data) => inspectTunnelOutput(data, process.stdout))
cloudflared.stderr.on('data', (data) => inspectTunnelOutput(data, process.stderr))

cloudflared.on('error', (error) => {
  console.error('cloudflared ishga tushmadi:', error)
  shutdown(1)
})

cloudflared.on('close', (code) => {
  if (!shuttingDown) shutdown(code ?? 1)
})

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))
