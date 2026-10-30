export const canEnter = steps => steps.length === 2 && steps.every(Boolean);
export const secondsLeft = (deadline, now = Date.now()) => Math.max(0, Math.ceil((deadline-now)/1000));
export const canOpenStep = (index, steps) => index === 0 || (index === 1 && steps[0] === true);
export const wheelRotation = sector => 2880 - (sector*45 + 44.4);
export const wheelSegments = [
 {type:'dragon',label:'Shadow Dragon',image:'assets/shadow-dragon-hq.png'},
 {type:'pet',label:'Kangaroo',image:'assets/kangaroo.png',referencePrice:7.09},
 {type:'empty',label:'No prize'},
 {type:'pet',label:'Turtle',image:'assets/turtle.png',referencePrice:8.88},
 {type:'pet',label:'Strawberry Shortcake Bat Dragon',image:'assets/strawberry-bat-dragon.png',referencePrice:17.75},
 {type:'empty',label:'No prize'},
 {type:'pet',label:'Crow',image:'assets/crow.png',referencePrice:49.99},
 {type:'pet',label:'Evil Unicorn',image:'assets/evil-unicorn.png',referencePrice:51.98}
];

export const spinProgress = t => 1 - Math.pow(1-Math.min(1,Math.max(0,t)),3);
export function pointerDeflection(angle, sinceRelease) {
 const phase=((angle%45)+45)%45;
 if(phase>=35){const t=(phase-35)/10;return -28*t*t*(3-2*t);}
 if(sinceRelease<95){const t=Math.max(0,sinceRelease)/95;return -28*Math.pow(1-t,3)+4*Math.sin(Math.PI*t);}
 return 0;
}
export const demoSpinSectors = [1,2,0];
export function rotationAfter(previous,sector) {
 const landingAngle=sector*45+(sector===0?44.4:sector===1?34:22.5);
 const target=(360-landingAngle)%360;
 return Math.ceil((previous+2520-target)/360)*360+target;
}
