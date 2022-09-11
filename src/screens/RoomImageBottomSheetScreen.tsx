import {BottomSheetScrollView} from '@gorhom/bottom-sheet'
import {observer} from 'mobx-react'
import React from 'react'
import {Image} from 'react-native'

import AppText from '../components/common/AppText'
import Vertical from '../components/common/Vertical'
import MarkdownHyperlink from '../components/screens/profileScreen/MarkdownHyperlink'
import {BottomSheetImage} from '../models'
import {commonStyles, makeTextStyle, useTheme} from '../theme/appTheme'
import {ms} from '../utils/layout.utils'

export interface RoomImageParams {
  imageInfo: BottomSheetImage
}

const RoomImageBottomSheetScreen: React.FC<RoomImageParams> = (props) => {
  const {colors} = useTheme()

  return (
    <BottomSheetScrollView
      style={[
        commonStyles.wizardContainer,
        {marginTop: ms(32), height: '100%'},
      ]}>
      <Vertical style={commonStyles.flexOne}>
        <Image
          source={{uri: props.imageInfo.imageUri}}
          style={{
            marginHorizontal: ms(16),
            height: ms(440),
            resizeMode: 'contain',
          }}
        />

        <AppText
          numberOfLines={2}
          style={{
            ...makeTextStyle(20, 28, '600'),
            marginHorizontal: ms(16),
            marginTop: ms(32),
            color: colors.bodyText,
          }}>
          {props.imageInfo.title}
        </AppText>

        <MarkdownHyperlink
          linkStyle={commonStyles.link}
          style={{margin: ms(16)}}>
          <AppText
            style={{
              ...makeTextStyle(15, 24, 'normal'),
              color: colors.bodyText,
            }}>
            {props.imageInfo.description}
          </AppText>
        </MarkdownHyperlink>
      </Vertical>
    </BottomSheetScrollView>
  )
}

export default observer(RoomImageBottomSheetScreen)
