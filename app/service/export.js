'use strict';
const xlsx = require('node-xlsx');
const Util = require('../utils');

module.exports = app => {
    class Export extends app.Service {
        * order(options) {
            const result = yield app.model.query(`SELECT o.orderNo,o.orderPrice,o.orderWeight,o.orderAdjust,ui.userId,ui.userName,o.createTime,o.validate,
                (select count(distinct supplierId) from order_detail where orderNo = o.orderNo) as supplierCount,
                (select s.supplierName from order_detail od left join supplier s on s.supplierId = od.supplierId where od.orderNo = o.orderNo limit 0,1) as supplierName
                FROM tb_order o
                LEFT JOIN user_info ui
                ON ui.userId = o.userId
                AND ui.comId = o.comId
                WHERE o.comId = :comId
                AND orderNo LIKE :orderNo
                ORDER BY o.createTime DESC
                `,{
                    replacements:{
                        comId:options.comId,
                        userId:options.userId?options.userId:'',
                        orderNo:options.orderNo?`%${options.orderNo}%`:'%%',
                    }
                })
            var tmpData = [];
            const orderStatus = {
                '0':'未审核',
                '1':'已审核'
            }
            tmpData.push(['订单编号','下单时间','供应商','总吨位','总价格','下浮总额','下单人','状态']);
            result[0].map((v)=>{
                const createTime = new Date(v['createTime']).toLocaleString();
                const orderNo = v['orderNo'];
                const orderPrice = v['orderPrice'];
                const orderWeight = v['orderWeight'];
                const orderAdjust = v['orderAdjust'];
                const userId = v['userId'];
                const validate = orderStatus[v['validate']];
                var supplierName = v['supplierName'].replace(/黑管|热镀锌|镀锌带/g,'');
                var lineData = [orderNo,createTime,supplierName,orderWeight,orderPrice,orderAdjust,userId,validate];
                tmpData.push(lineData);
            })
            var buffer = xlsx.build([{name: "订单列表", data: tmpData}])
            return buffer;
        }
        * orderDetail(options) {
            const list = yield app.model.query(`select od.*,s.supplierName from order_detail od 
                left join supplier s
                on s.supplierId = od.supplierId
                where od.orderNo = :orderNo`,{
                replacements:{
                    orderNo:options.orderNo,
                }
            })
            var tmpData = [];
            tmpData.push(['规格','类型','供应商','数量','单价','重量','下浮','备注']);
            list[0].map((v)=>{
                const spec = v['spec'];
                const type = v['type'];
                const supplierName = v['supplierName'];
                const orderAmount = v['orderAmount'];
                const unitPrice = v['unitPrice'];
                const Weight = v['Weight'];
                const orderDcrease = v['orderDcrease'];
                const comment = v['comment'];
                var lineData = [spec,type,supplierName,orderAmount,unitPrice,Weight,orderDcrease,comment];
                tmpData.push(lineData);
            })
            var buffer = xlsx.build([{name: "订单列表", data: tmpData}])
            return buffer;
        }
        * orderDetailList(options) {
            const list = yield app.model.query(`SELECT od.orderNo, od.spec, od.type, od.long, od.Weight, od.orderAmount, od.unitPrice, od.daPrice, od.orderDcrease, tbo.createTime, tbo.userId FROM order_detail od 
                INNER JOIN tb_order tbo
                ON tbo.orderNo = od.orderNo`)
            var tmpData = [];
            tmpData.push(['订单编号', '规格', '类型', '长度', '数量', '重量', '单价', '到岸单价', '下浮', '创建时间', '下单人']);
            list[0].map(v=>{
                var orderNo = v['orderNo'];
                var spec = v['spec'];
                var type = v['type'];
                var long = v['long'];
                var weight = v['Weight'];
                var orderAmount = v['orderAmount'];
                var unitPrice = v['unitPrice'];
                var daPrice = v['daPrice'];
                var orderDcrease = v['orderDcrease'];
                var createTime = new Date(v['createTime']).toLocaleString();
                var userId = v['userId'];
                tmpData.push([orderNo, spec, type, long, orderAmount, weight, unitPrice, daPrice, orderDcrease, createTime, userId]);
            });
            var buffer = xlsx.build([{name: '需求列表',data: tmpData}]);
            return buffer;
        }
        * demandList(options){
            const list = yield app.model.query(`SELECT * FROM demand d where comId = :comId`,{
                replacements:{
                    comId: options.comId,
                }
            });
            var tmpData = [];
            tmpData.push(['需求编号','销售','采购','状态','总重量','客户名称','目的地','客户电话','创建时间','报价时间','报价时长','备注']);
            list[0].map((v) => {
                const totalFreight = v['totalFreight'] || 0;
                const customerName = v['customerName'] || '';
                const demandWeight = v['demandWeight'] || 0;
                const customerPhone = v['customerPhone'] || '';
                const createTime = new Date(v['createTime']).toLocaleString();
                const priceTime = new Date(v['priceTime']).toLocaleString();
                const priceFragment = v['priceTime'] ? Math.ceil(( v['priceTime'] - v['createTime'] ) / 1000 / 60) + "分钟" : "未报价";
                var states = {
                    '0':'未报价',
                    '1':'未反馈',
                    '2':'已反馈报价',
                    '3':'成交失败',
                    '4':'成交成功',
                }
                const state = states[v['state']];
                tmpData.push([v['demandNo'],v['userId'],v['priceUser'],state,demandWeight,customerName,v['destination'],customerPhone,createTime,priceTime,priceFragment,v['comment']]);
            })
            var buffer = xlsx.build([{name: '需求列表',data: tmpData}]);
            return buffer;
        }
        * demandExport(options){
            if(!options.demandNo) return {
                code: -1,
                msg: '缺少需求编号'
            }
            const baseInfo = yield app.model.query(`select * from demand where demandNo = :demandNo`,{
                replacements:{
                    demandNo: options.demandNo,
                }
            })
            const list = yield app.model.query(`select * from demand_detail where demandNo = :demandNo`,{
                replacements:{
                    demandNo: options.demandNo
                }
            })
            var states = {
                '0':'未报价',
                '1':'未反馈',
                '2':'已反馈报价',
                '3':'成交失败',
                '4':'成交成功',
            }
            var tmpData = [];
            tmpData.push(
                [
                    '客户名称',
                    baseInfo[0][0].customerName,
                    '客户电话',
                    baseInfo[0][0].customerPhone,
                    '目的地',
                    baseInfo[0][0].destination,
                    '状态',
                    states[
                        baseInfo[0][0].state + ''
                    ]
                ]
            )
            tmpData.push([]);
            tmpData.push(['规格','类型','需求数量','需求重量','单价','运费']);
            list[0].map(v => {
                const spec = v['spec'];
                const type = v['type'];
                const demandAmount = v['demandAmount'];
                const demandWeight = v['demandWeight'];
                const factoryPrice = v['factoryPrice'];
                const freight = v['freight'];
                var lineData = [spec,type,demandAmount,demandWeight,factoryPrice,freight];
                tmpData.push(lineData);
            })
            var buffer = xlsx.build([{name: "需求详情", data: tmpData}])
            return buffer;
        }
        * demandDetailExport (options) {
            var info = yield app.model.query(`SELECT dd.demandDetailId,dd.demandNo,dd.spec,dd.type,dd.demandAmount,perAmount,dd.demandWeight,dd.factoryPrice,dd.feedbackPrice,dd.freight,d.state,d.userId,d.customerName,d.customerPhone,d.destination,d.priceUser from demand_detail dd 
            inner join demand d
            on d.demandNo = dd.demandNo
            and ( d.userId = :otherId or :otherId = '' ) 
            and customerName like :customerName
            and (createTime between :startTime and :endTime)
            order by dd.demandNo desc`,{
                replacements:{
                    otherId: options.demandUser || '',
                    customerName: options.customName ? `%${options.customName}%` : '%%',
                    startTime: options.createTime ? new Date(options.createTime).getTime() - 2.88e7   : 0,
                    endTime: options.endTime ? new Date(options.endTime).getTime() + 5.86e7 : 9999999999999,
                }
            })

            var states = {
                '0':'未报价',
                '1':'未反馈',
                '2':'已反馈报价',
                '3':'成交失败',
                '4':'成交成功',
            }

            var tmpData = [];
            tmpData.push(['需求编号','规格','类型','需求数量','需求重量','出厂价','运费','业务报价','成交状态',"销售","采购","客户","客户电话","目的地"]);
            info[0].map( v => {
                tmpData.push([v['demandNo'],v['spec'],v['type'],v['demandAmount'],v['demandWeight'],v['factoryPrice'],v['freight'],v['feedbackPrice'],states[v['state']],v['userId'],v['priceUser'],v['customerName'],v['customerPhone'],v['destination']]);
            })
            var buffer = xlsx.build([{name: "需求详情列表", data: tmpData}])
            return buffer;
        }
        * orderPrint(options) {
            const [$1,$2] = yield [app.model.query(`SELECT o.* FROM tb_order o WHERE o.orderNo = :orderNo`,{
                replacements:{
                    orderNo:options.orderNo,
                }
            }),
            app.model.query(`select od.*,s.supplierName from order_detail od 
                left join supplier s
                on s.supplierId = od.supplierId
                where od.orderNo = :orderNo`,{
                    replacements:{
                        orderNo:options.orderNo,
                    }
                })
            ]

            return {
                code:200,
                data:{
                    order:$1[0][0],
                    orderDetail:$2[0],
                },
                msg:"查询成功"
            }
        }
    }
    return Export;
}