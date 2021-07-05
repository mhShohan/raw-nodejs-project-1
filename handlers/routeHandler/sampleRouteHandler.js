/*
 * Title: Sample Handler
 * Description : Sample Handler
 * Author : Mehdi Hasan Shohan
 * Date : 03 may, 2021
 */

// Module scaffolding
const handler = {};

handler.sampleHandler = (requestPorperties, callback) => {
   callback(200, { message: 'Sample Page' });
};

module.exports = handler;
