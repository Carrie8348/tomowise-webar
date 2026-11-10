// Release camera tracks even if the tracker is only partly initialized or stop() throws.
export function releaseCamera(instance,extraVideos=[]){
  const videos=[...new Set([...extraVideos,instance?.video].filter(Boolean))];
  const tracks=[...new Set(videos.flatMap(v=>v.srcObject?.getTracks?.()||[]))];
  try{if(instance?.controller&&instance?.video?.srcObject)instance.stop();else instance?.controller?.stopProcessVideo();}catch(error){console.warn('Tracker shutdown:',error);}
  for(const track of tracks){try{track.stop();}catch{}}
  for(const video of videos){try{video.pause();video.srcObject=null;video.remove();}catch{}}
  try{instance?.renderer?.setAnimationLoop(null);instance?.renderer?.dispose();}catch{}
  instance?.ui?.hideLoading?.();instance?.ui?.hideScanning?.();
  return tracks.length;
}
