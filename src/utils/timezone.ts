export const secondsFromGMT = () => new Date().getTimezoneOffset() * 60
export const timestamp = () => secondsFromGMT()
