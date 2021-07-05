/*
 * Title: Environment variable
 * Description : Handle all environment variable
 * Author : Mehdi Hasan Shohan
 * Date : 06 may, 2021
 */

// module scaffolding
const environment = {};

environment.staging = {
    port: 8080,
    envName: 'staging',
    secretKey: 'ahsnhsdfhjs',
};

environment.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'ahsnhsdfhjs',
};

//determide whice environment was passed

const currentEnvironment =
    typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

// expoort curresponding environment object
const environmentToExport =
    typeof environment[currentEnvironment] === 'object'
        ? environment[currentEnvironment]
        : environment.staging;

// export module
module.exports = environmentToExport;
