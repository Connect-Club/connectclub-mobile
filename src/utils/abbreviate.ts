import {Translation} from '../models'

const units = ['k', 'm', 'b', 't']

const _abbreviate = (count: number, decPlaces: number = 2, t: Translation) => {
  let number: any = count
  const decPlacesMath = Math.pow(10, decPlaces)
  for (let i = 0; i < units.length; i++) {
    const size = Math.pow(10, (i + 1) * 3)

    if (size <= number) {
      number = Math.round((number * decPlacesMath) / size) / decPlacesMath
      if (number === 1000 && i < units.length - 1) {
        number = 1
        i++
      }
      number += t(units[i])
      break
    }
  }
  return number
}

export const abbreviate = (
  count: number,
  t: Translation,
  decPlaces: number = 2,
) => {
  const isNegative = count < 0
  const abbreviatedNumber = _abbreviate(count, decPlaces, t)
    .toString()
    .replace('.', ',')

  return isNegative ? `-${abbreviatedNumber}` : abbreviatedNumber
}
