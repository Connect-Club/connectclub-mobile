import {observer} from 'mobx-react'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {ActivityIntroModel} from '../../../models'
import {ActivityStore} from '../../../stores/ActivityStore'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {highlightWords} from '../../../utils/userHelper'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import Vertical from '../../common/Vertical'
import {presentIntercomCarousel} from '../../webSafeImports/webSafeImports'
import CreatedAtView from '../activity/CreatedAtView'

interface Props {
  readonly item: ActivityIntroModel
  readonly store: ActivityStore
  readonly index: number
}

const ActivityIntroView: React.FC<Props> = (props) => {
  const {colors} = useTheme()
  const itemOpacity = props.item.new ? 1 : 0.4

  const highlightedStyle = [styles.title, {color: colors.bodyText}]
  const regularStyle = [styles.subtitle, {color: colors.bodyText}]

  const firstLine = props.item.title.match(/[^\n]+\n?/gi)?.[0]?.trim()
  const titleParts = highlightWords(
    props.item.title,
    firstLine ? [firstLine] : [],
  )

  return (
    <View style={styles.listItem}>
      <AppIcon
        type={'icConnectLogo'}
        style={[
          styles.avatar,
          {
            opacity: itemOpacity,
            backgroundColor: colors.floatingBackground,
            borderColor: colors.inactiveAccentColor,
          },
        ]}
      />
      <AppTouchableOpacity
        style={styles.touchableView}
        onPress={presentIntercomCarousel}>
        <Vertical style={{flex: 1}}>
          <AppText style={[styles.textContainer, {opacity: itemOpacity}]}>
            {titleParts.map((part, index) => {
              const style = part.highlighted ? highlightedStyle : regularStyle
              return (
                <AppText key={index} style={style}>
                  {part.text}
                </AppText>
              )
            })}
          </AppText>
          <View
            style={[
              styles.takeMeOnTourButton,
              {backgroundColor: colors.accentPrimary},
            ]}>
            <Text
              style={[
                styles.takeMeOnTourButtonText,
                {color: colors.textPrimary},
              ]}>
              Take me on the tour
            </Text>
          </View>
        </Vertical>
        <CreatedAtView
          style={[styles.createdAt, {opacity: itemOpacity}]}
          createdAt={props.item.createdAt}
        />
      </AppTouchableOpacity>
    </View>
  )
}

export default observer(ActivityIntroView)

const styles = StyleSheet.create({
  avatar: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(70),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: ms(1),
  },
  listItem: {
    marginBottom: ms(16),
    paddingBottom: ms(16),
    flexDirection: 'row',
  },
  touchableView: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  textContainer: {
    justifyContent: 'flex-start',
    marginStart: ms(16),
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  takeMeOnTourButton: {
    paddingHorizontal: ms(8),
    height: ms(28),
    borderRadius: ms(28) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: ms(16),
    marginStart: ms(16),
  },
  takeMeOnTourButtonText: {
    fontSize: ms(12),
  },
  title: {
    flexWrap: 'wrap',
    fontSize: ms(12),
    fontWeight: 'bold',
  },
  subtitle: {
    flexWrap: 'wrap',
    alignSelf: 'center',
    fontSize: ms(12),
  },
  createdAt: {
    marginTop: ms(1),
    lineHeight: ms(16),
    paddingStart: ms(4),
    justifyContent: 'center',
  },
})
