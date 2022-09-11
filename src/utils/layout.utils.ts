import {Dimensions, StyleProp, ViewStyle} from 'react-native'
import {ms as msOrigin} from 'react-native-size-matters'

import {isWebOrTablet} from './device.utils'
import {tabletContainerWidthLimit} from './tablet.consts'

interface ItemsPerRow {
  readonly numColumns: number
  readonly additionalSpace: number
}

export function calculateItemsPerRow(itemSize: number): ItemsPerRow {
  const screenWidth = maxWidth()

  const numColumns = Math.round((screenWidth - ms(16)) / (itemSize + ms(16)))

  const total = (itemSize + ms(16)) * numColumns
  const additionalSpace = (screenWidth - ms(16) - total) / (numColumns - 1)
  return {numColumns, additionalSpace}
}

export function calculateDimensions(
  itemDimension: number,
  fixed: boolean,
  spacing: number,
) {
  const usableTotalDimension = Dimensions.get('window').width
  const availableDimension = usableTotalDimension - spacing // One spacing extra
  const itemTotalDimension = Math.min(
    itemDimension + spacing,
    availableDimension,
  ) // itemTotalDimension should not exceed availableDimension
  const itemsPerRow = Math.floor(availableDimension / itemTotalDimension)
  const containerDimension = availableDimension / itemsPerRow

  let fixedSpacing
  if (fixed) {
    fixedSpacing =
      (usableTotalDimension - itemDimension * itemsPerRow) / (itemsPerRow + 1)
  }

  return {
    itemTotalDimension,
    availableDimension,
    itemsPerRow,
    containerDimension,
    fixedSpacing,
  }
}

export function generateStyles(
  itemDimension: number,
  containerDimension: number,
  spacing: number,
  fixed: boolean,
  fixedSpacing: number,
): StyleProp<ViewStyle> {
  const margin = (fixed ? fixedSpacing : spacing) / 2
  return {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    width: fixed ? itemDimension : containerDimension - spacing,
    marginRight: margin,
    marginLeft: margin,
  }
}

export const ms = (size: number, factor?: number): number =>
  isWebOrTablet() ? size : msOrigin(size, factor)

export const maxWidth = () =>
  isWebOrTablet() ? tabletContainerWidthLimit : Dimensions.get('window').width
