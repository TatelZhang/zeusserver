/**
 * author:flyerjay
 * 2017-05-21
 * 定制化需求
 */
'use strict';

module.exports = app => {
    const { STRING, INTEGER, DOUBLE, BIGINT } = app.Sequelize;

    return app.model.define('Demand',{
        demandNo:{
            type: STRING(20),
            allowNull: false,
            primaryKey: true,
            comment: "需求编号",
        },
        comId: {
            type: STRING(2),
            comment:"公司编号(关联公司信息)"
        },
        demandWeight: {
            type: INTEGER,
            comment:"需求吨位"
        },
        demandAmount: {
            type: INTEGER,
            comment:"需求数量"
        },
        userId: {
            type: STRING(20),
            comment:"业务员"
        },
        totalFreight:{
            type:DOUBLE(10,2),
            comment:"总运费"
        },
        customerName:{
            type:STRING(20),
            comment:"客户名称"
        },
        customerPhone:{
            type:STRING(11),
            comment:"客户电话"
        },
        destination:{
            type:STRING(11),
            comment:"到岸目的地"
        },
        totalPrice:{
            type:DOUBLE(10,2),
            comment:"总成本"
        },
        dealReason:{
            type:STRING(100),
            comment:"状态说明"
        },
        timeConsume:{
            type:INTEGER(10),
            comment:"需求工时"
        },
        comment:{
            type:STRING(100),
            comment:"备注"
        },
        createTime:{
            type:BIGINT(15),
            comment:"创建时间"
        },
        priceTime: {
            type:BIGINT(15),
            comment:"报价时间"
        },
        state: {
            type: INTEGER,
            allowNull: false,
            default: 0,
            comment: "需求状态"
        }
    },{
        freezeTabName:true,
        underscored:true,
		tableName:"demand",
		timestamps:false,
        classMethods:{
            * countDemand(options){
                const submit = yield this.count({
                    where: {
                        state: 0,
                        comId: options.comId,
                    }
                })
                const price = yield this.count({
                    where: {
                        state: 1,
                        comId: options.comId,
                    }
                })
                const unDeal = yield this.count({
                    where: {
                        state: 2,
                        comId: options.comId,
                    }
                })
                const deal = yield this.count({
                    where: {
                        state: 3,
                        comId: options.comId,
                    }
                })
                app.io.in(`${comId}`).emit('update',{demand:{
                    submit,price,unDeal,deal
                }});
            },
            * add(options){
                if(!options.demandDetails) return {
                    code: -1,
                    msg: "请补充需求明细"
                }
                var self = this;
                const randomNo = `D${options.comId}${new Date().getTime()}`;
                return app.model.transaction(async (t)=>{
                    return await self.create(Object.assign(options,{
                        state: 0,
                        demandNo: randomNo,
                        createTime: +new Date(),
                    },{transaction:t}).then((res)=>{
                        var demandDetails = options.demandDetails;
                        return Promise.all(demandDetails.map((v)=>{
                            app.model.demandDetail.create({
                                demandNo: randomNo,
                                spec: v.spec,
                                type:v.type,
                                demandAmount:Number(v.demandAmount),
                                factoryPrice:Number(v.factoryPrice),
                                demandWeight:Number(v.demandWeight),
                                freight: Number(v.freight),
                            },{transaction:t})
                        }));
                    }));
                }).then((res)=>{
                    this.countDemand(options);
                    return {
                        code:200,
                        msg:"需求提交成功"
                    }
                }).catch((err)=>{
                    return {
                        code:-1,
                        msg:"需求提交失败"
                    }
                })
            },
            * update(options){
                if(!options.demandNo) return {
                    code:-1,
                    msg:"缺少查询主键"
                }
                const result = yield this.findOne({
                    where:{
                        demandId:{
                            $eq:options.demandNo
                        }
                    }
                })
                for(var arr in options){
                    if(arr == 'userId') continue;
                    result[arr] = options[arr];
                }
                const data = yield result.save();
                this.countDemand(options);
                return {
                    code:200,
                    msg:"更新数据成功",
                    data,
                }
            },
            * remove(options){
                if(!options.demandNo) return {
                    code:-1,
                    msg:"缺少查询主键"
                }
                yield this.destroy({
                    where:{
                        demandId:{
                            $in:options.demandNo.split(',')
                        }
                    }
                })
                return {
                    code:200,
                    msg:"删除成功"
                }
            },
            * list(options){
                const list = yield this.findAndCountAll({
                    offset:!options.page?0:(options.page - 1)*(options.pageSize?options.pageSize:15),
                    limit:options.pageSize?options.pageSize:15,
                    where:{
                        comId:{
                            $eq:options.comId
                        },
                        createTime:{
                            $between:[options.searchTime?new Date(options.searchTime).getTime() - 2.88e7:0,options.searchTime?new Date(options.searchTime).getTime() + 5.86e7:99999999999999999]
                        },
                        userId:{
                            $eq:options.userId,
                        },
                        state: (function(){
                            return options.state ? {
                                $eq: options.state
                            } : '';
                        })()
                    }
                })
                return {
                    code:200,
                    msg:"查询数据成功",
                    data:{
                        totalCount:list.count,
                        row:list.rows,
                        page:options.page?options.page:1,
                        pageSize:options.pageSize?options.pageSize:15
                    }
                }
            },
            * priceList(options){//定制化需求报价
                if(!options.comId) return {
                    code:-1,
                    msg:"缺少公司信息"
                }
                const list = yield this.findAndCountAll({
                    offset:!options.page?0:(options.page - 1)*(options.pageSize?options.pageSize:15),
                    limit:options.pageSize?options.pageSize:15,
                    where:{
                        comId:{
                            $eq:options.comId
                        },
                        createTime:{
                            $between:[options.searchTime?new Date(options.searchTime).getTime() - 2.88e7:0,options.searchTime?new Date(options.searchTime).getTime() + 5.86e7:99999999999999999]
                        },
                        state: (function(){
                            return options.state ? {
                                $eq: options.state
                            } : '';
                        })()
                    }
                })
                return {
                    code:200,
                    msg:"查询数据成功",
                    data:{
                        totalCount:list.count,
                        row:list.rows,
                        page:options.page?options.page:1,
                        pageSize:options.pageSize?options.pageSize:15
                    }
                }
            }
        }
    })
}