import React, {Fragment, useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {
  AlertButton,
  AlertOptions,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import {PromptOptions} from 'react-native-prompt-android'

import {
  commonStyles,
  PRIMARY_BACKGROUND,
  useTheme,
} from '../../../theme/appTheme'
import AppText from '../../common/AppText'
import AppTextInput from '../../common/AppTextInput'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

type AlertParams = {
  title: string
  message?: string
  buttons?: AlertButton[]
  options?: AlertOptions
  prompt?: {
    options?: PromptOptions
    onTextSubmit: (text: string) => void
  }
}

interface AlertHandlerContainer {
  readonly alerts: AlertParams[]
  readonly setAlerts: (
    previousAlertsCallback: (x: AlertParams[]) => AlertParams[],
  ) => void
}

const createAlertHandler = () => {
  // local state of alert handler
  // @ts-ignore
  let subscriber,
    alerts: AlertParams[] = []

  const setAlerts = (prev: (x: AlertParams[]) => AlertParams[]) => {
    alerts = prev(alerts)
    // @ts-ignore
    subscriber && subscriber(alerts)
  }

  const use = () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    let [localAlerts, setLocalAlerts] = useState<AlertParams[]>(alerts)

    // subscribe to external changes
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      subscriber = setLocalAlerts

      return () => (subscriber = undefined)
    }, [setLocalAlerts])

    return {
      alerts: localAlerts,
      setAlerts,
    } as AlertHandlerContainer
  }

  return {
    api: {
      alert: (
        title: string,
        message?: string,
        buttons?: AlertButton[],
        options?: AlertOptions,
        prompt?: {
          options?: PromptOptions
          onTextSubmit: (text: string) => void
        },
      ) => {
        setAlerts((prev) => [
          ...prev,
          {title, message, prompt, buttons, options},
        ])
      },
    },
    use,
  }
}

const AlertHandler = createAlertHandler()

export const AlertRoot: React.FC = () => {
  const {alerts, setAlerts} = AlertHandler.use()
  const {colors} = useTheme()
  const {t} = useTranslation()
  const [inputState, setInputState] = useState<Map<number, string>>(
    new Map<number, string>(),
  )
  const getInputText = (index: number): string => {
    return (
      inputState.get(index) ?? alerts[index].prompt!.options?.defaultValue ?? ''
    )
  }
  const setInputText = (index: number, text: string) => {
    setInputState(new Map([...Array.from(inputState), [index, text]]))
  }

  const onClose = (indexToRemove: number) => {
    const state = new Map(inputState)
    state.delete(indexToRemove)
    setInputState(state)
    setAlerts((prev: AlertParams[]) =>
      prev.filter((_, i) => i !== indexToRemove),
    )
  }

  const backdrop = <View style={[StyleSheet.absoluteFill, styles.backdrop]} />

  const renderButton = (
    {text, onPress, style}: AlertButton,
    alertIndex: number,
  ): React.ReactNode => {
    const onButtonPress = () => {
      onPress?.()
      onClose(alertIndex)
    }

    return (
      <AppTouchableOpacity onPress={onButtonPress}>
        <AppText
          style={[
            styles.alertButtonTitle,
            {
              color: style === 'destructive' ? colors.warning : undefined,
            },
          ]}>
          {text}
        </AppText>
      </AppTouchableOpacity>
    )
  }

  return (
    <>
      {alerts.map(({title, message, buttons, prompt, options}, alertIndex) => {
        const cancelable = options?.cancelable
        const getDefaultPromptButtons = (): AlertButton[] => {
          return [
            {text: t('cancelButton'), onPress: () => onClose(alertIndex)},
            {
              text: t('doneButton'),
              onPress: () => {
                prompt?.onTextSubmit(getInputText(alertIndex))
                onClose(alertIndex)
              },
            },
          ]
        }
        const buttonsActual =
          buttons ?? (prompt ? getDefaultPromptButtons() : undefined)

        return (
          <Modal
            key={alertIndex}
            visible={true}
            animationType='none'
            transparent
            onRequestClose={
              cancelable ? () => onClose(alertIndex) : () => null
            }>
            <View style={[StyleSheet.absoluteFill, styles.modalInner]}>
              {cancelable ? (
                <TouchableWithoutFeedback onPress={() => onClose(alertIndex)}>
                  {backdrop}
                </TouchableWithoutFeedback>
              ) : (
                backdrop
              )}

              <View style={styles.alert}>
                <AppText style={styles.alertTitle}>{title}</AppText>

                {message && (
                  <AppText style={styles.alertMessage}>{message}</AppText>
                )}

                {prompt && (
                  <AppTextInput
                    style={styles.alertTextInput}
                    value={getInputText(alertIndex)}
                    onChangeText={(text) => setInputText(alertIndex, text)}
                  />
                )}

                {buttonsActual && (
                  <View style={styles.alertButtons}>
                    {buttonsActual.map((buttonOptions, buttonIndex) => {
                      const hasThree = buttonsActual.length === 3
                      const isFirst = buttonIndex === 0

                      return (
                        <Fragment key={buttonIndex}>
                          {isFirst && !hasThree && <View style={styles.fill} />}

                          {!isFirst && <View style={styles.spacer} />}

                          {renderButton(buttonOptions, alertIndex)}

                          {isFirst && hasThree && (
                            <View style={commonStyles.flexOne} />
                          )}
                        </Fragment>
                      )
                    })}
                  </View>
                )}
              </View>
            </View>
          </Modal>
        )
      })}
    </>
  )
}

export default AlertHandler.api

const styles = StyleSheet.create({
  modalInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alert: {
    backgroundColor: PRIMARY_BACKGROUND,
    width: '100%',
    maxWidth: 400,
    padding: 16,
    borderRadius: 12,
  },
  alertTitle: {
    fontSize: 22,
  },
  alertMessage: {
    marginTop: 6,
  },
  alertButtons: {
    flexDirection: 'row',
    marginTop: 24,
  },
  alertButtonTitle: {
    fontSize: 16,
  },
  alertTextInput: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 16,
    marginBottom: 16,
  },
  fill: {
    flex: 1,
  },
  spacer: {
    width: 24,
  },
})
