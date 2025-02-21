# 第09章—组件实战：Calendar日历组件（下）

﻿基本的布局完成了，我们来添加一些参数：

![](./images/c65e20f3f2d058446c97b0139fc171d3.png )

```javascript
export interface CalendarProps {
    value: Dayjs;
    style?: CSSProperties;
    className?: string | string[];
    // 定制日期显示，会完全覆盖日期单元格
    dateRender?: (currentDate: Dayjs) => ReactNode;
    // 定制日期单元格，内容会被添加到单元格内，只在全屏日历模式下生效。
    dateInnerContent?: (currentDate: Dayjs) => ReactNode;
    // 国际化相关
    locale?: string;
    onChange?: (date: Dayjs) => void;
}
```

style 和 className 用于修改 Calendar 组件外层容器的样式。

内部的布局我们都是用的 flex，所以只要外层容器的样式变了，内部的布局会自动适应。

dateRender 是用来定制日期单元格显示的内容的。

比如加一些日程安排，加一些农历或者节日信息：

![](./images/6e2082e7659642a4885e53ce8bcfaafd.png )

![](./images/048cd10e6316e32a0cadf61da1655f0d.png )

dateRender 是整个覆盖，连带日期的数字一起，而 dateInnerContent 只会在日期的数字下添加一些内容。

这两个 props 是不一样的。

locale 是用于国际化的，比如切换到中文显示或者是英文显示。

onChange 是当选择了日期之后会触发的回调。

然后实现下这些参数对应的逻辑。

首先是 className 和 style：

![](./images/64a0541427340b461f1ce1eeb0027412.png )

```javascript
function Calendar(props: CalendarProps) {

    const {
        value,
        style,
        className,
    } = props;

    const classNames = cs("calendar", className);

    return <div className={classNames} style={style}>
        <Header></Header>
        <MonthCalendar {...props}/>
    </div>
}
```
这里用 classnames 这个包来做 className 的合并。

```
npm install classnames
```
它可以传入对象或者数组，会自动合并，返回最终的 className：

![](./images/4d4e72168b50f5b7429365fcd02c8d3d.png )

![](./images/149debaa0bcd9af14520a1c6b7843248.png )

当 className 的确定需要一段复杂计算逻辑的时候，就用 classname 这个包。

测试下：

![](./images/57672471e79d6db99336f29604d68987.png )

```javascript
import dayjs from 'dayjs';
import Calendar from './Calendar';

function App() {
  return (
    <div className="App">
      <Calendar value={dayjs('2023-11-08')} className={'aaa'} style={{background: 'yellow'}}></Calendar>
    </div>
  );
}

export default App;

```

![](./images/7fdca22cd7f608b4cca84c6e0e50779f.png )

![](./images/b0b1c6e5f5126f6abf8507bab06c9929.png )

className 和 style 的处理没问题。

然后我们处理下一个 props： dateRender 和 dateInnerContent。

在 MonthCalendar 里把它取出来，传入到 renderDays 方法里：

![](./images/d4e6e9b40cdc619f010db3c5da564ad9.png )

```javascript
const {
    dateRender,
    dateInnerContent
} = props;
```
```javascript
renderDays(allDays, dateRender, dateInnerContent)
```
dateRender 的处理也很简单，就是把渲染日期的逻辑换一下：

![](./images/30e93816e5d28e432c4e37266f4fc7f6.png )

在 App.tsx 里传入 dateRender 参数：

![](./images/72ef36ed4b9092ca86fca1fed3f49a76.png )

```javascript
import dayjs from 'dayjs';
import Calendar from './Calendar';

function App() {
  return (
    <div className="App">
      <Calendar value={dayjs('2023-11-08')} dateRender={(value) => {
        return <div>
          <p style={{background: 'yellowgreen', height: '50px'}}>{value.format('YYYY/MM/DD')}</p>
        </div>
      }}></Calendar>
    </div>
  );
}

export default App;
```
这样，渲染的内容就换成自定义的了：

![](./images/3fb6badff7e4b1a7785ddadf08b434b1.png )

不过现在我们没有做内容溢出时的处理：

![](./images/cd5e2e3f1aa5107ff3664f57e137863f.png )

![](./images/f271430dda8b4aa6e6b6a1855bb99999.png )

加个 overflow: hidden 就好了：

![](./images/61a1586f45ab705007035e6a6593036d.png )

![](./images/1983332f1c06ee5814ae4512e2a3c6d1.png )
而且之前加 padding 的位置也不对。

改一下渲染日期的逻辑，如果传了 dateRender 那就整个覆盖日期单元格，否则就是只在下面渲染 dateInnerContent 的内容：

![](./images/961ec0e6f2fc68f5c988eb1508a69585.png )

```javascript
function renderDays(
    days: Array<{ date: Dayjs, currentMonth: boolean}>,
    dateRender: MonthCalendarProps['dateRender'],
    dateInnerContent:  MonthCalendarProps['dateInnerContent']
) {
    const rows = [];
    for(let i = 0; i < 6; i++ ) {
        const row = [];
        for(let j = 0; j < 7; j++) {
            const item = days[i * 7 + j];
            row[j] = <div className={
                "calendar-month-body-cell " + (item.currentMonth ? 'calendar-month-body-cell-current' : '')
            }>
                {
                    dateRender ? dateRender(item.date) : (
                        <div className="calendar-month-body-cell-date">
                            <div className="calendar-month-body-cell-date-value">{item.date.date()}</div>
                            <div className="calendar-month-body-cell-date-content">{dateInnerContent?.(item.date)}</div>
                        </div>
                    )
                }
            </div>
        }
        rows.push(row);
    }
    return rows.map(row => <div className="calendar-month-body-row">{row}</div>)
}
```
改下对应的样式：

![](./images/822c4970d5b520b41979a7f1b0a4f406.png )

把加 padding 的位置改为内部的元素。

测试下：

![](./images/995287f6ce2ca0511807dff040c4a5ad.png )

```javascript
import dayjs from 'dayjs';
import Calendar from './Calendar';

function App() {
  return (
    <div className="App">
      <Calendar value={dayjs('2023-11-08')} dateInnerContent={(value) => {
        return <div>
          <p style={{background: 'yellowgreen', height: '30px'}}>{value.format('YYYY/MM/DD')}</p>
        </div>
      }}></Calendar>
    </div>
  );
}

export default App;
```

![](./images/5605d5519c3c799b409a5c37d54b75f9.png )

这样，dateRender 和 dateInnerContent 的逻辑就完成了。

接下来做国际化，也就是 locale 参数的处理。

国际化就是可以让日历支持中文、英文、日文等，其实也很简单，就是把写死的文案换成按照 key 从配置中取的文案就行了。

定义下用到的 ts 类型 src/Calendar/locale/interface.ts

```javascript
export interface CalendarType {
    formatYear: string;
    formatMonth: string;
    today: string;
    month: {
        January: string;
        February: string;
        March: string;
        April: string;
        May: string;
        June: string;
        July: string;
        August: string;       
        September: string;
        October: string;
        November: string;
        December: string;
    } & Record<string, any>;
    week: {
        monday: string;
        tuesday: string;
        wednesday: string;
        thursday: string;
        friday: string;
        saturday: string;
        sunday: string;
    } & Record<string, any>
}
```
然后分别定义中文和英文的配置：

src/Calendar/locale/zh-CN.ts

```javascript
import { CalendarType } from "./interface";

const CalendarLocale: CalendarType = {
    formatYear: 'YYYY 年',
    formatMonth: 'YYYY 年 MM 月',
    today: '今天',
    month: {
        January: '一月',
        February: '二月',
        March: '三月',
        April: '四月',
        May: '五月',
        June: '六月',
        July: '七月',
        August: '八月',
        September: '九月',
        October: '十月',
        November: '十一月',
        December: '十二月',
    },
    week: {
        monday: '周一',
        tuesday: '周二',
        wednesday: '周三',
        thursday: '周四',
        friday: '周五',
        saturday: '周六',
        sunday: '周日',
    }
}

export default CalendarLocale;
```

src/Calendar/locale/zh-CN.ts

把会用到的文案列出来。

然后再写个英文版：

src/Calendar/locale/en-US.ts

```javascript
import { CalendarType } from "./interface";

const CalendarLocale: CalendarType = {
    formatYear: 'YYYY',
    formatMonth: 'MMM YYYY',
    today: 'Today',
    month: {
        January: 'January',
        February: 'February',
        March: 'March',
        April: 'April',
        May: 'May',
        June: 'June',
        July: 'July',
        August: 'August',
        September: 'September',
        October: 'October',
        November: 'November',
        December: 'December',
    },
    week: {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday',
    },
}

export default CalendarLocale;
```

我们先把上面的周一到周日的文案替换了：

![](./images/0507ef1e4db2a28d048ee68903745bd6.png )

在 MonthCalendar 引入中文的资源包：

![](./images/e588594aa3010cc7623acc0fe40300d4.png )

然后把之前写死的文案，改成按照 key 从资源包中取值的方式：

![](./images/be8e09c88f06f1ebceb709de19086509.png )

```javascript
function MonthCalendar(props: MonthCalendarProps) {

    const {
        dateRender,
        dateInnerContent
    } = props;

    const weekList = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

    const allDays = getAllDays(props.value);

    return <div className="calendar-month">
        <div className="calendar-month-week-list">
            {weekList.map((week) => (
                <div className="calendar-month-week-list-item" key={week}>
                    {CalendarLocale.week[week]}
                </div>
            ))}
        </div>
        <div className="calendar-month-body">
            {
                renderDays(allDays, dateRender, dateInnerContent)
            }
        </div>
    </div>
}
```

现在渲染出来的是这样的：

![](./images/38bb161b9157d7928a4801f0c88e5856.png )

只要改一下用的资源包：

![](./images/2bf357d7bd762efdd88c9ef56bf841bf.png )

文案就变了：

![](./images/afb3e1a21896e3e9fc527744e1bbd43c.png )

这就是国际化。

当然，现在我们是手动切换的资源包，其实应该是全局统一配置的。

这个可以通过 context 来做：

新建 src/Calendar/LocaleContext.tsx

```javascript
import { createContext } from "react";

export interface LocaleContextType {
    locale: string;
}

const LocaleContext = createContext<LocaleContextType>({
    locale: 'zh-CN'
});

export default LocaleContext;
```
然后在 Calendar 组件里用 provider 修改 context 的值：

![](./images/ef1966adf2e5a4c60366fed9c05a265a.png )

如果传入了参数，就用指定的 locale，否则，就从浏览器取当前语言：

![](./images/0140d1edf1a2edba87646f2c65854fea.png )

加一个国际化资源包的入口：

src/Calendar/locale/index.ts

```javascript
import zhCN from "./zh-CN";
import enUS from "./en-US";
import { CalendarType } from "./interface";

const allLocales: Record<string, CalendarType>= {
    'zh-CN': zhCN,
    'en-US': enUS
}

export default allLocales;
```
把 MonthCalendar 组件的 locale 改成从 context 获取的：

![](./images/d153936f2d0a510b62ea3111d7260b36.png )

```javascript
const localeContext = useContext(LocaleContext);

const CalendarLocale = allLocales[localeContext.locale];
```

这样，当不指定 locale 时，就会按照浏览器的语言来设置：

![](./images/40eca7af45e914a48d5b05d10d7b6527.png )

当指定 locale 时，就会切换为指定语言的资源包：

![](./images/f5661d104bd3e81d110e02eb5fef4344.png )

![](./images/14bd6648e44b50a285844e648f04c8ea.png )

接下来，我们实现 value 和 onChange 参数的逻辑。

在 MonthCalendar 里取出 value 参数，传入 renderDays 方法：

![](./images/79a46a46a40efeff094c2ac0e2f3e177.png )

用 classnames 的 api 来拼接 className，如果是当前日期，就加一个 xxx-selected 的 className：

![](./images/fad5b22cff8003bdb5a21f6049b41e77.png )

```javascript
function renderDays(
    days: Array<{ date: Dayjs, currentMonth: boolean}>,
    dateRender: MonthCalendarProps['dateRender'],
    dateInnerContent:  MonthCalendarProps['dateInnerContent'],
    value: Dayjs
) {
    const rows = [];
    for(let i = 0; i < 6; i++ ) {
        const row = [];
        for(let j = 0; j < 7; j++) {
            const item = days[i * 7 + j];
            row[j] = <div className={
                "calendar-month-body-cell " + (item.currentMonth ? 'calendar-month-body-cell-current' : '')
            }
            >
                {
                    dateRender ? dateRender(item.date) : (
                        <div className="calendar-month-body-cell-date">
                            <div className={
                                cs("calendar-month-body-cell-date-value",
                                    value.format('YYYY-MM-DD') === item.date.format('YYYY-MM-DD')
                                        ? "calendar-month-body-cell-date-selected"
                                        : ""
                                )
                            }>{item.date.date()}</div>
                            <div className="calendar-month-cell-body-date-content">{dateInnerContent?.(item.date)}</div>
                        </div>
                    )
                }
            </div>
        }
        rows.push(row);
    }
    return rows.map(row => <div className="calendar-month-body-row">{row}</div>)
}
```
添加对应的样式：

![](./images/7cf248e5f998a3b58353dc657dec5d80.png )

```css
&-selected {
    background: blue;
    width: 28px;
    height: 28px;
    line-height: 28px;
    text-align: center;
    color: #fff;
    border-radius: 50%;
    cursor: pointer;
}
```
现在渲染出来是这样的：

![](./images/02692c9280c3a8c6cd6364a64d76219b.png )

然后我们加上点击的处理：

![](./images/c256cf5c5f3f9083fa941894c2da16e0.png )

```javascript
interface MonthCalendarProps extends CalendarProps {
    selectHandler?: (date: Dayjs) => void
}
```
添加一个 selectHandler 的参数，传给 renderDays 方法。

![](./images/99f733eb7d7e67ef07b20e295b4a4625.png )

renderDays 方法里取出来，给日期添加上点击事件：

![](./images/d40bddd31e6930cd3bba54693bba0bf7.png )

```javascript
function renderDays(
    days: Array<{ date: Dayjs, currentMonth: boolean}>,
    dateRender: MonthCalendarProps['dateRender'],
    dateInnerContent:  MonthCalendarProps['dateInnerContent'],
    value: Dayjs,
    selectHandler: MonthCalendarProps['selectHandler']
) {
    const rows = [];
    for(let i = 0; i < 6; i++ ) {
        const row = [];
        for(let j = 0; j < 7; j++) {
            const item = days[i * 7 + j];
            row[j] = <div className={
                "calendar-month-body-cell " + (item.currentMonth ? 'calendar-month-body-cell-current' : '')
            }
                onClick={() => selectHandler?.(item.date)}
            >
                {
                    dateRender ? dateRender(item.date) : (
                        <div className="calendar-month-body-cell-date">
                            <div className={
                                cs("calendar-month-body-cell-date-value",
                                    value.format('YYYY-MM-DD') === item.date.format('YYYY-MM-DD')
                                        ? "calendar-month-body-cell-date-selected"
                                        : ""
                                )
                            }>{item.date.date()}</div>
                            <div className="calendar-month-cell-body-date-content">{dateInnerContent?.(item.date)}</div>
                        </div>
                    )
                }
            </div>
        }
        rows.push(row);
    }
    return rows.map(row => <div className="calendar-month-body-row">{row}</div>)
}
```
然后这个参数是在 Calendar 组件传进来的：

![](./images/04cceefc5ea57ae7120e438126936a9f.png )

我们添加一个 state 来存储当前日期，selectHandler 里调用 onChange 的参数，并且修改当前日期。

```javascript
function Calendar(props: CalendarProps) {

    const {
        value,
        style,
        className,
        dateRender,
        dateInnerContent,
        locale,
        onChange
    } = props;

    const [curValue, setCurValue] = useState<Dayjs>(value);

    const classNames = cs("calendar", className);
        
    function selectHandler(date: Dayjs) {
        setCurValue(date);
        onChange?.(date);
    }

    return <LocaleContext.Provider value={{
        locale: locale || navigator.language
    }}>
        <div className={classNames} style={style}>
            <Header></Header>
            <MonthCalendar {...props} value={curValue} selectHandler={selectHandler}/>
        </div>
    </LocaleContext.Provider>
}
```
试一下，改下 App.tsx：

```javascript
import dayjs from 'dayjs';
import Calendar from './Calendar';

function App() {
  return (
    <div className="App">
      <Calendar value={dayjs('2023-11-08')} onChange={(date) => {
          alert(date.format('YYYY-MM-DD'));
      }}></Calendar>
    </div>
  );
}

export default App;
```

![](./images/cd548488a759bf98c743563abeb059a2.gif )

然后实现下 Header 组件里的日期切换：

![](./images/8f71f3e8009bce3b97a041a0cf8cb374.png )

根据传入的 value 来展示日期，点击上下按钮的时候会调用传进来的回调函数：

```javascript
import { Dayjs } from "dayjs";
interface HeaderProps {
    curMonth: Dayjs;
    prevMonthHandler: () => void;
    nextMonthHandler: () => void;
}
function Header(props: HeaderProps) {

    const {
        curMonth,
        prevMonthHandler,
        nextMonthHandler
    } = props;

    return <div className="calendar-header">
        <div className="calendar-header-left">
            <div className="calendar-header-icon" onClick={prevMonthHandler}>&lt;</div>
            <div className="calendar-header-value">{curMonth.format('YYYY 年 MM 月')}</div>
            <div className="calendar-header-icon" onClick={nextMonthHandler}>&gt;</div>
            <button className="calendar-header-btn">今天</button>
        </div>
    </div>
}

export default Header;
```

然后在 Calendar 组件创建 curMonth 的 state，点击上下按钮的时候，修改月份：

![](./images/52c4a03cbead725649346a0d33d488f9.png )

```javascript
function Calendar(props: CalendarProps) {

    const {
        value,
        style,
        className,
        dateRender,
        dateInnerContent,
        locale,
        onChange
    } = props;

    const [curValue, setCurValue] = useState<Dayjs>(value);

    const [curMonth, setCurMonth] = useState<Dayjs>(value);

    const classNames = cs("calendar", className);
        
    function selectHandler(date: Dayjs) {
        setCurValue(date);
        onChange?.(date);
    }

    function prevMonthHandler() {
        setCurMonth(curMonth.subtract(1, 'month'));
    }

    function nextMonthHandler() {
        setCurMonth(curMonth.add(1, 'month'));
    }

    return <LocaleContext.Provider value={{
        locale: locale || navigator.language
    }}>
        <div className={classNames} style={style}>
            <Header curMonth={curMonth} prevMonthHandler={prevMonthHandler} nextMonthHandler={nextMonthHandler}></Header>
            <MonthCalendar {...props} value={curValue} selectHandler={selectHandler}/>
        </div>
    </LocaleContext.Provider>
}
```

测试下：

![](./images/0078267ab9e4e995041692f046408fb7.gif )

但现在月份是变了，但下面的日历没有跟着变。

因为我们之前是拿到 value 所在月份来计算的日历，现在要改成 curMonth 所在的月份。

![](./images/17a72f12c53e480840658d530e784dcd.png )

![](./images/2320235024430213af9e4119c9fb9250.png )

这样，月份切换时，就会显示那个月的日历了：

![](./images/b38ae2a28071d3800769264b3fb5670b.gif )

然后我们加上今天按钮的处理：

![](./images/ffc2de4a6a1ac372b833bc58c37621fe.png )

```javascript
import { Dayjs } from "dayjs";
interface HeaderProps {
    curMonth: Dayjs;
    prevMonthHandler: () => void;
    nextMonthHandler: () => void;
    todayHandler: () => void;
}
function Header(props: HeaderProps) {

    const {
        curMonth,
        prevMonthHandler,
        nextMonthHandler,
        todayHandler
    } = props;

    return <div className="calendar-header">
        <div className="calendar-header-left">
            <div className="calendar-header-icon" onClick={prevMonthHandler}>&lt;</div>
            <div className="calendar-header-value">{curMonth.format('YYYY 年 MM 月')}</div>
            <div className="calendar-header-icon" onClick={nextMonthHandler}>&gt;</div>
            <button className="calendar-header-btn" onClick={todayHandler}>今天</button>
        </div>
    </div>
}

export default Header;
```

在 Calendar 里传入 todayHandler：

![](./images/d4f37023f8c6216f67e7cbabc2d41827.png )

```javascript
function todayHandler() {
    const date = dayjs(Date.now());

    setCurValue(date);
    setCurMonth(date);
    onChange?.(date);
}
```
同时修改日期和当前月份，并且还要调用 onChange 回调。

测试下：

![](./images/e9a6f4899a916c10912e0ff4f2720ddb.gif )

此外，我们希望点击上下月份的日期的时候，能够跳转到那个月的日历：

![](./images/d772123735d4fb41b72a2d93f75af973.gif )

这个也简单，切换日期的时候顺便修改下 curMonth 就好了：

![](./images/962d36dd3ed2d0f5d1923eaa245b9540.png )

测试下：

![](./images/a8e4afa95002636f8026daa3e45162ed.gif )

最后，还要加上 Header 的国际化：

![](./images/041564cd9554f9500cb466db40cd4a41.png )

就是把写死的文案，改成丛资源包取值的方式就好了。

```javascript
function Header(props: HeaderProps) {

    const {
        curMonth,
        prevMonthHandler,
        nextMonthHandler,
        todayHandler
    } = props;

    const localeContext = useContext(LocaleContext);
    const CalendarContext = allLocales[localeContext.locale];

    return <div className="calendar-header">
        <div className="calendar-header-left">
            <div className="calendar-header-icon" onClick={prevMonthHandler}>&lt;</div>
            <div className="calendar-header-value">{curMonth.format(CalendarContext.formatMonth)}</div>
            <div className="calendar-header-icon" onClick={nextMonthHandler}>&gt;</div>
            <button className="calendar-header-btn" onClick={todayHandler}>{CalendarContext.today}</button>
        </div>
    </div>
}
```
试试看：

![](./images/704b7222cf2ccceac5d12d4d410038b9.png )

![](./images/370e8f12d04f6a7d5bf8910c626f2bd5.png )

![](./images/9faee108ffc9af82cab03bf6a35f927f.png )

没啥问题。

这样，我们的 Calendar 组件就完成了。

最后我们再来优化下代码：

![](./images/958549e17c977f3da28f24800ea68943.png )

重复逻辑可以抽离出个方法：

![](./images/ad34264cce02300835002499f019de9e.png )

```javascript
function changeDate(date: Dayjs) {
    setCurValue(date);
    setCurMonth(date);
    onChange?.(date);
}
```
渲染逻辑抽离出来的函数，放在组件外需要传很多参数，而这个函数只有这里用，可以移到组件内：

![](./images/b338af785d1c62309f349c9146d30d48.png )

这样就不用传那些参数了：

![](./images/6940e866dbf771e29a052ca93d016b6f.png )

此外，我们的 Calendar 的 value 其实是 defaultValue：

![image.png](./images/c92223c8e13fbefd4900b7f5bfc0dc6b.png )

和迷你 Calendar 一样，我们也用 ahooks 的 useControllableValue 来做。

安装 ahooks：

```
npm install --save ahooks
```

把 useState 换成 ahooks 的 useControllableValue：

![image.png](./images/e36011e1ea01384aeee10789bf2e3a49.png )

```javascript
export interface CalendarProps {
    value?: Dayjs;
    defaultValue?: Dayjs;
    style?: CSSProperties;
    className?: string | string[];
    // 定制日期显示，会完全覆盖日期单元格
    dateRender?: (currentDate: Dayjs) => ReactNode;
    // 定制日期单元格，内容会被添加到单元格内，只在全屏日历模式下生效。
    dateInnerContent?: (currentDate: Dayjs) => ReactNode;
    // 国际化相关
    locale?: string;
    onChange?: (date: Dayjs) => void;
}
```
```javascript
const [curValue, setCurValue] = useControllableValue<Dayjs>(props, {
    defaultValue: dayjs()
});

const [curMonth, setCurMonth] = useState<Dayjs>(curValue);
```
用到 value 的地方加一下 ?：

![image.png](./images/534df3b084804d4cf2c7826f9fe24d3e.png )

这样就同时支持受控非受控，也就是 value 和 defaultValue 了。

试一下 defaultValue 非受控模式：

```javascript
import dayjs from 'dayjs';
import Calendar from './Calendar';

function App() {
  return (
    <div className="App">
      <Calendar defaultValue={dayjs('2023-11-08')}></Calendar>
    </div>
  );
}

export default App;
```

![2024-08-31 19.00.51.gif](./images/a685fa303a79dd553c461fbee193742d.gif )

value 受控模式:

```javascript
import dayjs from 'dayjs';
import Calendar from './Calendar';
import { useState } from 'react';

function App() {
  const [value, setValue] =  useState(dayjs('2023-11-08'));

  return (
    <div className="App">
      <Calendar value={value} onChange={(val) => {
        setValue(val)
      }}></Calendar>
    </div>
  );
}

export default App;
```

![2024-08-31 19.02.47.gif](./images/940745f19680e749fb62c7c34d39601b.gif )

案例代码上传了[小册仓库](https://github.com/QuarkGluonPlasma/react-course-code/tree/main/calendar-component)。

## 总结

上节我们实现了布局，这节加上了参数并且实现了这些参数对应的逻辑。

className 和 style 用于修改外层容器的样式，内部用的 flex 布局，只要容器大小变了，内容会自动适应。

dateRender 和 dateInnerConent 是用于修改日期单元格的内容的，比如显示节日、日程安排等。

locale 是切换语言，国际化就是把写死的文案换成从资源包取值的方式，我们创建了 zh-CN 和 en-US 两个资源包，并且可以通过 locale 参数来切换。

通过 createContext 创建 context 对象来保存 locale 配置，然后通过 Provider 修改其中的值，这样子组件里就通过 useContext 把它取出来就知道当前语言了。

最后我们用 ahooks 的 useControllableValue 同时支持了受控和非受控模式。

日历组件是一个常用组件，而且是经常需要定制的那种，因为各种场景下对它有不同的要求，所以能够自己实现各种日历组件是一个必备技能。
