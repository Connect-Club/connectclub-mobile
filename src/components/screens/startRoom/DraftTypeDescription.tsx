import React from 'react'
import {useTranslation} from 'react-i18next'
import {Dimensions, StyleSheet} from 'react-native'

import {draftTitles, DraftType, LanguageModel} from '../../../models'
import {commonStyles, useTheme} from '../../../theme/appTheme'
import {isWebOrTablet} from '../../../utils/device.utils'
import {maxWidth, ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import Vertical from '../../common/Vertical'
import {LinearGradient} from '../../webSafeImports/webSafeImports'
import StartRoomNameFooter from './StartRoomNameFooter'

interface Props {
  readonly roomName: string
  readonly onAddRoomNamePress: () => void
  readonly draftType: DraftType
  readonly isPrivateDefault: boolean
  readonly isPrivate: boolean
  readonly language?: LanguageModel
  readonly onLanguageSelect: () => void
  readonly onSetPrivate: (isPrivate: boolean) => void
  readonly onCreatePress: () => void
  readonly onDraftSelect: (draft: DraftType) => void
}

const DraftTypeDescription: React.FC<Props> = (props) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  return (
    <LinearGradient
      start={{x: 0, y: 0}}
      end={{x: 0, y: 0.7}}
      colors={['transparent', '#001C4E']}
      style={styles.container}>
      <Vertical style={[styles.textContainer, commonStyles.wizardContainer]}>
        <AppText style={[styles.title, {color: colors.textPrimary}]}>
          {t(draftTitles[props.draftType])}
        </AppText>

        <StartRoomNameFooter
          onDraftSelect={props.onDraftSelect}
          onCreatePress={props.onCreatePress}
          roomName={props.roomName}
          onAddRoomNamePress={props.onAddRoomNamePress}
          isPrivateDefault={props.isPrivateDefault}
          isPrivate={props.isPrivate}
          onSetPrivate={props.onSetPrivate}
          language={props.language}
          onLanguageSelect={props.onLanguageSelect}
        />
      </Vertical>
    </LinearGradient>
  )
}

export default DraftTypeDescription

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: ms(16),
    minHeight: Dimensions.get('window').height * 0.4,
    width: maxWidth(),
    alignSelf: 'center',
  },

  textContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: ms(50),
  },

  title: {
    fontSize: ms(34),
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: ms(16),
    lineHeight: isWebOrTablet() ? ms(40) : undefined,
    height: isWebOrTablet() ? ms(80) : undefined,
  },
})
