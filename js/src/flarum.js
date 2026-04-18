// 这个文件只是一个占位符，它的作用是让 Webpack 在打包时不报错
// 它导出的内容会在运行时被浏览器中真实的全局 flarum 对象覆盖
module.exports = window.flarum || {};