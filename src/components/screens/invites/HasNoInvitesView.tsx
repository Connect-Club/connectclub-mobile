import {observer} from 'mobx-react'
import React, {useContext} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import MyCountersStore from '../../../stores/MyCountersStore'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import Vertical from '../../common/Vertical'
import PendingInvitesButton from './PendingInvitesButton'

const HasNoInvitesView: React.FC = () => {
  const {t} = useTranslation()
  const {colors} = useTheme()

  const countersStore = useContext(MyCountersStore)
  const pendingInvitesCount = countersStore.counters.countPendingInvites

  return (
    <View style={styles.noInvitesView}>
      <Vertical>
        <AppIcon style={styles.noInvitesViewIcon} type={'icMailWithStars'} />
        <AppText
          style={[
            styles.noInvitesViewDescription,
            {color: colors.secondaryBodyText},
          ]}>
          {t('no_invites_description')}
        </AppText>
        {pendingInvitesCount > 0 && (
          <PendingInvitesButton
            style={styles.noInvitesViewPendingButton}
            count={pendingInvitesCount}
          />
        )}
      </Vertical>
    </View>
  )
}

export default observer(HasNoInvitesView)

const styles = StyleSheet.create({
  noInvitesView: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noInvitesViewIcon: {
    alignSelf: 'center',
  },
  noInvitesViewDescription: {
    marginTop: ms(40),
    paddingHorizontal: ms(16),
    fontSize: ms(15),
    textAlign: 'center',
    lineHeight: ms(22),
  },
  noInvitesViewPendingButton: {
    marginTop: ms(32),
  },
})
