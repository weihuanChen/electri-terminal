import fs from "node:fs";
import path from "node:path";

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((fileName) => {
    const filePath = path.join(dir, fileName);
    const isDirectory = fs.statSync(filePath).isDirectory();

    if (isDirectory) {
      walkDir(filePath, callback);
    } else {
      callback(filePath);
    }
  });
}

let count = 0;

walkDir("./app/admin", (filePath) => {
  if (!filePath.endsWith(".tsx")) return;

  const original = fs.readFileSync(filePath, "utf8");
  const content = original.replace(
    /bg-white dark:bg-zinc-900\/(\d+)/g,
    "bg-white/$1"
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log("Fixed", filePath);
    count += 1;
  }
});

console.log(`Done fixing ${count} files.`);
