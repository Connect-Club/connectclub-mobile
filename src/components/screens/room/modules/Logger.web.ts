// logJS - mocked to avoid including AppModule which has a lot of native deps
export function logJS(message: string, ...data: any[]) {
  if (!__DEV__) return
  console.log(`${message} ${data.join(', ')}`)
}
