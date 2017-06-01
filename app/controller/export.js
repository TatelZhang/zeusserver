'use strict';

module.exports = app => {
  class ExportController extends app.Controller {
    * order() {
        const ctx = this.ctx;
        ctx.body = yield this.ctx.service.export.order(ctx.query);
    }
    * orderDetail() {
        const ctx = this.ctx;
        ctx.body = yield this.ctx.service.export.orderDetail(ctx.query);
    }
  }
  return ExportController;
};
