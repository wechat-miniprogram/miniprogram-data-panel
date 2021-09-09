# data-panel

## 初衷
可视化展示数据的需求都有很强的共通性：`确定条件 + 获取数据 + 绘制图表`
**确定条件**：用户指定 或者 默认指定 数据日期（昨日、最近7天等）、指定筛选维度（场景、类目、行业等等）、指定数据指标（人数、次数、交易金额等）
**获取数据**：根据指定的条件，向服务端获取数据
**绘制图表**：将数据处理成一定格式，附加上对图表颜色、字体的设置，传入canvas增加数据的可读性

基于此，可以抽象出**数据面板（data-panel）组件**。开发者只需要按协议传入config，data-panel去处理公共逻辑。

总结：`data-panel组件 + config协议 = 可视化数据`



## 已有组件

### 1. 筛选组件
|  组件  | 用途  | 源文件
|  ----  | ----  | 
| date  | 单天 |  src/control/date/date.js
| date-range  | 日期范围 | src/control/date-range/date-range.js
| time-range | 实时范围 | src/control/time-range/time-range.js
| month-range | 月份选择 | src/control/month-range/month-range.js
| dimession(type=button)  | 按钮选择  | src/control/dimension/dimension.js
| dimession(type=picker)  | 下拉框选择  | src/control/dimension/dimension.js

效果图：
![效果图](http://tapd.oa.com/tfl/captures/2021-09/tapd_personalword_1100000000000471677_base64_1631107680_52.png)

### 2.图表

|  组件  | 用途  | 源文件
|  ----  | ----  | 
| card  | 卡片 | src/canvas/card/card.js
| linechart  | 折线图 |  src/canvas/linechart/linechart.js
| piechart  | 环形图|  src/canvas/piechart/piechart.js
| barchart | 柱状图 |  src/canvas/barchart/barchart.js
| fenbuchart | 分布图 |  src/canvas/fenbuchart/fenbuchart.js
| table | 表格 | src/canvas/table/table.js


![效果图](http://tapd.oa.com/tfl/captures/2021-09/tapd_personalword_1100000000000471677_base64_1631107487_88.png)



## 使用方法
1、下载该项目
2、copy dist 文件到对应的项目
3、以自定义组件方式引入组件, 可参考 `wxa-demo/pages/card_demo`
```js
// xxxx-page.json
{
  "usingComponents": {
    "data-panel": "../../dist/data-panel/data-panel"
  }
}
```
4、按config协议编辑config，可参考 `wxa-demo/configs`， 具体文档TODO
```js
// xxxx-page.wxml
<data-panel config="{{cardConfig}}" />
```

## 如何共建
该组件应用于 小程序数据助手等多个项目，精力有限，欢迎大家一起迭代维护

1、下载项目，执行 `tnpm i` 安装依赖
2、编写 `src/` 下组件
3、执行 `tnpm run demo`，可以在小程序开发者工具检验效果 （打开 wxa-demo)
4、执行 `tnpm run build`，生成dist文件


## Config字段解释
`TODO: 还没完善好`

```js
export const config = {
  title: {      // 标题部分
    label: "某个数据板块的标题",
  },
  control: {   // 控制面板部分
    filter: [
      // 过滤条件，根据需求的实际顺序填写
      {
        // alias: 'source',  // getData 时候可识别该字段 -> filters.source 可以获取
        mode: "dimension", // 维度
        style: "picker", // 维度的模式，picker 或者 btn input
        label: "访问来源",
        option: [
          // array类型：固定已知的维度列表
          {
            label: "xxx",
            value: "xxx",
            desc: "",
          },
        ],
        // option(fitlers, renderOption) {  // function类型：通过获取数据接口获取
        //   RequestWxaDimension(filters).then(option => {
        //     renderOption(option)
        //   }).catch(resp => {
        //     renderOption(null)
        //   })
        // },
        listenFilter: ["scene"], // 配置监听字段，默认不指定。当指定监听字段变化，会触发请求option更新
        defaultValue: "", // option[x].value 默认选中某个value
        defalutIndex: 0, // 默认为0
      },
      {
        mode: "date",
        alias: "date", // 标记性字段
        label: "选择日期",
        format: 'yyyy-MM-dd hh:mm', // 展示的格式：YYYY-MM-DD HH:MM:SS
        limit: {
          start: "2019-01-01", // 选择范围
          end: "2019-07-01", // 选择范围
          begin_yesterday: true, // 从昨天开始计算
          last_days: 7, // 指定最近7天，优先级最高
        },
        default: "2019-07-01", // 默认选中时间，默认可选范围的最后一天
      },
      {
        mode: "date-range",
        alias: "daterange", // 标记性字段
        btnOptionsShow: true,
        btnOptions: [
          // 快捷时间切换选项
          { label: "近7天", grain: "day", value: 7, showDateRange: false },
          { label: "近30天", grain: "day", value: 30, showDateRange: false },
          { label: "自定义", grain: "-", value: -1, showDateRange: true },
        ],
        default: {
          btnOptionsIdx: 0, // 默认选中btn，有意义时优先级最高
          startStr: "2019-01-01", // 默认开始时间
          endStr: "2019-01-02", // 默认结束时间
        },
        limit: {
          // start: '2019-01-01',
          // end: '2019-07-01',
          last_days: 90, // 指定最近多少天，自动计算start、end
          begin_yesterday: true, // 从昨天开始计算last_days
        },
      },
    ],
    //  cmpFilter: { // 设置某个条件进行对比 - 尚未支持
    //   option: [{
    //     label: '测试',
    //     selected: 1
    //   }, {
    //     label: '测试2',
    //     selected: 0
    //   }], // 填写具有对比的filter[x].alias
    //   defalutIndex: 0, // 默认为0
    // },
  },
  chart: [
    // 数据可视化展示部分，根据需要设置多个图表
    {
      mode: "card", // 指定什么形式图表
      label: "xxx", // 小标题
      config: {
        // 使用图表的个性化设置：颜色，字体大小
        lineColor: [
          "#00C777",
          "#60acfc",
          "#32d3eb",
          "#5bc49f",
          "#feb64d",
          "#ff7c7c",
          "#9287e7",
        ],
        hasLengend: true,
      },
      getData(filters, renderChart) {
        // 处理数据部分：不写按默认接口协议处理
        console.log("收到数据更新", filters);
        console.log("getOverviewData", filters);
        setTimeout(() => {
          // todo: 数据处理
          const info = { data: {}, status: "succ" };
          renderChart(info);
        }, 100);
      },
    },
    {
      mode: "lineChart", // 第二个图表：折线图形式
      label: "xxx", // 小标题
      config: {}, // 图表的配置问题
    },
  ],
};
```

## 欢迎共建
精力有限，该组件欢迎大家一起维护