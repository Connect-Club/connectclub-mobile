import moment from 'moment'

import {Translation} from '../models'

export const initializeMomentLocale = () => {
  moment.updateLocale('en', {
    relativeTime: {
      future: 'in %s',
      past: '%s ago',
      s: 'now', // a few seconds
      ss: '%ds', // %d seconds
      m: '%dm', // a minute
      mm: '%dm', // %d minutes
      h: '%dh', // an hour
      hh: '%dh', // %d hours
      d: '%dd', // a day
      dd: '%dd', // %d days
      w: '%dwk', // a week
      ww: '%dwk', // %d weeks
      M: '%dmo', // a month
      MM: '%dmo', // %d months
      y: '%d year', // a year
      yy: '%d years', // %d years
    },
  })
}

export const joinedSince = (date: number) => {
  return moment.unix(date).format('DD.MM.yyyy')
}

export const isTheSameDay = (first: number, second: number) => {
  return moment(first).isSame(moment(second), 'day')
}

export const isTheSameAfterDay = (first: number, second: number) => {
  return moment(first).isSame(moment(second).add(1, 'day'), 'day')
}

export const getCreateEventDate = (t: Translation, time: number) => {
  const today = new Date().getTime()
  if (isTheSameDay(time, today)) return t('today')
  if (isTheSameAfterDay(time, today)) return t('tomorrow')
  return moment(time).format('DD.MM.YY')
}

export const getEventDate = (time: number) => {
  const momentDate = moment.unix(time)
  return momentDate.format('h:mm A・ddd・MMM DD')
}

export const timeAgo = (unix: number, withoutSuffix?: boolean) => {
  return moment.unix(unix).fromNow(withoutSuffix)
}

export const delay = async (mills: number) => {
  return new Promise<any>((resolve) => {
    setTimeout(resolve, mills)
  })
}
