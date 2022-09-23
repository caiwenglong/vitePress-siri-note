import type { Plugin } from 'vite'

// vite 生命周期运行顺序
export const MyExamplePlugin = (): Plugin => {
    return {
      name: 'my-example-plugin',
      // 只执行一次
      options(opt) {
        console.log('options', opt)
        return opt
      },
      buildStart() {
        console.log('start')
      },
      // vite特有的钩子，用来修改默认配置，在进行自定插件的时候会用到
      config(conf) {
        // conf里面包含了vite的一些默认配置，如果要修改这些默认配置
        // 在这个config 中放回一个对象，那么这个对象就会和默认的 config 进行合并覆盖

        console.log('config', conf)

        return {} // 返回的这个对象就会和conf对象进行合并 
      },
      configResolved(id) {
        // vite配置确认
        console.log('configResolved', id)
      },
      configureServer(server) {
        // koa2的中间件模式类似的方式来去做，好像不完全用的是koa2这套东西（后续计划做个mock请求拦截工具）
        // 之前在做mock在网上有一个类似的插件库，可以按照拦截的模式做mock数据
        console.log('configureServer', 'server拦截, 做mock')
      },
      transformIndexHtml(html) {
        console.log('transformIndexHtml')
        return html
      },
      // 每次插件执行后都会去调用的钩子
      resolveId(source) {
        console.log('resolveId')
        return source
      },
      // 加载模块代码
      load(id) {
        console.log('load', id)
        return id
      },
      transform(code, id) {
        console.log('transform')
        return code
      }
    }
  }
  