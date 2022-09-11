import {BottomSheetModalProvider} from '@gorhom/bottom-sheet'
import React, {memo, ReactNode} from 'react'

import {NftWalletProvider} from '../../utils/NftWalletProvider'
import {DialogContextProvider} from './AskDialog'

const AppProviders: React.FC<{children?: ReactNode}> = (p) => {
  return (
    <BottomSheetModalProvider>
      <NftWalletProvider>
        <DialogContextProvider>{p.children}</DialogContextProvider>
      </NftWalletProvider>
    </BottomSheetModalProvider>
  )
}

export default memo(AppProviders)
