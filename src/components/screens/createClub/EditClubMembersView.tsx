import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import AppAvatar from 'src/components/common/AppAvatar'
import AppText from 'src/components/common/AppText'
import AppTouchableOpacity from 'src/components/common/AppTouchableOpacity'
import Horizontal from 'src/components/common/Horizontal'
import Spacer from 'src/components/common/Spacer'

import {ClubUser} from 'src/models'

import {ms} from 'src/utils/layout.utils'

import {commonStyles, makeTextStyle, useTheme} from 'src/theme/appTheme'

import BringMorePeopleView from './BringMorePeopleView'

type Props = {
  members?: ClubUser[]
  action: () => void
}

const EditClubMembersView: React.FC<Props> = ({members, action}) => {
  const {t} = useTranslation()
  const {colors} = useTheme()

  const maxMembersCount = members?.slice(0, 2)

  return (
    <View style={styles.wrapper}>
      <Horizontal>
        <AppText style={[styles.members, {color: colors.primaryClickable}]}>
          {t('members').toUpperCase()}
        </AppText>
        <AppText style={[styles.membersCount, {color: colors.thirdBlack}]}>
          {members?.length}
        </AppText>
      </Horizontal>
      <Horizontal style={styles.membersContainer}>
        {maxMembersCount?.map((el, id) => (
          <AppTouchableOpacity key={el.id}>
            <Horizontal style={commonStyles.alignCenter}>
              <AppAvatar
                avatar={el.avatar}
                shortName={el.displayName[0]}
                size={ms(32)}
              />
              <Spacer horizontal={ms(12)} />
              <AppText style={[styles.title, {color: colors.primaryClickable}]}>
                {el.displayName +
                  (id === maxMembersCount.length - 1 ? '' : ', ')}
              </AppText>
            </Horizontal>
          </AppTouchableOpacity>
        ))}
      </Horizontal>
      <BringMorePeopleView onShareLink={action} />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: ms(26),
  },
  membersContainer: {
    marginTop: ms(16),
    alignItems: 'center',
    marginBottom: ms(16),
  },
  avatar: {
    width: ms(16),
    height: ms(16),
    marginRight: ms(12),
  },
  title: {
    ...makeTextStyle(ms(12), ms(16), '600'),
  },
  members: {
    ...makeTextStyle(ms(11), ms(14.3), 'bold'),
    marginRight: ms(8),
  },
  membersCount: {
    ...makeTextStyle(ms(11), ms(14.3)),
  },
})

export default EditClubMembersView
