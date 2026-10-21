const path=require('path');

function parseRepoInput(input){
  const raw=String(input||'').trim();
  if(!raw)throw new Error('请输入 GitHub 仓库地址');
  let s=raw.replace(/^git\+?/i,'').replace(/\.git$/i,'');
  try{
    if(/^https?:\/\//i.test(s)){
      const u=new URL(s);
      if(!/(^|\.)github\.com$/i.test(u.hostname))throw new Error('目前 v0.1 只支持 GitHub');
      s=u.pathname.replace(/^\/+|\/+$/g,'');
    }
  }catch(e){if(e.message.includes('只支持'))throw e}
  s=s.replace(/^github\.com\//i,'').replace(/^\/+|\/+$/g,'');
  const parts=s.split('/').filter(Boolean);
  if(parts.length<2)throw new Error('仓库格式应为 owner/repo 或 GitHub URL');
  const owner=parts[0],repo=parts[1];
  if(!/^[A-Za-z0-9_.-]+$/.test(owner)||!/^[A-Za-z0-9_.-]+$/.test(repo))throw new Error('GitHub 仓库地址格式不正确');
  return{owner,repo,fullName:`${owner}/${repo}`};
}

function stripMarkdown(s){
  return String(s||'').replace(/```[\s\S]*?```/g,' ').replace(/!\[[^\]]*\]\([^)]*\)/g,' ').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/<[^>]+>/g,' ').replace(/[`*_>#|]/g,' ').replace(/\s+/g,' ').trim();
}

function extractFeatures(readme,limit=5){
  const lines=String(readme||'').split(/\r?\n/),items=[];
  for(const raw of lines){
    const line=raw.trim(),m=line.match(/^[-*+]\s+(?:\[[ xX]\]\s*)?(.{4,120})$/);
    if(!m)continue;
    const text=stripMarkdown(m[1]).replace(/[:：]\s*$/,'').trim();
    if(!text||/^https?:/i.test(text)||items.some(x=>x.toLowerCase()===text.toLowerCase()))continue;
    items.push(text);if(items.length>=limit)break;
  }
  return items;
}
function short(s,n=48){const t=stripMarkdown(s);return t.length>n?t.slice(0,n-1)+'…':t}
function cleanVersion(v){const s=String(v||'').trim();if(!s)return'v0.1.0';return /^v/i.test(s)?s:`v${s}`}
function inferDownload(meta){
  if(meta?.latestRelease?.assets?.length){const preferred=meta.latestRelease.assets.find(a=>/\.(exe|dmg|pkg|zip|msi)$/i.test(a.name||''));return (preferred||meta.latestRelease.assets[0]).browser_download_url||meta.latestRelease.html_url}
  if(meta?.latestRelease?.html_url)return meta.latestRelease.html_url;
  return meta?.html_url?`${meta.html_url}/releases`:'';
}
function buildLaunchPack(meta,overrides={}){
  const name=String(overrides.productName||meta.name||meta.repo||'My Project').trim();
  const description=String(overrides.oneLiner||meta.description||'一个刚刚完成的新项目').trim();
  const version=cleanVersion(overrides.version||meta.latestRelease?.tag_name||meta.packageVersion||'0.1.0');
  const audience=String(overrides.audience||'想提高效率的人').trim();
  const features=(overrides.features||meta.features||[]).map(x=>String(x||'').trim()).filter(Boolean).slice(0,4);
  while(features.length<4)features.push(['开箱即用','流程更省事','界面简单直观','持续更新'][features.length]);
  const repoUrl=meta.html_url||`https://github.com/${meta.fullName||''}`;
  const downloadUrl=inferDownload(meta),stars=Number(meta.stargazers_count||0),language=meta.language||'Desktop';
  const xhs=`最近又忍不住做了一个小工具：${name} 😼\n\n${description}\n\n我做它的原因很简单：有些事情明明应该几步搞定，却总要来回折腾。于是干脆把这套流程做成了一个工具。\n\n这版 ${version} 先把最核心的功能做顺：\n\n✨ ${features[0]}\n✨ ${features[1]}\n✨ ${features[2]}\n✨ ${features[3]}\n\n适合：${audience}。\n\n项目目前已经放到 GitHub，${stars?`现在有 ${stars} 个 Star，`:''}后面我还会继续往里加功能。\n\n下载方式：进入 GitHub 的 Releases 页面，在 Assets 里下载最新版。\n\n🐈 喵造实验室 · ${name}\n${version}\n\n#独立开发 #效率工具 #开源软件 #GitHub #Windows软件 #喵造实验室`;
  const release=`# ${name} ${version}\n\n${description}\n\n## ✨ What's new\n\n${features.map(x=>`- ${x}`).join('\n')}\n\n## 📦 Download\n\n${downloadUrl||'Open Releases → Assets and download the latest build.'}\n\n## 🔒 Notes\n\n- Project: ${repoUrl}\n- Main stack: ${language}\n- Built by MeowBuild Lab / 喵造实验室\n`;
  const download=`粉丝下载 ${name}：\n\n1. 打开 GitHub：${repoUrl}\n2. 点击右侧「Releases」\n3. 进入最新版本 ${version}\n4. 展开「Assets」\n5. 下载适合自己系统的安装包\n\n直接下载/Release：${downloadUrl||repoUrl+'/releases'}\n\n如果浏览器提示“文件不常下载”，请确认地址来自项目官方 GitHub 仓库。`;
  const video=`【15 秒软件演示脚本｜${name}】\n\n0–3 秒｜痛点\n画面：快速展示原来的繁琐操作。\n字幕：“每次做这件事，都要折腾半天？”\n\n3–7 秒｜工具出现\n画面：打开 ${name}，完成核心操作。\n字幕：“所以我做了 ${name}。”\n\n7–11 秒｜结果爽点\n画面：连续展示 3 个结果/功能。\n字幕：“${short(features[0],16)} · ${short(features[1],16)} · ${short(features[2],16)}”\n\n11–15 秒｜CTA\n画面：产品界面 + GitHub Release。\n字幕：“${description}”\n结尾：“GitHub 已发布 ${version} · 喵造实验室”`;
  return{name,description,version,audience,features,repoUrl,downloadUrl,language,stars,xhs,release,download,video};
}
function exportName(project,kind){const base=String(project||'LaunchCat').replace(/[\\/:*?"<>|]+/g,'-').trim()||'LaunchCat';return `${base}_${kind==='features'?'features':'cover'}_1080x1440.png`}
module.exports={parseRepoInput,extractFeatures,stripMarkdown,buildLaunchPack,exportName,inferDownload};
