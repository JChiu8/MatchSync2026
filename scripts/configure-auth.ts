import { exportJWK, exportPKCS8, generateKeyPair } from "jose";

const siteUrl = "http://localhost:5173";

async function run(command: string[]) {
  const process = Bun.spawn({ cmd: command, stdin: "inherit", stdout: "inherit", stderr: "inherit" });
  if ((await process.exited) !== 0) {
    throw new Error(`Command failed: ${command.join(" ")}`);
  }
}

const keyPair = await generateKeyPair("RS256", { extractable: true });
const privateKey = (await exportPKCS8(keyPair.privateKey)).trimEnd().replace(/\n/g, " ");
const publicKey = await exportJWK(keyPair.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });

await run(["bunx", "convex", "env", "set", `JWT_PRIVATE_KEY=${privateKey}`]);
await run(["bunx", "convex", "env", "set", `JWKS=${jwks}`]);
await run(["bunx", "convex", "env", "set", `SITE_URL=${siteUrl}`]);

await Bun.write(".convex-auth-configured", "Convex Auth keys configured for this local workspace.\n");
console.log("Convex Auth environment configured for http://localhost:5173.");
