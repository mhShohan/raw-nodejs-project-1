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

const { sendTwilioSms } = require('./helpers/notifications');

// app object = module scaffolding
const app = {};

/* ////////////////////////////////////
sendTwilioSms('01721146655', 'Hello Shohan', (err) => {
    console.log(`Error: ${err}`);
});
//////////////////////////////////// */

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
