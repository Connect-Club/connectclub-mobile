import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import React, {useLayoutEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Keyboard, Platform, ScrollView, StyleSheet} from 'react-native'

import AppText from '../components/common/AppText'
import {clearWindowFocus} from '../components/common/DecorConfigModule'
import InlineButton from '../components/common/InlineButton'
import PrimaryButton from '../components/common/PrimaryButton'
import Vertical from '../components/common/Vertical'
import {
  AppModal,
  KeyboardSpacer,
  MenuTextInput,
} from '../components/webSafeImports/webSafeImports'
import {commonStyles, useTheme} from '../theme/appTheme'
import {ms} from '../utils/layout.utils'
import {updateProfileData} from '../utils/profile.utils'
import {processTextLink} from '../utils/textedit.utils'

type ScreenRouteProp = RouteProp<
  {Screen: {userId: string; about: string; navigationRoot?: string}},
  'Screen'
>

const UpdateProfileBioScreen: React.FC = () => {
  const navigation = useNavigation()
  const {t} = useTranslation()
  const {params} = useRoute<ScreenRouteProp>()
  const {colors} = useTheme()
  const [bio, setBio] = useState(params.about ?? '')
  const aboutText = params.about ?? ''
  const secondaryColor = {color: colors.secondaryBodyText}
  const title = aboutText.length > 0 ? t('updateBioTitle') : t('addBioTitle')

  const onFinishWriteBio = () => {
    setTimeout(async () => {
      clearWindowFocus()
      Keyboard.dismiss()
      await updateProfileData({about: bio})
      navigation.goBack()
    }, 500)
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      title: title,
      headerRight: () => (
        <InlineButton
          textStyle={[styles.buttonText]}
          title={t('doneButton')}
          onPress={onFinishWriteBio}
        />
      ),
    })
  }, [bio])

  return (
    <AppModal navigationRoot={params?.navigationRoot}>
      <Vertical style={commonStyles.wizardContainer}>
        <ScrollView>
          <Vertical
            style={[
              styles.container,
              {
                backgroundColor: colors.systemBackground,
                ...commonStyles.paddingHorizontal,
              },
            ]}>
            <AppText style={[styles.headerText, secondaryColor]}>
              {t('addUpdateBioDescription')}
            </AppText>
            <MenuTextInput
              value={bio}
              onChangeText={setBio}
              onLinkText={(link, location) =>
                processTextLink(t, bio, link, location, setBio)
              }
              linkTextColor={colors.primaryClickable}
              multiline
              style={[styles.inputText]}
            />

            {Platform.OS === 'web' && (
              <PrimaryButton
                style={styles.saveButton}
                title={'Save'}
                onPress={onFinishWriteBio}
              />
            )}
            <KeyboardSpacer />
          </Vertical>
        </ScrollView>
      </Vertical>
    </AppModal>
  )
}

export default UpdateProfileBioScreen

const styles = StyleSheet.create({
  container: {
    height: '100%',
    paddingTop: ms(10),
  },

  headerText: {
    fontSize: ms(20),
    textAlign: 'center',
    marginTop: ms(12),
    lineHeight: ms(28),
    marginBottom: ms(24),
  },

  inputText: {
    height: ms(360),
    textAlignVertical: 'top',
    ...Platform.select({
      web: {
        backgroundColor: '#FFFFFF',
      },
    }),
  },

  buttonText: {
    fontSize: ms(18),
    marginEnd: ms(10),
    fontWeight: '500',
  },

  saveButton: {
    marginTop: 16,
  },
})
