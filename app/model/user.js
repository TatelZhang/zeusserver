'use strict';
var uuid = require('uuid');

module.exports = app => {
    const { STRING, INTEGER, DATE, UUID } = app.Sequelize;

    return app.model.define('User',{
        userToken: {
            type: UUID,
            comment:"验证用户登录的凭证"
        },
        userId: {
            type: STRING,
            primaryKey: true,
            allowNull:false,
            comment:"用户Id(主键)"
        },
        comId: {
            type: STRING,
            comment:"公司编号(关联公司信息)"
        },
        password: {
            type: STRING,
            allowNull:false,
            comment:"密码"
        },
        userName: {
            type: STRING,
            comment:"用户名(昵称)"
        },
        registerTime: {
            type: STRING,
            comment:"注册时间"
        },
        lastLoginTime: {
            type: STRING,
            comment:"上次登录时间"
        }
    },{
        freezeTabName:true,
		tableName:"user_info",
		timestamps:false,
        classMethods:{
            * registeUser(options){
                yield this.sync();
                if(!options || !options.userId) return {
                    code:-1,
                    msg:'缺少必要字段'
                }
                var isExist = yield this.findOne({
                    where:{
                        userId:{
                            $eq:options.userId
                        }
                    }
                });
                if(isExist) return {
                    code:-1,
                    message:"账号已存在"
                }
                var extendFiled = {
                    registerTime: +new Date(),
                    lastLoginTime: +new Date(),
                    userToken: uuid.v4(),
                };
                var result = yield this.create(Object.assign(options,extendFiled));
                return {
                    data:result,
                    code:200,
                    meg:'注册成功',
                }
            },
            * userLogin(options){
                yield this.sync();
                if(!options || !options.userId || !options.password) return {
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
                        }
                    }
                });
                if(!isExist) return {
                    code:-1,
                    msg:'用户名或密码错误'
                }
                isExist.userToken = uuid.v4();
                isExist.lastLoginTime = new Date().getTime();
                isExist.save();
                return {
                    data:isExist,
                    code:200,
                    msg:'登录成功',
                }
            },
            * getUserInfo(options){
                yield this.sync();
                if(!options || !options.userToken) return {
                    code:-1,
                    msg:'缺少必要字段'
                }
                const isExist = yield this.findOne({
                    where:{
                        userToken:{
                            $eq:options.userToken,
                        }
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
                yield this.sync();
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