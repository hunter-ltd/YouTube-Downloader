const { readdir, mkdir, copyFile } = require("fs").promises;
const { unlinkSync, existsSync, rmSync } = require("fs");
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

const compile = () => {
  return new Promise(async (resolvePromise, rejectPromise) => {
    const buildDir = resolve(process.cwd(), "build");

    if (existsSync(buildDir)) {
      // clear out the build directory
      rmSync(buildDir, { recursive: true, force: true });
    }

    exec("tsc"); // compile TypeScript

    for await (const file of getAllFiles(resolve(process.cwd(), "src"))) {
      let parent = dirname(file);
      if (!(parent.endsWith("ts") || parent.endsWith("js"))) {
        mkdir(resolve(process.cwd(), "build", basename(parent)), {
          recursive: true,
        }).finally(() => {
          // I want the files copied regardless of if the directory exists or not. If there is a more severe
          // error that rejects the copying, then that will reject this function with the same error
          copyFile(
            file,
            resolve(process.cwd(), "build", basename(parent), basename(file))
          ).catch((err) => {
            rejectPromise(err);
          });
        });
      }
    }
    resolvePromise();
  });
};

compile()
  .then(() => console.log("Electron TypeScript successfully compiled"))
  .catch((err) => console.error(err));
