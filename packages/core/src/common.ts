// nanoid 小于1kb
// @ts-ignore
// #ifndef MP
import { nanoid } from "nanoid";
// #endif
// @ts-ignore
// #ifdef MP
import { nanoid } from "nanoid/non-secure";
// #endif
import { mergeWith } from "lodash-es";
import Schema, { ValidateCallback } from "async-validator";

/**
 * @description 类型判断
 * @author 闰月飞鸟
 * @param obj 校验对象
 * @param type 校验类型，可以是字符串或数组，数组为或结果。值为所有类型的实例化名。如Object，Number...
 *  */
export const isType = (obj: any, type: string | string[]): boolean => {
  if (typeof type === "string")
    return Object.prototype.toString.call(obj) == `[object ${type}]`;
  if (Array.isArray(type))
    return type.some(
      (t) => Object.prototype.toString.call(obj) == `[object ${t}]`
    );
  return true;
};

/**
 * @description 利用nanoID得到一个uuid
 * @param prefix id前缀
 *  */
export const getUUID = (prefix = "uuid"): string => {
  return prefix + nanoid();
};

/**
 * @description 设置window 或document事件监听,同时当所在的vue实例销毁时自动移除监听
 * @author 闰月飞鸟
 * @param binder 指定window 或document  必传
 * @param vm vue实例 必传
 * @param evtName  事件名 必传
 * @param listener  监听函数 必传
 * @param options 监听本身参数
 * @return 返回一个移除监听函数
 *  */
export const setEventListenerVue2 = (
  binder: any,
  vm: any,
  evtName: string,
  listener: (...arg: any[]) => void,
  options: any
) => {
  if (!binder || !vm || !evtName || !listener) {
    return;
  }
  // 只有在当前视图下的vm才触发响应
  const _listener = (...arg: any[]) => {
    const { width, height } = vm.$el.getBoundingClientRect();
    if (!width || !height) return;
    listener(...arg);
  };
  const remove = () => {
    binder.removeEventListener(evtName, _listener);
  };
  const add = () => {
    remove();
    binder.addEventListener(evtName, _listener, options);
  };
  add();
  vm.$on("hook:mounted", add);
  vm.$on("hook:activated", add);
  vm.$on("hook:deactivated", remove);
  vm.$once("hook:beforeDestroy", () => {
    vm.$off("hook:mounted", add);
    vm.$off("hook:activated", add);
    vm.$off("hook:deactivated", remove);
    remove();
  });
  return remove;
};

/**
 * @description 对象合并，相同函数合并成一个，原函数先执行,若函数有返回值:若为对象则合并，非对象的以来源函数结果为主
 * @author 闰月飞鸟
 * @param to 原对象
 * @param from 待合并的来源对象
 * @return 返回一个新的对象
 *  */
export function mergeObject(to: object, from: object): object {
  function customizer(objValue: any, srcValue: any) {
    if (typeof objValue === "function" && typeof srcValue === "function") {
      if (
        typeof objValue.then === "function" ||
        typeof srcValue.then === "function"
      )
        return async function (...res: any) {
          const resObj = await objValue.bind(this)(...res);
          const resSrc = await srcValue.bind(this)(...res);
          if (isType(resObj, "Object") && isType(resSrc, "Object")) {
            return mergeObject(resObj, resSrc);
          } else if (isType(resObj, "Array") && isType(resSrc, "Array")) {
            return resObj.concat(resSrc);
          } else {
            return resSrc;
          }
        };
      else
        return function (...res: any) {
          const resObj = objValue.bind(this)(...res);
          const resSrc = srcValue.bind(this)(...res);
          if (isType(resObj, "Object") && isType(resSrc, "Object")) {
            return mergeObject(resObj, resSrc);
          } else if (isType(resObj, "Array") && isType(resSrc, "Array")) {
            return resObj.concat(resSrc);
          } else {
            return resSrc;
          }
        };
    }
    if (isType(objValue, "Array") && isType(srcValue, "Array")) {
      return objValue.concat(srcValue);
    }
  }
  return mergeWith(to, from, customizer);
}

//
/**
 * @description  异步添加dom元素
 * @author 闰月飞鸟
 * @param {*} el 元素名
 * @param {*} attrs  元素属性,若设置了id，则只会添加一次。
 * @param {*} appendToElement  添加到的目标元素,默认document.head
 * @return Boolean
 */
export const asyncLoadElement = (
  elementName: string,
  attrs: Recordable,
  appendToElement = document.head
) => {
  return new Promise((resolve) => {
    let id = attrs.id;
    if (id && document.getElementById(id)) {
      resolve(true);
      return;
    }
    let el = document.createElement(elementName);
    Object.keys(attrs).map((key) => {
      el.setAttribute(key, attrs[key]);
    });
    appendToElement.appendChild(el);
    el.onload = () => {
      resolve(true);
    };
  });
};
/**
 * @description  校验目标对象是否符合输入的校验规则
 * @return function  返回回调函数
 *      @param target 必选，目标对象 object
 *      @param rules 必选，校验规则 object
 *      @param validateCallback   可选，校验回调返回函数,errors,fields，两个参数， （errors, fields）=>{}
 *      @return 校验结果
 */
export const InstanceValidate = () => {
  let validateObject_validator: null | Schema = null;
  let validateObject_rules: any = null;
  return function (
    target: Recordable,
    rules: Schema["rules"],
    validateCallback: ValidateCallback
  ) {
    let flag = true;
    //类型检查
    if (isType(target, "Object") && isType(rules, "Object")) {
      // validateObject_validator为null是，或校验规则改变后需要重新实例化Schema
      if (!validateObject_validator || rules != validateObject_rules) {
        validateObject_rules = rules;
        validateObject_validator = new Schema(rules);
      }
      validateObject_validator.validate(target, (errors, fields) => {
        if (errors && fields) flag = false;
        validateCallback && validateCallback(errors, fields);
      });
    } else throw "校验类型和校验规则必须为一个Object对象";
    return flag;
  };
};
