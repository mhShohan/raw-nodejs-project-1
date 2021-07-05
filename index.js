/*
 * Title: Uptime Monitoring API
 * Description : A restFul API for up/down  time of user defined  links
 * Author : Mehdi Hasan Shohan
 * Date : 03 may, 2021
 */

// Dependencies
const http = require('http');
const { handleReqRes } = require('./helpers/hendleReqRes');
const environment = require('./helpers/environments');

// app object = module scaffolding
const app = {};

//create server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);

    server.listen(environment.port, () => {
        console.log(`http://localhost:${environment.port}`);
    });
};

//handle response request
app.handleReqRes = handleReqRes;

//start server / invoke function
app.createServer();
