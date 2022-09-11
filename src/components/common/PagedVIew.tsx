import React, {PropsWithChildren} from 'react'
import {ScrollView} from 'react-native'

import Horizontal from './Horizontal'

const PagedView: React.FC<PropsWithChildren<any>> = ({children}) => {
  return (
    <ScrollView>
      <Horizontal>{children}</Horizontal>
    </ScrollView>
  )
}

export default PagedView
