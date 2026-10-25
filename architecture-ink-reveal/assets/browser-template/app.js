'use strict';
(() => {
const $ = id => document.getElementById(id);
const config = Object.assign({title:'Architektur in Tusche',subtitle:'',duration:12000,mode:'both',direction:'top-down',loop:false,autoplay:true,background:'#f5f2e9',ink:'#111111'},window.ARCHITECTURE_CONFIG);
const duration=config.duration,cv=$('drawing'),ctx=cv.getContext('2d');
const mask=document.createElement('canvas');
let mx,maskData,field,img,segments=[],time=0,playing=false,loop=config.loop,last=null,frameId=0;
const clamp=x=>Math.min(1,Math.max(0,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
function hash(x,y){let n=Math.imul(x,374761393)+Math.imul(y,668265263);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;}
function noise(x,y){const a=Math.floor(x),b=Math.floor(y),u=smooth(x-a),v=smooth(y-b);return(hash(a,b)*(1-u)+hash(a+1,b)*u)*(1-v)+(hash(a,b+1)*(1-u)+hash(a+1,b+1)*u)*v;}
function prepareField(w,h){
  const scale=Math.min(1,384/Math.max(w,h));mask.width=Math.max(2,Math.round(w*scale));mask.height=Math.max(2,Math.round(h*scale));
  mx=mask.getContext('2d');maskData=mx.createImageData(mask.width,mask.height);field=new Float32Array(mask.width*mask.height);
  for(let y=0;y<mask.height;y++)for(let x=0;x<mask.width;x++){
    const i=y*mask.width+x,nx=x/(mask.width-1),ny=y/(mask.height-1);
    let position=ny;
    if(config.direction==='bottom-up')position=1-ny;
    else if(config.direction==='left-right')position=nx;
    else if(config.direction==='center-out')position=Math.hypot(nx-.5,ny-.5)/Math.SQRT1_2;
    const blot=noise(x/40,y/40)*.55+noise(x/16,y/16)*.3+noise(x/6,y/6)*.15;
    field[i]=position*.62+blot*.32+hash(x+800,y+900)*.06;
    maskData.data[i*4]=maskData.data[i*4+1]=maskData.data[i*4+2]=255;
  }
}
function render(ms){
  time=Math.max(0,Math.min(duration,ms));const p=time/duration;
  ctx.clearRect(0,0,cv.width,cv.height);
  if(config.mode!=='contours'){
    const r=clamp((p-(config.mode==='ink'?0:.133))/.717)*1.12-.06;
    for(let i=0;i<field.length;i++)maskData.data[i*4+3]=p>=.85?255:p===0?0:Math.round(smooth((r-field[i])/.065)*255);
    mx.putImageData(maskData,0,0);
    ctx.save();ctx.globalCompositeOperation='source-over';ctx.drawImage(mask,0,0,cv.width,cv.height);
    ctx.globalCompositeOperation='source-in';ctx.drawImage(img,0,0,cv.width,cv.height);ctx.restore();
  }
  const fade=config.mode==='both'?1-smooth((p-.733)/.117):1;
  for(const s of segments){s.el.style.strokeDashoffset=String(1-smooth((p-s.delay)/s.length));s.el.style.opacity=String(fade);}
  $('progress').value=String(p*1000);$('progress').setAttribute('aria-valuetext',`${(time/1000).toFixed(1)} von ${(duration/1000).toFixed(1)} Sekunden`);
  $('time').textContent=`${(time/1000).toFixed(1).padStart(4,'0')} / ${(duration/1000).toFixed(1)} s`;
  const phase=p>=.85?'Fertig':config.mode==='contours'?'Kontur':config.mode==='ink'?'Tusche':p<.133?'Kontur':'Tusche';
  if($('phase').textContent!==phase)$('phase').textContent=phase;
}
function updateButton(){$('play').innerHTML=playing?'Pause <span aria-hidden="true">Ⅱ</span>':'Abspielen <span aria-hidden="true">▷</span>';$('play').setAttribute('aria-label',playing?'Animation pausieren':'Animation abspielen');}
function tick(stamp){
  if(!playing)return;
  const delta=last===null?0:stamp-last;last=stamp;
  if(time+delta>=duration){if(loop){render(0);}else{render(duration);playing=false;last=null;updateButton();return;}}
  else render(time+delta);
  frameId=requestAnimationFrame(tick);
}
function start(){cancelAnimationFrame(frameId);if(time>=duration)render(0);playing=true;last=null;updateButton();frameId=requestAnimationFrame(tick);}
function pause(){playing=false;last=null;cancelAnimationFrame(frameId);updateButton();}
$('play').addEventListener('click',()=>playing?pause():start());
$('replay').addEventListener('click',()=>{render(0);start();});
$('progress').addEventListener('input',e=>{pause();render(Number(e.target.value)/1000*duration);});
$('loop').addEventListener('click',()=>{loop=!loop;$('loop').setAttribute('aria-pressed',String(loop));if(loop&&time>=duration)start();});
document.addEventListener('visibilitychange',()=>{last=null;});
async function init(){
  document.title=config.title;$('title').textContent=config.title;$('subtitle').textContent=config.subtitle;
  document.documentElement.style.setProperty('--paper',config.background);$('contours').style.stroke=config.ink;
  const response=await fetch('assets/drawing.json');if(!response.ok)throw new Error('Linien konnten nicht geladen werden.');
  const meta=await response.json();if(!(meta.w>0&&meta.h>0))throw new Error('Ungültige Bildmaße.');
  cv.width=meta.w;cv.height=meta.h;$('sheet').style.aspectRatio=`${meta.w}/${meta.h}`;$('contours').setAttribute('viewBox',`0 0 ${meta.w} ${meta.h}`);
  $('dimensions').textContent=`${meta.w} × ${meta.h} · TUSCHE`;
  img=new Image();img.src='assets/drawing.png';await img.decode();if(img.naturalWidth!==meta.w||img.naturalHeight!==meta.h)throw new Error('Bild und Linien haben unterschiedliche Maße.');
  prepareField(meta.w,meta.h);
  const all=config.mode==='ink'?[]:[...(meta.ground?[meta.ground]:[]),...meta.lines];
  for(let i=0;i<all.length;i++){
    const[x1,y1,x2,y2]=all[i],el=document.createElementNS('http://www.w3.org/2000/svg','line');
    for(const[key,value]of Object.entries({x1,y1,x2,y2,pathLength:1}))el.setAttribute(key,String(value));
    el.style.strokeDasharray='1';el.style.strokeDashoffset='1';$('contours').appendChild(el);
    const base=config.mode==='contours'?.52:.22;
    segments.push({el,delay:i===0?0:.02+Math.min(y1,y2)/meta.h*base+(i%7)*.004,length:i===0?.1:.035+Math.hypot(x2-x1,y2-y1)/Math.max(meta.w,meta.h)*.13});
  }
  $('start-phase').textContent=config.mode==='ink'?'TUSCHE':'KONTUR';$('middle-phase').textContent=config.mode==='contours'?'LINIEN':'TUSCHE';
  $('loop').setAttribute('aria-pressed',String(loop));$('loading').hidden=true;$('sheet').setAttribute('aria-busy','false');
  for(const id of['play','replay','progress'])$(id).disabled=false;
  window.architecturePreview={seek:ms=>{pause();render(ms);},get state(){return{time,playing,loop,lines:segments.length,width:cv.width,height:cv.height,duration,mode:config.mode,direction:config.direction};}};
  render(0);if(matchMedia('(prefers-reduced-motion: reduce)').matches){render(duration);updateButton();}else if(config.autoplay)start();else updateButton();
}
init().catch(error=>{$('loading').hidden=true;$('error').hidden=false;$('error').textContent=error.message;$('sheet').setAttribute('aria-busy','false');console.error(error);});
})();
