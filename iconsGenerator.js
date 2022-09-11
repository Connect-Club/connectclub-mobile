const {exec} = require('child_process')

const path = 'src/assets'
const fileName = 'AppIcon'

const callback = (error, stdout, stderr) => {
  if (error) return console.log(`error: ${error.message}`)
  if (stderr) return console.log(`stderr: ${stderr}`)
  console.log(stdout)
}

const nativeFilePath = `${path}/${fileName}.native.tsx`
const webFilePath = `${path}/${fileName}.tsx`

console.log('generate icon files', fileName)
exec(`node scripts/iconsGeneratorCommon ${nativeFilePath}`, callback)
exec(`node scripts/iconsGeneratorCommon ${webFilePath} web`, callback)
