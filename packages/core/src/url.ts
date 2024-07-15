// qs +32kb
import qs from "qs";
import { isType } from "./common";

/**
 * @description 将对象序列化成url参数。对参数中含有特殊字符的参数进行编码转义,默认返回结果带上？
 * @author 闰月飞鸟
 * @param {obj}  对象
 * @param {opt}  qs.stringify第二个参数
 * @return string 返回 序列化后的字符串 ，默认返回结果带上？
 */
export const qsStringify = function (obj: Recordable, opt: Recordable = {}) {
  return qs.stringify(obj, {
    // 对所有常规特殊字符进行编码。
    encoder: function (str: string) {
      if (/\!|\*|"|'|\(|\)|;|:|@|&|=|\+|\$|,|\/|\?|%|#|\[|\]/g.test(str))
        return encodeURIComponent(str);
      return str;
    },
    addQueryPrefix: true,
    ...opt,
  });
};
/**
 * @description  在url后面追加指定对象作为新的参数。
 * @author 闰月飞鸟
 * @param {url}  需要追加参数的url
 * @param {paramsObj}  具体的参数对象
 * @param {merge}  对原有的url参数进行覆盖合并，还是保留合并，true时为覆盖合并，以当前参数为主，false则为保留合并，以原来的url参数为主 。默认为覆盖合并。即有相同参数的以后传的参数值为准
 */
export const addUrParams = function (
  url: string,
  paramsObj: Recordable = {},
  merge = true
) {
  // paramsObj 为一个空对象，直接返回url
  if (!Object.keys(paramsObj).length) {
    return url;
  }
  // 获取url参数
  const { rootUrl, urlParams } = getUrlParams(url);
  return (
    rootUrl +
    qsStringify(
      merge
        ? {
            ...urlParams,
            ...paramsObj,
          }
        : {
            ...paramsObj,
            ...urlParams,
          }
    )
  );
};

/**
 * @description 获取url中的参数 。
 * @author 闰月飞鸟
 * @param {url}   url
 * @param {opt}  qs.parse第二个参数
 * @return {rootUrl,urlParams} 返回 rootUrl以及urlParams对象
 */
export const getUrlParams = function (url: string, opt = {}) {
  url = url.trim();
  if (!url) {
    console.error("url不能为空");
    return {
      rootUrl: url,
      urlParams: {},
    };
  }
  if (!isType(opt, "Object")) {
    console.warn("opt属性必须为一个对象");
  }
  /* 对url中的特殊字&&符做 encodeURIComponent处理，避免qs时出错*/
  url = url.replace(/&&/g, encodeURIComponent("&&"));

  const arr = url.split("?");
  let urlParams = {};
  if (arr.length == 2) {
    urlParams = qs.parse(arr[1], opt);
  }
  return {
    rootUrl: arr[0],
    urlParams,
  };
};
