/**
 * author:flyerjay
 * 2017-04-19
 * 用户实体类
 */
'use strict';
var uuid = require('uuid');

module.exports = app => {
    const { STRING, INTEGER, DATE, UUID, BIGINT } = app.Sequelize;

    return app.model.define('User',{
        userToken: {
            type: UUID,
            comment:"验证用户登录的凭证"
        },
        userId: {
            type: STRING(20),
            primaryKey: true,
            allowNull:false,
            comment:"用户Id(主键)"
        },
        comId: {
            type: STRING(2),
            primaryKey: true,
            allowNull:false,
            comment:"公司编号(关联公司信息)"
        },
        password: {
            type: STRING(20),
            allowNull:false,
            comment:"密码"
        },
        valid: {
            type:INTEGER,
            allowNull:false,
            comment:"账号是否有效",
        },
        userName: {
            type: STRING(20),
            comment:"用户名(昵称)"
        },
        registerTime: {
            type: BIGINT(20),
            comment:"注册时间"
        },
        lastLoginTime: {
            type: BIGINT(20),
            comment:"上次登录时间"
        }
    },{
        freezeTabName:true,
        underscored:true,
		tableName:"user_info",
		timestamps:false,
        classMethods:{
            associate(){
                app.model.User.belongsTo(app.model.Company,{foreignKey:'comId',targetKey:'comId'});
            },
            * registeUser(options){
                if(!options || !options.password || !options.comId || !options.registerId) return {
                    code:-1,
                    msg:'缺少必要字段'
                }
                var isExist = yield this.findOne({
                    where:{
                        userId: {
                            $eq:options.registerId
                        },
                        comId: {
                            $eq: options.comId
                        }
                    }
                });
                options.userId = options.registerId;
                if(isExist) return {
                    code:-1,
                    message:"账号已存在"
                }
                var extendFiled = {
                    registerTime: +new Date(),
                    lastLoginTime: +new Date(),
                    userToken: uuid.v4(),
                    valid:1,
                };
                var self = this;
                return app.model.transaction(async (t)=>{
                    return await self.create(Object.assign(options,extendFiled)
                    ,{transaction:t}).then(async (res)=>{
                        const data = res.dataValues;
                        var role = await app.model.Userrole.create({
                            userId:data.userId,
                            comId:data.comId,
                            adminAuth:0,
                            valueAuth:0,
                            inventoryAuth:0,
                            demandAuth:0,
                            orderAuth:0,
                            supplierAuth:0,
                            crossAuth:0,
                            queryAuth:0,
                            lastUpdateTime:new Date().getTime()
                        },{transaction:t})
                        var userData = {
                            userInfo:res,
                            userRole:role
                        }
                        return userData;
                    })
                }).then((res)=>{
                    return {
                        data:res,
                        code:200,
                        msg:"注册成功"
                    }
                }).catch((err)=>{
                    console.log(err);
                });
            },
            * resetPassword(options) {
                if(!options.resetUser || !options.comId) return {
                    code: -1,
                    msg: "缺少必要参数"
                }
                const result =  yield this.update({
                    password: options.password
                },{
                    where:{
                        userId: {
                            $eq: options.resetUser
                        },
                        comId: {
                            $eq: options.comId
                        }
                    }
                });
                return {
                    code: 200,
                    msg: "修改密码成功"
                }
            },
            * userLogin(options){
                if(!options || !options.userId || !options.password || !options.comId) return {
                    code:-1,
                    msg:'缺少必要字段'
                }
                const isExist = yield this.findOne({
                    where:{
                        userId:{
                            $eq:options.userId,
                        },
                        password:{
                            $eq:options.password,
                        },
                        comId:{
                            $eq:options.comId,
                        }
                    },
                    attributes:['userToken','userId','comId','valid','userName','registerTime','lastLoginTime']
                });
                if(!isExist) return {
                    code:-1,
                    msg:'用户名或密码错误'
                }
                isExist.userToken = uuid.v4();
                isExist.lastLoginTime = new Date().getTime();
                isExist.save();
                if(isExist.valid !== 1) return {
                    code:-1,
                    msg:'账号审核中'
                }
                if(isExist.comId !== options.comId) return {
                    code:-1,
                    msg:'公司信息有误'
                }
                const role = yield app.model.Userrole.findOne({
                    where:{
                        userId:{
                            $eq:options.userId
                        }
                    }
                })
                return {
                    data:{
                        userInfo:isExist,
                        userRole:role
                    },
                    code:200,
                    msg:'登录成功',
                }
            },
            * removeUser(options){
                if(!options.operator) return {
                    code:-1,
                    msg:"缺少删除用户"
                }
                return yield app.model.transaction((t) => {
                    return this.destroy({
                        where:{
                            userId:{
                                $eq:options.operator,
                            }
                        },
                        transaction: t
                    }).then(()=>{
                        return app.model.Userrole.destroy({
                            where:{
                                userId:{
                                    $eq:options.operator,
                                }
                            },
                            transaction: t
                        })
                    }).then(()=>{
                        return app.model.OperateRecord.create({
                            userId:options.userId,
                            comId:options.comId,
                            type:'删除用户',
                            detail:`删除用户${options.operator}`,
                            createTime:+new Date()
                        },{transaction:t})
                    })
                }).then(() => {
                    return {
                        code:200,
                        msg:"删除用户成功"
                    }
                }).catch(err => {
                    return {
                        code:-1,
                        msg:"删除用户出错"
                    }
                })
            },
            * getUserInfo(options){
                if(!options || !options.userToken) return {
                    code:-1,
                    msg:'缺少必要字段'
                }
                yield app.model.Company.sync();
                const isExist = yield this.findOne({
                    include:app.model.Company,
                    where:{
                        userToken:{
                            $eq:options.userToken,
                        },
                    }
                })
                if(isExist) return {
                    data:isExist,
                    code:200,
                    msg:'获取用户信息成功',
                }
                return {
                    code:-1,
                    msg:'登录失效'
                }
            },
            * validateUserId(options){
                if(!options || !options.userId) return {
                    code:-1,
                    msg:'缺少必要字段'
                }
                const isExist = yield this.findOne({
                    where:{
                        userId:{
                            $eq:options.userId
                        }
                    }
                })
                if(isExist) return {
                    code:-1,
                    msg:'账号已存在'
                }
                return {
                    code:200,
                    msg:'账号可用'
                }
            }
        }
    })
}