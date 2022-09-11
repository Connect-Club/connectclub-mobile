import React from 'react'
import {useTranslation} from 'react-i18next'
import {Linking, StyleSheet, View} from 'react-native'
// @ts-ignore
import InstagramLogin from 'react-native-instagram-login'
import LinkedInModal from 'react-native-linkedin'

import {analytics} from '../../../Analytics'
import AppIcon, {AppIconType} from '../../../assets/AppIcon.native'
import {ProfileStore} from '../../../stores/ProfileStore'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {updateProfileData} from '../../../utils/profile.utils'
import {toastHelper} from '../../../utils/ToastHelper'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import Horizontal from '../../common/Horizontal'
import {alert} from '../../webSafeImports/webSafeImports.native'

interface SocialProps {
  icon: AppIconType
  onPress: () => void
  onLongPress?: () => void
}

const SocialNetworkIcon: React.FC<SocialProps> = (props) => {
  const {colors} = useTheme()

  return (
    <AppTouchableOpacity
      style={[styles.socialIcon, {backgroundColor: colors.secondaryClickable}]}
      onPress={props.onPress}
      onLongPress={props.onLongPress}>
      <AppIcon type={props.icon} tint={colors.accentPrimary} />
      {props.children}
    </AppTouchableOpacity>
  )
}

const Linkedin = {
  client_id: '78mzehq8hx5qap',
  client_secret: 'HUxsrO7OSmHuXCUV',
}

const Instagram = {
  app_id: '282303077362473',
  app_secret: '4d9047e1e2313dafc5ab6ca866e18b19',
}

interface Props {
  store: ProfileStore
}

const ProfileSocialNetworkLinks: React.FC<Props> = ({store}) => {
  const {colors} = useTheme()
  const {t} = useTranslation()
  const user = store.user

  const currentUser = store.isCurrentUser
  const linkedModalRef = React.createRef<LinkedInModal>()
  const instagramModalRef = React.createRef()

  const hasLinkedin = !!user?.linkedin
  const hasInstagram = !!user?.instagram

  // MARK: - Sign in
  const onLinkedinSignIn = () => {
    linkedModalRef.current?.open()
  }

  const onInstagramSignIn = () => {
    // @ts-ignore
    instagramModalRef.current?.show()
  }

  // MARK: - Parse Incoming data
  const getLinkedinData = async (accessToken: string) => {
    const response = await fetch('https://api.linkedin.com/v2/me', {
      method: 'GET',
      headers: {Authorization: 'Bearer ' + accessToken},
    })
    const payload = await response.json()
    if (!payload.vanityName) {
      toastHelper.error('somethingWentWrong')
      return
    }
    await updateProfileData({linkedin: payload.vanityName})
    analytics.sendEvent('profile_social_linkedin_connected')
    await store.fetch()
  }

  const getInstagramData = async (data: any) => {
    const response = await fetch(
      `https://graph.instagram.com/me?fields=username&access_token=${data.access_token}`,
      {
        method: 'GET',
      },
    )
    const payload = await response.json()
    if (!payload.username) {
      toastHelper.error('somethingWentWrong')
      return
    }
    await updateProfileData({instagram: payload.username})
    analytics.sendEvent('profile_social_instagram_connected')
    await store.fetch()
  }

  // MARK: - Remove social page

  const removeLinkedin = () => {
    updateProfileData({linkedin: ''}).then(() => {
      analytics.sendEvent('profile_social_linkedin_removed')
      store.fetch()
    })
  }

  const removeInstagram = () => {
    updateProfileData({instagram: ''}).then(() => {
      analytics.sendEvent('profile_social_instagram_removed')
      store.fetch()
    })
  }

  // MARK: - Open social Page

  const openLinkedinProfile = () => {
    analytics.sendEvent('profile_social_linkedin_open', {
      linkedin: user?.linkedin,
      userId: user?.id,
    })
    Linking.openURL(`https://linkedin.com/in/${user?.linkedin}`)
  }

  const openInstagramProfile = () => {
    analytics.sendEvent('profile_social_instagram_open', {
      instagram: user?.instagram,
      userId: user?.id,
    })
    Linking.openURL(`https://instagram.com/${user?.instagram}`)
  }

  return (
    <Horizontal style={styles.container}>
      {hasLinkedin && (
        <SocialNetworkIcon
          icon={'icLinkedin'}
          onPress={openLinkedinProfile}
          onLongPress={() => {
            if (!currentUser) return
            alert(
              t('deleteSocialPage', {page: 'LinkedIn'}),
              t('profileDeleteSocialPageConfirmation'),
              [
                {text: t('cancelButton'), style: 'cancel'},
                {
                  text: t('deleteButton'),
                  style: 'destructive',
                  onPress: removeLinkedin,
                },
              ],
            )
          }}
        />
      )}
      {hasInstagram && (
        <SocialNetworkIcon
          icon={'icInstagram'}
          onPress={openInstagramProfile}
          onLongPress={() => {
            if (!currentUser) return
            alert(
              t('deleteSocialPage', {page: 'Instagram'}),
              t('profileDeleteSocialPageConfirmation'),
              [
                {text: t('cancelButton'), style: 'cancel'},
                {
                  text: t('deleteButton'),
                  style: 'destructive',
                  onPress: removeInstagram,
                },
              ],
            )
          }}
        />
      )}
      {!hasLinkedin && currentUser && (
        <SocialNetworkIcon icon={'icLinkedin'} onPress={onLinkedinSignIn}>
          <AppIcon
            style={[styles.addIcon, {backgroundColor: colors.accentPrimary}]}
            type={'icPlus'}
            tint={colors.floatingBackground}
          />
        </SocialNetworkIcon>
      )}
      {!hasInstagram && currentUser && (
        <SocialNetworkIcon icon={'icInstagram'} onPress={onInstagramSignIn}>
          <AppIcon
            style={[styles.addIcon, {backgroundColor: colors.accentPrimary}]}
            type={'icPlus'}
            tint={colors.floatingBackground}
          />
        </SocialNetworkIcon>
      )}
      <View style={styles.hiddenButton}>
        <LinkedInModal
          ref={linkedModalRef}
          closeStyle={{marginTop: ms(14), marginEnd: ms(14)}}
          onSuccess={(data: any) => {
            const token = data.access_token
            if (!token) {
              toastHelper.error('somethingWentWrong')
              return
            }
            getLinkedinData(token)
          }}
          onError={(error: any) => {
            if (error.message) toastHelper.error(error.message)
          }}
          clientSecret={Linkedin.client_secret}
          clientID={Linkedin.client_id}
          permissions={['r_basicprofile']}
          redirectUri={'https://connect.club'}
        />
        <InstagramLogin
          ref={instagramModalRef}
          closeStyle={{marginTop: ms(9), marginEnd: ms(9)}}
          appId={Instagram.app_id}
          appSecret={Instagram.app_secret}
          redirectUrl={'https://connect.club/'}
          scopes={['user_profile', 'user_link', 'public_profile']}
          onLoginSuccess={getInstagramData}
          onLoginFailure={(error: any) => {
            toastHelper.error(JSON.stringify(error))
          }}
        />
      </View>
    </Horizontal>
  )
}

export default ProfileSocialNetworkLinks

const styles = StyleSheet.create({
  container: {
    marginHorizontal: ms(16),
    marginVertical: ms(8),
    alignItems: 'center',
    flexDirection: 'row',
  },

  socialIcon: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    marginHorizontal: ms(3),
    alignItems: 'center',
    justifyContent: 'center',
  },

  addIcon: {
    position: 'absolute',
    alignItems: 'center',
    width: ms(16),
    height: ms(16),
    top: ms(-3),
    right: ms(-3),
    borderRadius: ms(8),
  },

  button: {
    height: ms(30),
    paddingHorizontal: ms(8),
    flex: 1,
    minWidth: undefined,
    minHeight: undefined,
    maxWidth: ms(209),
  },

  hiddenButton: {
    width: 0,
    height: 0,
  },
})
