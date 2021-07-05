/*
 * Title: Utilities
 * Description : Importent utilities
 * Author : Mehdi Hasan Shohan
 * Date : 05 july, 2021
 */

/// dependencies
const crypto = require('crypto');
const environment = require('./environments');

//moduel scaffolding
const utilities = {};

//parse if there input any other data
utilities.parseJSON = (jsonString) => {
    let output;

    try {
        output = JSON.parse(jsonString);
    } catch {
        output = {};
    }

    return output;
};

//hashing the string
utilities.hash = (str) => {
    if (typeof str === 'string' && str.length > 0) {
        let hash = crypto
            .createHmac('sha256', environment.secretKey)
            .update(str)
            .digest('hex');
        return hash;
    } else {
        return false;
    }
};

module.exports = utilities;
