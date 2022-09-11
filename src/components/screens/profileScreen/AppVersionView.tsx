import React, {memo, useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Platform, StyleSheet, View} from 'react-native'
import {getBuildNumber} from 'react-native-device-info'

import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import {getAppVersion} from '../../webSafeImports/webSafeImports'

interface VersionInfo {
  versionName?: string
  buildNumber?: string
}

const AppVersionView: React.FC = () => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)

  useEffect(() => {
    updateVersionInfo()
  }, [])

  const updateVersionInfo = async () => {
    setVersionInfo({
      versionName: getAppVersion(),
      buildNumber: getBuildNumber(),
    })
  }

  if (!versionInfo) return null

  const titleStyle = [
    styles.versionInfoTitle,
    {color: colors.secondaryBodyText},
  ]
  const dataStyle = [styles.versionInfoData, {color: colors.secondaryBodyText}]

  return (
    <View style={styles.versionInfoContainer}>
      <AppText style={titleStyle}>{t('appVersionViewVersionTitle')}</AppText>
      <AppText style={dataStyle}>{versionInfo.versionName}</AppText>

      {Platform.OS !== 'web' && (
        <>
          <AppText style={titleStyle}>
            {t('appVersionViewBuildNumberTitle')}
          </AppText>

          <AppText style={dataStyle}>{versionInfo.buildNumber}</AppText>
        </>
      )}
    </View>
  )
}

export default memo(AppVersionView)

const styles = StyleSheet.create({
  versionInfoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: ms(16),
  },

  versionInfoTitle: {
    fontSize: ms(12),
    flexBasis: '50%',
    flexDirection: 'row',
    textAlign: 'right',
    paddingEnd: ms(8),
  },

  versionInfoData: {
    fontSize: ms(12),
    flexBasis: '50%',
  },
})
