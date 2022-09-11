import {useNavigation} from '@react-navigation/native'
import React, {useRef} from 'react'
import {useTranslation} from 'react-i18next'

import {FullUserModel, UserModel} from '../../../models'
import {useTheme} from '../../../theme/appTheme'
import {askBlockUser} from '../../../utils/alerts'
import BaseInlineBottomSheet, {
  AppBottomSheet,
} from '../../BaseInlineBottomSheet'
import CommonBottomSheetListView, {
  CommonBottomSheetListItemModel,
} from '../../common/CommonBottomSheetListView'
import NavigationIconButton from '../mainFeed/NavigationIconButton'

interface Props {
  readonly user: FullUserModel
  readonly isUserAdmin: boolean
  readonly isCurrentUserAdmin: boolean
  readonly isCurrentUser: boolean
  readonly onBanUser: (user: UserModel) => void
  readonly onToggleBlockUser: () => void
}

const ProfileContextMenu: React.FC<Props> = ({
  user,
  isUserAdmin,
  isCurrentUserAdmin,
  isCurrentUser,
  onBanUser,
  onToggleBlockUser,
}) => {
  const {colors} = useTheme()
  const {t} = useTranslation()
  const navigation = useNavigation()
  const modalRef = useRef<AppBottomSheet>(null)

  const onPress = () => {
    modalRef.current?.present()
  }

  const onSelected = async (item: CommonBottomSheetListItemModel) => {
    modalRef.current?.dismiss()
    switch (item.id) {
      case 0:
        onToggleBlockUser()
        break
      case 1:
        navigation.navigate('ProfileReportScreen', {user})
        break
      case 2:
        const isAllow = await askBlockUser(t)
        if (!isAllow) return
        onBanUser(user)
        break
    }
  }
  const items = [
    {
      id: 0,
      title: user.isBlocked ? t('unblockUser') : t('blockUser'),
      style: {color: colors.warning},
    },
    {
      id: 1,
      title: t('reportAnIncident'),
    },
  ]
  if (isCurrentUserAdmin && !isUserAdmin && !isCurrentUser && !user.isOwner) {
    items.push({
      id: 2,
      title: t('blockInThisRoom'),
    })
  }

  return (
    <>
      <NavigationIconButton
        icon={'icVerticalMenu'}
        tint={colors.accentPrimary}
        onPress={onPress}
      />
      <BaseInlineBottomSheet
        ref={modalRef}
        itemsCount={items.length}
        itemHeight={56}>
        <CommonBottomSheetListView onPress={onSelected} items={items} />
      </BaseInlineBottomSheet>
    </>
  )
}

export default ProfileContextMenu
