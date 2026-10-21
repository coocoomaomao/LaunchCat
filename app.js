const $=s=>document.querySelector(s);
let meta=null,pack=null,shotImage=null;
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2100)}
function status(msg,type=''){const e=$('#repoStatus');e.textContent=msg;e.className='status '+type}
function buildPack(){
  const name=$('#productName').value.trim()||meta.name;
  const description=$('#oneLiner').value.trim()||meta.description||'一个刚刚完成的新项目';
  let version=$('#version').value.trim()||meta.latestRelease?.tag_name||meta.packageVersion||'0.1.0';
  if(!/^v/i.test(version))version='v'+version;
  const audience=$('#audience').value.trim()||'想提高效率的人';
  const features=[1,2,3,4].map(n=>$('#feature'+n).value.trim()).filter(Boolean);
  while(features.length<4)features.push(['开箱即用','流程更省事','界面简单直观','持续更新'][features.length]);
  const repoUrl=meta.html_url||('https://github.com/'+meta.fullName);
  const assets=meta.latestRelease?.assets||[];
  const asset=assets.find(a=>/\.(exe|dmg|pkg|zip|msi)$/i.test(a.name||''))||assets[0];
  const downloadUrl=asset?.browser_download_url||meta.latestRelease?.html_url||repoUrl+'/releases';
  const stars=Number(meta.stargazers_count||0),language=meta.language||'Desktop';
  const short=(s,n=16)=>s.length>n?s.slice(0,n-1)+'…':s;
  return{
    name,description,version,audience,features,repoUrl,downloadUrl,stars,language,
    xhs:`最近又忍不住做了一个小工具：${name} 😼\n\n${description}\n\n我做它的原因很简单：有些事情明明应该几步搞定，却总要来回折腾。于是干脆把这套流程做成了一个工具。\n\n这版 ${version} 先把最核心的功能做顺：\n\n✨ ${features[0]}\n✨ ${features[1]}\n✨ ${features[2]}\n✨ ${features[3]}\n\n适合：${audience}。\n\n项目目前已经放到 GitHub，${stars?`现在有 ${stars} 个 Star，`:''}后面我还会继续往里加功能。\n\n下载方式：进入 GitHub 的 Releases 页面，在 Assets 里下载最新版。\n\n🐈 喵造实验室 · ${name}\n${version}\n\n#独立开发 #效率工具 #开源软件 #GitHub #Windows软件 #喵造实验室`,
    release:`# ${name} ${version}\n\n${description}\n\n## ✨ What's new\n\n${features.map(x=>'- '+x).join('\n')}\n\n## 📦 Download\n\n${downloadUrl}\n\n## 🔒 Notes\n\n- Project: ${repoUrl}\n- Main stack: ${language}\n- Built by MeowBuild Lab / 喵造实验室\n`,
    download:`粉丝下载 ${name}：\n\n1. 打开 GitHub：${repoUrl}\n2. 点击右侧「Releases」\n3. 进入最新版本 ${version}\n4. 展开「Assets」\n5. 下载适合自己系统的安装包\n\n直接下载/Release：${downloadUrl}\n\n如果浏览器提示“文件不常下载”，请确认地址来自项目官方 GitHub 仓库。`,
    video:`【15 秒软件演示脚本｜${name}】\n\n0–3 秒｜痛点\n画面：快速展示原来的繁琐操作。\n字幕：“每次做这件事，都要折腾半天？”\n\n3–7 秒｜工具出现\n画面：打开 ${name}，完成核心操作。\n字幕：“所以我做了 ${name}。”\n\n7–11 秒｜结果爽点\n画面：连续展示 3 个结果/功能。\n字幕：“${short(features[0])} · ${short(features[1])} · ${short(features[2])}”\n\n11–15 秒｜CTA\n画面：产品界面 + GitHub Release。\n字幕：“${description}”\n结尾：“GitHub 已发布 ${version} · 喵造实验室”`
  };
}
async function analyze(){
  const input=$('#repoInput').value.trim();if(!input)return;
  $('#analyzeBtn').disabled=true;status('正在读取 GitHub 项目…');
  try{
    meta=await window.launchcat.analyzeRepo(input);
    $('#productName').value=meta.name||meta.repo;
    $('#oneLiner').value=meta.description||meta.readmePreview?.slice(0,90)||'一个刚刚完成的新项目';
    $('#version').value=meta.latestRelease?.tag_name||meta.packageVersion||'v0.1.0';
    const fs=(meta.features||[]).slice(0,4),fallback=['一键完成核心流程','自动整理发布内容','生成可直接使用的素材','减少重复操作'];
    [1,2,3,4].forEach((n,i)=>$('#feature'+n).value=fs[i]||fallback[i]);
    $('#projectCard').classList.remove('hidden');$('#shotCard').classList.remove('hidden');
    $('#packTitle').textContent=meta.name+' · 等待生成';
    status(`已读取 ${meta.fullName} · ${meta.stargazers_count||0} Stars · ${meta.language||'未知技术栈'}`,'ok');toast('项目读取完成 😼');
  }catch(e){status(e.message||'读取失败','error');toast(e.message||'读取失败')}
  finally{$('#analyzeBtn').disabled=false}
}
function generate(){
  if(!meta){toast('先分析一个 GitHub 项目');return}
  pack=buildPack();
  $('#outXhs').value=pack.xhs;$('#outRelease').value=pack.release;$('#outDownload').value=pack.download;$('#outVideo').value=pack.video;
  $('#emptyState').classList.add('hidden');$('#resultArea').classList.remove('hidden');$('#packTitle').textContent=pack.name+' · '+pack.version;
  $('#repoBtn').disabled=false;$('#releaseBtn').disabled=false;renderPosters();toast('Launch Pack 已生成');
}
async function chooseShot(){
  try{const r=await window.launchcat.chooseImage();if(!r)return;const img=new Image();img.onload=()=>{shotImage=img;$('#shotName').textContent=r.name;renderPosters();toast('项目截图已加入')};img.src=r.dataUrl}catch(e){toast(e.message||'图片读取失败')}
}
function rr(c,x,y,w,h,r){const q=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+q,y);c.arcTo(x+w,y,x+w,y+h,q);c.arcTo(x+w,y+h,x,y+h,q);c.arcTo(x,y+h,x,y,q);c.arcTo(x,y,x+w,y,q);c.closePath()}
function wrap(c,text,maxW,font,max=3){c.font=font;const out=[];let line='';for(const ch of [...String(text||'')]){const t=line+ch;if(c.measureText(t).width>maxW&&line){out.push(line);line=ch}else line=t}if(line)out.push(line);return out.slice(0,max)}
function bg(canvas){const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height,g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#16102a');g.addColorStop(.55,'#4b2a86');g.addColorStop(1,'#ffb6d7');c.fillStyle=g;c.fillRect(0,0,w,h);const rg=c.createRadialGradient(w*.78,h*.15,0,w*.78,h*.15,600);rg.addColorStop(0,'rgba(255,255,255,.28)');rg.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=rg;c.fillRect(0,0,w,h);return c}
function drawShot(c,x,y,w,h){c.save();c.shadowColor='rgba(12,7,28,.45)';c.shadowBlur=38;c.shadowOffsetY=22;c.fillStyle='#fff';rr(c,x,y,w,h,34);c.fill();c.restore();if(shotImage){const s=Math.min((w-26)/shotImage.naturalWidth,(h-26)/shotImage.naturalHeight),dw=shotImage.naturalWidth*s,dh=shotImage.naturalHeight*s,xx=x+(w-dw)/2,yy=y+(h-dh)/2;c.save();rr(c,xx,yy,dw,dh,24);c.clip();c.drawImage(shotImage,xx,yy,dw,dh);c.restore()}else{c.fillStyle='#171126';rr(c,x+22,y+22,w-44,h-44,24);c.fill();c.fillStyle='#8b5cf6';c.font='900 38px sans-serif';c.fillText(pack?.name||'Your Project',x+55,y+85);c.fillStyle='#aaa2bd';c.font='600 21px sans-serif';c.fillText('PROJECT PREVIEW',x+55,y+125)}}
function drawCover(){const c=bg($('#coverCanvas')),w=1080,h=1440;if(!pack)return;c.fillStyle='#f7d66e';c.font='900 22px sans-serif';c.fillText(pack.version.toUpperCase()+' · GITHUB RELEASE',70,110);c.fillStyle='#fff';c.font='950 78px "Microsoft YaHei",sans-serif';const lines=wrap(c,pack.name,940,c.font,2);lines.forEach((x,i)=>c.fillText(x,70,220+i*92));const sy=220+lines.length*92+35;c.fillStyle='#f6d7f0';c.font='800 38px "Microsoft YaHei",sans-serif';wrap(c,pack.description,900,c.font,3).forEach((x,i)=>c.fillText(x,70,sy+i*54));drawShot(c,70,600,940,500);c.fillStyle='rgba(255,255,255,.94)';rr(c,70,1130,940,180,30);c.fill();c.fillStyle='#241636';c.font='950 31px "Microsoft YaHei",sans-serif';c.fillText('代码写完了？剩下的交给猫。',105,1190);c.fillStyle='#6c5e7e';c.font='700 19px "Microsoft YaHei",sans-serif';c.fillText('海报 · 小红书文案 · Release · 下载说明 · 15秒脚本',105,1235);c.fillStyle='#fff';c.font='700 18px sans-serif';c.fillText(pack.repoUrl.replace('https://',''),70,h-55)}
function drawFeatures(){const c=bg($('#featuresCanvas')),h=1440;if(!pack)return;c.fillStyle='#f7d66e';c.font='900 22px sans-serif';c.fillText('WHAT’S NEW · '+pack.version.toUpperCase(),70,90);c.fillStyle='#fff';c.font='950 68px "Microsoft YaHei",sans-serif';c.fillText('这次更新了什么？',70,185);const pos=[[70,285],[560,285],[70,570],[560,570]];pack.features.forEach((f,i)=>{const [x,y]=pos[i];c.fillStyle='rgba(255,255,255,.94)';rr(c,x,y,450,235,30);c.fill();c.fillStyle='#7c5ce1';c.font='950 20px sans-serif';c.fillText('0'+(i+1),x+30,y+43);c.fillStyle='#241636';c.font='950 29px "Microsoft YaHei",sans-serif';wrap(c,f,365,c.font,3).forEach((t,j)=>c.fillText(t,x+30,y+95+j*40))});drawShot(c,70,855,940,355);c.fillStyle='rgba(16,10,30,.72)';rr(c,70,1240,940,125,28);c.fill();c.fillStyle='#fff';c.font='900 24px "Microsoft YaHei",sans-serif';c.fillText('GitHub 已发布 · '+pack.version,105,1287);c.fillStyle='#cfc5e4';c.font='700 16px sans-serif';c.fillText(pack.downloadUrl.replace('https://','').slice(0,88),105,1325)}
function renderPosters(){if(pack){drawCover();drawFeatures()}}
$('#analyzeBtn').addEventListener('click',analyze);$('#repoInput').addEventListener('keydown',e=>{if(e.key==='Enter')analyze()});$('#generateBtn').addEventListener('click',generate);$('#chooseShotBtn').addEventListener('click',chooseShot);
$('#tabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(!b)return;document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('[data-panel]').forEach(x=>x.classList.toggle('hidden',x.dataset.panel!==b.dataset.tab))});
document.addEventListener('click',async e=>{const cp=e.target.closest('[data-copy]');if(cp&&pack){const v={xhs:pack.xhs,release:pack.release,download:pack.download,video:pack.video}[cp.dataset.copy];await navigator.clipboard.writeText(v);toast('已复制')}const ex=e.target.closest('[data-export]');if(ex&&pack){const kind=ex.dataset.export,c=kind==='cover'?$('#coverCanvas'):$('#featuresCanvas');try{const saved=await window.launchcat.savePng({dataUrl:c.toDataURL('image/png'),project:pack.name,kind});if(saved)toast('海报导出成功')}catch(err){toast(err.message||'导出失败')}}});
$('#repoBtn').addEventListener('click',()=>{if(pack?.repoUrl)window.launchcat.openExternal(pack.repoUrl)});$('#releaseBtn').addEventListener('click',()=>{if(pack?.downloadUrl)window.launchcat.openExternal(pack.downloadUrl)});
