import React, {
  createRef,
  forwardRef,
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  findNodeHandle,
  ScrollView,
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'

import {useTheme} from '../../../theme/appTheme'
import {isNative} from '../../../utils/device.utils'
import {ms} from '../../../utils/layout.utils'
import {logJS} from '../../screens/room/modules/Logger'
import AppTouchableOpacity from '../AppTouchableOpacity'
import Indicator, {IndicatorRef} from './Indicator'
import {Measurement} from './models'

export interface TabRef {
  readonly onPageSelected: (page: number) => void
  readonly onPagerScroll: (page: number, offset: number) => void
  readonly onPagerScrollStateChanged: (isIdle: boolean) => void
}

interface Props {
  readonly style?: StyleProp<ViewStyle>
  readonly titlesStyle?: StyleProp<TextStyle>
  readonly tabsStyle?: StyleProp<ViewStyle>
  readonly showSeparators?: boolean
  readonly initialPage: number
  readonly titles: Array<(titleStyle: StyleProp<TextStyle>) => ReactNode>
  readonly onChange: (index: number) => void
  readonly highlightedTabStyle?: StyleProp<ViewStyle>
  readonly highlightedTitleStyle?: StyleProp<TextStyle>
}

const Tabs = forwardRef<TabRef, Props>(
  (
    {
      style,
      titlesStyle,
      tabsStyle,
      showSeparators = true,
      initialPage,
      titles,
      onChange,
      highlightedTabStyle,
      highlightedTitleStyle,
    },
    ref,
  ) => {
    const {colors} = useTheme()
    // states
    const [measurements, setMeasurements] = useState<Array<Measurement>>([])
    const [containerWidth, setContainerWidth] = useState(0)
    // refs
    const isInitializedRef = useRef(false)
    const indicatorScrollViewRef = useRef<ScrollView>(null)
    const indicatorRef = useRef<IndicatorRef>(null)
    const containerRef = useRef<View>(null)
    const scrollRef = useRef<{page: number; offset: number}>({
      page: 0,
      offset: 0,
    })
    const [highlightedPage, setHighlightedPage] = useState(initialPage)

    const leftSeparator = {
      width: ms(1),
      backgroundColor: colors.separator,
    }
    const tabs = useMemo(() => {
      return titles.map((title) => ({
        title,
        ref: createRef<TouchableOpacity>(),
      }))
    }, titles)
    useEffect(() => {
      const containerNode = findNodeHandle(containerRef.current)
      if (containerNode) {
        const masures: Array<Measurement> = []
        tabs.forEach((tab) => {
          tab.ref.current?.measureLayout(
            containerNode,
            (x, y, width, height) => {
              masures.push({x, y, width, height})
              if (masures.length === tabs.length) setMeasurements(masures)
            },
            () => logJS('warning', 'Tabs measurement error'),
          )
        })
      }
    }, [tabs])
    const updateIndicatorScroll = useCallback(
      (page: number, offset: number) => {
        if (measurements.length !== tabs.length || containerWidth === 0) return
        const current = measurements[page]
        const first = measurements[0]
        if (!first) return
        const m = first.x
        const next = measurements[page + 1]
        const currentHalfWidth = current.width / 2
        const nextHalfWidth = next ? next.width / 2 : 0
        const markerPos =
          current.x +
          currentHalfWidth +
          (currentHalfWidth + 2 * m + nextHalfWidth) * offset
        performScroll(Math.max(0, markerPos - containerWidth / 2))
      },
      [measurements, containerWidth, tabs.length],
    )
    const performScroll = (scroll: number) => {
      indicatorScrollViewRef.current?.scrollTo({x: scroll, animated: true})
    }
    const onPagerScroll = useCallback((page: number, offset: number) => {
      scrollRef.current = {page: page, offset: offset}
      indicatorRef.current?.onPagerScroll?.(page, offset)
      isInitializedRef.current = true
    }, [])
    const onPageSelected = useCallback(
      (page: number) => setHighlightedPage(page),
      [],
    )
    const onPagerScrollStateChanged = useCallback(
      (isIdle) => {
        if (!isIdle) return
        const scroll = scrollRef.current
        updateIndicatorScroll(scroll.page, scroll.offset)
      },
      [updateIndicatorScroll],
    )
    useEffect(() => {
      if (measurements.length !== tabs.length || isInitializedRef.current)
        return
      onPagerScroll(initialPage, 0)
      isInitializedRef.current = true
    }, [measurements, initialPage, onPagerScroll, tabs.length])
    useImperativeHandle(
      ref,
      () => ({onPagerScroll, onPagerScrollStateChanged, onPageSelected}),
      [onPagerScroll, onPagerScrollStateChanged, onPageSelected],
    )
    const onContainerLayout = useCallback(
      (e) => setContainerWidth(e.nativeEvent.layout.width),
      [],
    )

    return (
      <ScrollView
        style={[styles.scrollView, style]}
        ref={indicatorScrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onLayout={onContainerLayout}>
        <View>
          <View ref={containerRef} style={styles.tabsContainer}>
            {tabs.map((tab, i) => {
              const key = `tab-${tab.title}-${i}`
              const isHighlighted = highlightedPage === i
              const tabStyle = [
                styles.tab,
                isHighlighted ? highlightedTabStyle ?? tabsStyle : tabsStyle,
              ]
              const tabTextStyle = [
                styles.tabText,
                isHighlighted
                  ? highlightedTitleStyle ?? titlesStyle
                  : titlesStyle,
              ]
              if (showSeparators && i !== 0) {
                return (
                  <View key={key} style={styles.separatorContainer}>
                    <View style={leftSeparator} />
                    <AppTouchableOpacity
                      ref={tab.ref}
                      style={tabStyle}
                      onPress={() => onChange(i)}>
                      {tab.title(tabTextStyle)}
                    </AppTouchableOpacity>
                  </View>
                )
              } else {
                return (
                  <AppTouchableOpacity
                    ref={tab.ref}
                    key={key}
                    style={tabStyle}
                    onPress={() => onChange(i)}>
                    {tab.title(tabTextStyle)}
                  </AppTouchableOpacity>
                )
              }
            })}
          </View>
          {isNative && measurements.length === tabs.length && (
            <Indicator ref={indicatorRef} measurements={measurements} />
          )}
        </View>
      </ScrollView>
    )
  },
)

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: ms(12),
  },
  tabText: {
    textAlign: 'center',
  },
  separatorContainer: {
    flexDirection: 'row',
  },
})

export default memo(Tabs)
