/**
 * 作品集数据层。
 *
 * 应用启动（dev 启动 / 生产构建）时通过 import.meta.glob 扫描项目根目录的
 * /prod 文件夹：每一个一级子目录视为一个作品集，作品集内部支持多级文件夹。
 * 仅收录图片与视频文件；不含任何媒体文件的目录（空作品集、空文件夹）会被剪除。
 */

export type WorkType = 'image' | 'video'

export interface WorkItem {
  /** 文件名（不含路径） */
  name: string
  /** 可直接用于 <img> / <video> 的地址 */
  url: string
  type: WorkType
}

export interface FolderNode {
  type: 'folder'
  /** 文件夹名 */
  name: string
  /** 子级（文件夹在前、文件在后，均已自然排序） */
  children: Entry[]
  /** 包含的媒体文件总数（含所有子文件夹，文件夹本身不计入） */
  fileCount: number
}

/** 文件夹条目：文件或子文件夹，以 type 字段区分 */
export type Entry = WorkItem | FolderNode

export type Collection = FolderNode

const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'bmp', 'svg', 'ico'])
const VIDEO_EXTS = new Set(['mp4', 'webm', 'm4v', 'mov', 'ogv', 'mkv', 'avi'])

// 注意：glob 模式必须是内联字符串字面量，Vite 在编译期静态分析它
const mediaModules = import.meta.glob(
  '/prod/**/*.{jpg,jpeg,png,gif,webp,avif,bmp,svg,ico,mp4,webm,m4v,mov,ogv,mkv,avi}',
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
) as Record<string, string>

/** 自然排序：保证 IMG_2.jpg 排在 IMG_10.jpg 之前，中文按拼音 */
function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, 'zh-Hans-CN', { numeric: true })
}

interface Dir {
  name: string
  files: WorkItem[]
  dirs: Map<string, Dir>
}

function createDir(name: string): Dir {
  return { name, files: [], dirs: new Map() }
}

/** Dir → FolderNode：递归剪除空目录，子级按「文件夹在前、自然排序」排列 */
function toNode(dir: Dir): FolderNode {
  const folderChildren: FolderNode[] = []
  for (const childDir of dir.dirs.values()) {
    const node = toNode(childDir)
    if (node.children.length > 0) folderChildren.push(node)
  }
  folderChildren.sort((a, b) => naturalCompare(a.name, b.name))
  const fileChildren = dir.files.sort((a, b) => naturalCompare(a.name, b.name))
  return {
    type: 'folder',
    name: dir.name,
    children: [...folderChildren, ...fileChildren],
    fileCount: folderChildren.reduce((sum, f) => sum + f.fileCount, 0) + fileChildren.length,
  }
}

/** 由媒体文件相对路径列表构建作品集树（路径形如 "作品集/子文件夹/文件.jpg"） */
function buildCollections(
  paths: readonly string[],
  resolveUrl: (path: string) => string,
): Collection[] {
  const rootDirs = new Map<string, Dir>()

  for (const rawPath of paths) {
    const segments = rawPath.replace(/^\//, '').split('/')
    // 根目录下的散落文件不属于任何作品集，忽略
    if (segments.length < 2) continue
    const topName = segments[0]
    const fileName = segments[segments.length - 1]
    if (!topName || !fileName) continue
    const ext = fileName.slice(fileName.lastIndexOf('.') + 1).toLowerCase()
    if (!IMAGE_EXTS.has(ext) && !VIDEO_EXTS.has(ext)) continue

    const top = rootDirs.get(topName) ?? createDir(topName)
    rootDirs.set(topName, top)

    let current = top
    for (let i = 1; i < segments.length - 1; i++) {
      const seg = segments[i]
      if (!seg) continue
      let next = current.dirs.get(seg)
      if (!next) {
        next = createDir(seg)
        current.dirs.set(seg, next)
      }
      current = next
    }
    current.files.push({
      name: fileName,
      url: resolveUrl(rawPath.replace(/^\//, '')),
      type: IMAGE_EXTS.has(ext) ? 'image' : 'video',
    })
  }

  return Array.from(rootDirs.values(), toNode)
    .filter((c) => c.children.length > 0)
    .sort((a, b) => naturalCompare(a.name, b.name))
}

/** 编译期内嵌的媒体文件（glob 静态分析），路径剥去 /prod/ 前缀 */
const bundledPaths = Object.keys(mediaModules).map((p) => p.replace(/^\/prod\//, ''))
// 回退模式与清单模式使用同一套相对 URL（scan-prod.mjs 会把 prod/ 复制到 dist/prod/），
// 避免 Vite 哈希资源 URL 在单文件内联/子路径部署/file:// 场景下失效
const bundledCollections = buildCollections(bundledPaths, (path) => `prod/${path}`)

// 注意：使用可变的模块级导出（ESM 活绑定），
// initCollections() 在应用挂载前完成重赋值，组件读取到的是最终数据。
export let collections: Collection[] = bundledCollections

export let totalWorks = collections.reduce((sum, c) => sum + c.fileCount, 0)

/**
 * 应用启动时初始化作品集数据：
 * - 开发环境：直接使用编译期 glob 扫描结果（增删文件自动刷新）
 * - 生产环境：优先加载站点根的 prod-manifest.json（清单模式，
 *   使部署后的静态页面使用「文件所在目录下的 prod 目录」作为作品集），
 *   清单不存在或加载失败时回退到内嵌数据
 */
export async function initCollections(): Promise<void> {
  if (import.meta.env.DEV) return

  try {
    const res = await fetch('prod-manifest.json', { cache: 'no-store' })
    if (!res.ok) return
    const data: unknown = await res.json()
    const list = Array.isArray(data) ? data : (data as { files?: unknown } | null)?.files
    if (!Array.isArray(list)) return
    const paths = list.filter((s): s is string => typeof s === 'string')
    collections = buildCollections(paths, (path) => `prod/${path}`)
    totalWorks = collections.reduce((sum, c) => sum + c.fileCount, 0)
  } catch {
    // 无清单（例如直接双击打开 index.html）时继续使用编译期内嵌数据
  }
}

export function getCollection(name: string): Collection | undefined {
  return collections.find((c) => c.name === name)
}

/** 按路径段定位作品集内的（子）文件夹 */
export function resolveFolder(collection: Collection, segments: string[]): FolderNode | undefined {
  let node: FolderNode = collection
  for (const seg of segments) {
    if (!seg) continue
    const next = node.children.find((c): c is FolderNode => c.type === 'folder' && c.name === seg)
    if (!next) return undefined
    node = next
  }
  return node
}

/** 统计文件夹内的媒体文件数（递归），可按类型过滤 */
export function countFiles(node: FolderNode, type?: WorkType): number {
  let count = 0
  for (const child of node.children) {
    if (child.type === 'folder') count += countFiles(child, type)
    else if (!type || child.type === type) count++
  }
  return count
}

/** 取文件夹封面：优先本级图片，其次深入子文件夹，最后退回本级视频 */
export function getCover(node: FolderNode): WorkItem | undefined {
  for (const child of node.children) {
    if (child.type === 'image') return child
  }
  for (const child of node.children) {
    if (child.type === 'folder') {
      const found = getCover(child)
      if (found) return found
    }
  }
  for (const child of node.children) {
    if (child.type === 'video') return child
  }
  return undefined
}
