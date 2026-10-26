# SEED GitHub Pages 发布说明

## 当前状态

未部署。GitHub 连接账号已确认为 startrick-code，但创建 seed-ascii-mv 返回：`Resource not accessible by integration (createRepository)`。没有覆盖或修改任何现有 GitHub 仓库。尚无仓库 URL 和网站 URL；请勿将下面的地址模板视为已上线链接。

## 发布包

seed-ascii-mv-pages.zip 解压后，index.html 就在根目录。完整保留附件的 23 个文件：运行代码、CSS、时间轴、原创音轨生成、文档、截图和测试。运行文件没有修改，无需构建。仅新增本部署说明。

## iPad 操作

1. Safari 登录 github.com，用右上角菜单创建 New repository，名称 seed-ascii-mv，选择 Public，勾选 Add a README file 并创建。若名称已被占用，请换一个新名称，勿覆盖其他项目。
2. 在“文件”App 中点 ZIP 解压。Safari 打开新仓库的 Code 页面，必要时选“请求桌面网站”。选择 Add file → Upload files → 选取文件，把解压根目录下的 index.html、style.css、所有 6 个 .js、README.md、LICENSE、SHA256SUMS.txt 上传到仓库根，提交更改。不要上传整个 ZIP；不要把 index.html 再嵌套在 ascii-ipad 文件夹中。
3. 上传 docs 和 tests：如果文件选择器支持文件夹，连同这两个文件夹上传；否则在 GitHub 用 Add file → Create new file 创建 docs/.gitkeep 并提交，进入 docs，再 Upload files 多选本地 docs 内所有文件提交；tests 同样处理。这样“使用说明”及完整源码资料也能访问。隐藏的 .nojekyll 在 iPad 不便选择时可以省略，本项目无下划线资源路径或构建要求；ZIP 中已保留它。
4. 在仓库 Settings → Pages → Build and deployment，Source 选择 Deploy from a branch；Branch 选 main，目录选 / (root)，Save。此项目不需要 npm、Actions 配置或自定义域名。
5. 等待 Pages 显示发布地址，或在 Actions 查看 pages build and deployment 成功。首次发布通常需要数分钟。GitHub 给出的实际链接才是最终地址，通常格式为 https://你的用户名.github.io/seed-ascii-mv/ 。
6. iPad 横屏打开该链接，点击“原创测试音轨”，再“播放”。完整观看 30 秒，测试暂停、拖动、设置中的场景跳转及沉浸模式。若出现 404，确认部署已成功且 index.html 位于 main 的根目录；资源失败则核对文件与目录是否全部上传。

## 本次检查

附件校验和全部匹配，核心测试通过；发布前使用本地 HTTP 服务和系统 Chromium 执行原有浏览器自动测试，验证用户点击播放、真实 FFT/RMS、暂停画面冻结、场景直接跳转、反复 seek、拖动恢复、偏移、24 FPS 设置、三种视口 16:9 与无横向溢出、沉浸切换、本地 WAV 选择播放、30 秒停止及重新播放；无 JavaScript 异常。静态资源相对路径适用于仓库子目录。

未验证：GitHub 实际部署及线上 HTTPS 资源（未能建仓）；真实 iPad Safari 的音频解码／触摸／本地文件选择／长时性能／横竖屏切换／全屏行为与后台恢复。现有代码包含无 Fullscreen API 时提示的回退路径，但不是本次真机通过结论。桌面 Chromium 结果不能代替 iPad Safari 验收。

全部动画模型、导演时间配置、播放器和样式保持原样。没有打包歌曲、歌词、字体或新增音频文件。原创测试音轨仍现场合成；本地音频仍通过 Blob URL 读取，无上传代码。发布包不包含用户本地音乐。
