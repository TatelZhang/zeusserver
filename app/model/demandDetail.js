/**
 * author:flyerjay
 * 2017-07-22
 * 需求明细实体类
 */
'use strict';

module.exports = app => {
    const { STRING, INTEGER, BIGINT} = app.Sequelize;

    return app.model.define('DemandDetail',{
        demandDetailId: {
            type: INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull:false,
            comment:"需求明细Id",
        },
        demandNo: {
            type: STRING(20),
            allowNull: false,
            comment: "需求编号",
        },
        spec: {
            type: STRING(16),
            allowNull:false,
            comment:"规格"
        },
        type: {
            type: STRING(10),
            allowNull:false,
            comment:"类型"
        },
        demandAmount: {
            type: INTEGER,
            allowNull: false,
            comment:"需求件数"
        },
        perAmount: {
            type:INTEGER,
            allowNull:false,
            default: 0,
            comment:"单件支数"
        },
        demandWeight: {
            type: STRING(20),
            allowNull: true,
            comment:"需求重量"
        },
        factoryPrice: {
            type: INTEGER(11),
            comment: "出厂价",
        },
        feedbackPrice: {
            type: INTEGER(11),
            comment: "需求报价"
        },
        freight: {
            type: INTEGER(11),
            comment: "运费",
        },
        comment: {
            type: STRING(50),
            allowNull: true,
            comment: "需求备注"
        }
    },{
        freezeTabName:true,
        underscored:true,
		tableName:"demand_detail",
		timestamps:false,
        classMethods:{
        }
    })
}