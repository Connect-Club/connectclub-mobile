import {observer} from 'mobx-react'
import React, {memo, useCallback, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {ListRenderItemInfo, StyleSheet, View} from 'react-native'

import {
  InviteFriendUserModel,
  PingFriendsStore,
} from '../../../stores/PingFriendsStore'
import {commonStyles} from '../../../theme/appTheme'
import {calculateItemsPerRow, ms} from '../../../utils/layout.utils'
import {tabletContainerWidthLimit} from '../../../utils/tablet.consts'
import {useViewModel} from '../../../utils/useViewModel'
import CancelableSearchBar from '../../common/CancelableSearchBar'
import InviteBlockView from '../../common/InviteBlockView'
import NoSearchResultsView from '../../common/NoSearchResultsView'
import TopContentGradientView from '../../common/TopContentGradientView'
import {BottomSheetFlatList} from '../../webSafeImports/webSafeImports'
import FriendItemView from './FriendItemView'
import PingSomeoneBottomSheetEmptyView from './PingSomeoneBottomSheetEmptyView'
import SimpleRoomBottomSheetHeader from './SimpleRoomBottomSheetHeader'

const Wrapper: React.FC = memo(({children}) => {
  const {t} = useTranslation()
  return (
    <View style={[commonStyles.wizardContainer, commonStyles.flexOne]}>
      <SimpleRoomBottomSheetHeader
        title={t('inviteFriendToRoomScreenTitle')}
        titleStyle={styles.title}
      />
      {children}
    </View>
  )
})

interface Props {
  readonly roomId: string
  readonly eventId?: string
  readonly onShareRoomPress: (inviteCode?: string) => void
  readonly onCopyRoomLinkPress: (inviteCode?: string) => void
}

const FriendsBottomSheetListView: React.FC<Props> = ({
  roomId,
  eventId,
  onShareRoomPress,
  onCopyRoomLinkPress,
}) => {
  const {t} = useTranslation()
  const store = useViewModel(() => new PingFriendsStore(roomId))

  useEffect(() => {
    store.fetch()
  }, [store])

  const result = calculateItemsPerRow(ms(66))

  const renderItem = useCallback(
    ({item, index}: ListRenderItemInfo<InviteFriendUserModel>) => {
      return (
        <FriendItemView
          user={item}
          index={index}
          onUserPress={store.inviteFriend}
          style={[styles.item, {marginEnd: ms(16) + result.additionalSpace}]}
        />
      )
    },
    [result.additionalSpace, store.inviteFriend],
  )

  const users = store.list
  if (!users.length && !store.searchMode) {
    if (store.isFirstLoading) return <Wrapper />
    if (!store.isInProgress)
      return (
        <Wrapper>
          <PingSomeoneBottomSheetEmptyView
            onShareRoomPress={onShareRoomPress}
            onCopyRoomLinkPress={onCopyRoomLinkPress}
            roomId={roomId}
            eventId={eventId}
          />
        </Wrapper>
      )
  }

  return (
    <Wrapper>
      <CancelableSearchBar
        placeholderText={t('selectInterestsFindPeople')}
        isLoading={store.searchMode && store.isSearchStoreInRefreshing}
        onChangeText={store.search}
        searchMode={store.searchMode}
        onSearchModeChanged={store.setSearchMode}
      />
      <View style={commonStyles.flexOne}>
        <TopContentGradientView
          style={commonStyles.fullWidth}
          gradientStart={0.35}>
          <BottomSheetFlatList
            contentContainerStyle={styles.container}
            numColumns={result.numColumns}
            style={styles.list}
            ListEmptyComponent={
              <NoSearchResultsView query={store.searchQuery} />
            }
            ListHeaderComponent={
              <InviteBlockView
                icon={'icLink'}
                title={t('sendRoomLinkTitle')}
                text={t('sendRoomLinkText')}
                style={{marginBottom: ms(24)}}
                onCopyLink={onCopyRoomLinkPress}
                onShareLink={onShareRoomPress}
                roomId={roomId}
                eventId={eventId}
                accessibilitySuffix={'Ping'}
              />
            }
            data={users}
            keyExtractor={(item) => item.user.id}
            renderItem={renderItem}
            onEndReached={store.fetchMore}
          />
        </TopContentGradientView>
      </View>
    </Wrapper>
  )
}

export default observer(FriendsBottomSheetListView)

const styles = StyleSheet.create({
  list: {
    flex: 1,
    paddingHorizontal: ms(16),
    paddingTop: ms(16),
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'column',
  },
  container: {
    paddingBottom: ms(72),
    overflow: 'visible',
    maxWidth: tabletContainerWidthLimit,
  },
  title: {
    paddingStart: ms(51),
    paddingEnd: ms(31),
  },
})
