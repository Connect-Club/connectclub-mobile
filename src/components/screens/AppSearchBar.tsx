import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import {useTranslation} from 'react-i18next'
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import AppIcon from '../../assets/AppIcon'
import AppText from '../../components/common/AppText'
import {SetTimeoutReturnType} from '../../models'
import {useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import AppTextInput from '../common/AppTextInput'
import AppTouchableOpacity from '../common/AppTouchableOpacity'

export interface AppSearchBarProps {
  /** @default false */
  readonly topInset?: boolean
  readonly style?: StyleProp<ViewStyle>
  readonly placeholderText: string
  readonly placeholderTextActivated?: string
  readonly onSearchDone?: () => void
  readonly onChangeText: (text: string) => void
  readonly onFocus?: () => void
  readonly onBlur?: () => void
  readonly isLoading?: boolean
  readonly clickableOverlay?: boolean
  readonly onClick?: () => void
}

export interface AppSearchBarRef {
  clear: () => void
  blur: () => void
  focus: () => void
}

const AppSearchBar = forwardRef<AppSearchBarRef, AppSearchBarProps>(
  (props, ref) => {
    const {t} = useTranslation()
    const {colors} = useTheme()
    const [showPlaceholder, setShowPlaceholder] = useState(true)
    const timeoutRef = useRef<SetTimeoutReturnType>(null)
    const [query, setQuery] = useState<string | null>(null)
    const inset = useSafeAreaInsets()
    const inputRef = useRef<TextInput>(null)
    const queryLength = query?.length ?? 0
    const placeholderTextActivated =
      props.placeholderTextActivated ?? t('selectInterestsFindPeople')

    useImperativeHandle(ref, () => ({
      clear: () => onClearField(),
      blur: () => inputRef?.current?.blur(),
      focus: () => inputRef?.current?.focus(),
    }))

    const onClearField = useCallback(() => {
      setQuery('')
      props.onChangeText('')
    }, [])

    const onChangeValue = (newValue: string) => {
      setQuery(newValue)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => props.onChangeText(newValue), 500)
    }

    useEffect(() => {
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
      }
    }, [])

    return (
      <View
        style={[
          styles.inputContainer,
          props.style,
          {marginTop: props.topInset ? ms(16) + inset.top : ms(16)},
        ]}>
        <AppTextInput
          ref={inputRef}
          style={[
            styles.textInput,
            {backgroundColor: colors.inactiveAccentColor},
          ]}
          accessibilityLabel={'searchInput'}
          autoCorrect={false}
          onFocus={() => {
            setShowPlaceholder(false)
            props.onFocus?.()
          }}
          onBlur={() => {
            setShowPlaceholder(true)
            props.onBlur?.()
          }}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          onSubmitEditing={props.onSearchDone}
          value={query ?? ''}
          onChangeText={onChangeValue}
        />
        {!showPlaceholder && !query && (
          <View style={styles.secondSearchPlaceholder} pointerEvents={'none'}>
            <AppText
              style={[styles.placeholderText, {color: colors.supportBodyText}]}>
              {placeholderTextActivated}
            </AppText>
          </View>
        )}
        {showPlaceholder && !query && (
          <View style={styles.searchPlaceholder} pointerEvents={'none'}>
            <AppIcon
              style={styles.placeholderIcon}
              type={'icSearch'}
              tint={colors.supportBodyText}
            />
            <AppText
              style={[styles.placeholderText, {color: colors.supportBodyText}]}>
              {props.placeholderText}
            </AppText>
          </View>
        )}
        {props.isLoading && (
          <ActivityIndicator
            style={styles.loader}
            animating={true}
            size={'small'}
            color={colors.accentPrimary}
          />
        )}
        {!props.clickableOverlay && !props.isLoading && queryLength > 0 && (
          <AppTouchableOpacity
            accessibilityLabel={'clear'}
            style={styles.clearBtn}
            onPress={onClearField}>
            <AppIcon type={'icClear'} />
          </AppTouchableOpacity>
        )}
        {props.clickableOverlay && (
          <AppTouchableOpacity
            style={styles.clickableOverlay}
            onPress={props.onClick}
          />
        )}
      </View>
    )
  },
)

export default AppSearchBar

const styles = StyleSheet.create({
  inputContainer: {
    marginHorizontal: ms(16),
    marginVertical: ms(16),
  },
  textInput: {
    fontSize: ms(17),
    lineHeight: ms(22),
    minHeight: ms(36),
    maxHeight: ms(36),
    textAlign: 'justify',
    borderRadius: ms(10),
    paddingVertical: 0,
    paddingEnd: ms(36),
  },
  placeholderIcon: {marginEnd: ms(8)},
  searchPlaceholder: {
    position: 'absolute',
    flexDirection: 'row',
    alignSelf: 'center',
    height: '100%',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: ms(17),
    lineHeight: ms(36),
  },
  secondSearchPlaceholder: {
    position: 'absolute',
    left: ms(8),
  },
  loader: {
    position: 'absolute',
    right: ms(2),
    paddingHorizontal: ms(8),
    height: '100%',
    justifyContent: 'center',
  },
  clearBtn: {
    position: 'absolute',
    right: ms(2),
    paddingHorizontal: ms(8),
    height: '100%',
    justifyContent: 'center',
  },
  clickableOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
})
