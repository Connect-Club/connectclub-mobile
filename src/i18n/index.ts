import i18n from 'i18next'
import backend from 'i18next-xhr-backend'
import {initReactI18next} from 'react-i18next'

export const i18nInitialization = i18n
  .use(backend)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: () => '{{lng}}',
      parse: (data: any) => data,
      ajax: (_url: string, _opts: any, callback: any) => {
        let promise = import('./locales/en.json')
        promise.then((l) => callback(l, {status: 200}))
      },
    },
    fallbackLng: 'en',
  })
export default i18n
