import React, {memo} from 'react'
import {StyleSheet, View} from 'react-native'

import Vertical from '../../../src/components/common/Vertical'
import WebModalHeader, {
  WebModalHeaderProps,
} from '../../../src/components/common/WebModalHeader'
import SelectParticipantsListView from '../../../src/components/screens/createEvent/SelectParticipantsListView'
import {AppModal} from '../../../src/components/webSafeImports/webSafeImports'

import {UserModel} from '../../../src/models'

import {CreateEventStore} from '../../../src/stores/CreateEventStore'

import {ms} from '../../../src/utils/layout.utils'
import {popupHeight} from '../../../src/utils/tablet.consts'

import {commonStyles} from '../../../src/theme/appTheme'

interface Props {
  readonly visible: boolean
  readonly headerStyle?: WebModalHeaderProps
  readonly onSelect: (items: UserModel) => void
  readonly onClose: () => void
  readonly store: CreateEventStore
}

const SelectParticipantsListViewWeb: React.FC<Props> = (props) => {
  return (
    <AppModal
      visible={props.visible}
      animationType={'fade'}
      contentStyle={styles.modal}>
      <Vertical style={[styles.container, commonStyles.flexOne]}>
        <WebModalHeader
          {...props.headerStyle}
          onNavigationAction={props.onClose}
        />
        <View style={[styles.listContainerPadding, commonStyles.flexOne]}>
          <SelectParticipantsListView
            store={props.store}
            onSelect={props.onSelect}
          />
        </View>
      </Vertical>
    </AppModal>
  )
}

export default memo(SelectParticipantsListViewWeb)

const styles = StyleSheet.create({
  modal: {
    padding: 0,
  },
  container: {
    maxHeight: popupHeight,
  },
  listContainerPadding: {
    paddingHorizontal: ms(8),
  },
})
