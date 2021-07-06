/*
 * Title: Check Handler
 * Description :  Handling user define checks
 * Author : Mehdi Hasan Shohan
 * Date : 06 july, 2021
 */

//dependencies
const data = require('../../lib/data');
const { parseJSON, createRandomStrings } = require('../../helpers/utilities');
const { _token } = require('./tokenHandler');
const { maxChecks } = require('../../helpers/environments');

// Module scaffolding
const handler = {};

handler.checkHandler = (requestPorperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestPorperties.method) > -1) {
        handler._check[requestPorperties.method](requestPorperties, callback);
    } else {
        callback(405);
    }
};

handler._check = {};

//post method with authentication
handler._check.post = (requestPorperties, callback) => {
    //validate input
    let protocol =
        typeof requestPorperties.body.protocol === 'string' &&
        ['http', 'https'].indexOf(requestPorperties.body.protocol) > -1
            ? requestPorperties.body.protocol
            : false;

    let url =
        typeof requestPorperties.body.url === 'string' &&
        requestPorperties.body.protocol.trim().length > 0
            ? requestPorperties.body.url
            : false;

    let method =
        typeof requestPorperties.body.method === 'string' &&
        ['GET', 'POST', 'PUT', 'DELETE'].indexOf(
            requestPorperties.body.method
        ) > -1
            ? requestPorperties.body.method
            : false;

    let successCode =
        typeof requestPorperties.body.successCode === 'object' &&
        requestPorperties.body.successCode instanceof Array
            ? requestPorperties.body.successCode
            : false;

    let timeoutSeconds =
        typeof requestPorperties.body.timeoutSeconds === 'number' &&
        requestPorperties.body.timeoutSeconds % 1 === 0 &&
        requestPorperties.body.timeoutSeconds >= 1 &&
        requestPorperties.body.timeoutSeconds <= 5
            ? requestPorperties.body.timeoutSeconds
            : false;

    if (protocol && url && method && successCode && timeoutSeconds) {
        let token =
            typeof requestPorperties.headerObject.token === 'string'
                ? requestPorperties.headerObject.token
                : false;

        //lookup the phone by reading token
        data.read('tokens', token, (err, tokenData) => {
            if (!err && tokenData) {
                let userPhone = parseJSON(tokenData).phone;
                //look up the user data by reading users
                data.read('users', userPhone, (err2, userData) => {
                    if (!err2 && userData) {
                        //varify token
                        _token.verify(token, userPhone, (tokenIsValid) => {
                            if (tokenIsValid) {
                                let userObject = parseJSON(userData);
                                let userChecks =
                                    typeof userObject.checks === 'object' &&
                                    userObject instanceof Array
                                        ? userObject.checks
                                        : [];

                                if (userChecks < maxChecks) {
                                    let checkId = createRandomStrings(20);
                                    let checkObject = {
                                        id: checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCode,
                                        timeoutSeconds,
                                    };

                                    //save the checkObject to database
                                    data.create(
                                        'checks',
                                        checkId,
                                        checkObject,
                                        (err3) => {
                                            if (err3) {
                                                //add check id to user's object
                                                userObject.checks = userChecks;
                                                userObject.checks.push(checkId);

                                                //sstore data new use data
                                                data.update(
                                                    'users',
                                                    userPhone,
                                                    userObject,
                                                    (err4) => {
                                                        if (err4) {
                                                            // return  the data about check

                                                            callback(
                                                                200,
                                                                checkObject
                                                            );
                                                        } else {
                                                            callback(400, {
                                                                error: 'New use object cannot store',
                                                            });
                                                        }
                                                    }
                                                );
                                            } else {
                                                callback(400, {
                                                    error: 'CheckObject cannot store',
                                                });
                                            }
                                        }
                                    );
                                } else {
                                    callback(401, {
                                        error: 'user has aleady max checks.',
                                    });
                                }
                            } else {
                                callback(400, {
                                    error: 'Token not found/ Authentication failed...',
                                });
                            }
                        });
                    } else {
                        callback(400, { error: 'User not found...' });
                    }
                });
            } else {
                callback(400, {
                    error: 'Authentication Problem in check get method',
                });
            }
        });
    } else {
        callback(400, { error: 'Problem in your check inputs...' });
    }
};

//get method with authentication
handler._check.get = (requestPorperties, callback) => {
    const id =
        typeof requestPorperties.queryStringObject.id === 'string' &&
        requestPorperties.queryStringObject.id.trim().length === 20
            ? requestPorperties.queryStringObject.id
            : false;

    if (id) {
        //lookup the checks
        data.read('checks', id, (err, checkData) => {
            if (!err && checkData) {
                let token =
                    typeof requestPorperties.headerObject.token === 'string'
                        ? requestPorperties.headerObject.token
                        : false;

                //varify token
                _token.verify(
                    token,
                    parseJSON(checkData).userPhone,
                    (tokenIsValid) => {
                        if (tokenIsValid) {
                            callback(200, parseJSON(checkData));
                        } else {
                            callback(403, {
                                error: 'Authentication Failed to get checks',
                            });
                        }
                    }
                );
            } else {
                callback(400, { error: 'Cannot read check data' });
            }
        });
    } else {
        callback(400, { error: 'Invalid id to get checks' });
    }
};

//put method with authentication
handler._check.put = (requestPorperties, callback) => {
    const id =
        typeof requestPorperties.body.id === 'string' &&
        requestPorperties.body.id.trim().length === 20
            ? requestPorperties.body.id
            : false;

    //validate input
    let protocol =
        typeof requestPorperties.body.protocol === 'string' &&
        ['http', 'https'].indexOf(requestPorperties.body.protocol) > -1
            ? requestPorperties.body.protocol
            : false;

    let url =
        typeof requestPorperties.body.url === 'string' &&
        requestPorperties.body.url.trim().length > 0
            ? requestPorperties.body.url
            : false;

    let method =
        typeof requestPorperties.body.method === 'string' &&
        ['GET', 'POST', 'PUT', 'DELETE'].indexOf(
            requestPorperties.body.method
        ) > -1
            ? requestPorperties.body.method
            : false;

    let successCode =
        typeof requestPorperties.body.successCode === 'object' &&
        requestPorperties.body.successCode instanceof Array
            ? requestPorperties.body.successCode
            : false;

    let timeoutSeconds =
        typeof requestPorperties.body.timeoutSeconds === 'number' &&
        requestPorperties.body.timeoutSeconds % 1 === 0 &&
        requestPorperties.body.timeoutSeconds >= 1 &&
        requestPorperties.body.timeoutSeconds <= 5
            ? requestPorperties.body.timeoutSeconds
            : false;

    if (id) {
        if (protocol || url || method || successCode || timeoutSeconds) {
            data.read('checks', id, (err, checkData) => {
                if (!err && checkData) {
                    let checkObject = parseJSON(checkData);
                    let token =
                        typeof requestPorperties.headerObject.token === 'string'
                            ? requestPorperties.headerObject.token
                            : false;

                    _token.verify(
                        token,
                        checkObject.userPhone,
                        (tokenIsValid) => {
                            if (tokenIsValid) {
                                if (protocol) {
                                    checkObject.protocol = protocol;
                                }
                                if (url) {
                                    checkObject.url = url;
                                }
                                if (method) {
                                    checkObject.method = method;
                                }
                                if (successCode) {
                                    checkObject.successCode = successCode;
                                }
                                if (timeoutSeconds) {
                                    checkObject.timeoutSeconds = timeoutSeconds;
                                }

                                //store the updated checks
                                data.update(
                                    'checks',
                                    id,
                                    checkObject,
                                    (err2) => {
                                        if (err2) {
                                            callback(200, checkObject);
                                        } else {
                                            callback(400, {
                                                error: 'Cannot update check data',
                                            });
                                        }
                                    }
                                );
                            } else {
                                callback(403, {
                                    error: 'Authentication Failed to Update checks',
                                });
                            }
                        }
                    );
                } else {
                    callback(500, { error: 'cannot read data to find id' });
                }
            });
        } else {
            callback(400, { error: 'Must provide atleast one field...' });
        }
    } else {
        callback(400, { error: 'Invalid Check id to update...' });
    }
};

//delete method with authentication
handler._check.delete = (requestPorperties, callback) => {
    const id =
        typeof requestPorperties.queryStringObject.id === 'string' &&
        requestPorperties.queryStringObject.id.trim().length === 20
            ? requestPorperties.queryStringObject.id
            : false;

    if (id) {
        //lookup the checks
        data.read('checks', id, (err, checkData) => {
            if (!err && checkData) {
                let token =
                    typeof requestPorperties.headerObject.token === 'string'
                        ? requestPorperties.headerObject.token
                        : false;

                //varify token
                _token.verify(
                    token,
                    parseJSON(checkData).userPhone,
                    (tokenIsValid) => {
                        if (tokenIsValid) {
                            //delete stored checks
                            data.delete('checks', id, (err1) => {
                                if (err1) {
                                    data.read(
                                        'users',
                                        parseJSON(checkData).userPhone,
                                        (err2, userData) => {
                                            let userObject =
                                                parseJSON(userData);
                                            if (!err2 && userData) {
                                                let userChecks =
                                                    typeof userObject.checks ===
                                                        'object' &&
                                                    userObject.checks instanceof
                                                        Array
                                                        ? userObject.checks
                                                        : [];

                                                //remove deleted check id from user
                                                let checkPosition =
                                                    userChecks.indexOf(id);
                                                if (checkPosition > -1) {
                                                    userChecks.splice(
                                                        checkPosition,
                                                        1
                                                    );
                                                    //save new data
                                                    userObject.checks =
                                                        userChecks;
                                                    data.update(
                                                        'users',
                                                        userObject.phone,
                                                        userObject,
                                                        (err3) => {
                                                            if (err3) {
                                                                callback(200, {
                                                                    message:
                                                                        'Checks removed successfully!',
                                                                });
                                                            } else {
                                                                callback(500, {
                                                                    error: 'Cannot remove checks id from users',
                                                                });
                                                            }
                                                        }
                                                    );
                                                } else {
                                                    callback(400, {
                                                        error: 'Cannot find check id to delete',
                                                    });
                                                }
                                            } else {
                                                callback(400, {
                                                    error: 'Cannot romove checksdata from users..',
                                                });
                                            }
                                        }
                                    );
                                } else {
                                    callback(403, {
                                        error: 'Cannot delete checks',
                                    });
                                }
                            });
                        } else {
                            callback(403, {
                                error: 'Authentication Failed to get delete',
                            });
                        }
                    }
                );
            } else {
                callback(400, { error: 'Cannot read check data for delete' });
            }
        });
    } else {
        callback(400, { error: 'Invalid id to delete checks' });
    }
};

module.exports = handler;
