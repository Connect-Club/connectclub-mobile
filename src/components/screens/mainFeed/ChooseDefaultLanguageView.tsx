import {useNavigation, useRoute} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {LayoutChangeEvent, StyleSheet} from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'

import {appEventEmitter} from '../../../appEventEmitter'
import {storage} from '../../../storage'
import {makeTextStyle, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {animateNumberValues} from '../../../utils/reanimated.utils'
import AppText from '../../common/AppText'
import Horizontal from '../../common/Horizontal'
import PrimaryButton from '../../common/PrimaryButton'
import SecondaryButton from '../../common/SecondaryButton'

const ChooseDefaultLanguageView: React.FC = () => {
  const {t} = useTranslation()
  const {colors} = useTheme()
  const navigation = useNavigation()
  const route = useRoute()
  const [languageChosen, setLanguageChosen] = useState(storage.isLanguageChosen)
  const isAnimating = useRef(false)
  const layoutHeight = useRef(0)

  useEffect(() => {
    return appEventEmitter.on('userLanguagesSet', () => {
      setLanguageChosen(true)
    })
  }, [])

  const onViewLayout = useCallback((e: LayoutChangeEvent) => {
    layoutHeight.current = e.nativeEvent.layout.height
  }, [])

  const opacityValue = useSharedValue(1)
  const translateValue = useSharedValue(0)

  const fadeAnim = useAnimatedStyle(() => {
    return {
      opacity: opacityValue.value,
      marginTop: translateValue.value,
    }
  })

  const onSkipPress = useCallback(async () => {
    await storage.setLanguageChosen()
    isAnimating.current = true
    await animateNumberValues(
      {
        from: 1,
        to: 0,
        duration: 300,
        sharedValue: opacityValue,
        easing: Easing.out(Easing.quad),
      },
      {
        from: 0,
        to: -ms(layoutHeight.current),
        duration: 300,
        sharedValue: translateValue,
        easing: Easing.out(Easing.quad),
      },
    )
    isAnimating.current = false
    setLanguageChosen(true)
  }, [opacityValue, translateValue])

  const onChoosePress = useCallback(async () => {
    if (!storage.currentUser) return
    navigation.navigate('LanguageSelectorScreenModal', {
      navigationRoot: 'MainFeedListScreen',
      backScreen: route,
      title: t('settingsYourLanguageSection'),
      selection: storage.currentUser!.language,
      mode: 'multiple',
    })
  }, [navigation, t])

  if ((languageChosen && !isAnimating.current) || !storage.currentUser)
    return null

  const secondaryButtonStyle = {
    ...styles.secondaryButton,
    backgroundColor: colors.secondaryClickable,
  }

  return (
    <Animated.View style={[styles.container, fadeAnim]} onLayout={onViewLayout}>
      <AppText style={styles.title}>
        {t('yourDefaultLanguage', {
          language: storage.currentUser.language.name,
        })}
      </AppText>
      <AppText style={styles.description}>
        {t('yourDefaultLanguageDescription')}
      </AppText>
      <Horizontal style={styles.buttonsContainer}>
        <SecondaryButton
          textStyle={styles.buttonText}
          style={[secondaryButtonStyle]}
          accessibilityLabel={'selectNoneButton'}
          title={t('skipButton')}
          onPress={onSkipPress}
        />
        <PrimaryButton
          textStyle={styles.buttonText}
          style={styles.buttonChoose}
          title={t('chooseLanguages')}
          onPress={onChoosePress}
        />
      </Horizontal>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: ms(16),
    paddingBottom: ms(32),
  },
  title: {
    ...makeTextStyle(ms(12), ms(16), 'bold'),
  },
  description: {
    paddingTop: ms(4),
    ...makeTextStyle(ms(12), ms(16), 'normal'),
  },
  buttonsContainer: {
    paddingTop: ms(8),
  },
  buttonChoose: {
    height: ms(28),
    paddingStart: ms(16),
    minWidth: ms(160),
    marginStart: ms(8),
  },
  buttonText: {
    ...makeTextStyle(ms(12), ms(18), '600'),
  },
  secondaryButton: {
    height: ms(28),
    borderRadius: ms(14),
    minWidth: ms(80),
  },
})

export default observer(ChooseDefaultLanguageView)
