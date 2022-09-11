import React, {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react'

import BaseInlineBottomSheet, {AppBottomSheet} from '../BaseInlineBottomSheet'
import AskUnfollowDialog, {
  AskUnfollowDialogContent,
  askUnfollowDialogHeight,
} from './dialogs/AskUnfollowDialog'

type PromiseValue = boolean | PromiseLike<boolean>

interface DialogSpec {
  readonly showAskUnfollow: (
    content: AskUnfollowDialogContent,
  ) => Promise<boolean>
}

export const DialogContext = createContext<DialogSpec | null>(null)

export const DialogContextProvider: React.FC = (p) => {
  const [sheetContent, setSheetContent] = useState<
    AskUnfollowDialogContent | undefined
  >()
  const resolverRef = useRef<(value: PromiseValue) => void>()
  const sheetRef = useRef<AppBottomSheet>(null)
  const resultRef = useRef(false)
  const onShowAskUnfollow = useCallback(
    (content: AskUnfollowDialogContent): Promise<boolean> => {
      resultRef.current = false
      setSheetContent(content)
      resolverRef.current?.(false)
      sheetRef?.current?.present?.()
      return new Promise((resolve) => {
        resolverRef.current = resolve
      })
    },
    [],
  )
  const onDismiss = useCallback(() => {
    resolverRef.current?.(resultRef.current)
    resolverRef.current = undefined
  }, [])
  const onAccept = useCallback(() => {
    resultRef.current = true
    sheetRef.current?.dismiss()
  }, [])
  const onCancel = useCallback(() => {
    resultRef.current = false
    sheetRef.current?.dismiss()
  }, [])
  const value = useMemo(() => ({showAskUnfollow: onShowAskUnfollow}), [])
  return (
    <DialogContext.Provider value={value}>
      {p.children}
      <BaseInlineBottomSheet
        ref={sheetRef}
        onDismiss={onDismiss}
        height={askUnfollowDialogHeight}>
        <AskUnfollowDialog
          content={sheetContent}
          onAccept={onAccept}
          onCancel={onCancel}
        />
      </BaseInlineBottomSheet>
    </DialogContext.Provider>
  )
}
