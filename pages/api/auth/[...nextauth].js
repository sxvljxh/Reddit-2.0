import NextAuth from "next-auth"
import RedditProvider from "next-auth/providers/reddit"
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
    // Configure one or more authentication providers
    providers: [
        RedditProvider({
            clientId: process.env.REDDIT_CLIENT_ID,
            clientSecret: process.env.REDDIT_CLIENT_SECRET
        }),
        // ...add more providers here
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        })
    ],
    secret: `${process.env.NEXT_AUTH_SECRET}` //entah kenapa apke ini biar ga error di reddit
})