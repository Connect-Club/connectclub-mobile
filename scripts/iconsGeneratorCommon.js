const p = require('path')
const fs = require('fs')

const uniqueNames = new Set()
function findInDir(dir, filter, fileList = []) {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = p.join(dir, file)
    const fileStat = fs.lstatSync(filePath)

    if (fileStat.isDirectory()) {
      findInDir(filePath, filter, fileList)
    } else if (p.extname(filePath) === filter) {
      const name = p.basename(filePath, filter)
      if (uniqueNames.has(name)) throw new Error(`file exists: ${name}`)
      uniqueNames.add(name)
      fileList.push(filePath)
    }
  })

  return fileList
}

if (process.argv.length < 3)
  throw 'Invalid arguments; Please specify file path to write to.'

const fullPath = process.argv[2]
const path = p.dirname(fullPath)
const method = process.argv[3]

console.log('generate icons file', fullPath)

const icons = findInDir(path, '.svg')

if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath)
const logger = fs.createWriteStream(fullPath)

logger.write(`/* eslint-disable */
import React, {memo} from 'react'
import {StyleProp, View, ViewStyle} from 'react-native'
import deepEqual from 'deep-equal'
`)

const iconNames = Array.from(uniqueNames.values())
const types = iconNames.map((c) => `'${c}'`).join(' | ')

for (const icon of icons) {
  const name = p.basename(icon, '.svg')
  let capitalized = name.charAt(0).toUpperCase() + name.slice(1)
  capitalized = capitalized
    .split('-')
    .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
    .join('')

  if (method === 'web') {
    logger.write(
      `import {ReactComponent as ${capitalized}} from './icons/${name}.svg'\n`,
    )
  } else {
    logger.write(`import ${capitalized} from './icons/${name}.svg'\n`)
  }
}

logger.write(`
export type AppIconType = ${types}
export interface AppIconProps {
  readonly type: AppIconType
  readonly testID?: string
  readonly style?: StyleProp<ViewStyle>
  readonly isVisible?: boolean
  readonly tint?: string
}

const getIcon = (type: AppIconType, tint: string | undefined): JSX.Element => {
    switch (type) {
`)

for (let iconName of iconNames) {
  let capitalized = iconName.charAt(0).toUpperCase() + iconName.slice(1)
  capitalized = capitalized
    .split('-')
    .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
    .join('')

  logger.write(`  case '${iconName}':\n`)
  logger.write(
    `    return tint ? <${capitalized} fill={tint} /> : <${capitalized} />\n`,
  )
}

logger.write(`  }
}

const AppIcon: React.FC<AppIconProps> = ({
  type,
  testID,
  style,
  isVisible,
  tint,
}) => {
  if (isVisible === false) return null
  return (
    <View accessibilityLabel={testID} pointerEvents={'none'} style={style}>
      {getIcon(type, tint)}
    </View>
  )
}
export default memo(AppIcon, deepEqual)
`)
