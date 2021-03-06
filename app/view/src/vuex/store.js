import Vuex from 'vuex'
import common from './modules/common'
import supplier from './modules/supplier'
import order from './modules/order'
import manager from './modules/manager'


Vue.use(Vuex)


export default new Vuex.Store({
	//组合各个模块
  modules: {
    common,
    supplier,
    order,
    manager
  }
})
