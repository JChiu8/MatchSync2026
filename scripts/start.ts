async function run(command: string[]) {
  const child = Bun.spawn({ cmd: command, stdin: "inherit", stdout: "inherit", stderr: "inherit" });
  if ((await child.exited) !== 0) {
    throw new Error(`Command failed: ${command.join(" ")}`);
  }
}

const bunExecutable = process.execPath;
// `bun run start` is intentionally a restart command. Only stop processes on
// MatchSync's own local ports; unrelated processes are left alone.
const stopExisting = Bun.spawn([
  "powershell.exe",
  "-NoProfile",
  "-Command",
  "$ports = 3210,5173; Get-NetTCPConnection -LocalPort $ports -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }",
], { stdin: "inherit", stdout: "inherit", stderr: "inherit" });
await stopExisting.exited;
await Bun.sleep(500);
const alreadyRunning = false;
const frontendAlreadyRunning = false;
if (!alreadyRunning) {
  // This creates or synchronizes the selected Convex development deployment and its generated API types.
  await run([bunExecutable, "x", "convex", "dev", "--once"]);
}

if (!(await Bun.file(".convex-auth-configured").exists())) {
  await run([bunExecutable, "run", "auth:configure"]);
}

const convexProcess = alreadyRunning ? null : Bun.spawn([bunExecutable, "x", "convex", "dev"], { stdin: "inherit", stdout: "inherit", stderr: "inherit" });
const viteProcess = frontendAlreadyRunning ? null : Bun.spawn([bunExecutable, "x", "vite"], { stdin: "inherit", stdout: "inherit", stderr: "inherit" });

await Promise.race([...(viteProcess ? [viteProcess.exited] : []), ...(convexProcess ? [convexProcess.exited] : [])]);
convexProcess?.kill();
viteProcess?.kill();
