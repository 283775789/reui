## 颜色体系
twui的颜色体系包括品牌色，文本色，边框色三种类型

### 品牌色
<table>
    <thead>
        <tr>
            <th style="text-align:center;">分类</th>
            <th style="text-align:center;">默认颜色</th>
            <th>作用</th>
            <th>应用范围</th>
            <th>推导色</th>
            <th>推导色应用范围</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td rowspan="3" style="text-align:center;">主色</td>
            <td rowspan="3" style="text-align:center;"><i class="twui-color xmain"></i></td>
            <td rowspan="3">品牌定位颜色，突显视觉单元</td>
            <td rowspan="3">头部背景，主按钮，链接色等</td>
            <td>主色-滑过色<br />计算公式:hsl颜色体系中，饱和度增加8%,亮度减少8%</td>
            <td>头部导航滑过，主按钮滑过，链接滑过</td>
        </tr>
        <tr>
            <td>主色-激活色<br />计算公式:hsl颜色体系中，饱和度增加15%,亮度减少15%</td>
            <td>头部导航选中，主按钮选中</td>
        </tr>
        <tr>
            <td>主色-反转色<br />计算公式:手动指定</td>
            <td>头部导航文字颜色，主按钮选文字颜色</td>
        </tr>
        <tr>
            <td rowspan="2" style="text-align:center;">辅色</td>
            <td rowspan="2" style="text-align:center;"><i class="twui-color xminor"></i></td>
            <td rowspan="2">辅助展示</td>
            <td rowspan="2">次要操作按钮，或次要视觉单元背景</td>
            <td>辅色-滑过色<br />计算公式:hsl颜色体系中，饱和度增加8%,亮度减少8%</td>
            <td>次要操作按钮滑过</td>
        </tr>
        <tr>
            <td>辅色-反转色<br />计算公式:手动指定</td>
            <td>次要操作按钮文本色，次要视觉单元文本色</td>
        </tr>
        <tr>
            <td style="text-align:center;">页面背景色</td>
            <td style="text-align:center;"><i class="twui-color xbg"></i></td>
            <td>增加内容区的识别度</td>
            <td>页面背景</td>
            <td>/</td>
            <td>/</td>
        </tr>
        <tr>
            <td style="text-align:center;">错误色</td>
            <td style="text-align:center;"><i class="twui-color xerror"></i></td>
            <td>增强信息识别度</td>
            <td>表单报错或系统警示区域</td>
            <td>/</td>
            <td>/</td>
        </tr>
    </tbody>
</table>

注:响应式断点采用的是bootstrp4的划分方法

### 响应式栅格
参照Bootstrap的12列响应式栅格的基础上，采用了以下栅格布局体系：
1. 等分布局:可将容器平均分成1-12列,适合做相同视觉单元的重复布局；
2. mixin布局：设计师可按响应式理念任意设计布局，前端工程师可采用twui内置的响应式mixin，快速生成响应式布局。

### 编码原则
为了更流畅的编写响应式前端代码，twui响应式体系采用两种方式实现，纯前端项目采用大屏幕优先编码原则，而纯移动端项目或响应式项目，采用移动端优先编码原则。
+ **大屏幕优先**:即样式是默认适配pc屏幕，而后再用media查询实现其它设备的适配；
+ **移动端优先**:即样式默认是适配移动端，而后再用media查询实现其它设备的适配。

**需注意点**：应避免在同一项目中一部份css采用大屏幕优先，一部份css采用移动端优先的方式构建样式。
