/*
 * Title: Not Found Handler
 * Description : Not Found Handler
 * Author : Mehdi Hasan Shohan
 * Date : 03 may, 2021
 */

// Module scaffolding
const handler = {};

handler.notFoundHandler = (requestPorperties, callback) => {
   callback(404, { massage: '404! Not Found...' });
};

module.exports = handler;
