import { isType, getUUID } from "./common";
import { flattenDeep } from "lodash-es"; //+13kb
/**
 * @description 将普通的树形数据，转成扁平化的数据，
 * @description id,pId,children 为source中对应的字段名。
 * @description  不改变源数据
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
}): { id: string; data: T; pId: string }[] => {
  if (!isType(source, "Array")) throw "treeToFlat  source必须是数组";
  function getChildren(sourceList: any[], targetList: any[], pIdValue = "") {
    sourceList.forEach((item: any) => {
      let _id = item[id] || getUUID("tree-");
      pIdValue = pIdValue || item[pId];
      targetList.push({ id: _id, data: item, pId: pIdValue });
      if (item[children]) getChildren(item[children], targetList, _id);
    });
  }
  const target: { id: string; data: T; pId: string }[] = [];
  getChildren(source, target);
  return target;
};

/**
 * @description  树形数据格式化,不会修改源数据。
 * @author 闰月飞鸟
 * @param {*} source
 * @param {*} id
 * @param {*} pId
 * @param customizer 自定义节点信息，可以直接对节点对象添加自定义属性。
 * @return {treeData,leaves,objById,flatData}
 * @description  treeData 格式化后的树数据
 * @description  leaves 所有叶子节点
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

export const treeDataFactory = <T extends MynxUtils.Recordable>(
  {
    source,
    id = "id",
    pId = "pId",
  }: {
    source: T[];
    id?: string;
    pId?: string;
  },
  customizer?: (item: MynxUtils.TreeFactoryItemType<T>) => void
) => {
  if (!isType(source, "Array")) throw "treeToFlat  source必须是数组";
  let formatSource: MynxUtils.TreeFactoryItemType<T>[] = source.map(
    (item: T) => {
      const _item = {
        id: item[id],
        pId: item[pId],
        data: item,
        children: [],
      };
      if (customizer) {
        customizer(_item);
        // 避免被修改
        _item.id = item[id];
        _item.pId = item[pId];
      }
      return _item;
    }
  );
  try {
    let treeData = formatSource.reduce(
      (arr: MynxUtils.TreeFactoryItemType<T>[], item) => {
        item.children = item.children || [];
        item.track = item.track || [item.id];
        item.trigger = item.trigger || [];
        let parent = formatSource.find((node) => node.id == item.pId);
        if (!parent) arr.push(item);
        else {
          // track:所有父id，包括自己
          parent.track = parent.track ?? [parent.id];
          item.track.push(parent.track);
          // trigger:所有子id
          parent.trigger = parent.trigger || [];
          parent.trigger.push(item.id);
          parent.trigger.push(item.trigger);
          parent.children = parent.children
            ? [...parent.children, item]
            : [item];
        }
        return arr;
      },
      []
    );
    let leaves: MynxUtils.TreeFactoryItemType<T>[] = [];
    // id 为key的对象。将trigger扁平化,获取所有子节点
    let objById = formatSource.reduce(
      (obj: { [key: string]: MynxUtils.TreeFactoryItemType<T> }, item) => {
        if (item.trigger) {
          const triggerFlatten: string[] = flattenDeep(item.trigger);
          item.trigger.length = 0;
          item.trigger.push(...triggerFlatten);
        }
        if (item.track) {
          const trackFlatten: string[] = flattenDeep(item.track);
          item.track.length = 0;
          item.track.push(...trackFlatten);
          item.level = item.track.length;
        }
        obj[item.id] = item;
        // 叶子节点移除children
        if (!item.children?.length) {
          leaves.push(item);
          delete item.children;
        }
        return obj;
      },
      {}
    );

    return {
      treeData,
      leaves,
      objById,
      flatData: formatSource,
    };
  } catch (error) {
    console.error(error);
    return {
      treeData: [],
      leaves: [],
      objById: {},
      flatData: [],
    };
  }
};
/**
 * @description  在不修改当前引用的基础上 ，批量移除元素。数组依据条件函数，
 * @author 闰月飞鸟
 * @param {*} arr 目标数组
 * @param {*} remove 移除函数，接受两个参数，当前项item，以及下标index。
 *   @return Boolean,返回true时，代表要移除该项
 */
export const arrayRemoveItem = <T = any>(
  arr: T[],
  remove: (item: T, index: number) => boolean
): void => {
  if (isType(arr, "Array") && isType(remove, "Function")) {
    let stay = arr.filter((v, i) => !remove(v, i));
    arr.splice(0, arr.length);
    arr.push(...stay);
  } else throw "arrayRemoveItem 参数类型不正确，arr必须是数组，fun必须是函数";
};
