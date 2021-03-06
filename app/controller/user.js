'use strict';

module.exports = app => {
  class UserController extends app.Controller {
    * login() {
      const ctx = this.ctx;
      const user =  yield ctx.model.User.userLogin(ctx.request.body);
      if(user.code == 200){
        var info = user.data.userInfo.dataValues;
        for(var props in info){
          if(props == 'userId' ){
            ctx.cookies.set(`${props}`,encodeURI(`${info[props]}`).toString('base64'),{
              maxAge: 30 * 24 * 3600 * 1000,//cookie有效期为1个月
              httpOnly: false,
            })
          }else if(props == 'comId' || props == 'userToken'){
            ctx.cookies.set(`${props}`,`${info[props]}`,{
              maxAge: 30 * 24 * 3600 * 1000,//cookie有效期为1个月
              httpOnly: false,
            })
          }
        }
        var _role = user.data.userRole.dataValues;
        var role = `${_role['adminAuth']}${_role['valueAuth']}${_role['inventoryAuth']}${_role['supplierAuth']}${_role['demandAuth']}${_role['orderAuth']}${_role['queryAuth']}${_role['crossAuth']}`;
        ctx.cookies.set('userRole',role,{
          maxAge: 30 * 24 * 3600 * 1000,//cookie有效期为1个月
          httpOnly: false,
        })
      }
      ctx.body = user;
    };
    * register() {
		  const ctx = this.ctx;
      const user =  yield ctx.model.User.registeUser(ctx.request.body);
      ctx.body = user;
    };
    * reset() {
      const ctx = this.ctx;
      const userRole = ctx.cookies.get('userRole');
      if(userRole.charAt(0) === '0' && userRole.charAt(7) === '0'){
        ctx.body = {
          code: -1,
          msg: "抱歉，没有权限进行该操作!"
        }
      }else{
        ctx.body = yield ctx.model.User.resetPassword(ctx.request.body);
      }
    };
    * info() {
      const ctx = this.ctx;
      ctx.body = yield ctx.model.User.getUserInfo(ctx.query);
    };
    * validate() {
		  const ctx = this.ctx;
		  ctx.body = yield ctx.model.User.validateUserId(ctx.query);
	  };
    * remove() {
      const ctx = this.ctx;
      ctx.body = yield ctx.model.User.removeUser(ctx.request.body);
    };
    * logout() {
      const ctx = this.ctx;
      ctx.cookies.set('userId',null);
      ctx.cookies.set('comId',null);
      ctx.cookies.set('userToken',null);
      ctx.cookies.set('userRole',null);
      ctx.body = {
        code:200,
        msg:"成功退出登录"
      }
    }
  }
  return UserController;
};
