import {toJS} from 'mobx'
import {observer} from 'mobx-react'
import React, {useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {commonStyles} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {BottomSheetFlatList} from '../../webSafeImports/webSafeImports'
import UserManager from './jitsi/UserManager'
import RaisedHandListItemView from './RaisedHandListItemView'
import RoomBottomSheetHeader from './RoomBottomSheetHeader'

interface Props {
  readonly userManager: UserManager
  readonly callToStage: (userId: string) => void
  readonly handsProvider: () => Promise<string>
}

const RaisedHandsListView: React.FC<Props> = ({
  userManager,
  callToStage,
  handsProvider,
}) => {
  const {t} = useTranslation()

  const fetchHands = async () => {
    userManager.updateRaisedHands(await handsProvider())
  }

  useEffect(() => {
    fetchHands()
  }, [userManager])

  return (
    <View style={[commonStyles.wizardContainer]}>
      <RoomBottomSheetHeader title={t('raisedHandsTitle')} />
      <BottomSheetFlatList
        style={styles.list}
        data={toJS(userManager.raisedHands)}
        renderItem={({item}) => (
          <RaisedHandListItemView
            user={item}
            callToStage={() => callToStage(item.id)}
          />
        )}
      />
    </View>
  )
}

export default observer(RaisedHandsListView)

const styles = StyleSheet.create({
  list: {
    flex: 1,
    paddingHorizontal: ms(16),
    overflow: 'visible',
  },
})
