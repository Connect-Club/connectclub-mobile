import React from 'react'
import {StyleSheet, View} from 'react-native'

import {FullUserModel} from '../../../models'
import {useTheme} from '../../../theme/appTheme'
import {isNative} from '../../../utils/device.utils'
import {ms} from '../../../utils/layout.utils'
import {getUserShortName} from '../../../utils/userHelper'
import AppAvatar from '../../common/AppAvatar'
import ProfileHeaderCrown from './ProfileHeaderCrown'
import UploadAvatarView from './UploadAvatarView'

interface Props {
  readonly allowUploadPhoto: boolean
  readonly setAvatar?: (url: string) => void
  readonly user: FullUserModel
  readonly isCrownVisible: boolean
}

const ProfileAvatarView: React.FC<Props> = (props) => {
  const {colors} = useTheme()
  if (props.allowUploadPhoto) {
    return (
      <View style={styles.uploadContainer}>
        <UploadAvatarView
          size={100}
          setAvatar={props.setAvatar}
          smallUploadIcon
        />
        {isNative && <ProfileHeaderCrown isVisible={props.isCrownVisible} />}
      </View>
    )
  }

  return (
    <View accessibilityLabel={'profileAvatar'}>
      <AppAvatar
        shortName={getUserShortName(props.user)}
        style={styles.avatar}
        avatar={props.user.avatar}
        size={ms(100)}
        borderColor={props.user.avatar ? undefined : colors.inactiveAccentColor}
      />
      <ProfileHeaderCrown isVisible={props.isCrownVisible} />
    </View>
  )
}

export default ProfileAvatarView

const styles = StyleSheet.create({
  avatar: {
    width: ms(100),
    height: ms(100),
  },
  uploadContainer: {
    alignSelf: 'baseline',
  },
})
