(function(R){
  const timeline=[];let data=null,profileEnabled=false;
  const ready=typeof document!=='undefined'?fetch('music-timeline.json').then(r=>{if(!r.ok)throw Error('Timeline HTTP '+r.status);return r.json();}).then(configure):Promise.resolve();
  function configure(json){data=json;timeline.splice(0,timeline.length,...data.scenes);return data;}
  function scene(t){return timeline.find(s=>t<s.end)||timeline[timeline.length-1];}
  function envelope(t){if(!data||!profileEnabled)return null;const index=Geo.clamp(t/data.method.profileStep,0,data.profile.length-1),i=Math.floor(index),u=index-i;
    const a=data.profile[i],b=data.profile[Math.min(i+1,data.profile.length-1)];return Object.fromEntries(['rms','bass','mid','high'].map((k,j)=>[k,Geo.mix(a[j],b[j],u)]));}
  function features(t,live={},enabled=true){
    const base={rms:0,bass:0,mid:0,high:0,event:0};if(!enabled)return base;
    const recorded=envelope(t);Object.assign(base,recorded||live);
    if(recorded)for(const k of ['bass','mid','high'])base[k]=Geo.clamp(base[k]+(live[k]||0)*.12);
    for(const e of data?.events||[]){const dt=t-e.time;if(dt>=0&&dt<e.duration)base.event=Math.max(base.event,e.strength*Math.exp(-dt*3/e.duration));}
    return base;
  }
  const originalLength={boot:5,creation:6,dimension:7,life:7,consciousness:5};
  function render(t,w,h,live={},enabled=true){t=Geo.clamp(t,0,30);const s=scene(t);if(!s)return new ASCII.Grid(w,h);
    const f=features(t,live,enabled),local=s=>((t-s.start)/(s.end-s.start))*originalLength[s.id];
    let a=Scenes[s.id](local(s),w,h,f,s.params);const next=timeline[timeline.indexOf(s)+1];
    if(next&&t>s.end-s.transition){const u=Geo.smooth(s.end-s.transition,s.end,t),b=Scenes[next.id](local(next),w,h,f,next.params);
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){const ac=a.cells[y][x],bc=b.cells[y][x];if(bc[0]!==' '&&Geo.hash(x+y*w)<u)a.cells[y][x]=bc;else ac[2]=(ac[2]??1)*(1-u);}}
    for(const e of data?.events||[]){const dt=t-e.time;if(!['first-entry','energy-break'].includes(e.label)||dt<0||dt>e.duration)continue;
      const u=dt/e.duration,r=.06+u*1.35;
      for(let layer=0;layer<3;layer++)for(let i=0;i<200;i++){const angle=i/200*Math.PI*2,rr=r-layer*.045;
        Geo.point(a,Math.cos(angle)*rr,Math.sin(angle)*rr*1.6,layer===0?'#':'+',layer===1?3:1,(1-u)*.9);}}
    return a;
  }
  R.Director={timeline,ready,configure,scene,render,features,envelope,setProfile:enabled=>{profileEnabled=enabled;},get data(){return data;}};
})(globalThis);
