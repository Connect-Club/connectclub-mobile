import {observer} from 'mobx-react'
import React, {memo} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {UserModel} from '../../../models'
import {CreateEventStore} from '../../../stores/CreateEventStore'
import {commonStyles} from '../../../theme/appTheme'
import {isNative} from '../../../utils/device.utils'
import {ms} from '../../../utils/layout.utils'
import {useBottomSafeArea} from '../../../utils/safeArea.utils'
import CancelableSearchBar from '../../common/CancelableSearchBar'
import NoSearchResultsView from '../../common/NoSearchResultsView'
import TopContentGradientView from '../../common/TopContentGradientView'
import {BottomSheetFlatList} from '../../webSafeImports/webSafeImports'
import SimpleRoomBottomSheetHeader from '../room/SimpleRoomBottomSheetHeader'
import AddModeratorsEmptyView from './AddModeratorsEmptyView'
import ParticipantListItem from './ParticipantListItem'

interface Props {
  readonly onSelect: (items: UserModel) => void
  readonly store: CreateEventStore
  readonly usersList: Array<UserModel>
  readonly title: string
}

interface WrapperProps {
  readonly title: string
}

const Wrapper: React.FC<WrapperProps> = memo(({title, children}) => {
  const {t} = useTranslation()
  return (
    <View style={commonStyles.flexOne}>
      {isNative && <SimpleRoomBottomSheetHeader title={t(title)} />}
      {children}
    </View>
  )
})

const SelectParticipantsListView: React.FC<Props> = ({
  store,
  onSelect,
  usersList,
  title,
}) => {
  const inset = useBottomSafeArea()
  const {t} = useTranslation()

  if (!usersList.length && !store.searchMode) {
    if (store.isFirstLoading) return <Wrapper title={title} />
    if (!store.isInProgress)
      return (
        <Wrapper title={title}>
          <AddModeratorsEmptyView />
        </Wrapper>
      )
  }

  return (
    <Wrapper title={title}>
      <CancelableSearchBar
        searchMode={store.searchMode}
        placeholderText={t('selectInterestsFindPeople')}
        isLoading={store.searchMode && store.isSearchStoreInRefreshing}
        onChangeText={store.search}
        onSearchModeChanged={store.setSearchMode}
      />
      <View style={commonStyles.flexOne}>
        <TopContentGradientView
          style={commonStyles.fullWidth}
          gradientStart={0.35}>
          <BottomSheetFlatList<UserModel>
            contentContainerStyle={{paddingBottom: inset}}
            keyboardShouldPersistTaps={'handled'}
            style={styles.list}
            ListEmptyComponent={
              <NoSearchResultsView query={store.searchQuery} />
            }
            data={usersList}
            initialNumToRender={20}
            onEndReached={store.fetchMore}
            renderItem={({item, index}) => (
              <ParticipantListItem
                style={styles.listItem}
                user={item}
                onPress={() => {
                  onSelect(item)
                  store.clearSearchOnly()
                }}
                showTopSeparator={index !== 0}
              />
            )}
          />
        </TopContentGradientView>
      </View>
    </Wrapper>
  )
}

export default observer(SelectParticipantsListView)

const styles = StyleSheet.create({
  list: {
    marginTop: ms(10),
    height: '100%',
  },
  listItem: {
    paddingHorizontal: ms(16),
    height: ms(56),
  },
})
