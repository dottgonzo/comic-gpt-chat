import router from "mongo-passport-auth-lib/serversingle";
import serverless from "serverless-http";
const app = router({
  mongoUri: process.env.MONGO_URI,
  authPath: "/.netlify/functions/auth",
  jwtSecret: process.env.JWT_SECRET,
  jwt: {
    audience: process.env.AUDIENCE || "test",
    issuer: process.env.ISSUER || "test",
    expiresIn: 60 * 60 * 24,
  },
  socialLogin: true,
  socialRegistration: true,
  github: {
    clientID: process.env.GITHUB_CLIENT_ID || "test",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "test",
  },
  local: { register: true },
});
const handler = serverless(app);

export { handler };
