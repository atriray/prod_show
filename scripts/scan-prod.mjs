// 生成部署用作品集清单：
// 1. 扫描项目根目录 prod/ 下所有媒体文件
// 2. 将相对路径写入 docs/prod-manifest.json（应用启动时通过它加载作品集）
// 3. 将 prod/ 目录原样复制到 docs/prod/，保证静态部署后媒体文件可访问
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'bmp', 'svg', 'ico'])
const VIDEO_EXTS = new Set(['mp4', 'webm', 'm4v', 'mov', 'ogv', 'mkv', 'avi'])

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const prodDir = join(projectRoot, 'prod')
const outDir = join(projectRoot, 'docs')

if (!existsSync(prodDir)) {
  console.error('[scan-prod] 未找到 prod 目录：' + prodDir)
  process.exit(1)
}
const files = []
;(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      walk(full)
      continue
    }
    const ext = name.slice(name.lastIndexOf('.') + 1).toLowerCase()
    if (IMAGE_EXTS.has(ext) || VIDEO_EXTS.has(ext)) {
      files.push(relative(prodDir, full).split(sep).join('/'))
    }
  }
})(prodDir)

// 与应用内一致的自然排序（应用端还会做「文件夹在前」的分组）
files.sort((a, b) => a.localeCompare(b, 'zh-Hans-CN', { numeric: true }))

mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'prod-manifest.json'), JSON.stringify(files, null, 2) + '\n', 'utf8')
cpSync(prodDir, join(outDir, 'prod'), { recursive: true })
// 应用统一使用 prod/ 下的相对路径访问媒体，构建产生的 assets/ 哈希副本不再被引用，删除以免发布体积翻倍
rmSync(join(outDir, 'assets'), { recursive: true, force: true })
console.log(`[scan-prod] 已生成 docs/prod-manifest.json（${files.length} 个媒体文件），并复制 prod/ 到 docs/prod/`)
