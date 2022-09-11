import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import React, {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {FlatList, StyleSheet, TextInput, View} from 'react-native'

import {analytics} from '../Analytics'
import AppText from '../components/common/AppText'
import Vertical from '../components/common/Vertical'
import WebModalHeader from '../components/common/WebModalHeader'
import PhoneFormatListItem from '../components/phoneFormats/PhoneFormatListItem'
import {AppModal} from '../components/webSafeImports/webSafeImports'
import {PhoneFormatsModel} from '../models'
import {commonStyles, useTheme} from '../theme/appTheme'
import {isNative} from '../utils/device.utils'
import {ms} from '../utils/layout.utils'
import {useBottomSafeArea} from '../utils/safeArea.utils'
import {tabletContainerWidthLimit} from '../utils/tablet.consts'

type ScreenProps = RouteProp<
  {
    Screen: {
      formats: PhoneFormatsModel
      selected: string
    }
  },
  'Screen'
>

const getItemLayout = (
  _data: Array<string> | null | undefined,
  index: number,
): {length: number; offset: number; index: number} => ({
  length: ms(56),
  offset: ms(56) * index,
  index,
})

const keyExtractor = (item: string) => item
const ChoosePhoneRegion: React.FC = () => {
  const {params} = useRoute<ScreenProps>()
  const navigation = useNavigation()
  const {t} = useTranslation()
  const {colors} = useTheme()
  const inset = useBottomSafeArea()
  const regions = Object.keys(params.formats.availableRegions)
  const [available] = useState(() => regions)
  const [search, setSearch] = useState('')
  const [filtered, setFiltered] = useState(() => regions)
  const onSearchPress = () => {
    analytics.sendEvent('phone_country_select_search_click')
  }

  const onSearchChange = (text: string) => {
    setFiltered(
      available.filter((t) => {
        const key = t.toLowerCase()
        const format = params.formats.availableRegions[t]
        const prefix = `+${format.regionPrefix.toLowerCase()}`
        // @ts-ignore
        const name = format.name?.toLowerCase() ?? ''
        const searchString = text.toLowerCase()
        return (
          key.startsWith(searchString) ||
          name.startsWith(searchString) ||
          prefix.startsWith(searchString)
        )
      }),
    )
    setSearch(text)
  }

  return (
    <AppModal header={<WebModalHeader title={t('yourLanguageTitle')} />}>
      <Vertical
        style={[
          styles.base,
          commonStyles.webScrollingContainer,
          {backgroundColor: colors.systemBackground},
        ]}>
        <View
          style={[
            styles.header,
            {backgroundColor: colors.inactiveAccentColor},
          ]}>
          <TextInput
            onTouchStart={onSearchPress}
            allowFontScaling={false}
            style={commonStyles.flexOne}
            onChangeText={onSearchChange}
            value={search}
            placeholder={t('searchInputPlaceholder')}
          />
        </View>

        {filtered.length === 0 && (
          <View style={styles.noResultsContainer}>
            <AppText
              style={[styles.noResults, {color: colors.secondaryBodyText}]}>
              {t('selectCountryCodeNoResults')}
            </AppText>
          </View>
        )}

        {filtered.length > 0 && (
          <FlatList<string>
            windowSize={40}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            getItemLayout={getItemLayout}
            data={filtered}
            style={[
              styles.flatList,
              {
                backgroundColor: colors.floatingBackground,
                marginBottom: inset + ms(16),
              },
            ]}
            keyboardShouldPersistTaps={'always'}
            keyboardDismissMode={'on-drag'}
            keyExtractor={keyExtractor}
            renderItem={({item, index}) => {
              return (
                <PhoneFormatListItem
                  code={item}
                  showBottomBorder={index < filtered.length - 1}
                  number={params.formats.availableRegions[item].regionPrefix}
                  isSelected={params.selected === item}
                  onSelect={() => {
                    navigation.navigate('EnterPhoneScreen', {selected: item})
                  }}
                />
              )
            }}
          />
        )}
      </Vertical>
    </AppModal>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    height: '100%',
    paddingHorizontal: isNative ? ms(16) : 0,
    maxWidth: tabletContainerWidthLimit,
    alignSelf: 'center',
    width: '100%',
  },

  flatList: {
    marginTop: ms(16),
    borderRadius: ms(12),
  },

  header: {
    height: ms(42),
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: ms(16),
    borderRadius: ms(10),
  },

  doneButton: {
    height: ms(42),
    paddingHorizontal: ms(8),
    alignItems: 'center',
    justifyContent: 'center',
  },

  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  noResults: {
    fontSize: ms(17),
    textAlign: 'center',
  },
})

export default ChoosePhoneRegion
