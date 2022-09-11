import {Paginated, RestResponse} from '../api/httpClient'
import {Unknown} from '../models'

type Result<T> = {
  data?: Array<T>
  error?: string
}

export const fetchAll = async <T>(
  request: (lastValue: string | Unknown) => Promise<RestResponse<Paginated<T>>>,
): Promise<Result<T>> => {
  const data: Array<T> = []
  let lastValue: string | Unknown
  let response: RestResponse<Paginated<T>> | undefined
  do {
    response = await request(lastValue)
    if (response.error) return {error: response.error}
    if (!response.data) break
    lastValue = response.data.lastValue

    data.push(...response.data!.items)
  } while (!response.error && typeof lastValue === 'string')

  return {data}
}
