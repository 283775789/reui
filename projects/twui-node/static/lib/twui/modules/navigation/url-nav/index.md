## URL导航
根据当前浏览器地址栏的URL选择当前激活的导航项。

### 应用场景

+ SPA应用
+ 导航项与URL强相关的应用
+ 后台不实现导航项激活逻辑的应用

### 组件说明

1. 交互触发器class:`jst-urlnav`
2. 触发导航行为的元素应为`a`元素,且具有`href`值或`data-url-keyword`值之一
3. 因为存在ajax请求数据动态生成URL导航的情况，组件本身不自动触发激活行为，需内容渲染完成后手动调用`$(selector).twui('activate')`方法触发交互。

### 组件演示
见本页头部导航与侧边栏导航

### html代码

```
{{/static/lib/twui/modules/navigation/url-nav/_url-nav.html}}
```

### js代码

```
{{/static/lib/twui/modules/navigation/url-nav/_url-nav.js}}
```

### 组件data属性

| 属性名 | 描述 | 值 | 默认值 |
| ----- | ----- | ----- |
| data-index | 匹配href时，当存在多级导航(如本页的头部导航)，父级导航在子级页面打开时也应该处于激活状态,而父级导航的href一般关联的是第一个子页面，这时需要使用`data-back`来指定URL路径的返回层级数，如`href="http://ui.twui.com/web/code/spec"`,当`data-back="1"`时,实际的匹配值为`href="http://ui.twui.com/web/code/` | number | 0 |

### 导航元素data属性

| 属性名 | 描述 | 值 |
| ----- | ----- | ----- |
| data-url-keyword | 可在子导航元素上指定该值用关键字来匹配URL，该值的匹配优先级大于href | string |

### 方法

| 方法名 | 描述 | 参数 |
| ----- | ----- | ----- |
| activate | 触发激活导航项的交互脚本 | none |