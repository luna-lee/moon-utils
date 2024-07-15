import { isType, getUUID } from "./common";
import { flattenDeep } from "lodash-es"; //+13kb
/**
 * @description 将普通的树形数据，转成扁平化的数据，若无指定层级元素如id，pId，则自动添加，不改变源数据
 * @author 闰月飞鸟
 * @param {*} source
 * @param {*} id
 * @param {*} pId
 * @param {*} children
 */
export const treeToFlat = <T = any>({
  source,
  id = "id",
  pId = "pId",
  children = "children",
}: {
  source: T[];
  id?: string;
  pId?: string;
  children?: string;
}): T[] => {
  if (!isType(source, "Array")) throw "treeToFlat  source必须是数组";
  function getChildren(sourceList: any[], targetList: any[], pIdValue = "") {
    sourceList.forEach((item: any) => {
      let _id = item[id] || getUUID("tree-");
      pIdValue = pIdValue || item[pId];
      targetList.push({ id: _id, data: item, pId: pIdValue });
      if (item[children]) getChildren(item[children], targetList, _id);
    });
  }
  const target: T[] = [];
  getChildren(source, target);
  return target;
};

/**
 * @description  树形数据格式化,不会修改源数据。
 * @author 闰月飞鸟
 * @param {*} source
 * @param {*} id
 * @param {*} pId
 * @return {treeData,leafs,objById,flatData}
 * @description  treeData 格式化后的树数据
 * @description  leafs 所有叶子节点
 * @description  objById 以id为key的对象
 * @description  flatData  扁平数组，
 * @return TreeFactoryItemType类型
 * @param {*} id
 * @param {*} pId
 * @param {*} children 子项
 * @param {*} data 源数据
 * @param {*} track 所有当前节点的父节点id，包括自身ID
 * @param {*} trigger 所有当前节点的子节点id，不包含自身ID
 */

export const treeDataFactory = <T extends Recordable>({
  source,
  id = "id",
  pId = "pId",
}: {
  source: T[];
  id?: string;
  pId?: string;
}) => {
  if (!isType(source, "Array")) throw "treeToFlat  source必须是数组";
  let formatSource: TreeFactoryItemType<T>[] = source.map((item: T) => {
    return {
      id: item[id],
      pId: item[pId],
      data: item,
      children: [],
    };
  });
  try {
    let treeData = formatSource.reduce(
      (arr: TreeFactoryItemType<T>[], item) => {
        // 判断数组项是否符合 树结构类型
        if (!item.hasOwnProperty(id))
          throw `${JSON.stringify(
            item
          )}树形结构数据不准确,数据项中没有指定的id:${id}`;
        item.children = item.children || [];
        item.track = item.track || [item.id];
        item.trigger = item.trigger || [];
        let parent = formatSource.find((node) => node.id == item.pId);
        if (!parent) arr.push(item);
        else {
          // track:所有父id，包括自己
          parent.track = parent.track || [parent.id];
          //   @ts-ignore
          item.track.push(parent.track);
          // trigger:所有子id
          parent.trigger = parent.trigger || [];
          parent.trigger.push(item.id);
          //   @ts-ignore
          parent.trigger.push(item.trigger);
          parent.children = parent.children
            ? [...parent.children, item]
            : [item];
        }
        return arr;
      },
      []
    );
    let leafs: TreeFactoryItemType<T>[] = [];
    // id 为key的对象。将trigger扁平化,获取所有子节点
    let objById = formatSource.reduce(
      (obj: { [key: string]: TreeFactoryItemType<T> }, item) => {
        item.trigger = flattenDeep(item.trigger);
        item.track = flattenDeep(item.track).reverse();
        item.level = item.track.length;
        obj[item.id] = item;
        if (!item.children.length) leafs.push(item);
        return obj;
      },
      {}
    );

    return {
      treeData,
      leafs,
      objById,
      flatData: formatSource,
    };
  } catch (error) {
    console.error(error);
    return {
      treeData: [],
      leafs: [],
      objById: {},
      flatData: [],
    };
  }
};
/**
 * @description  在不修改当前引用的基础上 ，批量移除元素。数组依据条件函数，
 * @author 闰月飞鸟
 * @param {*} arr 目标数组
 * @param {*} fun 移除迭代函数，接受两个参数，当前项item，以及下标index。
 *   @return Boolean,返回true时，代表要移除该项
 */
export const arrayRemoveItem = <T = any>(
  arr: T[],
  fun: (item: T, index: number) => boolean
): void => {
  if (isType(arr, "Array") && isType(fun, "Function")) {
    let stay = arr.filter((v, i) => {
      return !fun(v, i);
    });
    arr.splice(0, arr.length);
    stay.forEach((v) => {
      arr.push(v);
    });
  } else throw "arrayRemoveItem 参数类型不正确，arr必须是数组，fun必须是函数";
};
