import {useNavigation} from '@react-navigation/native'
import {StackNavigationOptions} from '@react-navigation/stack'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {
  LayoutChangeEvent,
  Modal,
  ModalBaseProps,
  StyleProp,
  ViewStyle,
} from 'react-native'
import {
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native'

import {useTheme} from '../../theme/appTheme'
import {popupHeight, tabletContainerWidthLimit} from '../../utils/tablet.consts'

const DEFAULT_OPACITY = 0.3

type HeaderRender = (props?: StyleProp<ViewStyle>) => React.ReactElement | null

interface Props {
  navigationRoot?: string
  cancelable?: boolean
  opacity?: number
  containerStyle?: StyleProp<ViewStyle>
  contentStyle?: StyleProp<ViewStyle>
  isScrolling?: boolean
  header?: React.ReactElement | HeaderRender
}

const AppModalWeb: React.FC<Props & ModalBaseProps> = ({
  children,
  navigationRoot,
  cancelable,
  opacity,
  containerStyle,
  contentStyle,
  header,
  animationType = 'none',
  transparent = true,
  visible = true,
  isScrolling = true,
}) => {
  const navigation = useNavigation()
  const {colors} = useTheme()
  const [headerHeight, setHeaderHeight] = useState(-1)

  const onTouchOutsidePress = useCallback(() => {
    if (!cancelable) return
    if (navigationRoot) return navigation.navigate(navigationRoot)
    navigation.goBack()
  }, [cancelable, navigation, navigationRoot])

  useEffect(() => {
    const options: StackNavigationOptions = {
      cardStyle: {
        backgroundColor: 'transparent',
      },
      cardOverlayEnabled: true,
      headerShown: false,
      cardStyleInterpolator: ({current: {progress}}) => ({
        overlayStyle: {
          opacity: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, opacity ?? DEFAULT_OPACITY],
            extrapolate: 'clamp',
          }),
        },
      }),
    }

    navigation.setOptions(options)
  }, [navigation, opacity])

  const renderHeader: HeaderRender | undefined = useMemo(() => {
    if (!header) return
    if (typeof header === 'function') return header
    return () => header
  }, [header])

  const onHeaderLayout = useCallback((e: LayoutChangeEvent) => {
    setHeaderHeight(e.nativeEvent.layout.height)
  }, [])

  const modalContentMinHeight =
    popupHeight - (headerHeight > -1 ? headerHeight : 0)
  const contentHeightStyle = {
    minHeight: modalContentMinHeight,
    maxHeight: modalContentMinHeight,
  }
  const rootBackground = {
    backgroundColor: transparent ? undefined : 'rgba(0, 0, 0, 0.5)',
  }

  const renderContent = () => {
    return (
      <TouchableWithoutFeedback>
        <View
          onStartShouldSetResponder={() => true}
          style={[
            modalStyles.container,
            {backgroundColor: colors.systemBackground},
            containerStyle,
          ]}>
          {renderHeader && (
            <View onLayout={onHeaderLayout}>{renderHeader()}</View>
          )}
          {(headerHeight > -1 || !renderHeader) && (
            <View style={[styles.content, contentHeightStyle, contentStyle]}>
              {children}
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    )
  }
  const renderContainer = () => {
    if (isScrolling) {
      return (
        <ScrollView contentContainerStyle={[modalStyles.root, rootBackground]}>
          {renderContent()}
        </ScrollView>
      )
    }
    return (
      <View style={[modalStyles.root, rootBackground]}>{renderContent()}</View>
    )
  }

  return (
    <Modal
      visible={visible}
      transparent={transparent}
      animationType={animationType}>
      <TouchableWithoutFeedback onPress={onTouchOutsidePress}>
        {renderContainer()}
      </TouchableWithoutFeedback>
    </Modal>
  )
}

AppModalWeb.defaultProps = {
  cancelable: true,
  opacity: DEFAULT_OPACITY,
}

export default AppModalWeb

export const modalStyles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
  },
  container: {
    top: '5%',
    position: 'absolute',
    flexDirection: 'column',
    borderRadius: 12,
    justifyContent: 'center',
    width: tabletContainerWidthLimit,
  },
})

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
})
