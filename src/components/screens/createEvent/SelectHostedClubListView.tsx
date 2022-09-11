import {observer} from 'mobx-react'
import React, {memo} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {ClubInfoModel} from '../../../models'
import {CreateEventStore} from '../../../stores/CreateEventStore'
import {commonStyles} from '../../../theme/appTheme'
import {isNative} from '../../../utils/device.utils'
import {ms} from '../../../utils/layout.utils'
import {useBottomSafeArea} from '../../../utils/safeArea.utils'
import TopContentGradientView from '../../common/TopContentGradientView'
import {BottomSheetFlatList} from '../../webSafeImports/webSafeImports'
import SimpleRoomBottomSheetHeader from '../room/SimpleRoomBottomSheetHeader'
import ClubListItem from './ClubListItem'

interface Props {
  readonly onSelect: (items: ClubInfoModel) => void
  readonly selected?: ClubInfoModel
  readonly store: CreateEventStore
}

const Wrapper: React.FC = memo(({children}) => {
  const {t} = useTranslation()
  return (
    <View style={commonStyles.flexOne}>
      {isNative && (
        <SimpleRoomBottomSheetHeader title={t('createEventAddHostClub')} />
      )}
      {children}
    </View>
  )
})

const SelectHostedClubListView: React.FC<Props> = ({store, onSelect}) => {
  const inset = useBottomSafeArea()
  const clubs = store.myClubs

  return (
    <Wrapper>
      <View style={commonStyles.flexOne}>
        <TopContentGradientView
          style={commonStyles.fullWidth}
          gradientStart={0.35}>
          <BottomSheetFlatList<ClubInfoModel>
            contentContainerStyle={{paddingBottom: inset}}
            style={styles.list}
            data={clubs}
            initialNumToRender={20}
            onEndReached={store.fetchMore}
            renderItem={({item, index}) => (
              <ClubListItem
                style={styles.listItem}
                club={item}
                isSelected={item.id === store.hostedClub?.id}
                onPress={() => {
                  onSelect(item)
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

export default observer(SelectHostedClubListView)

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
