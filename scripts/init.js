// create build config properties from template
// run with node init.js [STAGE]
// parameters:
// STAGE - release stage environment (staging, production)
// BUILD_TYPE - build purpose (dev, qa, release)
// FEATURES - optional comma separated features for build (e.g. "host")
// example:
// node scripts/init.js production release
// node scripts/init.js staging qa
// node scripts/init.js staging qa "host"
function generateProperties(stage, buildType, features) {
  const fs = require('fs')
  const templatePath = `${__dirname}/buildConfig.tstemplate`

  const outputPath = './src/buildConfig.ts'
  console.log(
    'creating',
    outputPath,
    'stage:',
    stage,
    'build type:',
    buildType,
    'features',
    features,
  )

  if (!features) {
    features = []
  } else {
    features = String(features)
      .split(',')
      .map((f) => f.trim())
  }
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath)
    console.log('deleted existing file')
  }

  const contents = fs
    .readFileSync(templatePath)
    .toString()
    .replace('STAGE', `'${stage}'`)
    .replace('BUILD_TYPE', `'${buildType}'`)
    .replace('FEATURES', JSON.stringify(features))
  fs.writeFileSync(outputPath, contents, {encoding: 'utf-8'})
  console.log('written to', outputPath)
}

const stage = process.argv[2] ?? 'staging'
const buildType = process.argv[3] ?? 'dev'
const features = process.argv.length >= 5 ? process.argv[4].split(',') : ''

generateProperties(stage, buildType, features)
