import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from './prisma';

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || 'dummy',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy',
      callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:4000/api/auth/github/callback',
      scope: ['user:email'],
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        let user = await prisma.user.findFirst({
          where: { providerId: profile.id, provider: 'GITHUB' },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              name: profile.displayName || profile.username,
              provider: 'GITHUB',
              providerId: profile.id,
              avatarUrl: profile.photos?.[0]?.value,
              email: profile.emails?.[0]?.value || null,
              emailVerified: true // OAuth implies verified
            },
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'dummy',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback',
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        let user = await prisma.user.findFirst({
          where: { providerId: profile.id, provider: 'GOOGLE' },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              name: profile.displayName,
              provider: 'GOOGLE',
              providerId: profile.id,
              avatarUrl: profile.photos?.[0]?.value,
              email: profile.emails?.[0]?.value || null,
              emailVerified: true
            },
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
