'use strict';

var path = require("path");
module.exports = appInfo => {
  return {
    keys: appInfo.name + '_1492401589170_1020',
    security:{
      csrf:{
        enable: false,
      }
    },
    multipart:{
      fileExtensions: ['.xlsx','.xls'],
    },
    sequelize:{
      dialect: 'mysql',
      database: 'zues',
      host: '116.62.226.140',
      port: '3306',
      username: 'zues',
      password: 'zues@Kx002',
    },
    proxyworker:{
      port: 10086,
    },
    static:{
      prefix: '/public/',
      dir: path.join(appInfo.baseDir, 'app/public'),
      dynamic: true,
      preload: false,
      buffer: false,
    }
  }
}

