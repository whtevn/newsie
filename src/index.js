import fs from 'fs';
import ejs from 'ejs';
import util from 'util';
import yaml from 'yaml';
import path from 'path';
import immutable from 'immutable';
const __dirname = path.resolve();
const readdir   = util.promisify(fs.readdir);
const readFile  = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.readFile);
const {
  fromJS,
  Map,
  List,
} = immutable;

async function sitePageDescriptionsToHTML({ sitePagesDirectory, layoutDirectory, outputDirectory }){

  // get site pages as list
  const sitePages = fromJS(await readdir(sitePagesDirectory)).filter(dir=>!dir.match(/^\./))

  // loop over site data
  sitePages.forEach(async (pageFileName) => {
    // get page description
    const pageDescriptionLocation = `${sitePagesDirectory}/${pageFileName}`;
    const pageDescriptionContents = await readFile(pageDescriptionLocation, 'UTF8'); 
    const pageDescription= yaml.parse(pageDescriptionContents);
    
    // get layout from template
    const layoutLocation = `${layoutDirectory}/${pageDescription.layout}.ejs`;
    const layoutContents = await readFile(layoutLocation, 'UTF8');

    // render page description into layout
    const pageResult = ejs.render(layoutContents, pageDescription)

    // write rendered result to build location
    const pageName = pageFileName.split('.')[0];
    const pageResultAsBuffer = new Uint8Array(Buffer.from(pageResult))
    const resultLocation = `${outputDirectory}/${pageName}.html`;
    fs.writeFile(
      resultLocation,
      pageResult,
      {
          encoding: "UTF8",
          flag: "w"
      },
      function(){ console.log(`"${pageName}" written to ${resultLocation}`) }
    )
  })
}

sitePageDescriptionsToHTML({
  sitePagesDirectory: `${__dirname}/test-area/site-pages`,
  layoutDirectory: `${__dirname}/test-area/layouts`,
  outputDirectory: `${__dirname}/build`,
})
