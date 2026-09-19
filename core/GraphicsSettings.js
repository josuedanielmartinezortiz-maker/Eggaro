export const GraphicsSettings={
  maxPixelRatio(){return Math.min(window.devicePixelRatio||1,2)},
  quality(){
    const p=window.devicePixelRatio||1;
    if(innerWidth<700)return p>1.5?"medium":"low";
    return "high";
  }
};
