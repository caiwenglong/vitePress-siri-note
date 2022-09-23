### 环境变量
> 环境变量: 会根据当前的代码环境产生不同值的变量就叫做环境变量

### 代码环境

#### 代码环境大致分为以下几种环境:
- 开发环境
- 测试环境
- 生产环境
- 预发布环境
- 灰度环境

### 在vite中的环境变量处理
在vite项目的根目录中一般有以下几个文件: 
> **.env**: 所用环境通用的环境变量

> .env.development: 放着开发环境所用的变量

> .env.production: 放着生产环境所用的变量

vite 本身就集成了dotenv 这个第三方插件，这个插件会去根据环境变量去读取.env 里面定义的变量，如果.env里面定义的变量是以 **VITE_** 开头的，那么这个变量就会被添加到 import.mate.env 里面去。开发人员就能通过**import.mate.env.VITE_** 进行调用，例如：

```ts .env
# 如果环境变量以VITE_开头，那么就说明这个环境变量要暴露给开发人员调用
# vite 内置了dotenv这个第三方库，dotenv会去读取这个文件中的环境变量
# 如果这个变量是以VITE_开头的，那么dotenv会将这个变量注入到import.meta.env
# 那么开发人员就能通过 import.mate.env.VITE_BASE_URL来进行调用
# 如果.env.development 中的变量与.env中的变量名一致，那么会以带环境变量的文件为主
# 即：以.env.development 或者 .env.production文件中的变量为主
VITE_BASE_URL = localhost:8080
PORT：8080  // 没有以 VITE_ 开头，所有这个变量在客户端读取不到
```

```ts .env.development
# 如果环境变量以VITE_开头，那么就说明这个环境变量要暴露给开发人员调用
# vite 内置了dotenv这个第三方库，dotenv会去读取这个文件中的环境变量
# 如果这个变量是以VITE_开头的，那么dotenv会将这个变量注入到import.meta.env
# 那么开发人员就能通过 import.mate.env.VITE_BASE_URL来进行调用
# 如果.env.development 中的变量与.env中的变量名一致，那么会以带环境变量的文件为主
# 即：以.env.development 或者 .env.production文件中的变量为主
VITE_BASE_URL = localhost:8081
```


```ts main.ts
// 使用 yarn dev 启动项目，就代表启动的环境是开发环境，
// 因此vite会去加载.env 和 .env.development 文件中的环境变量
console.log(import.mate.env.VITE_BASE_URL)  // localhost:8081
console.log(import.mate.env.PORT：8081)  // undefined 没有以 VITE_开头 故读取不到这个变量  
```

> 以 VITE_ 开头是vite 默认的，如果要修改这个前缀，可以去使用envPrefix配置

```ts vite.config.ts
export default defineConfig({
    envPrefix: "ENV_", // 将 环境变量的默认前缀改为 ENV_
});
```

> 补充一个小知识: 为什么vite.config.js可以书写成esmodule的形式, 这是因为vite他在读取这个vite.config.js的时候会率先node去解析文件语法, 如果发现你是esmodule规范会直接将你的esmodule规范进行替换变成commonjs规范


