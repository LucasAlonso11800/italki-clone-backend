const getRefreshTokenSecret = (): string => {
    if (process.env.NODE_ENV === 'test') return 'somesecret'
    return process.env.REFRESH_TOKEN_SECRET as string
}
export const REFRESH_TOKEN_SECRET = getRefreshTokenSecret()