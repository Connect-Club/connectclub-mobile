import {observer} from 'mobx-react'
import React, {useContext, useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {
  AppState,
  AppStateStatus,
  Linking,
  Platform,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native'

import {analytics} from '../../../Analytics'
import AppIcon from '../../../assets/AppIcon'
import {storage} from '../../../storage'
import MyCountersStore from '../../../stores/MyCountersStore'
import {makeTextStyle, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import FlexSpace from '../../common/FlexSpace'

const bannerColor = '#5A68EA'

const DiscordBannerView: React.FC = () => {
  const countersStore = useContext(MyCountersStore)
  const {colors} = useTheme()
  const {t} = useTranslation()
  const [isHidden, setHidden] = useState(storage.isDiscordBannerHidden)
  const isClickedJoin = useRef(false)

  useEffect(() => {
    const onBlurListener = (state: AppStateStatus) => {
      if (state === 'background') {
        if (isClickedJoin.current) setHidden(true)
      }
    }
    AppState.addEventListener('change', onBlurListener)
    return () => {
      AppState.removeEventListener('change', onBlurListener)
    }
  }, [])

  if (isHidden) return null
  if (!countersStore.counters.joinDiscordLink) return null

  const onBannerPress = async () => {
    await storage.setDiscordBannerHidden()
    isClickedJoin.current = true
    const url = countersStore.counters.joinDiscordLink
    analytics.sendEvent('join_discord_banner_link_click', {link: url})
    Linking.openURL(url)
  }

  const textStyle: TextStyle = {color: colors.textPrimary}
  const buttonTextStyle: TextStyle = {color: bannerColor}
  const buttonStyle: ViewStyle = {backgroundColor: colors.card}

  return (
    <AppTouchableOpacity style={styles.container} onPress={onBannerPress}>
      <View style={styles.banner}>
        <AppIcon type={'icDiscord24'} />
        <AppText style={[styles.text, textStyle]}>{t('discordHeader')}</AppText>
        <FlexSpace />
        <View style={[styles.button, buttonStyle]}>
          <AppText style={[styles.buttonText, buttonTextStyle]}>
            {t('join')}
          </AppText>
        </View>
      </View>
    </AppTouchableOpacity>
  )
}

export default observer(DiscordBannerView)
const styles = StyleSheet.create({
  container: {
    zIndex: 3,
    marginTop: ms(16),
    marginBottom: ms(16),
    height: ms(60),
  },
  text: {
    ...makeTextStyle(18, 22, 'bold'),
    paddingHorizontal: ms(8),
  },
  banner: {
    width: '100%',
    height: '100%',
    backgroundColor: bannerColor,
    borderRadius: ms(12),
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: ms(16),
    paddingEnd: ms(16),
    ...Platform.select({
      android: {elevation: ms(8)},
      ios: {
        shadowOpacity: 0.5,
        shadowRadius: 12,
        shadowOffset: {width: 0, height: ms(8)},
        shadowColor: 'rgba(0, 0, 0, 0.5)',
      },
    }),
  },
  button: {
    borderRadius: ms(16),
    height: ms(32),
    width: ms(56),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...makeTextStyle(12, 16, 'bold'),
  },
})
