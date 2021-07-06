/*
 * Title: Route
 * Description : Application Route Handler
 * Author : Mehdi Hasan Shohan
 * Date : 03 may, 2021
 */
// Dependecies
const { sampleHandler } = require('./handlers/routeHandler/sampleRouteHandler');
const { userHandler } = require('./handlers/routeHandler/userHandler');
const { tokenHandler } = require('./handlers/routeHandler/tokenHandler');
const { checkHandler } = require('./handlers/routeHandler/checkHandler');

//moduel scaffolding
const routes = {
    sample: sampleHandler,
    user: userHandler,
    token: tokenHandler,
    check: checkHandler,
};

module.exports = routes;
