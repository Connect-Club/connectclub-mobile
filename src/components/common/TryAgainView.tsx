import React, {memo, useCallback} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet} from 'react-native'

import AppIcon from '../../assets/AppIcon'
import {makeTextStyle, useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import {logJS} from '../screens/room/modules/Logger'
import {RevealView} from './anim/RevealView'
import AppText from './AppText'
import SecondaryButton from './SecondaryButton'

type Props = {
  readonly visible?: boolean
  readonly onRetry: () => void
}

const TryAgainView: React.FC<Props> = ({onRetry, visible}) => {
  const {t} = useTranslation()
  const {colors} = useTheme()
  const onRetryInternal = useCallback(() => {
    logJS('debug', 'TryAgainView retry pressed')
    onRetry()
  }, [onRetry])

  const titleStyle = {
    color: colors.secondaryBodyText,
    ...makeTextStyle(ms(20), ms(28), 'normal'),
    ...styles.title,
  }
  const buttonStyle = {
    backgroundColor: colors.secondaryClickable,
    ...styles.button,
  }

  return (
    <RevealView style={styles.container} animType={'fade'} isRevealed={visible}>
      <AppIcon type={'warningSign'} />
      <AppText style={titleStyle}>{t('somethingWentWrong')}</AppText>
      <SecondaryButton
        style={buttonStyle}
        title={t('retryButton')}
        onPress={onRetryInternal}
      />
    </RevealView>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    marginTop: ms(-48),
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginTop: ms(24),
  },
  button: {
    height: ms(48),
    minWidth: ms(107),
    borderRadius: ms(24),
    marginTop: ms(24),
  },
})

export default memo(TryAgainView)
