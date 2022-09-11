import {createTheming} from '@callstack/react-theme-provider'
import {Dimensions, Platform, StyleSheet} from 'react-native'
import {setGuideLines} from 'react-native-size-matters'

import {isWebOrTablet} from '../utils/device.utils'
import {ms} from '../utils/layout.utils'
import {
  popupHeight,
  tabletButtonWidthLimit,
  tabletContainerWidthLimit,
} from '../utils/tablet.consts'

setGuideLines(375, 812, 1)

export const PRIMARY_BACKGROUND = '#F0F0F0'
export const SUPPORT_BACKGROUND = '#0D0C32'
export const PRIMARY_BACKGROUND_TRANSPARENT = 'rgba(240,240,240,0)'
export const COLLAPSED_ROOM_HEADER_HEIGHT = ms(89)

export type AppTheme = {
  colors: {
    accentPrimary: string
    accentPrimaryDisabled: string
    accentSecondary: string
    accentTernary: string
    activeAccent: string
    accentIcon: string
    activeAccentColor: string
    avatarBorder: string
    actionButton: string
    bodyText: string
    captionBodyText: string
    chatBgMyMessage: string
    chatBgOtherMessage: string
    clickedPointBackground: string
    complaintIconTint: string
    floatingBackground: string
    inactiveAccentColor: string
    inRadar: string
    navigationBackground: string
    onboardingVideoOverlay: string
    outRadar: string
    primaryClickable: string
    primaryDisabled: string
    publisherBorder: string
    roomBackground: string
    secondaryBodyText: string
    secondaryClickable: string
    secondaryHeader: string
    thirdIcons: string
    secondaryIcon: string
    separator: string
    skeleton: string
    skeletonDark: string
    skeletonDisabled: string
    shadow: string
    splashIconBottom: string
    splashIconTop: string
    supportBackground: string
    systemBackground: string
    textPrimary: string
    textPrimaryDisabled: string
    titleSecondary: string
    warning: string
    success: string
    bottomGradient: string
    supportBodyText: string
    thirdBlack: string
    card: string
    sectionBorder: string
    sectionButton: string
    indicatorColorInverse: string
    modalBackground: string
  }
}

const DayAppTheme: AppTheme = {
  colors: {
    accentPrimary: 'rgba(77, 125, 208, 1)',
    accentPrimaryDisabled: 'rgba(77, 125, 208, 0.4)',
    accentSecondary: 'rgba(77, 125, 208, 0.08)',
    accentTernary: 'rgba(255, 255, 255, 0.1)',
    activeAccent: '#5DC56E',
    accentIcon: '#3B598D',
    activeAccentColor: '#6ED479',
    avatarBorder: 'white',
    actionButton: 'white',
    bodyText: 'rgba(0, 0, 0, 0.87)',
    captionBodyText: 'rgba(255, 255, 255, 0.3)',
    chatBgMyMessage: '#6B6A7C',
    chatBgOtherMessage: '#E3E8F0',
    clickedPointBackground: 'rgba(192, 192, 192, 1)',
    complaintIconTint: 'white',
    floatingBackground: 'white',
    inactiveAccentColor: 'rgba(0, 0, 0, 0.08)',
    inRadar: 'rgba(60, 215, 110, 1)',
    navigationBackground: 'rgba(255, 255, 255, 0.12)',
    onboardingVideoOverlay: 'rgba(83, 142, 244, 0.54)',
    outRadar: 'rgba(155, 155, 155, 1)',
    primaryClickable: '#4D7DD0',
    primaryDisabled: 'rgba(255, 255, 255, 0.38)',
    publisherBorder: '#007AFF',
    roomBackground: '#333333',
    secondaryBodyText: 'rgba(0, 0, 0, 0.54)',
    secondaryClickable: 'rgba(83, 142, 244, 0.08)',
    secondaryHeader: 'rgba(0, 0, 0, 0.87)',
    thirdIcons: 'rgba(0, 0, 0, 0.54)',
    secondaryIcon: '#212121',
    separator: 'rgba(0, 0, 0, 0.08)',
    skeleton: '#FFFFFF',
    skeletonDark: 'rgba(0,0,0, 0.08)',
    skeletonDisabled: 'rgba(0,0,0, 0.04)',
    shadow: 'rgba(255, 255, 255, 0.1)',
    splashIconBottom: '#3986F7',
    splashIconTop: '#46A2DD',
    supportBackground: '#0D0C32',
    systemBackground: PRIMARY_BACKGROUND,
    bottomGradient: PRIMARY_BACKGROUND_TRANSPARENT,
    textPrimary: '#FFFFFF',
    textPrimaryDisabled: 'rgba(255, 255, 255, 0.4)',
    titleSecondary: 'rgba(255, 255, 255, 0.54)',
    warning: '#F54949',
    success: 'rgba(60, 215, 110, 1)',
    supportBodyText: 'rgba(0, 0, 0, 0.38)',
    thirdBlack: 'rgba(0, 0, 0, 0.32)',
    card: 'white',
    sectionBorder: '#0000001F',
    sectionButton: '#0000000A',
    indicatorColorInverse: 'white',
    modalBackground: 'rgba(0, 0, 0, 0.3)',
  },
}

const {ThemeProvider, useTheme} = createTheming<AppTheme>(DayAppTheme)
const screenWidth = Dimensions.get('window').width
const sheetWidth =
  0.8 * screenWidth > tabletContainerWidthLimit
    ? tabletContainerWidthLimit
    : 0.8 * screenWidth

export const makeTextStyle = (
  fontSize: number,
  lineHeight: number,
  fontWeight?: 'normal' | 'bold' | '600',
) => ({
  fontSize,
  lineHeight,
  fontWeight,
})

export {ThemeProvider, useTheme}

export const commonStyles = StyleSheet.create({
  flexCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  alignCenter: {
    alignItems: 'center',
  },
  flexOne: {
    flex: 1,
  },
  flexWrap: {flexWrap: 'wrap'},
  fullWidth: {
    width: '100%',
  },
  fullHeight: {
    height: '100%',
  },
  paddingHorizontal: {paddingHorizontal: ms(32)},
  registrationBigTitle: {
    width: '100%',
    fontSize: ms(34),
    lineHeight: ms(40),
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: ms(16),
    ...Platform.select({
      web: {
        fontSize: ms(16),
      },
    }),
  },
  registrationSmallTitle: {
    width: '100%',
    fontSize: ms(24),
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: ms(32),
    ...Platform.select({
      web: {
        fontSize: ms(12),
        marginBottom: ms(12),
      },
    }),
  },
  registrationText: {
    width: '100%',
    fontSize: ms(16),
    lineHeight: ms(24),
    textAlign: 'center',
    fontWeight: '400',
    marginBottom: ms(16),
    ...Platform.select({
      web: {
        fontSize: ms(9),
      },
    }),
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  link: {
    color: '#4D7DD0',
  },
  registrationLink: {
    color: '#3F5886',
  },
  navigationButton: {
    width: ms(30),
    height: ms(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  wizardButton: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: ms(isWebOrTablet() ? tabletButtonWidthLimit : 215),
  },
  wizardContainer: {
    flexGrow: 1,
    width: '100%',
    maxWidth: tabletContainerWidthLimit,
    alignSelf: 'center',
  },
  webScrollingContainer: {
    ...Platform.select({
      web: {
        maxHeight: popupHeight,
      },
    }),
  },
  wizardPrimaryButton: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: ms(isWebOrTablet() ? tabletButtonWidthLimit : 215),
    marginTop: ms(32),
  },
  wizardContentWrapper: {
    alignItems: 'center',
    width: '100%',
    maxWidth: ms(tabletContainerWidthLimit),
    flexGrow: 1,
    justifyContent: isWebOrTablet() ? 'center' : 'flex-start',
  },
  commonBottomSheet: {
    width: isWebOrTablet() ? sheetWidth : screenWidth,
    marginStart: isWebOrTablet() ? (screenWidth - sheetWidth) / 2 : 0,
  },
  primaryButton: {
    height: ms(48),
    borderRadius: ms(48) / 2,
    paddingHorizontal: ms(16),
    justifyContent: 'center',
    minWidth: ms(180),
  },
  primaryButtonSmall: {
    height: ms(28),
    alignSelf: 'baseline',
    minWidth: 0,
    borderRadius: ms(14),
    paddingHorizontal: ms(12),
  },
})
