import React, {memo} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {shortFromDisplayName} from '../../../utils/userHelper'
import AppAvatar from '../AppAvatar'
import AppText from '../AppText'
import AppTouchableOpacity from '../AppTouchableOpacity'

export const askUnfollowDialogHeight = ms(280)

export interface AskUnfollowDialogContent {
  readonly avatar: string
  readonly displayName: string
}

interface Props {
  content?: AskUnfollowDialogContent
  onAccept: () => void
  onCancel: () => void
}

const AskUnfollowDialog: React.FC<Props> = (p) => {
  const {t} = useTranslation()
  const {colors} = useTheme()
  if (!p.content) return null
  return (
    <View style={styles.base}>
      <AppAvatar
        size={ms(56)}
        style={styles.avatar}
        avatar={p.content.avatar}
        shortName={shortFromDisplayName(p.content.displayName)}
      />

      <AppText style={[styles.questionText, {color: colors.secondaryBodyText}]}>
        {t('askUnfollowDialogQuestion')}
      </AppText>
      <AppText style={[styles.nameText, {color: colors.bodyText}]}>
        {p.content.displayName}?
      </AppText>
      <AppTouchableOpacity
        style={[
          styles.unfollowButton,
          {
            borderTopColor: colors.separator,
            borderBottomColor: colors.separator,
          },
        ]}
        onPress={p.onAccept}>
        <AppText style={[styles.unfollowButtonText, {color: colors.warning}]}>
          {t('stopConnectionButton')}
        </AppText>
      </AppTouchableOpacity>
      <AppTouchableOpacity style={styles.cancelButton} onPress={p.onCancel}>
        <AppText
          style={[styles.cancelButtonText, {color: colors.primaryClickable}]}>
          {t('cancelButton')}
        </AppText>
      </AppTouchableOpacity>
    </View>
  )
}

export default memo(AskUnfollowDialog)

const styles = StyleSheet.create({
  base: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    width: ms(56),
    height: ms(56),
    marginTop: ms(29),
  },
  questionText: {
    marginTop: ms(12),
    fontSize: ms(13),
    lineHeight: ms(18),
    fontWeight: 'bold',
    textAlign: 'center',
    maxWidth: ms(327),
  },
  nameText: {
    fontSize: ms(13),
    lineHeight: ms(18),
    fontWeight: 'bold',
    maxWidth: ms(285),
  },
  unfollowButton: {
    alignItems: 'center',
    width: '100%',
    borderTopWidth: ms(1),
    borderBottomWidth: ms(1),
    marginTop: ms(13),
    paddingVertical: ms(19),
  },
  unfollowButtonText: {
    fontSize: ms(17),
    lineHeight: ms(22),
  },
  cancelButton: {
    alignItems: 'center',
    width: '100%',
    marginTop: ms(4),
    paddingVertical: ms(16),
  },
  cancelButtonText: {
    fontSize: ms(20),
    lineHeight: ms(24),
    fontWeight: 'bold',
  },
})
