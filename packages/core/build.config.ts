import { defineBuildConfig } from "unbuild";
import { writeFileSync, readFileSync } from 'fs';
import { resolve } from 'path';

export default defineBuildConfig({
  clean: true,
  entries: ["./src/index"],
  declaration: true,
  rollup: {
    emitCJS: true,
  },
  hooks: {
    'build:done': (ctx) => {
      // 获取 index.d.ts 的路径
      const dtsPath = resolve(ctx.options.outDir, 'index.d.ts');
      
      try {
        // 读取现有的 index.d.ts 内容
        let content = readFileSync(dtsPath, 'utf-8');
        
        // 添加类型引用（如果还没有的话）
        const reference = '/// <reference path="./type.d.ts" />\n';
        if (!content.includes(reference)) {
          content = reference + content;
          
          // 写入更新后的内容
          writeFileSync(dtsPath, content, 'utf-8');
          console.log('Successfully added type reference to index.d.ts');
        }
      } catch (error) {
        console.error('Error adding type reference:', error);
      }
    }
  }
});
