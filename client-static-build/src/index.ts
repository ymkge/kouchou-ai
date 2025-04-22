import { exec } from "node:child_process";
import { dirname, join } from "node:path";
import { PassThrough } from "node:stream";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import archiver from "archiver";
import express from "express";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const clientDir = join(__dirname, "../../client");
const outDir = join(clientDir, "out");

const ZIP_FILE_NAME = "kouchou-ai.zip";

const app = express();

app.post("/build", async (req, res) => {
  try {
    console.log("Build request received");
    // 1. ビルド実行
    const { stdout, stderr } = await execAsync("npm run build:static", {
      cwd: clientDir,
      env: {
        ...process.env,
        PATH: process.env.PATH ?? "",
        NODE_ENV: "production",
      },
    });

    console.log("Build stdout:", stdout);
    if (stderr) console.warn("Build stderr:", stderr);

    // 2. zip ストリームを作成
    const archive = archiver("zip", { zlib: { level: 9 } });
    const zipStream = new PassThrough();

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${ZIP_FILE_NAME}`,
    );

    // 3. ストリームをレスポンスに流す
    archive.pipe(zipStream).pipe(res);

    // 4. zip に outDir を追加して完了
    archive.directory(outDir, false);
    await archive.finalize();
  } catch (err) {
    console.error("Build or Zip error:", err);
    res.status(500).json({
      status: "error",
      message: err instanceof Error ? err.message : String(err),
    });
  }
});

const PORT = 3200;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
