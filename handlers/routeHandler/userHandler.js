/*
 * Title: User Handler
 * Description :  Handling user route
 * Author : Mehdi Hasan Shohan
 * Date : 04 july, 2021
 */

//dependencies
const data = require('../../lib/data');
const { hash, parseJSON } = require('../../helpers/utilities');

// Module scaffolding
const handler = {};

handler.userHandler = (requestPorperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestPorperties.method) > -1) {
        handler._users[requestPorperties.method](requestPorperties, callback);
    } else {
        callback(405);
    }
};

handler._users = {};

//get method
handler._users.get = (requestPorperties, callback) => {
    //check the phone number is valid
    const phone =
        typeof requestPorperties.queryStringObject.phone === 'string' &&
        requestPorperties.queryStringObject.phone.trim().length === 11
            ? requestPorperties.queryStringObject.phone
            : false;

    if (phone) {
        data.read('users', phone, (err, u) => {
            const user = { ...parseJSON(u) };
            if (!err && user) {
                delete user.password;
                callback(200, user);
            } else {
                callback(404, { Error: 'Requested User not found!' });
            }
        });
    } else {
        callback(404, { Error: 'Requested User not found!' });
    }
};

//post method
handler._users.post = (requestPorperties, callback) => {
    const firstName =
        typeof requestPorperties.body.firstName === 'string' &&
        requestPorperties.body.firstName.trim().length > 0
            ? requestPorperties.body.firstName
            : false;

    const lastName =
        typeof requestPorperties.body.lastName === 'string' &&
        requestPorperties.body.lastName.trim().length > 0
            ? requestPorperties.body.lastName
            : false;

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

    const tosAgreement =
        typeof requestPorperties.body.tosAgreement === 'boolean'
            ? requestPorperties.body.tosAgreement
            : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        /// make sure user doesn't exits
        data.read('users', phone, (err, user) => {
            if (err) {
                let userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement,
                };
                //store user to database
                data.create('users', phone, userObject, (err) => {
                    if (err) {
                        callback(200, {
                            message: 'User is created successfully!',
                        });
                    } else {
                        callback(500, { error: 'Could not create user~!' });
                    }
                });
            } else {
                callback(500, { error: 'User already exits' });
            }
        });
    } else {
        callback(400, { error: 'Problem in your request!!!' });
    }
};

//put method
handler._users.put = (requestPorperties, callback) => {
    const firstName =
        typeof requestPorperties.body.firstName === 'string' &&
        requestPorperties.body.firstName.trim().length > 0
            ? requestPorperties.body.firstName
            : false;

    const lastName =
        typeof requestPorperties.body.lastName === 'string' &&
        requestPorperties.body.lastName.trim().length > 0
            ? requestPorperties.body.lastName
            : false;

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
    if (phone) {
        if (firstName || lastName || password) {
            //find the user
            data.read('users', phone, (err, user) => {
                const userData = { ...parseJSON(user) };

                if (!err && userData) {
                    if (firstName) {
                        userData.firstName = firstName;
                    }
                    if (lastName) {
                        userData.lastName = lastName;
                    }
                    if (password) {
                        userData.password = hash(password);
                    }
                    //update database
                    data.update('users', phone, userData, (err) => {
                        if (err) {
                            callback(200, {
                                message: 'User was updated Successfully!',
                            });
                        } else {
                            callback(500, {
                                error: 'Cannot update Data ...',
                            });
                        }
                    });
                } else {
                    callback(400, {
                        error: 'Cannot read Data for updating...',
                    });
                }
            });
        } else {
            callback(400, { error: 'Update atleast one field!' });
        }
    } else {
        callback(400, { error: 'Invalid Phone Number of user!' });
    }
};

//delete method
handler._users.delete = (requestPorperties, callback) => {
    //check the phone number is valid
    const phone =
        typeof requestPorperties.queryStringObject.phone === 'string' &&
        requestPorperties.queryStringObject.phone.trim().length === 11
            ? requestPorperties.queryStringObject.phone
            : false;

    if (phone) {
        data.read('users', phone, (err1, userData) => {
            if (!err1 && userData) {
                data.delete('users', phone, (err2) => {
                    if (err2) {
                        callback(200, { message: 'user deleted successfully' });
                    } else {
                        callback(500, {
                            error: 'Cannot delete requested user!!!',
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'Cannot read user for  deleting!!!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'Cannot delete the user!!!',
        });
    }
};

module.exports = handler;
