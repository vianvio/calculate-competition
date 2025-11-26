# 数学口算练习应用 - 部署指南

## 应用概述
这是一个为小学生设计的数学口算练习应用，支持：
- 📝 每日练习模式（加减乘除）
- 🏆 双人对抗竞速模式
- 📅 练习日历追踪
- 📊 统计分析
- 👥 多用户管理

## 技术栈
- **后端**: NestJS + TypeORM + SQLite
- **前端**: EJS模板 + 原生JavaScript
- **样式**: CSS Grid/Flexbox，iPad优化

## 本地开发

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run start:dev
```

访问: http://localhost:3000/calculate-competition

### 生产构建
```bash
npm run build
npm run start:prod
```

## 部署到服务器

### 1. 配置基础路径

当应用部署到服务器的子路径时（如 `/calculate-competition`），基础路径已经预配置好了：

**已配置的文件：**
- ✅ `src/main.ts` - NestJS全局路由前缀
- ✅ `public/js/main.js` - API调用基础路径
- ✅ `views/*.ejs` - 所有页面链接
- ✅ `public/js/*.js` - 所有页面跳转

### 2. 如果需要修改基础路径

如果需要部署到不同的路径（如 `/math-app`），修改以下位置：

#### 2.1 修改后端配置
编辑 `src/main.ts`:
```typescript
// 修改这一行的路径
app.setGlobalPrefix('your-new-path');

// 修改静态资源前缀
app.useStaticAssets(join(__dirname, '..', 'public'), {
  prefix: '/your-new-path/',
});
```

#### 2.2 修改前端配置
编辑 `public/js/main.js`:
```javascript
// 修改基础路径常量
const BASE_PATH = '/your-new-path';
```

#### 2.3 批量更新视图文件
```bash
# 更新所有EJS模板中的链接
find views -name "*.ejs" -type f -exec sed -i '' 's|/calculate-competition|/your-new-path|g' {} \;

# 更新所有JavaScript文件中的链接
find public/js -name "*.js" -type f -exec sed -i '' 's|/calculate-competition|/your-new-path|g' {} \;
```

### 3. 使用Nginx反向代理

#### 示例Nginx配置
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 代理到NestJS应用
    location /calculate-competition/ {
        proxy_pass http://localhost:3000/calculate-competition/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. 使用PM2管理进程

#### 安装PM2
```bash
npm install -g pm2
```

#### 启动应用
```bash
npm run build
pm2 start dist/main.js --name calculate-competition
```

#### PM2常用命令
```bash
pm2 status                    # 查看状态
pm2 logs calculate-competition # 查看日志
pm2 restart calculate-competition # 重启
pm2 stop calculate-competition    # 停止
pm2 delete calculate-competition  # 删除
```

#### 开机自启动
```bash
pm2 startup
pm2 save
```

### 5. 数据库位置

SQLite数据库文件位置：`calculate-competition.db`

**备份数据库：**
```bash
cp calculate-competition.db calculate-competition.db.backup
```

## 项目结构

```
calculate-competition/
├── src/                      # 后端源代码
│   ├── users/               # 用户模块
│   ├── practice/            # 练习模块
│   ├── competition/         # 竞速模块
│   ├── app.controller.ts    # 路由控制器
│   └── main.ts             # 应用入口
├── views/                   # EJS模板
│   ├── index.ejs           # 首页/用户选择
│   ├── practice.ejs        # 练习页面
│   ├── competition-play.ejs # 竞速页面
│   ├── calendar.ejs        # 日历页面
│   ├── stats.ejs           # 统计页面
│   └── ...
├── public/                  # 静态资源
│   ├── css/
│   │   ├── style.css       # 主样式表
│   │   └── competition.css # 竞速模式样式
│   └── js/
│       ├── main.js         # 公共函数
│       ├── practice.js     # 练习逻辑
│       ├── competition-play.js # 竞速逻辑
│       └── ...
└── calculate-competition.db # SQLite数据库
```

## 功能特性

### 日常练习模式
- ✅ 四则运算（加减乘除）
- ✅ 可选带余数的除法
- ✅ 自定义题目数量（5-100题）
- ✅ 可选时间限制（1-60分钟）
- ✅ 实时统计正确率
- ✅ 数字输入支持从左往右/从右往左
- ✅ 触摸友好的虚拟键盘
- ✅ 完美达成特殊标记（100%正确率）

### 对抗竞速模式
- ✅ 双人同时答题
- ✅ 准确模式：同题竞速，答对进入下一题
- ✅ 速度模式：独立题目，快速连续答题
- ✅ 实时得分显示
- ✅ 每个玩家独立的虚拟键盘
- ✅ 支持除法余数输入

### 统计与追踪
- ✅ 每日练习日历视图
- ✅ 完美记录标记（⭐）
- ✅ 总练习次数统计
- ✅ 总正确题数统计
- ✅ 总平均正确率
- ✅ 最高连续正确
- ✅ 对抗记录列表

## 常见问题

### Q: 如何重置数据库？
```bash
rm calculate-competition.db
npm run start:dev  # 重启应用会自动创建新数据库
```

### Q: 如何修改端口号？
编辑 `src/main.ts`，修改 `app.listen(3000)` 中的端口号。

### Q: 静态资源404错误？
确保 `src/main.ts` 中的静态资源前缀与全局路由前缀一致。

### Q: 页面链接跳转错误？
检查 `public/js/main.js` 中的 `BASE_PATH` 常量是否正确。

## 许可证
MIT

## 作者
Vian

## 更新日志

### v1.0.0 (2025-01-27)
- ✅ 初始版本发布
- ✅ 完整的练习和竞速功能
- ✅ iPad优化界面
- ✅ 支持子路径部署
