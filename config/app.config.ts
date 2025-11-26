export const appConfig = {
  // 应用基础路径，部署到服务器时修改此配置
  basePath: '/calculate-competition',
  
  // 端口配置
  port: 3000,
  
  // 数据库配置
  database: {
    type: 'sqlite' as const,
    database: 'calculate-competition.db',
    synchronize: true,
    logging: false,
  },
};
