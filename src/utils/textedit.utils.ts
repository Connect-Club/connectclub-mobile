import {TFunction} from 'i18next'

import {
  fetchLinkFromMarkdown,
  validURL,
} from '../components/screens/profileScreen/MarkdownHyperlink'
import {prompt} from '../components/webSafeImports/webSafeImports'
import {toastHelper} from './ToastHelper'

export const processTextLink = (
  t: TFunction,
  text1: string,
  link: string,
  location: number,
  callback: (result: string) => void,
) => {
  const results = fetchLinkFromMarkdown(link)
  if (results.length > 1) {
    toastHelper.error('alertAddLinkMultipleLinksSelectedError')
    return callback(text1)
  }
  prompt(
    t('alertAddLinkTitle'),
    t('alertAddLinkDescription', {
      name: results.length > 0 ? results[0].title : link,
    }),
    (newLink: string) => {
      if (!validURL(newLink))
        return toastHelper.error('alertAddLinkUrlNotValid')
      if (results.length > 0) {
        return callback(
          text1.replace(
            `[${results[0].title}](${results[0].link})`,
            `[${results[0].title}](${newLink})`,
          ),
        )
      }
      callback(
        text1.substring(0, location) +
          text1.substring(location).replace(link, `[${link}](${newLink})`),
      )
    },
    {
      type: 'plain-text',
      defaultValue: results[0]?.link,
      placeholder: t('alertAddLinkPlaceholder'),
    },
  )
}
