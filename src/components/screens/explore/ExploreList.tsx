import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useCallback} from 'react'
import {useTranslation} from 'react-i18next'
import {
  ListRenderItem,
  Platform,
  SectionList,
  SectionListRenderItemInfo,
  StyleSheet,
  View,
} from 'react-native'

import {analytics} from '../../../Analytics'
import {UserModel} from '../../../models'
import {
  makeTextStyle,
  PRIMARY_BACKGROUND,
  useTheme,
} from '../../../theme/appTheme'
import {bottomInset} from '../../../utils/inset.utils'
import {ms} from '../../../utils/layout.utils'
import {useBottomSafeArea} from '../../../utils/safeArea.utils'
import AppText from '../../common/AppText'
import InviteBlockView from '../../common/InviteBlockView'
import SecondaryButton from '../../common/SecondaryButton'
import {useExploreContext} from './ExploreContext'
import ExploreCreateClubButton from './ExploreCreateClubButton'

interface ScreenProps {
  navigationRoot: string
}

type ScreenRouteProp = RouteProp<{Screen: ScreenProps}, 'Screen'>

const INVITE_BLOCK_POS_MAX = 3

const ExploreList: React.FC = () => {
  const inset = useBottomSafeArea()
  const {t} = useTranslation()
  const {searchStore, renderClubListItem, renderUserItem} = useExploreContext()
  const {colors} = useTheme()
  const navigation = useNavigation()
  const {params} = useRoute<ScreenRouteProp>()

  const renderInviteBlock = (): React.ReactElement => {
    return (
      <InviteBlockView
        title={t('growNetworkBlockTitle')}
        text={t('growNetworkBlockText')}
        icon={'icHasInvites'}
        style={styles.inviteBlock}
        accessibilitySuffix={'Explore'}
      />
    )
  }

  const renderUserListItemInternal:
    | ListRenderItem<UserModel>
    | null
    | undefined = (info) => {
    const inviteBlockPosition = Math.min(
      INVITE_BLOCK_POS_MAX,
      searchStore.peopleExploreStore.exploredList.length,
    )
    if (info.index === inviteBlockPosition) return renderInviteBlock()
    let index = info.index
    if (info.index > inviteBlockPosition) {
      index += 1
    }
    return renderUserItem!({
      index,
      item: info.item,
      separators: info.separators,
    })
  }

  const clubSection = {
    title: t('interestingClubsTitle'),
    footerText: t('showMoreClubs'),
    isLoadingMore: searchStore.clubsExploreStore.isLoadingMore,
    fetchMore: () => searchStore.clubsExploreStore.loadMore(),
    renderItem: renderClubListItem,
    data: searchStore.clubsExploreStore.exploredList,
  }

  const usersSection = {
    title: t('interestingPeopleTitle'),
    footerText: t('showMorePeople'),
    isLoadingMore: searchStore.peopleExploreStore.isLoadingMore,
    fetchMore: () => searchStore.peopleExploreStore.loadMore(),
    renderItem: renderUserListItemInternal,
    data: searchStore.peopleExploreStore.exploredList,
  }

  const checkIfHeaderNeed = useCallback(
    (sectionTitle: string) => {
      switch (sectionTitle) {
        case clubSection.title:
          return searchStore.clubsStore.list.length > 0
        case usersSection.title:
          return searchStore.peopleExploreStore.list.length > 0
        default:
          return true
      }
    },
    [searchStore],
  )

  const onCreateClub = useCallback(() => {
    analytics.sendEvent('explore_open_create_club', {})
    navigation.navigate('ProfileScreenModal', {
      navigationRoot: params?.navigationRoot,
      initialScreen: 'CreateClubScreen',
    })
  }, [navigation, params?.navigationRoot])

  const checkIfFooterNeed = useCallback(
    (sectionTitle: string) => {
      if (!checkIfHeaderNeed(sectionTitle)) return false
      switch (sectionTitle) {
        case clubSection.title:
          return !searchStore.clubsExploreStore.isLoadAll
        default:
          return false
      }
    },
    [searchStore.isLoading],
  )

  const renderSectionHeader = useCallback(
    ({section: {title}}) => {
      if (!checkIfHeaderNeed(title)) return null
      return (
        <View style={{backgroundColor: PRIMARY_BACKGROUND}}>
          <AppText style={[{color: colors.thirdBlack}, styles.sectionHeader]}>
            {title.toUpperCase()}
          </AppText>
          {clubSection.title === title && (
            <ExploreCreateClubButton onPress={onCreateClub} />
          )}
        </View>
      )
    },
    [checkIfHeaderNeed, colors.thirdBlack],
  )

  const renderSectionFooter = useCallback(
    ({section: {title, isLoadingMore, footerText, fetchMore}}) => {
      if (!checkIfFooterNeed(title)) return null

      return (
        <SecondaryButton
          style={[
            styles.footerButton,
            {backgroundColor: colors.secondaryClickable},
          ]}
          textStyle={styles.footerText}
          title={footerText}
          isLoading={isLoadingMore}
          onPress={() => fetchMore(3)}
        />
      )
    },
    [checkIfFooterNeed, colors.secondaryClickable],
  )

  const renderSectionItem = (info: SectionListRenderItemInfo<any, any>) => {
    return <>{info.section.renderItem}</>
  }

  const sectionsData = [clubSection, usersSection]

  return (
    <SectionList
      style={styles.flatList}
      keyboardDismissMode={Platform.OS === 'ios' ? 'on-drag' : 'none'}
      keyboardShouldPersistTaps={'always'}
      contentContainerStyle={{
        paddingBottom: bottomInset(inset),
      }}
      sections={sectionsData}
      renderItem={renderSectionItem}
      renderSectionHeader={renderSectionHeader}
      renderSectionFooter={renderSectionFooter}
      onEndReached={usersSection.fetchMore}
    />
  )
}

export default observer(ExploreList)

const styles = StyleSheet.create({
  flatList: {
    paddingHorizontal: ms(16),
    height: '100%',
  },
  sectionHeader: {
    paddingBottom: ms(12),
    paddingTop: ms(16),
    ...makeTextStyle(ms(11), ms(14), '600'),
  },
  footerButton: {
    alignSelf: 'center',
    height: ms(28),
    borderRadius: ms(14),
    minWidth: ms(125),
    marginVertical: ms(12),
  },
  footerText: {
    ...makeTextStyle(ms(12), ms(18), '600'),
  },
  inviteBlock: {
    marginTop: ms(24),
    marginBottom: ms(24),
  },
})
