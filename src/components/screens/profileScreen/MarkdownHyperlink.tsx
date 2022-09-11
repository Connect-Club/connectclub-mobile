/**
 * @providesModule Hyperlink
 **/

import React, {PureComponent} from 'react'
import {Platform, StyleProp, TextStyle, View} from 'react-native'
import matchAllPolyfill from 'string.prototype.matchall'

import {useOpenUrl} from '../../../utils/deeplink/deeplink.utils'
import AppText from '../../common/AppText'

const {OS} = Platform

// Alt. 1: If you have Markdown links:
let re = /\[(.*?)\]\((.+?)\)/g
const matchAll = (haystack: string) => {
  //@ts-ignore
  return [...matchAllPolyfill(haystack, re)]
}

interface FetchMarkdownLinkResult {
  readonly title: string
  readonly link: string
}

export const validURL = (str: string): boolean => {
  const pattern = new RegExp(
    '^(https?:\\/\\/)' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i',
  ) // fragment locator
  return pattern.test(str)
}

export const fetchLinkFromMarkdown = (
  possibleMarkdown: string,
): Array<FetchMarkdownLinkResult> => {
  return matchAll(possibleMarkdown).map((link) => {
    const url = link[2]
    let text = link[1]
    return {link: url, title: text}
  })
}

interface PressProps {
  onPress?: (url: string, text: string) => void
  onLongPress?: (url: string, text: string) => void
}

interface Props extends PressProps {
  readonly linkStyle?: StyleProp<TextStyle>
  readonly numberOfLines?: number
  readonly style?: StyleProp<TextStyle>
  readonly accessibilityLabel?: string
}

class Hyperlink extends PureComponent<Props> {
  constructor(props: Props) {
    super(props)
  }

  render() {
    const {...viewProps} = this.props
    delete viewProps.onPress
    delete viewProps.onLongPress
    delete viewProps.linkStyle

    return (
      <View
        {...viewProps}
        style={this.props.style}
        accessibilityLabel={this.props.accessibilityLabel}>
        {!this.props.onPress && !this.props.onLongPress && !this.props.linkStyle
          ? this.props.children
          : this.parse(this)?.props.children}
      </View>
    )
  }

  isTextNested(component: any) {
    if (!React.isValidElement(component)) throw new Error('Invalid component')
    //@ts-ignore
    let {type: {displayName} = {}} = component
    if (displayName !== 'Text') throw new Error('Not a Text component')
    //@ts-ignore
    return typeof component.props.children !== 'string'
  }

  linkify = (component: any) => {
    let elements = []
    let _lastIndex = 0

    const componentProps = {
      ...component.props,
      ref: undefined,
      key: undefined,
    }

    try {
      const allText = component.props.children
      matchAll(allText).forEach((link, _) => {
        const restText = allText.substring(_lastIndex)
        const index = restText.indexOf(link[0]) + _lastIndex
        let nonLinkedText = allText.substring(_lastIndex, index)
        nonLinkedText && elements.push(nonLinkedText)
        _lastIndex = index + link[0].length
        const url = link[2]
        let text = link[1]

        const clickHandlerProps: PressProps = {}
        if (OS !== 'web') {
          clickHandlerProps.onLongPress = this.props.onLongPress
            ? () => this.props.onLongPress?.(url, text)
            : undefined
        }
        clickHandlerProps.onPress = this.props.onPress
          ? () => this.props.onPress?.(url, text)
          : undefined

        elements.push(
          <AppText
            {...componentProps}
            {...clickHandlerProps}
            key={url + index}
            style={[component.props.style, this.props.linkStyle]}>
            {text}
          </AppText>,
        )
      })
      elements.push(
        component.props.children.substring(
          _lastIndex,
          component.props.children.length,
        ),
      )
      return React.cloneElement(component, componentProps, elements)
    } catch (err) {
      return component
    }
  }

  parse = (component: any): any => {
    //@ts-ignore
    let {props: {children} = {}} = component || {}
    if (!children) return component

    const componentProps = {
      ...component.props,
      ref: undefined,
      key: undefined,
    }

    return React.cloneElement(
      component,
      componentProps,
      React.Children.map(children, (child) => {
        //@ts-ignore
        let {type: {displayName} = {}} = child || {}
        if (typeof child === 'string')
          return this.linkify(
            <AppText {...componentProps} style={component.props.style}>
              {child}
            </AppText>,
          )
        if (displayName === 'Text' && !this.isTextNested(child))
          return this.linkify(child)
        return this.parse(child)
      }),
    )
  }
}

const MarkdownHyperlink: React.FC<Props> = (props) => {
  const openUrl = useOpenUrl()

  const onPress = props.onPress || openUrl

  return <Hyperlink {...props} onPress={onPress} />
}

export default MarkdownHyperlink
