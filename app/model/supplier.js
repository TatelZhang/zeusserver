/**
 * author:flyerjay
 * 2017-04-19
 * 供应商实体类
 */
'use strict';

module.exports = app => {
    const { STRING, INTEGER } = app.Sequelize;

    return app.model.define('Supplier',{
        supplierId: {
            type: INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull:false,
            comment:"供应商编号",
        },
        supplierName: {
            type: STRING,
            allowNull:false,
            comment:"供应商名称"
        },
        comId: {
            type:STRING,
            allowNull:false,
            comment:"公司编号"
        },
        address: {
            type:STRING,
            allowNull:false,
            comment:"供应商地址"
        },
        benifit: {
            type:STRING,
            comment:"优惠"
        }
    },{
        freezeTabName:true,
		tableName:"supplier",
        underscored:true,
		timestamps:false,
        classMethods:{
            * getList(options){
                if(!options.comId) return {
                    code:-1,
                    msg:"缺少公司信息"
                }
                let condition = '';
                if(options.address) {
                    condition = `AND s.address = :address`
                }
                const [$1,$2] = yield [app.model.query(`SELECT s.supplierId,s.supplierName,s.comId,s.address,s.benifit,f.freight 
                FROM supplier s
                LEFT JOIN freight f ON
                f.comId = s.comId AND
                f.address = s.address
                WHERE s.comId = :comId AND
                s.supplierName LIKE :supplierName
                ${condition}
                LIMIT :start,:offset`,{
                    replacements:{
                        supplierName:options.supplierName?`%${options.supplierName}%`:'%%',
                        comId:options.comId,
                        address:options.address?options.address:'',
                        start:!options.page?0:options.page*(options.pageSize?options.pageSize:30),
                        offset:!options.page?(options.pageSize?(options.pageSize-0):30):(((options.page-0)+1)*(options.pageSize?options.pageSize:30)),
                    }
                }),
                app.model.query(`SELECT count(1) as count 
                FROM supplier s
                LEFT JOIN freight f ON
                f.comId = s.comId AND
                f.address = s.address
                WHERE s.comId = :comId AND
                s.supplierName LIKE :supplierName
                ${condition}
                LIMIT :start,:offset`,{
                    replacements:{
                        supplierName:options.supplierName?`%${options.supplierName}%`:'%%',
                        comId:options.comId,
                        address:options.address?options.address:'',
                        start:!options.page?0:options.page*(options.pageSize?options.pageSize:30),
                        offset:!options.page?(options.pageSize?(options.pageSize-0):30):(((options.page-0)+1)*(options.pageSize?options.pageSize:30)),
                    }
                })]
                if(!$1[0] || $1[0].length === 0) return {
                    code:-1,
                    msg:"数据为空"
                }
                let result= {};
                result.row = $1[0];
                result.totalCount = $2[0][0].count;
                result.page = options.page?options.page:0;
                result.pageSize = options.pageSize?options.pageSize:30;
                return {
                    code:200,
                    msg:"查询成功",
                    data:result,
                }
            },
            * update(options){
                var result = yield this.findOne({
                    where:{
                        supplierId:{
                            $eq:options.supplierId,
                        }
                    }
                })
                if(!result) return{
                    code:-1,
                    msg:'修改的记录不存在'
                }
                var keys = '';
                var values = '';
                var value = '';
                for(var props in options){
                    yield app.model.query(`UPDATE supplier SET ${props} = :value WHERE supplierId = :supplierId`,{
                        replacements:{
                            supplierId:options.supplierId,
                            value:options[props]
                        }
                    })
                }
                return {
                    code:200,
                    msg:"修改成功"
                }
            },
            * add(options){
                if(!options.comId) return {
                    code:-1,
                    msg:"缺少公司信息"
                }
                if(!options.supplierName) return {
                    code:-1,
                    msg:"请输入供应商名称"
                }
                if(!options.address) return {
                    code:-1,
                    msg:"请选择供应商地址"
                }
                const isExsit = yield this.findOne({
                    where:{
                        supplierName:{
                            $eq:options.supplierName
                        },
                        comId:{
                            $eq:options.comId
                        }
                    }
                })
                if(isExsit) return {
                    code:-1,
                    msg:"已经存在相同的记录"
                }
                const result = yield this.create(options);
                return {
                    code:200,
                    msg:"添加成功",
                    data:result
                }
            },
            * remove(options){
                const result = yield this.destroy({
                    where:{
                        supplierId:{
                            $in:options.supplierId.split(','),
                        }
                    }
                })
                if(result) return {
                    code:200,
                    msg:'删除成功'
                }
                return {
                    code:-1,
                    msg:'删除失败'
                };
            },
            * address(options){
                if(!options.comId) return {
                    code:-1,
                    msg:"缺少公司信息:comId"
                }
                const result = yield app.model.query(`SELECT DISTINCT address from freight WHERE comId = :comId`,{
                    replacements:{
                        comId:options.comId,
                    }
                });
                return {
                    code:200,
                    data:result[0]
                }
            }
        }
    })
}