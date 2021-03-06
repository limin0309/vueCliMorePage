const glob = require('glob')
const npmConfigArgv = JSON.parse(process.env.npm_config_argv)
const config = {}
let index = 2 // 自定义参数开始的下标，自定义参数以  --module=projectA 格式传入
const cooked = npmConfigArgv.cooked
const length = npmConfigArgv.cooked.length
while((index += 2) <= length) {
  config[cooked[index - 2]] = cooked[index - 1]
}

let moduleName = config['--module']

function getPages() {
  let entries = {}
  if (process.env.NODE_ENV == 'production') {
    if (!moduleName) {
      console.error('请正确输入要打包的模块名')
      process.exit()
    }
    console.log(`正在打包模块：${moduleName}`)
    entries[moduleName] = {
      // page的入口
      entry: `src/modules/${moduleName}/main.js`,
      // 模板来源
      template: 'public/index.html',
      // 在 dist/index.html 的输出
      filename: 'index.html',
      title: moduleName,
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    }
  } else {
    const modules = glob.sync('./src/modules/*/main.js')
    if (moduleName) {
      if (!modules.includes(`./src/modules/${moduleName}/main.js`)) {
        console.error('请输入正确的模块名')
        process.exit()
      }
      entries[moduleName] = {
        entry: `src/modules/${moduleName}/main.js`,
        filename: 'index.html'
      }
    } else {
      for (let i in modules) {
        let filepath = modules[i]
        let fileList = filepath.split('/');
        let fileName = fileList[fileList.length-2];
        entries[fileName] = {
          entry: `src/modules/${fileName}/main.js`,
          // 模板来源
          template: `public/index.html`,
          // 在 dist/index.html 的输出
          filename: `${fileName}.html`,
          // 提取出来的通用 chunk 和 vendor chunk。
          chunks: ['chunk-vendors', 'chunk-common', fileName]
        }
      }
    }
  }
  return entries
}

module.exports = {
  productionSourceMap: false, // 生产禁止显示源代码
  publicPath: moduleName ? `/${moduleName}` : `/`,
  outputDir: 'dist/' + moduleName,
  pages: getPages()
}