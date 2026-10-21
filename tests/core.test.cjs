const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('../electron/launchcat-core.cjs');

test('parse GitHub url',()=>{
  assert.deepEqual(core.parseRepoInput('https://github.com/coocoomaomao/ShotCat'),{owner:'coocoomaomao',repo:'ShotCat',fullName:'coocoomaomao/ShotCat'});
  assert.deepEqual(core.parseRepoInput('coocoomaomao/ShotCat'),{owner:'coocoomaomao',repo:'ShotCat',fullName:'coocoomaomao/ShotCat'});
});

test('extract markdown bullets',()=>{assert.deepEqual(core.extractFeatures('# x\n- 本地处理\n- 一键导出\n- 本地处理',5),['本地处理','一键导出']);});
test('build launch pack',()=>{const p=core.buildLaunchPack({name:'ShotCat',description:'截图美化工具',html_url:'https://github.com/x/y',features:['A','B','C','D'],packageVersion:'0.4.0'});assert.equal(p.version,'v0.4.0');assert.match(p.xhs,/ShotCat/);assert.match(p.release,/What's new/);});
test('poster export name',()=>{assert.equal(core.exportName('ShotCat','cover'),'ShotCat_cover_1080x1440.png');});
