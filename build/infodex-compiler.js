// infodex-compiler.js
//

var fs = require("fs");
var mkdirp = require("mkdirp").sync;

function findInfodexEntries() {
	
}
module.exports = findInfodexEntries;




function zipWorkingDirectory(id) {
	var outstr = fs.createWriteStream(BUILD_OUT+"infodex.zip");
	var arch = archiver("zip");
	
	outstr.on("finish", sync.defer());
	arch.pipe(outstr);
	arch.bulk([
		{ expand: true, cwd: BUILD_TEMP+id, src: ["**"], flatten: false, },
		//{ expand: true, cwd: 'source', src: ["**"], dest: 'source' },
	]);
	arch.finalize();
	
	sync.await();
	console.log("[cMaps] Zipped file:", "maps/"+id+".zip", "["+arch.pointer()+" bytes]");
}