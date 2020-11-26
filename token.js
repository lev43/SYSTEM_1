var jose = require('node-jose');
var fs = require('fs');

var key = fs.readFileSync(require.resolve('private.pem'));

var serviceAccountId = 'ajeuj152kpbc9jrdrc5p';
var keyId = 'aje9r1os9h241l9i8r0o';
var now = Math.floor(new Date().getTime() / 1000);

var payload = { aud: "https://iam.api.cloud.yandex.net/iam/v1/tokens",
                iss: serviceAccountId,
                iat: now,
                exp: now + 3600 };

jose.JWK.asKey(key, 'pem', { kid: keyId, alg: 'PS256' })
    .then(function(result) {
        jose.JWS.createSign({ format: 'compact' }, result)
            .update(JSON.stringify(payload))
            .final()
            .then(function(result) {
                // result — это сформированный JWT.
            });
    });