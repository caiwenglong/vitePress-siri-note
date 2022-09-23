### vite 插件

##### 什么是 vite 插件？

> vite 会在不同的生命周期调用不同的插件来对代码进行处理，以达到不同的目的

我们去写插件其实就是抢在 vite 执行配置文件之前去修改默认的配置文件,比如我们在写**VitePluginAlias**插件的时候
该插件会接受一个 config,这个 config 就是默认的配置文件,我们对这个 config 进行改写并且返回一个新的配置文件
VitePluginAlias:

```ts
import { UserConfig } from "vite";

// vite 别名设置插件
export default () => ({
  name: "VitePluginAlias",
  /**
   *
   * @param config 这边的config 会接收到vite.config.ts里面的配置
   * @param env 环境变量,如果控制台输入的命令是 yarn dev ,
   *            则 command的值为 serve, mode的值为development
   *            如果控制台输入的启动命令为 yarn build ,
   *            则command的值为build, mode的值为production
   */
  config(config: UserConfig, env: { command: string; mode: string }) {
    console.log("config:", config);
    console.log("env:", env);
    return {
        // 改写默认配置的resolve
        resolve: {
            alias: [],
        },
    };
  },
});
```
