/*
 * Title: Token Handler
 * Description :  Handling Token for authentication
 * Author : Mehdi Hasan Shohan
 * Date : 06 july, 2021
 */

//dependencies
const data = require('../../lib/data');
const {
    hash,
    parseJSON,
    createRandomStrings,
} = require('../../helpers/utilities');

// Module scaffolding
const handler = {};

handler.tokenHandler = (requestPorperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestPorperties.method) > -1) {
        handler._token[requestPorperties.method](requestPorperties, callback);
    } else {
        callback(405);
    }
};

handler._token = {};

//create token
handler._token.post = (requestPorperties, callback) => {
    const phone =
        typeof requestPorperties.body.phone === 'string' &&
        requestPorperties.body.phone.trim().length === 11
            ? requestPorperties.body.phone
            : false;

    const password =
        typeof requestPorperties.body.password === 'string' &&
        requestPorperties.body.password.trim().length > 0
            ? requestPorperties.body.password
            : false;

    if (phone && password) {
        data.read('users', phone, (err1, userData) => {
            const hashedPassword = hash(password);

            if (hashedPassword == parseJSON(userData).password) {
                let tokenId = createRandomStrings(20);
                let expires = Date.now() + 60 * 60 * 1000;
                let tokenObject = { phone, tokenId, expires };

                //store token to database
                data.create('tokens', tokenId, tokenObject, (err2) => {
                    if (err2) {
                        callback(200, tokenObject);
                    } else {
                        callback(400, {
                            error: 'Cannot create token!',
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'Password does not match',
                });
            }
        });
    } else {
        callback(400, {
            error: 'Problem in create token!',
        });
    }
};

//get token
handler._token.get = (requestPorperties, callback) => {
    //check the phone number is valid
    const tokenId =
        typeof requestPorperties.queryStringObject.tokenId === 'string' &&
        requestPorperties.queryStringObject.tokenId.trim().length === 20
            ? requestPorperties.queryStringObject.tokenId
            : false;

    if (tokenId) {
        data.read('tokens', tokenId, (err, tokenData) => {
            const token = { ...parseJSON(tokenData) };
            if (!err && token) {
                callback(200, token);
            } else {
                callback(404, { Error: 'Token not found!' });
            }
        });
    } else {
        callback(404, { Error: 'Requested Token not found!' });
    }
};

//Update token
handler._token.put = (requestPorperties, callback) => {
    const tokenId =
        typeof requestPorperties.body.tokenId === 'string' &&
        requestPorperties.body.tokenId.length === 20
            ? requestPorperties.body.tokenId
            : false;

    const extend =
        typeof requestPorperties.body.extend === 'boolean' &&
        requestPorperties.body.extend === true
            ? true
            : false;

    if (tokenId && extend) {
        data.read('tokens', tokenId, (err, tokenData) => {
            let tokenObject = parseJSON(tokenData);

            //check that tokenId already expired or not
            if (tokenObject.expires > Date.now()) {
                tokenObject.expires = Date.now() + 60 * 60 * 1000;

                //store the extended time of token
                data.update('tokens', tokenId, tokenObject, (err2) => {
                    if (err2) {
                        callback(200, tokenObject);
                    } else {
                        callback(500, {
                            error: 'Cannot update extended token',
                        });
                    }
                });
            } else {
                callback(400, { error: 'Token expired...' });
            }
        });
    } else {
        callback(400, { error: 'Problem with tokenId or extend' });
    }
};

//delete method
handler._token.delete = (requestPorperties, callback) => {
    //check the phone number is valid
    const tokenId =
        typeof requestPorperties.queryStringObject.tokenId === 'string' &&
        requestPorperties.queryStringObject.tokenId.trim().length === 20
            ? requestPorperties.queryStringObject.tokenId
            : false;

    if (tokenId) {
        data.read('tokens', tokenId, (err1, tokenData) => {
            if (!err1 && tokenData) {
                data.delete('tokens', tokenId, (err2) => {
                    if (err2) {
                        callback(200, {
                            message: 'Token deleted successfully',
                        });
                    } else {
                        callback(500, {
                            error: 'Cannot delete requested token!!!',
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'Cannot read token for  deleting!!!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'Cannot delete token!!!',
        });
    }
};

//verify authentication
handler._token.verify = (tokenId, phone, callback) => {
    data.read('tokens', tokenId, (err, tokenData) => {
        if (!err && tokenData) {
            if (
                parseJSON(tokenData).phone === phone &&
                parseJSON(tokenData).expires > Date.now()
            ) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

module.exports = handler;
