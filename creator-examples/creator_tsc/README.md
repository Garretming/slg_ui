# hello-world
Hello world new project template.

## creator 创建项目

## 生成creatorApi提示文件creator.d.ts

## 创建tsconfig.json
tsc --init  
copy tsconfig.json 配置一般不改变

## 全局安装 typings  (国内一般因为被墙，所以改用node的.d.ts,参照下一步))
typings 主要是用来获取.d.ts文件。当typescript使用一个外部JavaScript库时,会须要这个文件，当然好多的编译器都用它来增加智能感知能力。

npm install typings --global
typings install debug --save
typings info env~node --versions
typings install env~node@0.10 --global --save

若果安装不成功，则可以跳过此步骤。直接使用node  安装 node 的 .d.ts 库


## 安装 node 的 .d.ts 库
还是因为是node.js开发，我们要安装node的ts库, 为了强类型，主要还是为了智能感知。
typings install dt~node —global  无效命令
国内的用typings 的时候，而且就会抽风，好久都完成不了，不要紧，Ctrl+C掉了，再执行，多试几次，总会有成功的时候的。
typings 现在已经不推荐使用了。现在都用npm来弄。
npm install @types/node --dev-save