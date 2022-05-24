const fs = require("fs").promises;
const src = "./extension";
const dist = "./extension_dist";
const url = process.argv[2];

async function main() {
    try {
        await fs.rm(`${dist}`, { recursive: true });
    }
    catch(err) {
        console.log("Old dist doesn't exist, creating new dist");
    }

    await fs.mkdir(`${dist}`);
    const fileList = await fs.readdir(`${src}`);

    for (let file of fileList) {
        if (file == "main.js" || file == "capture.js") {
            let content = await fs.readFile(`${src}/${file}`, { encoding: "utf-8" });
            content = content.replace(/\$khoaluan-rollcall-url/g, url);

            await fs.writeFile(`${dist}/${file}`, content);
        }
        else {
            await fs.copyFile(`${src}/${file}`, `${dist}/${file}`)
        }
    }
}

main();