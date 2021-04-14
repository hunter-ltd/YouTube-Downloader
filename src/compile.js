const os = require('os');
const { exec } = require('child_process');

// TODO: Add MacOSX and Linux (look here for values: https://stackoverflow.com/questions/45082648/npm-package-json-os-specific-script)
const compile = () => {
    let command = "tsc && "
    switch (os.type()) {
        case "Windows_NT":
            command += "robocopy src build *.html *.css";
            break;
        case "Darwin":
            command += "cp src/*.html src/*.css build/";
            break;
        default:
            throw new Error("Unsupported OS: " + os.type());
    }
    exec(command);
}

compile();
