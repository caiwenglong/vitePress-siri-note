# vite 生命周期

## 在开发中,Vite 开发服务器会创建一个插件容器来调用 **Rollup 构建钩子**,以下的钩子和 rollup 一样

##### 以下钩子会在服务器启动的时候被调用:

- option
- buildStart

##### 以下钩子会在每个传入模块请求时被调用：

- resolveID
- load
- transform

##### 以下钩子会在服务器关闭的时候被调用:

- buildEnd
- closeBundle

> 请注意 moduleParsed 钩子在开发中是 不会 被调用的，因为 Vite 为了性能会避免完整的 AST 解析。
> Output Generation Hooks（除了 closeBundle) 在开发中是 不会 被调用的。你可以认为 Vite 的开发服务器只调用了 rollup.rollup() 而没有调用 bundle.generate()。

#### 以下的钩子是 vite 独有的

1. `config` : **在解析 vite 配置前调用,因此它可以用来改写默认配置**
   1. 它的类型是: `(config: UserConfig, env: {mode: string, command: string}) => UserConfig | null | void`
   2. 它会接收 `vite.config.ts` 中的 `defineConfig` 的配置,然后会通过类似于 Object.assign()的方式将原始的配置和用户的通过插件的配置进行合并,并返回合并后的对象返回
   3. **示例:**

```shell terminal
    yarn dev
```

在 `vite.config.ts` 配置文件中, 有如下配置:

```ts vite.config.ts
import { defineConfig } from "vite";
// 插件
import VitePluginMock from "./plugins/VitePluginMock";
import VitePluginAlias from "./plugins/VitePluginAlias";

export default defineConfig({
  envPrefix: "VITE_",
  plugins: [
    VitePluginMock(), // 自定义的mock插件
    VitePluginAlias(),
  ], // 自定义的alias插件
});
```

在自定义插件 `VitePluginAlias` 中:

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
    console.log("config", config); // 输出的结果如下所示
    console.log("env", env);
    return {
      resolve: {
        alias: [],
      },
    };
  },
});
```

输出的结果:

```json

config: {
  envPrefix: 'VITE_',
  plugins: [
    {
      name: 'config-server',
      configureServer: [Function: configureServer]
    },
    { name: 'VitePluginAlias', config: [Function: config] }
  ],
  optimizeDeps: { force: undefined },
  server: {}
}
env: { mode: 'development', command: 'serve', ssrBuild: false }

```

> 注意用户插件在运行这个钩子之前会被解析，因此在 config 钩子中注入其他插件不会有任何效果。

2. `configResolved`: **在解析 Vite 配置后调用**, 使用这个钩子读取和存储最终解析的配置。当插件需要根据运行的命令做一些不同的事情时，它也很有用。

3. `configureServer`: **是用于配置开发服务器的钩子**
   直接上示例: 自定义 mock 插件

```ts
import { ViteDevServer } from "vite";

const fs = require("fs");
const path = require("path");

/**
 * 这个插件主要做的事情是拦截http请求
 * 当我们使用fetch 或者axios去请求服务器数据时拦截请求数据
 * 当使用的是开发环境时，axios 的baseURL一般会被设置为 /
 * 这时请求就会发给本电脑的开发服务器，这时这个请求就会被viteServer服务器接管
 *
 */
export default () => ({
  name: "config-server",
  configureServer(server: ViteDevServer) {
    // 同步读取文件
    const mockStat = fs.statSync("mock");

    // 读取的这个文件是否是一个文件夹
    const isDirectory = mockStat.isDirectory();

    let mockResult = [];
    if (isDirectory) {
      // process.cwd() ---> 获取你当前的执行根目录
      mockResult = require(path.resolve(process.cwd(), "mock/index.ts"));
    }

    /**
     * 当浏览器地址栏敲击回车的时候,就会进入到这边来
     * @params req: 用户发过来的请求，包括请求头、请求体 请求路径等诸多信息
     * @params res: 响应对象，
     * @params next: 是否交给下一个中间件
     */
    server.middlewares.use((req, res, next) => {
      // 拦截请求并自定义请求处理...

      const reqUrl = req.url; // 获取浏览器请求的地址

      // 获取跟浏览器请求URL匹配的的数据
      const matchItem = mockResult.find((mockDescriptor) => {
        return mockDescriptor.url === reqUrl;
      });

      if (matchItem) {
        const responseData = matchItem.response(req);
        // 强制设置一下他的请求头的格式为json
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(responseData)); // 设置请求头 异步的
      } else {
        next();
      }
    });
  },
});
```

4. `configurePreviewServer`:
   1. 类型: `(server: { middlewares: Connect.Server, httpServer: http.Server }) => (() => void) | void | Promise<(() => void) | void>`
   2. 与 configureServer 相同但是作为预览服务器。。它提供了一个 connect 服务器实例及其底层的 http server。与 configureServer 类似，configurePreviewServer 这个钩子也是在其他中间件安装前被调用的。如果你想要在其他中间件 之后 安装一个插件，你可以从 configurePreviewServer 返回一个函数，它将会在内部中间件被安装之后再调用：

```ts
const myPlugin = () => ({
  name: "configure-preview-server",
  configurePreviewServer(server) {
    //  会在其他中间件安装完成前调用
    server.middlewares.use((req, res, next) => {
      // 自定义处理请求 ...
    });
  },
});

const myPlugin = () => ({
  name: "configure-preview-server",
  configurePreviewServer(server) {
    // 返回一个钩子，会在其他中间件安装完成后调用
    return () => {
      server.middlewares.use((req, res, next) => {
        // 自定义处理请求 ...
      });
    };
  },
});
```

5. `transformIndexHtml`:
   1. 类型: `IndexHtmlTransformHook | { enforce?: 'pre' | 'post', transform: IndexHtmlTransformHook }`
   2. 转换 index.html 的专用钩子。

**示例:** 将 html 文件中的 title 替换成 `vite 测试`
`index.html`文件内容如下:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- 目的要替换 -->
    <title><%= title %></title>
    <script src="./main.js" type="module"></script>
  </head>

  <body>
    <div id="app">APP</div>
  </body>
</html>
```

`vite.config.ts`

```ts
import { defineConfig } from "vite";
// 插件
import VitePluginMock from "./plugins/VitePluginMock";
import VitePluginAlias from "./plugins/VitePluginAlias";
import { htmlPlugin } from "./plugins/VitePluginIndexHtml";

export default defineConfig({
  envPrefix: "VITE_",
  plugins: [
    VitePluginMock(), // 自定义的mock插件
    VitePluginAlias(), // 自定义的alias插件
    htmlPlugin({
      inject: {
        data: {
          title: "vite 测试", // title文本
        },
      },
    }),
  ],
});
```

`VitePluginIndexHtml.ts`

```ts
export const htmlPlugin = (options) => {
  return {
    name: "html-transform",
    /**
     *
     * @param html 返回index.html内容
     * @param ctx 上下文
     * @returns 返会修改后的html内容
     */
    transformIndexHtml: (html, ctx) => {
      // 将<%= title %> 全部替换成设置在vite.config.ts中设置的内容
      let newHtml = html.replace(/<%= title %>/g, options.inject.data.title);
      return newHtml;
    },
  };
};
```

### 插件的执行顺序

> 一个 Vite 插件可以额外指定一个 enforce 属性,enforce 的值可以是 pre 或 post

1. Alias
2. 带有 enforce: 'pre' 的用户插件
3. Vite 核心插件
4. 没有 enforce 值的用户插件
5. Vite 构建用的插件
6. 带有 enforce: 'post' 的用户插件
7. Vite 后置构建插件（最小化，manifest，报告）
