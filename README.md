ai-generated

# 万年历 PWA

一个功能完整的中国农历万年历渐进式网页应用（PWA），支持离线使用，可部署到 Cloudflare Pages 或 GitHub Pages。

## 功能特性

### 📅 日历功能
- **公历与农历对照**：实时显示公历和农历日期
- **二十四节气**：准确显示传统二十四节气
- **传统节日**：包含春节、端午、中秋等传统节日
- **现代节日**：元旦、劳动节、国庆节等现代节日
- **天干地支**：完整的干支纪年、纪月、纪日系统
- **生肖显示**：十二生肖年份标识

### 🔧 技术特性
- **PWA 支持**：可安装到手机桌面，像原生应用一样使用
- **离线功能**：完全支持离线浏览，无需网络连接
- **响应式设计**：完美适配手机、平板、桌面设备
- **快速加载**：优化的缓存策略，秒开应用
- **中文界面**：完全中文化的用户界面

### 🎨 用户体验
- **直观导航**：简单的月份切换和日期选择
- **详细信息**：点击日期查看详细的农历信息
- **视觉指示**：节日和节气的颜色标识
- **键盘支持**：支持键盘快捷键操作

## 安装和部署

### 1. 准备工作

#### 安装依赖
\`\`\`bash
npm install
\`\`\`

#### 创建应用图标
应用已包含 SVG 格式的图标文件，无需额外准备：
- 所有图标位于 `icons/` 目录
- 使用 SVG 格式确保各种尺寸下都清晰显示
- 图标设计采用红色主题色 (#d32f2f) 和中文"历"字

### 2. 本地开发

\`\`\`bash
# 启动开发服务器
npm run dev
\`\`\`

访问 http://localhost:3000 查看应用

### 3. 部署选项

#### 选项 A：GitHub Pages（免费，简单）

1. **推送代码到 GitHub**
   \`\`\`bash
   git remote add origin https://github.com/yourusername/chinese-calendar.git
   git push -u origin main
   \`\`\`

2. **启用 GitHub Pages**
   - 进入 GitHub 仓库设置
   - 滚动到 "Pages" 部分
   - 选择源：Deploy from a branch
   - 分支：main
   - 文件夹：/ (root)
   - 点击 Save

3. **访问应用**
   - 应用将在 `https://fu-infotrack.github.io/ChineseCalendar` 可用
   - GitHub 自动提供 HTTPS，PWA 功能完全支持

**GitHub Pages PWA 注意事项：**
- ✅ 完全支持 PWA 功能（Service Worker、离线缓存、安装到桌面）
- ✅ 自动 HTTPS（PWA 必需）
- ✅ 免费且易于设置
- ✅ **路径自适应**：自动处理 GitHub Pages 子目录路径问题
- ❌ 没有自定义头部配置（但不影响 PWA 功能）
- ❌ 没有服务器端渲染支持（静态文件托管）

**解决 GitHub Pages 路径问题：**
本应用已自动处理 GitHub Pages 的子目录路径问题：
- 使用相对路径 (`./`) 而非绝对路径 (`/`)
- Service Worker 自动检测并适配基础路径
- PWA 安装后可正常工作，无需手动配置

#### 选项 B：Cloudflare Pages（高级功能）

1. **推送代码到 Git 仓库**
   \`\`\`bash
   git push -u origin main
   \`\`\`

2. **在 Cloudflare Pages 创建项目**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
   - 进入 "Pages" 页面
   - 点击 "Create a project"
   - 选择 "Connect to Git"
   - 选择你的仓库

3. **配置构建设置**
   - **Framework preset**: None
   - **Build command**: `npm run build`
   - **Build output directory**: `.`
   - **Root directory**: `/`

4. **部署**
   - 点击 "Save and Deploy"
   - 等待部署完成

**Cloudflare Pages 优势：**
- ✅ 完整的头部配置支持
- ✅ 更好的缓存控制
- ✅ 更快的全球 CDN
- ✅ 自定义域名更简单

### 4. 自定义域名（可选）

1. 在 Cloudflare Pages 项目设置中添加自定义域名
2. 配置 DNS 记录指向 Cloudflare Pages
3. 启用 HTTPS（自动）

## 项目结构

\`\`\`
chinese-calendar-pwa/
├── index.html              # 主页面
├── manifest.json           # PWA 清单文件
├── sw.js                   # Service Worker
├── package.json            # 项目配置
├── cloudflare.toml         # Cloudflare Pages 配置
├── _redirects              # Cloudflare 重定向配置
├── css/
│   └── styles.css         # 样式文件
├── js/
│   ├── lunar.js           # 农历计算库
│   ├── calendar.js        # 农历计算核心
│   └── app.js            # 应用主程序
└── icons/                 # 应用图标 (SVG格式)
    ├── icon-72x72.svg
    ├── icon-96x96.svg
    ├── icon-128x128.svg
    ├── icon-144x144.svg
    ├── icon-152x152.svg
    ├── icon-192x192.svg
    ├── icon-384x384.svg
    └── icon-512x512.svg
\`\`\`

## 技术实现

### 农历算法
- 基于 1900-2100 年农历数据表
- 精确的农历与公历转换算法
- 干支纪年算法
- 二十四节气计算

### PWA 特性
- **Service Worker**：实现离线缓存和更新策略
- **Web App Manifest**：支持应用安装和启动画面
- **响应式设计**：适配各种设备屏幕
- **缓存策略**：静态资源缓存优先，动态内容网络优先

### 性能优化
- 资源压缩和合并
- 图片优化
- 关键路径CSS内联
- 预加载重要资源

## 使用说明

### 基本操作
- **月份导航**：点击左右箭头切换月份
- **回到今天**：点击"今天"按钮
- **查看详情**：点击任意日期查看详细信息
- **安装应用**：点击"安装应用"按钮添加到桌面

### 键盘快捷键
- `←` / `→`：切换月份
- `Home`：回到当前月份
- `Esc`：关闭详情弹窗

### 离线使用
应用支持完全离线使用，所有功能在无网络环境下正常工作。

## 浏览器支持

- **现代浏览器**：Chrome 67+, Firefox 63+, Safari 11.1+, Edge 79+
- **移动浏览器**：iOS Safari 11.3+, Chrome Mobile 67+
- **PWA 功能**：需要 HTTPS 环境（Cloudflare Pages 自动提供）

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

---

享受使用这个精美的万年历应用！🎉
