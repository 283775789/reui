## 代码规范(header)[设计文件](header.pdf)

前台系统中，顶部导航为默认导航，没有特殊原因，左侧导航通常只作为顶部导航的附属出现，不会取代顶部导航

### 应用场景

+ Logo和导航菜单在一栏，适用于一级导航内容较少的前台系统
+ 无导航菜单，适用于门户、多定制的项目（如教育云）、及一级导航内容较多需要拓展的页面

### 组件说明
在前台系统中，头部内容分为两种尺寸：
1. 浏览器大于1200px分辨率时，内容宽度为:1200px
2. 浏览器小于1200px分辨率时，内容宽度为:960px

### 组件演示：带导航
> [引用](../static/lib/twui/modules/layout/header/_header.html)

### 组件演示：不带导航
> [引用](../static/lib/twui/modules/layout/header/_header-nonav.html)

### html代码 

```
{{../static/lib/twui/modules/layout/header/_header.html}}
```

```
{{../static/lib/twui/modules/layout/header/_header-nonav.html}}
```

### scss代码

```
{{../static/lib/twui/modules/layout/header/_header.scss}}
```

### js代码

```
{{code path}}
```

### data属性

| 列标题 | 列标题 | 列标题 |
| ----- | ----- | ----- |
| 内容 | 内容 | 内容 |

### 事件

| 列标题 | 列标题 | 列标题 |
| ----- | ----- | ----- |
| 内容 | 内容 | 内容 |

### 方法

| 列标题 | 列标题 | 列标题 |
| ----- | ----- | ----- |
| 内容 | 内容 | 内容 |