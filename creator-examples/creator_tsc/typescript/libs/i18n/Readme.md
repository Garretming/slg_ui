# i18n 多语言显示插件使用方法

本插件适用于 Cocos Creator v1.0 或更高版本，插件将会在您的项目里添加以下内容：

- `i18n/i18n.js`: 负责本地化文本数据的初始化和运行时提供翻译输出的方法。
- `i18n/polyglot.js`: 来自 airbnb 的 i18n 本地化代码库，查看 https://github.com/airbnb/polyglot.js 来获取完整的文档参考
- `i18n/data/zh.ts`: 中文语言数据模板，您应该在这里添加您的翻译字典
- `i18n/data/en.ts`: 英文语言数据模板，您应该在这里添加您的翻译字典
- `i18n/LabelLocalized.js`: 用这个组件替换原来的 Label，在该组件的 `Text Key` 属性中填入翻译字典中的 key 值，就会在编辑器和运行时显示正确的翻译后文本。

## 工作流程

将插件包解压到你项目的 `assets` 目录下，应该会形成如下的目录结构：

```
assets
  |-i18n
    |-data
    | |-en.ts
    | |-zh.ts
    |-i18n.js
    |-LabelLocalized.js
    |-polyglot.js
    |-Readme.md
```

### 定制本地化数据

接下来您应该首先根据多语言种类的需要，定制 `assets/i18n/data` 目录下的数据源文件，每个文件的格式是这样的：

```js
// zh.ts
module.exports = {
    "HELLO": "你好",
    "WORLD": "世界"
}
```

其中 `HELLO` 是 key，后面的值就是翻译后的文本。这里采用 js 格式定义数据，以便能够被引擎正常引用。


数据的内容是一个标准的 JavaScript Object，因此您可以使用嵌套的结构：

```js
module.exports = {
    'GREETINGS': {
        'HELLO': '您好',
        'WORLD': '世界'
    }
}
```

然后通过 'GREETINGS.HELLO' 形式的 key 来访问。


您可以根据需要制作多份数据源文件，每个数据源文件的文件名就是该语言的标识，如 `fr.js` 的语言标识就是 `fr`，后面我们会介绍如何通过语言标识来切换显示语言。


### 设置场景编辑器的默认显示语言

场景编辑器里显示的语言，是由 `assets/i18n/i18n.js` 里的

```js
const language = require('zh');
```

来控制的，将上述代码中的 `zh` 替换成 `en` 或其他语言标识，就可以更改场景预览时显示的语言。

### 运行时的文本翻译

在代码中，您可以随时调用

```js
var i18n = require('i18n'); // 通常会在脚本最开始调用
i18n.init('zh');// init 的参数就是语言标识，如 'zh', 'en' 等
var myLocalizedText = i18n.t('TEXT_KEY');
```

来通过文本数据源字典里的 key 来获得本地化后的字符串。

#### 文本融合

您可以在数据源中用如下形式的定义：

```js
module.exports = {
    "hello_name": "Hello, %{name}"
}
```

来声明一个可以融合到最终文本里的参数，在使用时：

```js
var greetingText = i18n.t('hello_name', {name: 'nantas'}); // Hello, nantas
```

就可以在输入文本时添加一个参数，来将代码动态获取到的字符串和预设的翻译文本融合。


### 在场景编辑时渲染翻译后的效果

在场景中，我们需要使用 `LabelLocalized` 组件代替原来的 `Label`，`LabelLocalized` 组件比 `Label` 增加了一个属性 `Text Key`，
我们在属性检查器中只要将 `Text Key` 设为字典里的 key 值，`LabelLocalized` 就会在场景中显示出翻译后的文本。

同时 LabelLocalized.string 属性现在变成只读，不能通过这个接口再写入了。