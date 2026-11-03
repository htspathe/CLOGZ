const fs=require('fs'),path=require('path'),{spawn}=require('child_process');
const {createCanvas,loadImage,GlobalFonts}=require('@napi-rs/canvas');
const {createMotion}=require('./motion');const config=require('./config.json'),bounds=require('./assets/bounds.json');
const base=__dirname,variant=process.argv[2]||'master',mode=process.argv[3]||'video';
async function main(){
GlobalFonts.registerFromPath(path.join(base,'assets/Bricolage-static.ttf'),'Bricolage');GlobalFonts.registerFromPath(path.join(base,'assets/Instrument-static.ttf'),'Instrument');
let assets={};for(const f of fs.readdirSync(path.join(base,'assets'))){if(/\.(png|jpg|webp)$/.test(f)&&!f.startsWith('remote-'))assets[f.replace(/\.[^.]+$/,'')]=await loadImage(path.join(base,'assets',f))}
let v=config.variants[variant],canvas=createCanvas(v.width,v.height),m=createMotion(canvas.getContext('2d'),assets,config,bounds),duration=v.scenes.reduce((a,x)=>a+x[1],0);
if(mode==='stills'){let start=0;for(let i=0;i<v.scenes.length;i++){const t=start+v.scenes[i][1]*.7;m.seek(t,variant);fs.writeFileSync(path.join(base,`output/${variant}-${i}.png`),canvas.toBuffer('image/png'));start+=v.scenes[i][1]}return}
let output=path.join(base,'output',variant+'-silent.mp4');let ff=spawn('ffmpeg',['-y','-v','error','-f','rawvideo','-pix_fmt','rgba','-s',`${v.width}x${v.height}`,'-r',String(config.fps),'-i','pipe:0','-an','-c:v','libx264','-preset','fast','-threads','2','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart',output],{stdio:['pipe','inherit','inherit']});
for(let f=0;f<duration*config.fps;f++){m.seek(f/config.fps,variant);let buf=canvas.data();if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(f%300===0)console.log(variant,`${f/config.fps}/${duration}s`)}ff.stdin.end();await new Promise((r,j)=>ff.on('close',c=>c?j(Error('ffmpeg '+c)):r()));console.log('DONE',output)
}main().catch(e=>{console.error(e);process.exit(1)});
