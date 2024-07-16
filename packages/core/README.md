### isType

- 类型判断
- @param obj 校验对象
- @param type 校验类型，可以是字符串或数组，数组为或结果。值为所有类型的实例化名。如 Object，Number...
- @return Boolean

```javascript
isType(obj, "Array");
isType(obj, ["Array", "String"]);
```

### getUUID

- 得到一个 uuid
- @param prefix 前缀
- @return String

```javascript
getUUID("moon-validate-");
```

### setEventListenerVue2

- @description 设置 window 或 document 事件监听,同时当所在的 vue 实例销毁时自动移除监听
- @author 闰月飞鸟
- @param binder 指定 window 或 document 必传
- @param vm vue 实例 必传
- @param evtName 事件名 必传
- @param listener 监听函数 必传
- @param options 监听本身参数
- @return 返回一个移除监听函数

```javascript
setEventListenerVue2(window, this, "mousemove", () => {});
```

### mergeObject

- @description 对象合并，相同函数合并成一个，原函数先执行,若函数有返回值:若为对象则合并，非对象的以来源函数结果为主
- @author 闰月飞鸟
- @param to 原对象
- @param from 待合并的来源对象
- @return 返回一个新的对象

```javascript
mergeObject({}, {});
```

### asyncLoadElement

- @description 异步添加 dom 元素
- @author 闰月飞鸟
- @param {\*} el 元素名
- @param {\*} attrs 元素属性
- @param {\*} appendToElement 添加到的目标元素,默认 document.head
- @return Boolean

```javascript
await asyncLoadElement('script',{src;'',id:'xx'});
```

### InstanceValidate

- @description 校验目标对象是否符合输入的校验规则
- @return function 返回回调函数
- @param targetObject 必选，目标对象 object
- target @param rules 必选，校验规则 object
- target @param validateCallback 可选，校验回调返回函数,errors,fields，两个参数， （errors, fields）=>{}
- target @return 校验结果

```javascript
const form = {
  catalogId: "",
};
const rules = {
  catalogId: [
    {
      required: true,
      message: "请选择资源目录",
    },
  ],
};
InstanceValidate()({}, rules, (e) => {
  console.log(e);
});
```

### treeToFlat

- @description 将普通的树形数据，转成扁平化的数据，若无指定层级元素如 id，pId，则自动添加，不改变源数据
- @author 闰月飞鸟
- @param {\*} source
- @param {\*} id
- @param {\*} pId
- @param {\*} children
- @return Array

```javascript
treeToFlat({ source: data, id: "id", pId: "pId", children: "children" });
```

### treeDataFactory

- @description 树形数据格式化
- @param {\*} source
- @param {\*} id
- @param {\*} pId
- @return {treeData,leafs,objById,flatData}
- @description treeData 格式化后的树数据
- @description leafs 所有叶子节点
- @description objById 以 id 为 key 的对象
- @description flatData 扁平数组，
- @return TreeFactoryItemType 类型
- @param {\*} id
- @param {\*} pId
- @param {\*} children 子项
- @param {\*} data 源数据
- @param {\*} track 所有当前节点的父节点 id，包括自身 ID
- @param {\*} trigger 所有当前节点的子节点 id，不包含自身 ID

```javascript
let { treeData } = treeDataFactory({ source: data, id: "id", pId: "pId" });
```

### arrayRemoveItem

- @description 在不修改当前引用的基础上 ，批量移除元素。数组依据条件函数，
- @author 闰月飞鸟
- @param {\*} arr 目标数组
- @param {\*} fun 移除迭代函数，接受两个参数，当前项 item，以及下标 index。
- @return Boolean,返回 true 时，代表要移除该项

```javascript
 arrayRemoveItem([],(item,index)=>{
  ...
  return true
});
```

### addUrlParams

- @description 在 url 后面追加指定对象作为新的参数。
- @author 闰月飞鸟
- @param {url} 需要追加参数的 url
- @param {paramsObj} 具体的参数对象
- @param {merge} 对原有的 url 参数进行覆盖合并，还是保留合并，true 时为覆盖合并，以当前参数为主，false 则为保留合并，以原来的 url 参数为主 。默认为覆盖合并。即有相同参数的以后传的参数值为准

```javascript
addUrlParams("http:", { a: "b" });
```

### getUrlParams

- @description 获取 url 中的参数 。
- @author 闰月飞鸟
- @param {url} url
- @param {opt} qs.parse 第二个参数
- @return {rootUrl,urlParams} 返回 rootUrl 以及 urlParams 对象

```javascript
getUrlParams("http:");
```
