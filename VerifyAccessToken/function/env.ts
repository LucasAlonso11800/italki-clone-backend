const getAccessTokenSecret = (): string => {
    if (process.env.NODE_ENV === 'test') return 'somesecret'
    return process.env.ACCESS_TOKEN_SECRET as string
}
export const ACCESS_TOKEN_SECRET = getAccessTokenSecret();