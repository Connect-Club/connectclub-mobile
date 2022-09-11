import React from 'react'
import {useTranslation} from 'react-i18next'

import {storage} from '../../../storage'
import AppSwitchButton from '../../common/AppSwitchButton'

interface Props {}

const SettingsDjModeMenuItem: React.FC<Props> = () => {
  const {t} = useTranslation()

  return (
    <AppSwitchButton
      initialState={storage.djModeEnabled}
      onSwitch={(enabled) => {
        if (enabled) storage.clearDjModeDidSelected()
        else storage.djModeDidSelected()
        return true
      }}
      title={t('settingsScreenDjMode')}
    />
  )
}

export default SettingsDjModeMenuItem
