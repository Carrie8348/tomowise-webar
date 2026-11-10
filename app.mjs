import {Experience} from './experience.mjs';
import {releaseCamera} from './camera.mjs';
const $=s=>document.querySelector(s),camera=$('#camera'),frame=$('#animation');
let tracker=null,run=0,animationPromise=null,startTimer=null;
function show(name){
 document.querySelectorAll('.screen').forEach(e=>e.hidden=e.id!==name);
 const player=$('#playing'),preparing=name==='rotate'||name==='loading';
 // Keep the iframe laid out while loading, so SVG getBBox() has real geometry.
 if(preparing)player.hidden=false;
 player.style.visibility=preparing?'hidden':'visible';player.inert=preparing;player.setAttribute('aria-hidden',String(preparing));
 $('#portraitHint').hidden=!experience.started||landscape();
}
function landscape(){return matchMedia('(orientation: landscape)').matches;}
function stopCamera(instance=tracker){
 const ownsView=instance===tracker;
 releaseCamera(instance,ownsView?[...camera.querySelectorAll('video')]:[]);
 if(ownsView){clearTimeout(startTimer);camera.replaceChildren();}
}
function report(message,error){console.error(error||message);stopCamera();$('#errorText').textContent=message;show('error');}
function loadAnimation(){
  if(animationPromise)return animationPromise;
  animationPromise=new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(new Error('Animation readiness timeout')),25000);
    frame.addEventListener('load',()=>{
      clearTimeout(timeout);
      try{const api=frame.contentWindow.TomoWISE;if(typeof api?.start!=='function')throw new Error('Animation integration API missing');resolve(api);}catch(error){reject(error);}
    },{once:true});
    frame.addEventListener('error',()=>{clearTimeout(timeout);reject(new Error('Animation request failed'));},{once:true});
    // The integration copy initializes paused at zero, even while hidden in portrait.
    frame.src='./animation-webar.html';
  });return animationPromise;
}
const experience=new Experience({stopCamera,loadAnimation,isLandscape:landscape,show,report});
async function startScanner(){
  const token=++run;$('#start').disabled=true;
  try{
    if(!window.isSecureContext)throw new Error('Open this experience over HTTPS, or localhost on this computer. Camera access is unavailable over ordinary HTTP.');
    if(!navigator.mediaDevices?.getUserMedia)throw new Error('This browser cannot access a camera. Try Safari on iPhone or Chrome on Android.');
    if(!window.WebGLRenderingContext)throw new Error('This experience needs WebGL support.');
    show('scanner');$('#scanStatus').textContent='Starting your camera…';
    const [{MindARThree},target]=await Promise.all([import('mindar-image-three'),fetch('./targets.mind',{cache:'no-cache'})]);
    if(!target.ok)throw new Error('The compiled logo target could not load. Check that targets.mind is beside index.html.');
    if(token!==run)return;
    tracker=new MindARThree({container:camera,imageTargetSrc:'./targets.mind',maxTrack:1,uiLoading:'no',uiScanning:'no',uiError:'no'});
    const anchor=tracker.addAnchor(0);
    anchor.onTargetFound=()=>{if(token===run&&!experience.recognized)queueMicrotask(()=>experience.recognize());};
    let timedOut=false;
    const startingTracker=tracker;const startup=startingTracker.start();
    startup.then(()=>{if(token!==run||timedOut||experience.recognized)stopCamera(startingTracker);},()=>{});
    await Promise.race([startup,new Promise((_,reject)=>{startTimer=setTimeout(()=>{timedOut=true;reject(new Error('Camera setup timed out. Allow camera access, then try again.'));},60000);})]);
    clearTimeout(startTimer);
    if(token!==run||experience.recognized){stopCamera();return;}
    $('#scanStatus').textContent='Hold the full logo in view. Recognition starts the animation automatically.';
  }catch(error){if(token===run&&!experience.recognized)report(error?.message||'Camera access was not granted. Allow camera access in your browser and try again.',error);}
  finally{$('#start').disabled=false;}
}
$('#start').addEventListener('click',startScanner);
$('#cancel').addEventListener('click',()=>{run++;stopCamera();show('welcome');$('#start').disabled=false;});
$('#retry').addEventListener('click',()=>{if(experience.recognized)location.reload();else startScanner();});
$('#continue').addEventListener('click',()=>experience.continueAnyway());
function viewportChanged(){experience.viewportChanged();$('#portraitHint').hidden=!experience.started||landscape();}
window.addEventListener('resize',viewportChanged);window.addEventListener('orientationchange',viewportChanged);
matchMedia('(orientation: landscape)').addEventListener?.('change',viewportChanged);
window.addEventListener('pagehide',()=>{run++;experience.dispose();});
// No fake recognition/skip path is shipped: targetIndex 0 must be detected first.

window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
