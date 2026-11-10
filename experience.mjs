// Camera recognition and viewport policy only. No scientific animation is rebuilt here.
export class Experience {
  constructor({stopCamera,loadAnimation,isLandscape,show,report}) {
    Object.assign(this,{stopCamera,loadAnimation,isLandscape,show,report});
    this.recognized=false;this.started=false;this.ready=false;this.allowPortrait=false;this.disposed=false;this.api=null;
  }
  async recognize() {
    if(this.recognized||this.disposed)return;
    this.recognized=true;
    // Camera is shut down before loading/orientation waiting, not after playback.
    await this.stopCamera();
    if(this.disposed)return;
    this.show(this.isLandscape()?'loading':'rotate');
    try {
      this.api=await this.loadAnimation();
      if(this.disposed)return;
      this.ready=true;this.maybeStart();
    } catch(error) { if(!this.disposed)this.report('The animation could not load. Please reload this page.',error); }
  }
  viewportChanged(){if(this.recognized&&!this.started&&!this.disposed)this.maybeStart();}
  continueAnyway(){this.allowPortrait=true;this.maybeStart();}
  maybeStart(){
    if(this.disposed||!this.recognized||this.started)return;
    if(!this.isLandscape()&&!this.allowPortrait){this.show('rotate');return;}
    if(!this.ready){this.show('loading');return;}
    this.started=true;this.show('playing');
    // Native playback API, after the iframe has loaded. No synthetic button click.
    this.api.start({restart:true});
  }
  async dispose(){this.disposed=true;this.api?.pause();await this.stopCamera();}
}
