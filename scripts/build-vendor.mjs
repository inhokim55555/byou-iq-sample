import {build} from 'esbuild';
import {copyFile} from 'node:fs/promises';
await build({stdin:{contents:'import "@material/web/checkbox/checkbox.js";',resolveDir:process.cwd()},bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'inline',outfile:'prototype/material-controls.mjs'});
await copyFile('node_modules/fflate/esm/browser.js','prototype/vendor/fflate.browser.js');
console.log('Rebuilt the bundled Material Web and fflate assets from locked dependencies.');
