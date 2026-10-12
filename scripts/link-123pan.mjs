// 将 docs/prod-manifest.json 中的媒体条目替换为 123 云盘直链。
// 用法: node scripts/link-123pan.mjs [--keep-local]
//   默认: 已映射文件的本地副本会从 docs/prod/ 中删除（发布体积最小化），并清理空目录
//   --keep-local: 保留本地副本
// 映射表: scripts/123pan-mapping.json
//   {
//     "风景摄影/晨曦山谷.png": "https://...直链...",
//     "prod/生活视频/动画短片.mp4": "https://...直链..."   // 键带不带 prod/ 前缀均可
//   }
//   值为空字符串视为未映射（该文件保留本地路径兜底）。
//   首次运行若映射表不存在，会生成包含全部媒体键的初稿。
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const keepLocal = process.argv.includes('--keep-local')

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const manifestPath = join(projectRoot, 'docs', 'prod-manifest.json')
const mappingPath = join(projectRoot, 'scripts', '123pan-mapping.json')
const localProdDir = join(projectRoot, 'docs', 'prod')

if (!existsSync(manifestPath)) {
  console.error('[link-123pan] 未找到 docs/prod-manifest.json，请先运行编译（build.cmd）')
  process.exit(1)
}

// 读取或初始化映射表
if (!existsSync(mappingPath)) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const draft = {}
  for (const entry of manifest) {
    const path = typeof entry === 'string' ? entry : entry?.path
    if (typeof path === 'string') draft[path] = ''
  }
  mkdirSync(dirname(mappingPath), { recursive: true })
  writeFileSync(mappingPath, JSON.stringify(draft, null, 2) + '\n', 'utf8')
  console.log(`[link-123pan] 已生成映射表初稿 ${relative(projectRoot, mappingPath)}（${Object.keys(draft).length} 个文件），请填入 123 云盘直链后重新运行本脚本`)
  process.exit(0)
}

const rawMapping = JSON.parse(readFileSync(mappingPath, 'utf8').replace(/^\uFEFF/, ''))
// 归一化键：剥去可选的 prod/ 前缀，同时建立带前缀索引便于宽容匹配
const mapping = new Map()
for (const [key, url] of Object.entries(rawMapping)) {
  if (typeof url !== 'string' || url.trim() === '') continue
  mapping.set(key.replace(/^\/?prod\//, ''), url.trim())
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8').replace(/^\uFEFF/, ''))
if (!Array.isArray(manifest)) {
  console.error('[link-123pan] 清单格式异常（应为数组）')
  process.exit(1)
}

const linked = []
const kept = []
const removed = []
const next = manifest.map((entry) => {
  const path = typeof entry === 'string' ? entry : entry?.path
  if (typeof path !== 'string') return entry
  const url = mapping.get(path.replace(/^\/?prod\//, ''))
  if (!url) {
    kept.push(path)
    return typeof entry === 'string' ? entry : { path, url: entry.url }
  }
  linked.push(path)
  if (!keepLocal) {
    const localFile = join(localProdDir, path)
    if (existsSync(localFile)) {
      rmSync(localFile)
      removed.push(path)
    }
  }
  return { path, url }
})

writeFileSync(manifestPath, JSON.stringify(next, null, 2) + '\n', 'utf8')

// 把清单内嵌进 index.html（file:// 双击打开时浏览器禁止 fetch，内嵌是唯一途径）
const indexPath = join(projectRoot, 'docs', 'index.html')
let html = readFileSync(indexPath, 'utf8')
const payload = JSON.stringify(next).replace(/</g, '\\u003c')
const tag = '<script>window.__PROD_MANIFEST__=' + payload + ';</script>'
if (html.includes('__PROD_MANIFEST__')) {
  html = html.replace(/<script>window\.__PROD_MANIFEST__=[\s\S]*?<\/script>/, tag)
} else {
  html = html.replace('</head>', tag + '\n</head>')
}
writeFileSync(indexPath, html)

// 清理删除文件后遗留的空目录（仅限 docs/prod 内部，后序遍历）
if (!keepLocal) {
  ;(function pruneEmptyDirs(dir) {
    if (!existsSync(dir)) return false
    let empty = true
    for (const name of readdirSync(dir)) {
      const full = join(dir, name)
      if (statSync(full).isDirectory()) {
        if (!pruneEmptyDirs(full)) empty = false
      } else {
        empty = false
      }
    }
    if (empty && dir !== localProdDir) {
      // rmSync 必须带 recursive，否则对目录抛 EISDIR
      rmSync(dir, { recursive: true, force: true })
      return true
    }
    return false
  })(localProdDir)
}

console.log(`[link-123pan] 共 ${next.length} 个文件：${linked.length} 个已替换为直链，${kept.length} 个保留本地路径` +
  (keepLocal ? '' : `，${removed.length} 个本地副本已删除`))
if (kept.length > 0) {
  console.log('[link-123pan] 未映射的文件：')
  for (const p of kept) console.log(`  - ${p}`)
}
