'use strict';
var record = require('../record');

module.exports = app => {
    return function* (){
        const message = this.args[0];
        this.socket.join(`${message.comId}`);
        this.socket.emit('res',`您已成功接入消息中心，公司代码：${message.comId}`);
        yield this.app.model.Demand.countDemand(message);
    }
}