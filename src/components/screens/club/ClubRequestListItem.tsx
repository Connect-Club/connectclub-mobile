import {useNavigation} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useCallback} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {ClubJoinRequestModel} from '../../../models'
import {ClubOptions} from '../../../screens/ProfileScreen'
import {commonStyles, makeTextStyle, useTheme} from '../../../theme/appTheme'
import {isJoinedClub} from '../../../utils/club.utils'
import {ms} from '../../../utils/layout.utils'
import {push} from '../../../utils/navigation.utils'
import {shortFromDisplayName} from '../../../utils/userHelper'
import AppAvatar from '../../common/AppAvatar'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import MarkdownHyperlink from '../profileScreen/MarkdownHyperlink'

interface Props {
  readonly request: ClubJoinRequestModel
  readonly isLoading: boolean
  readonly onAcceptPress: (userId: string, requestId: string) => void
}

const ClubRequestListItem: React.FC<Props> = ({
  request,
  isLoading,
  onAcceptPress,
}) => {
  const {colors} = useTheme()
  const navigation = useNavigation()
  const {t} = useTranslation()

  const onPress = useCallback(() => {
    onAcceptPress(request.user.id, request.joinRequestId)
  }, [onAcceptPress, request.user.id, request.joinRequestId])
  const onUserPress = useCallback(() => {
    const clubOptions: ClubOptions = {joinRequestId: request.joinRequestId}
    push(navigation, 'ProfileScreenModal', {
      userId: request.user.id,
      clubOptions,
    })
  }, [navigation, request.user.id, request.joinRequestId])
  const bio = request.user.about?.trim()
  const isJoined = isJoinedClub(request.user.clubRole)

  return (
    <View style={styles.base}>
      <AppTouchableOpacity
        style={styles.clickableContainer}
        onPress={onUserPress}>
        <AppAvatar
          style={styles.avatar}
          shortName={shortFromDisplayName(request.user.displayName)}
          avatar={request.user.avatar}
          size={ms(40)}
        />
        <View style={styles.textContainer}>
          <AppText style={styles.nameText}>{request.user.displayName}</AppText>
          {!!bio && (
            <MarkdownHyperlink linkStyle={commonStyles.link}>
              <AppText
                style={[
                  styles.descriptionText,
                  {color: colors.secondaryBodyText},
                ]}
                numberOfLines={2}>
                {bio}
              </AppText>
            </MarkdownHyperlink>
          )}
        </View>
      </AppTouchableOpacity>
      {!isJoined && (
        <AppTouchableOpacity
          style={[styles.button, {backgroundColor: colors.primaryClickable}]}
          onPress={onPress}>
          <AppText
            style={[styles.buttonText, {color: colors.floatingBackground}]}>
            {isLoading ? t('loading') : t('letInButton')}
          </AppText>
        </AppTouchableOpacity>
      )}
      {isJoined && (
        <AppText style={[styles.statusText, {color: colors.secondaryBodyText}]}>
          {t('approved')}
        </AppText>
      )}
    </View>
  )
}

export default observer(ClubRequestListItem)

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    marginHorizontal: ms(16),
    marginVertical: ms(14),
  },
  clickableContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  avatar: {
    alignSelf: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    marginStart: ms(16),
  },
  nameText: {
    ...makeTextStyle(ms(12), ms(16), 'bold'),
  },
  descriptionText: {
    ...makeTextStyle(ms(12), ms(16), 'normal'),
  },
  button: {
    height: ms(28),
    marginStart: ms(8),
    marginEnd: ms(12),
    paddingHorizontal: ms(12),
    alignSelf: 'center',
    borderRadius: ms(100),
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
  },
  statusText: {
    marginStart: ms(8),
    marginEnd: ms(12),
    alignSelf: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    ...makeTextStyle(ms(12), ms(18), 'bold'),
  },
  buttonText: {
    alignSelf: 'center',
    ...makeTextStyle(ms(12), ms(18), 'bold'),
  },
})
