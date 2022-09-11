import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import React, {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, TextInput} from 'react-native'

import {api} from '../api/api'
import {hideLoading, showLoading} from '../appEventEmitter'
import AppText from '../components/common/AppText'
import PrimaryButton from '../components/common/PrimaryButton'
import Vertical from '../components/common/Vertical'
import ReportChooseReasonView from '../components/screens/reporting/ReportChooseReasonView'
import ReportingOnUserView from '../components/screens/reporting/ReportingOnUserView'
import {
  AppModal,
  KeyboardAwareScrollView,
} from '../components/webSafeImports/webSafeImports'
import {UserModel} from '../models'
import {commonStyles, useTheme} from '../theme/appTheme'
import {ms} from '../utils/layout.utils'
import {useTitle} from '../utils/navigation.utils'
import {useBottomSafeArea} from '../utils/safeArea.utils'
import {toastHelper} from '../utils/ToastHelper'

type ScreenRouteProp = RouteProp<{Screen: {user: UserModel}}, 'Screen'>

const ProfileReportScreen: React.FC = () => {
  const {params} = useRoute<ScreenRouteProp>()
  const {colors} = useTheme()
  const inset = useBottomSafeArea()
  const {t} = useTranslation()
  const navigation = useNavigation()

  const [details, setDetails] = useState('')
  const [reason, setReason] = useState('')

  useTitle(t('reportAnIncident'))

  const onSubmitPress = async () => {
    showLoading()
    const response = await api.sendComplain(params.user.id, reason, details)
    if (response.error) return toastHelper.error(response.error)
    hideLoading()
    navigation.goBack()
  }

  const secondaryText = {color: colors.secondaryBodyText}

  return (
    <AppModal>
      <KeyboardAwareScrollView
        keyboardDismissMode={'on-drag'}
        enableOnAndroid={true}
        keyboardShouldPersistTaps={'handled'}
        contentContainerStyle={[styles.content, {paddingBottom: inset}]}
        showsVerticalScrollIndicator={false}>
        <Vertical style={commonStyles.wizardContainer}>
          <AppText style={[styles.title, secondaryText]}>
            {t('reportIncidentScreenReporting')}
          </AppText>
          <ReportingOnUserView user={params.user} />

          <AppText style={[styles.whyReportText, secondaryText]}>
            {t('reportIncidentScreenWhy', {fullName: params.user.displayName})}
          </AppText>
          <ReportChooseReasonView reason={reason} onPress={setReason} />

          <AppText style={[styles.detailsText, secondaryText]}>
            {t('reportIncidentScreenDetails')}
          </AppText>

          <TextInput
            allowFontScaling={false}
            value={details}
            onChangeText={setDetails}
            multiline
            style={[
              styles.descriptionTextInput,
              {backgroundColor: colors.floatingBackground},
            ]}
          />

          <AppText style={[styles.descriptionText, secondaryText]}>
            {t('reportIncidentScreenDescription')}
          </AppText>

          <PrimaryButton
            isEnabled={reason.length > 0}
            onPress={onSubmitPress}
            title={t('reportIncidentScreenSubmitButton')}
          />
        </Vertical>
      </KeyboardAwareScrollView>
    </AppModal>
  )
}

export default ProfileReportScreen

const styles = StyleSheet.create({
  content: {
    paddingTop: ms(32),
    paddingHorizontal: ms(16),
  },

  title: {
    fontSize: ms(15),
  },

  whyReportText: {
    fontSize: ms(15),
    lineHeight: ms(22),
    marginTop: ms(32),
    marginBottom: ms(16),
  },

  detailsText: {
    fontSize: ms(15),
    marginTop: ms(32),
    marginBottom: ms(16),
  },

  descriptionTextInput: {
    minHeight: ms(132),
    borderRadius: ms(8),
    padding: ms(16),
  },

  descriptionText: {
    fontSize: ms(13),
    lineHeight: ms(21),
    marginTop: ms(16),
    marginBottom: ms(32),
  },
})
