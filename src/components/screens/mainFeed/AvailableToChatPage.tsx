import {useNavigation} from '@react-navigation/native'
import React, {useCallback} from 'react'
import {useTranslation} from 'react-i18next'
import {ViewProps} from 'react-native'

import {UserModel} from '../../../models'
import {useBottomSafeArea} from '../../../utils/safeArea.utils'
import BaseFlatList from '../../common/BaseFlatList'
import RecommendedPeopleEmptyView from '../myNetwork/RecommendedPeopleEmptyView'
import AvailableToChatListItem from './AvailableToChatListItem'

interface Props {
  readonly users: Array<UserModel>
  readonly onRefresh: () => void
  readonly onLoadMore: () => void
  readonly isRefreshing: boolean
}

const AvailableToChatPage: React.FC<Props & ViewProps> = (props) => {
  const navigation = useNavigation()
  const inset = useBottomSafeArea()
  const {t} = useTranslation()

  const onUserPress = useCallback((userId: string) => {
    navigation.navigate('ProfileScreenModal', {userId})
  }, [])

  if (!props.users.length) {
    if (props.isRefreshing) return null
    else
      return <RecommendedPeopleEmptyView text={t('availableToChatEmptyView')} />
  }

  return (
    <BaseFlatList<UserModel>
      style={props.style}
      contentContainerStyle={{paddingBottom: inset}}
      refreshing={props.isRefreshing}
      onEndReached={props.onLoadMore}
      onRefresh={props.onRefresh}
      data={props.users}
      renderItem={({item}) => {
        return <AvailableToChatListItem user={item} onUserPress={onUserPress} />
      }}
    />
  )
}

export default AvailableToChatPage
