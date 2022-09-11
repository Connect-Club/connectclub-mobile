const p = require('path')
const fs = require('fs')

const kind = process.argv[2] // web or default

const uniqueNames = new Set()
function findInDir(dir, filter, fileList = []) {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = p.join(dir, file)
    const fileStat = fs.lstatSync(filePath)

    if (fileStat.isDirectory()) {
      findInDir(filePath, filter, fileList)
    } else if (
      filter.includes(p.extname(filePath)) &&
      (kind === 'web' || !filePath.includes('@'))
    ) {
      const name = p.basename(filePath, p.extname(filePath))
      if (name.includes('@')) {
        console.log('==')
      }
      if (uniqueNames.has(name)) throw new Error(`file exists: ${name}`)
      uniqueNames.add(name)
      fileList.push(filePath)
    }
  })

  return fileList
}

const path = 'src/assets'
const icons = findInDir(path, ['.jpg', '.jpeg', '.png'])

const iconNames = Array.from(uniqueNames.values())
const types = iconNames.map((c) => `'${c}'`).join(' | ')

const rasterIconFile = `${path}/rasterIcons${
  kind === 'web' ? '' : '.native'
}.ts`
if (fs.existsSync(rasterIconFile)) fs.unlinkSync(rasterIconFile)
const rasterIconLogger = fs.createWriteStream(rasterIconFile)

rasterIconLogger.write(`/* eslint-disable */
import {ImageStyle, StyleProp} from 'react-native'

export type RasterIconType = ${types}

export interface RasterIconProps {
  readonly type: RasterIconType
  readonly style?: StyleProp<ImageStyle>
  readonly accessibilityLabel?: string
  readonly circle?: boolean
  readonly scaleType?: 'centerInside' | 'fitCenter'
  readonly paddingHorizontal?: number
}

export const requireRasterIcon = (type: RasterIconType) => {
    switch (type) {
`)

for (let icon of icons) {
  const name = p.basename(icon, p.extname(icon))
  const icPath = kind === 'web' ? icon.replace(path, '.') : icon
  rasterIconLogger.write(`  case '${name}':\n`)
  rasterIconLogger.write(`    return require('${icPath}')\n`)
}

rasterIconLogger.write(`  }
}
`)

const fileName = `${path}/RasterIcon.tsx`
if (fs.existsSync(fileName)) fs.unlinkSync(fileName)
const logger = fs.createWriteStream(fileName)

logger.write(`/* eslint-disable */
import React, {memo} from 'react'
import deepEqual from 'deep-equal'
import {RasterIconNative} from '../components/webSafeImports/webSafeImports'
import {RasterIconProps} from '${
  kind === 'web' ? '../assets/rasterIcons' : `${path}/rasterIcons`
}'
`)

logger.write(`
const RasterIcon: React.FC<RasterIconProps> = (props) => {
  return (
    <RasterIconNative
      accessibilityLabel={props.accessibilityLabel}
      type={props.type}
      style={props.style}
      circle={props.circle}
      paddingHorizontal={props.paddingHorizontal}
      scaleType={props.scaleType}
    />
  )
}
export default memo(RasterIcon, deepEqual)
`)
