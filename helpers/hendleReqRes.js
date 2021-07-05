/*
 * Title: Handle Request And Response
 * Description : Handle Request And Response
 * Author : Mehdi Hasan Shohan
 * Date : 03 may, 2021
 */

//Dependencies

const url = require('url');
const { StringDecoder } = require('string_decoder');
const routes = require('../routes');
const { notFoundHandler } = require('../handlers/routeHandler/notFoundHandler');
const { parseJSON } = require('./utilities');

// Modele scaffolding
const handler = {};

handler.handleReqRes = (req, res) => {
    //handle request
    //get the url and parse it
    const parseUrl = url.parse(req.url, true);
    const path = parseUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    const method = req.method.toLowerCase();
    const queryStringObject = parseUrl.query;
    const headerObject = req.headers;

    // all the request property
    const requestPorperties = {
        parseUrl,
        path,
        trimmedPath,
        method,
        queryStringObject,
        headerObject,
    };

    const decoder = new StringDecoder('utf-8');
    let realData = '';

    const chosenHanlder = routes[trimmedPath]
        ? routes[trimmedPath]
        : notFoundHandler;

    //requested from body
    req.on('data', (buffer) => {
        realData += decoder.write(buffer);
    });

    req.on('end', () => {
        realData += decoder.end();

        requestPorperties.body = parseJSON(realData);

        chosenHanlder(requestPorperties, (statusCode, payload) => {
            statusCode = typeof statusCode === 'number' ? statusCode : 500;
            payload = typeof payload === 'object' ? payload : {};

            const payloadString = JSON.stringify(payload);

            //return the final response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
        });

        //handle response
        // res.end('hello');
    });
};

//Export module
module.exports = handler;
