import { execSync } from "node:child_process";
import { bunBuild } from "bun";

await bunBuild({
  entrypoints: ["src/index.ts"],
  outdir: "dist",
  target: "node",
  format: "esm",
  external: ["@elizaos/core"],
});

execSync("tsc --emitDeclarationOnly --outDir dist", { cwd: import.meta.dir });
console.log("plugin-video-generation built successfully");
