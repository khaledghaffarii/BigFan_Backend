const { expressjwt: jwt } = require("express-jwt");

function authJwt() {
  const secret = process.env.secret;
  const api = process.env.API_URL;

  return jwt({
    isRevoked: isRevoked,
    secret,
    algorithms: ["HS256"],
  }).unless({
    path: [
      { url: /\/api\/v1\/users\/([^\/]*)$/, methods: ["GET", "OPTIONS"] },
      { url: /\/public\/uploads(.*)/, methods: ["GET", "OPTIONS"] },
      {
        url: /\/api\/v1\/posts(.*)/,
        methods: ["GET", "OPTIONS"][("POST", "OPTIONS")],
      },
      {
        url: /\/api\/v1\/comments(.*)/,
        methods: ["GET", "OPTIONS"][("POST", "OPTIONS")],
      },
      {
        url: /\/api\/v1\/likes(.*)/,
        methods: ["GET", "OPTIONS"][("POST", "OPTIONS")],
      },
      `${api}/users/:id`,
      `${api}/users/login`,
      `${api}/users/register`,
      `${api}/posts`,
      `${api}/comments`,
      `${api}/likes`,
    ],
  });
}

async function isRevoked(req, payload) {
  //console.table(payload);
  if (!payload.payload.isAdmin) {
    return true;
  }

  return false;
}

module.exports = authJwt;
