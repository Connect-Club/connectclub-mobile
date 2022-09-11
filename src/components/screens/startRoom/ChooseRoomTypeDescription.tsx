import React from 'react'
import {StyleSheet, View} from 'react-native'

import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import Vertical from '../../common/Vertical'

const ChooseRoomTypeDescription: React.FC = () => {
  const {colors} = useTheme()

  return (
    <View style={styles.chooseContainer}>
      <Vertical>
        <AppText style={[styles.chooseTitle, {color: colors.secondaryHeader}]}>
          Choose room type
        </AppText>
        <AppText style={[styles.chooseDescription, {color: colors.thirdIcons}]}>
          And you will see the possibilities of this room
        </AppText>
      </Vertical>
    </View>
  )
}

export default ChooseRoomTypeDescription

const styles = StyleSheet.create({
  chooseContainer: {
    backgroundColor: 'white',
    alignItems: 'center',
    minHeight: ms(260),
    justifyContent: 'center',
  },

  chooseTitle: {
    fontSize: ms(34),
    fontWeight: 'bold',
    textAlign: 'center',
  },

  chooseDescription: {
    fontSize: ms(15),
    textAlign: 'center',
    lineHeight: ms(24),
    marginTop: ms(16),
  },
})
