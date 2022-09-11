import React, {useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import BaseInlineBottomSheet, {
  AppBottomSheet,
} from '../../BaseInlineBottomSheet'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import CommonBottomSheetListView, {
  CommonBottomSheetListItemModel,
} from '../../common/CommonBottomSheetListView'

interface Props {
  readonly reason: string
  readonly onPress: (reason: string) => void
}

const ReportChooseReasonView: React.FC<Props> = (props) => {
  const {t} = useTranslation()
  const {colors} = useTheme()
  const modalRef = useRef<AppBottomSheet>(null)

  let id = 1
  const reasons: Array<CommonBottomSheetListItemModel> = [
    {id: id++, title: 'Abuse, bullying, or harrasment'},
    {id: id++, title: 'Discrimination or hateful conduct'},
    {id: id++, title: 'Offensive or harmful content'},
    {id: id++, title: 'Trolling'},
    {id: id++, title: 'False information'},
    {id: id++, title: 'Spam or platform manipulation'},
    {id: id++, title: 'Encouraging users to violate rules'},
    {id: id++, title: 'Real name and identity'},
    {id: id++, title: 'Age Requirement'},
    {id: id++, title: 'Unauthorized or illegal activity'},
    {id: id++, title: 'Violence or terrorism'},
    {id: id++, title: 'Sharing of others’ private information'},
    {id: id++, title: 'Fake Badges'},
    {id: id++, title: 'Intellectual property misuse'},
    {id: id++, title: 'Recording or transcribing content'},
    {id: id++, title: 'Synthetic or manipulated media'},
    {id: id++, title: 'Self-harm or suicide'},
    {id: id++, title: 'Other'},
  ]

  const onReasonPress = (item: CommonBottomSheetListItemModel) => {
    props.onPress(item.title)
    modalRef.current?.dismiss()
  }

  return (
    <>
      <AppTouchableOpacity
        accessibilityLabel={'reportIncidentScreenChooseReason'}
        style={[styles.base, {backgroundColor: colors.floatingBackground}]}
        onPress={() => modalRef.current?.present()}>
        <AppText style={[styles.title, {color: colors.bodyText}]}>
          {props.reason.length > 0
            ? props.reason
            : t('reportIncidentScreenChooseReason')}
        </AppText>
        <AppIcon type={'icArrowRight'} />
      </AppTouchableOpacity>

      <BaseInlineBottomSheet
        ref={modalRef}
        itemHeight={56}
        itemsCount={reasons.length}>
        <CommonBottomSheetListView items={reasons} onPress={onReasonPress} />
      </BaseInlineBottomSheet>
    </>
  )
}

export default ReportChooseReasonView

const styles = StyleSheet.create({
  base: {
    borderRadius: ms(8),
    paddingHorizontal: ms(16),
    height: ms(48),
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    fontSize: ms(17),
    flex: 1,
  },
})
