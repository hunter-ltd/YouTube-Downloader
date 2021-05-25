const { readdir, mkdir, rmdir, copyFile } = require("fs").promises;
const { existsSync } = require("fs");
const { resolve, dirname, basename } = require("path");
const { exec } = require("child_process");

// a recursive generator that basically eliminates callback hell (cough stackoverflow)
async function* getAllFiles(dir) {
  const items = await readdir(dir, { withFileTypes: true }); // gets all the items in the current dir
  for (const item of items) {
    const res = resolve(dir, item.name);
    if (item.isDirectory()) {
      yield* getAllFiles(res); // yields a new generator created from the given directory
    } else {
      yield res; // yields the file path
    }
  }
}

async function compile() {
  const buildDir = resolve(process.cwd(), "build");
  if (existsSync(buildDir)) {
    await rmdir(buildDir, { recursive: true });
  }
  exec("tsc");

  for await (const file of getAllFiles(resolve(process.cwd(), "src"))) {
    let parent = dirname(file);
    if (!(parent.endsWith("ts") || parent.endsWith("js"))) {
      try {
        await mkdir(resolve(buildDir, basename(parent)), { recursive: true });
        copyFile(file, resolve(buildDir, basename(parent), basename(file)));
      } catch (e) {
        console.error(e);
      }
    }
  }
}

(async () => {
  try {
    await compile();
    console.log("Electron TypeScript successfully compiled!");
  } catch (error) {
    console.error(e);
  }
})();
