const fs = require('fs');
const ps = require('ps-node');
const path = require("path");
const asar = require('asar');

async function main() {
  const asarPath = "/Applications/GitKraken.app/Contents/Resources/app.asar";
  const tmpDir = "/tmp/GitCracken/";
  const patchPath = "v1.patch";

  console.log("Clearing temp dir if exist");
  if (fs.existsSync(tmpDir)) {
    rmdir(tmpDir);
  }

  console.log("Unpacking .asar ...");
  asar.extractAll(asarPath, tmpDir);
  console.log("Unpacked");

  const indexPath = tmpDir + "static/index.js";
  const flagPath = tmpDir + "GitCracken" + patchPath + ".flag";

  console.log("Checking patch");
  if (fs.existsSync(flagPath)) {
    console.error("Patch " + patchPath + " already applied");
    process.exit();
  }

  console.log("Applying patch...");
  fs.appendFileSync(indexPath, fs.readFileSync(patchPath));

  console.log("Marked patched");
  fs.closeSync(fs.openSync(flagPath, 'w'))

  console.log("Patch " + patchPath + " successfully applied");

  console.log("Removing existins .asar");
  fs.unlinkSync(asarPath);

  console.log("Packing .asar back");
  await asar.createPackage(tmpDir, asarPath);

  console.log("Deleting temp directory");
  rmdir(tmpDir);

  console.log("Job finished! Enjoy, hopefully...");
}

var rmdir = function(dir) {
	var list = fs.readdirSync(dir);
	for(var i = 0; i < list.length; i++) {
		var filename = path.join(dir, list[i]);
		var stat = fs.statSync(filename);

		if(filename == "." || filename == "..") {
			// pass these files
		} else if(stat.isDirectory()) {
			// rmdir recursively
			rmdir(filename);
		} else {
			// rm fiilename
			fs.unlinkSync(filename);
		}
	}
	fs.rmdirSync(dir);
};

(async function() {
  try {
    await main();
  }
  catch(e) {
    console.log('Catch an error: ', e)
  }
})()
