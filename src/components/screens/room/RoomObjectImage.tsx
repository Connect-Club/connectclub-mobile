import React, {memo} from 'react'
import {Image, Platform, StyleSheet, View} from 'react-native'

import {BottomSheetImage} from '../../../models'
import {commonStyles} from '../../../theme/appTheme'
import {RoomImageObject, RoomObject} from './models/jsonModels'
import {convertRealRoomObjectToLocal} from './models/mappers'
import ClickableView from './nativeview/RTCClickableView'

interface Props {
  readonly onImagePress?: (image: BottomSheetImage) => void
  readonly imageObjects: Array<RoomObject>
  readonly widthMultiplier: number
}

const RoomObjectImage: React.FC<Props> = ({
  onImagePress,
  imageObjects,
  widthMultiplier,
}) => {
  if (!imageObjects || !imageObjects.length) return null

  return (
    <>
      {imageObjects.map((imageObject, ind) => {
        const roomObject = convertRealRoomObjectToLocal(
          imageObject,
          widthMultiplier,
        )
        const img = imageObject as RoomImageObject
        const ImageContainer = img.description ? ClickableView : View
        const pointerStyle = () => {
          return Platform.OS === 'android'
            ? img.description
              ? 'auto'
              : 'none'
            : undefined
        }

        return (
          <ImageContainer
            key={ind}
            onClick={() => {
              const img = imageObject as RoomImageObject
              if (!img.title || !img.description) return
              onImagePress?.({
                imageUri: img.data,
                title: img.title,
                description: img.description,
              })
            }}
            pointerEvents={pointerStyle()}
            style={[
              styles.imageObj,
              {
                top: roomObject.y ?? 0,
                left: roomObject.x ?? 0,
                width: roomObject.width ?? 100,
                height: roomObject.height ?? 100,
              },
            ]}>
            <Image
              key={ind}
              source={{uri: imageObject.data}}
              style={commonStyles.flexOne}
            />
          </ImageContainer>
        )
      })}
    </>
  )
}

const styles = StyleSheet.create({
  imageObj: {
    position: 'absolute',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        pointerEvents: 'none',
      },
    }),
  },
})

export default memo(RoomObjectImage, () => true)
