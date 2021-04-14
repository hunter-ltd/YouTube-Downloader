const { readdir, mkdir, copyFile } = require('fs').promises;
const { resolve, dirname, basename } = require('path');
const { exec } = require('child_process');

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

const compile = async () => {
    exec("tsc");
    for await (const file of getAllFiles(resolve(process.cwd(), "src"))) {
        let parent = dirname(file);
        if (!(parent.endsWith("ts") || parent.endsWith("js"))) {
            mkdir(resolve(process.cwd(), "build", basename(parent)), { recursive: true }).then(() => {
                copyFile(file, resolve(process.cwd(), "build", basename(parent), basename(file))).catch(err => {
                    return new Promise((resolve1, reject) => reject(err));
                });
            }).catch(() => {
                copyFile(file, resolve(process.cwd(), "build", basename(parent), basename(file))).catch(err => {
                    return new Promise((resolve1, reject) => reject(err));
                });
            });
        }
    }
    return new Promise(resolve => resolve());
}

compile().then(() => console.log('Electron TypeScript successfully compiled')).catch(err => console.error(err));
