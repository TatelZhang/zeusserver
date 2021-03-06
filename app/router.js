'use strict';

module.exports = app => {
  // app.beforeStart(async function(){
  //     await app.model.sync();
  // });
  app.io.route('info',app.io.controllers.info);
  app.io.of('info',app.io.controllers.info);
  app.all('*',app.middlewares.user())
  app.get('/zues/api/', 'home.index');
  //文件上传
  app.post('/zues/api/upload/excel', 'upload.excel');
  //用户
  app.post('/zues/api/user/register', 'user.register');
  app.post('/zues/api/user/login', 'user.login');
  app.get('/zues/api/user','user.info');
  app.post('/zues/api/user/delete','user.remove');
  app.get('/zues/api/user/validate','user.validate');
  app.post('/zues/api/user/logout','user.logout');
  app.post('/zues/api/user/update','user.reset');
  //公司
  app.get('/zues/api/company','company.list');
  app.post('/zues/api/company/setting','company.defaultdata');
  //运费信息
  app.get('/zues/api/freight/list','freight.list');
  app.post('/zues/api/freight/add','freight.add');
  app.post('/zues/api/freight/update','freight.update');
  app.post('/zues/api/freight/remove','freight.remove');
  //供应商
  app.get('/zues/api/supplier/list','supplier.list');
  app.post('/zues/api/supplier/update','supplier.update');
  app.post('/zues/api/supplier/add','supplier.add');
  app.post('/zues/api/supplier/remove','supplier.remove');
  app.get('/zues/api/supplier/address','supplier.address');
  app.post('/zues/api/supplier/open','supplier.open');
  app.post('/zues/api/supplier/close','supplier.close');
  //供应商库存
  app.get('/zues/api/inventory/list','inventory.list');
  app.post('/zues/api/inventory/add','inventory.add');
  app.post('/zues/api/inventory/update','inventory.update');
  app.post('/zues/api/inventory/remove','inventory.remove');
  //供应商价格
  app.get('/zues/api/price/list','price.list');
  app.post('/zues/api/price/add','price.add');
  app.post('/zues/api/price/update','price.update');
  app.post('/zues/api/price/remove','price.remove');
  app.post('/zues/api/price/adjust','price.adjust');
  //供应商现货
  app.get('/zues/api/product/list','product.list');
  //购物车
  app.get('/zues/api/chart/list','chart.list');
  app.post('/zues/api/chart/addToChart','chart.addToChart');
  app.post('/zues/api/chart/remove','chart.remove');
  app.post('/zues/api/chart/update','chart.update');
  //地址
  app.get('/zues/api/address/list','address.list');
  app.get('/zues/api/address/default','address.defaultAddress');
  app.post('/zues/api/address/add','address.add');
  app.post('/zues/api/address/remove','address.remove');
  app.post('/zues/api/address/setdefault','address.setdefault');
  //车辆
  app.get('/zues/api/car/list','car.list');
  app.post('/zues/api/car/add','car.add');
  app.post('/zues/api/car/remove','car.remove');
  //客户
  app.get('/zues/api/customer/list','customer.list');
  app.post('/zues/api/customer/add','customer.add');
  app.post('/zues/api/customer/remove','customer.remove');
  //下单
  app.get('/zues/api/order/list','order.list');
  app.get('/zues/api/order/detail','order.detail');
  app.post('/zues/api/order/add','order.add');
  app.post('/zues/api/order/remove','order.remove');
  app.post('/zues/api/order/print','order.print');
  app.post('/zues/api/orderdetail/update','order.update');
  //管理员操作
  app.get('/zues/api/operate/list','manage.operateList');
  app.get('/zues/api/userrole/list','manage.userRoleList');
  app.post('/zues/api/userrole/update','manage.updateUserRole');
  app.get('/zues/api/order/verifylist','manage.verifyList');
  app.post('/zues/api/order/verify','manage.orderVerify');
  //定制化需求
  app.get('/zues/api/demand/list','demand.list');
  app.get('/zues/api/demand/detail','demand.detail');
  app.get('/zues/api/demand/price','demand.priceList');
  app.post('/zues/api/demand/add','demand.add');
  app.post('/zues/api/demand/submitudapte','demand.submitUdapte');
  app.post('/zues/api/demand/update','demand.update');
  app.post('/zues/api/demand/price','demand.price');  
  app.post('/zues/api/demand/save','demand.save');  
  app.post('/zues/api/demand/remove','demand.remove');
  app.get('/zues/api/demand/pricehistory','demand.priceHistory')
  //导出报表
  app.get('/zues/api/export/order/*','export.order');
  app.get('/zues/api/export/orderdetail/*','export.orderDetail');
  app.get('/zues/api/export/orderdetaillist/*','export.orderDetailList');
  app.get('/zues/api/export/demandexport/*','export.demandExport');
  app.get('/zues/api/export/demandlist/*','export.demandList');
  app.get('/zues/api/export/demanddetaillist/*','export.demandDetailList');
  //数据分析
  app.get('/zues/api/cdata/value','cdata.value');
  //消息
  app.get('/zues/api/message/list','message.list');
  app.post('/zues/api/message/add','message.add');
  app.post('/zues/api/message/update','message.modify');
  app.post('/zues/api/message/delete','message.delete');
};
