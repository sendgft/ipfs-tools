export * from './client'

export const constructGatewayUrl = (gatewayBaseUrl: string, cid: string): string => {
  if (gatewayBaseUrl.charAt(gatewayBaseUrl.length - 1) !== '/') {
    gatewayBaseUrl += '/'
  }
  return `${gatewayBaseUrl}${cid}`
}
