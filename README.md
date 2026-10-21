# LaunchCat 发布猫 🐈‍⬛

> 代码写完了？剩下的交给猫。

LaunchCat 是「喵造实验室」的项目发布工作流工具。输入一个 GitHub 仓库，自动整理成一套可以直接发布的 Launch Pack。

## v0.1 MVP

输入 GitHub 项目后自动读取：

- 仓库名称 / 描述
- README
- package.json 版本
- 最新 GitHub Release
- Release 下载资源
- Star / 技术栈
- README 中的功能要点

然后生成：

1. 小红书 3:4 宣传海报 × 2（1080×1440，可导出 PNG）
2. 小红书宣传文案
3. GitHub Release 文案
4. 粉丝下载说明
5. 15 秒软件演示脚本
6. GitHub / Release 快捷入口

支持额外导入一张软件截图，用于自动生成宣传海报。

## 产品原则

- v0.1 不接收费 AI API，先把发布流程跑通
- GitHub 项目读取只访问公开 GitHub API
- 用户截图只在本机读取，用于本地 Canvas 生成海报
- 不上传用户截图
- 文案与项目字段都可以在生成前手动修改

## 开发

```bash
npm install
npm test
npm run check
npm start
```

## Windows 打包

```bash
npm run dist:win
```

## Roadmap

- v0.2：AI 文案重写（爆款 / 技术 / 克制三种语气）
- v0.3：自动读取 README 图片并推荐首图
- v0.4：发布模板保存 / 品牌模板
- v0.5：一键生成 GitHub Release 草稿与小红书发布包 ZIP
