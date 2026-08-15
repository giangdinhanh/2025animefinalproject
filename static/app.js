const MODEL = {intercept:-108322.54,episodes:2.394,score:13328.82,rank:2.655,popularity:0.245,scoredBy:0.03016,members:0.00278};
function predictFavorites(v){return Math.max(0, MODEL.intercept + MODEL.episodes*v.episodes + MODEL.score*v.score + MODEL.rank*v.rank + MODEL.popularity*v.popularity + MODEL.scoredBy*v.scoredBy + MODEL.members*v.members)}
function animateNumber(el,start,end,duration=900){const t0=performance.now();function tick(t){const p=Math.min((t-t0)/duration,1);const e=1-Math.pow(1-p,3);el.textContent=Math.round(start+(end-start)*e).toLocaleString();if(p<1)requestAnimationFrame(tick)}requestAnimationFrame(tick)}
function performanceLabel(n){if(n>=30000)return 'Very High';if(n>=15000)return 'High';if(n>=5000)return 'Moderate';return 'Low'}
function initPredictor(){const form=document.querySelector('#predictionForm');if(!form)return;const result=document.querySelector('#predictionValue'), card=document.querySelector('#resultCard'), range=document.querySelector('#predictionRange'), level=document.querySelector('#predictionLevel');let last=0;form.addEventListener('submit',e=>{e.preventDefault();const v={episodes:+form.episodes.value,score:+form.score.value,rank:+form.rank.value,popularity:+form.popularity.value,scoredBy:+form.scoredBy.value,members:+form.members.value};if(v.members<v.scoredBy){alert('Members should be greater than or equal to Scored By.');return}const pred=Math.round(predictFavorites(v));animateNumber(result,last,pred);last=pred;range.textContent=`${Math.round(pred*.8).toLocaleString()} – ${Math.round(pred*1.2).toLocaleString()}`;level.textContent=performanceLabel(pred);card.classList.remove('result-active');requestAnimationFrame(()=>card.classList.add('result-active'));});const example=document.querySelector('#loadExample');if(example)example.addEventListener('click',()=>{form.episodes.value=24;form.score.value=8.2;form.rank.value=850;form.popularity.value=420;form.scoredBy.value=125000;form.members.value=310000;});}
function initReveal(){const els=document.querySelectorAll('.reveal');const io=new IntersectionObserver(entries=>entries.forEach(x=>{if(x.isIntersecting){x.target.classList.add('is-visible');io.unobserve(x.target)}}),{threshold:.12});els.forEach((el,i)=>{el.style.transitionDelay=`${Math.min(i*55,280)}ms`;io.observe(el)})}
function initCounters(){document.querySelectorAll('[data-count]').forEach(el=>{const target=+el.dataset.count;const suffix=el.dataset.suffix||'';const io=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){const t0=performance.now();function tick(t){const p=Math.min((t-t0)/1000,1);const val=Math.floor(target*(1-Math.pow(1-p,3)));el.textContent=val.toLocaleString()+suffix;if(p<1)requestAnimationFrame(tick)}requestAnimationFrame(tick);io.disconnect()}})});io.observe(el)})}
function initHeroParallax(){const hero=document.querySelector('.hero-shell');const stage=document.querySelector('.logo-stage');if(!hero||!stage)return;hero.addEventListener('mousemove',e=>{const r=hero.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;stage.style.transform=`translate(calc(-50% + ${x*10}px),calc(-50% + ${y*8}px)) rotate(${-4+x*2}deg)`});hero.addEventListener('mouseleave',()=>stage.style.transform='translate(-50%,-50%) rotate(-4deg)')}
let genreChart=null,trendChart=null,insightRecords=[];
const INSIGHT_COLORS=['#111111','#7f79f2','#9c98ff','#b8b4ff','#ffbd38','#ee2727','#5f58d7','#d3d0ff'];
function fmtCompact(n){if(!Number.isFinite(n))return '—';return new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(n)}
function average(rows,key){const vals=rows.map(r=>+r[key]).filter(Number.isFinite);return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0}
function populateSelect(select,values,prefix){if(!select)return;select.innerHTML=`<option value="all">${prefix}</option>`+values.map(v=>`<option value="${String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;')}">${v}</option>`).join('')}
function getInsightFilters(){return {genre:document.querySelector('#genreFilter')?.value||'all',season:document.querySelector('#seasonFilter')?.value||'all',source:document.querySelector('#sourceFilter')?.value||'all'}}
function filterInsightRecords(){const f=getInsightFilters();return insightRecords.filter(r=>(f.genre==='all'||r.genres.includes(f.genre))&&(f.season==='all'||r.season===f.season)&&(f.source==='all'||r.source===f.source))}
function updateInsightStats(rows){
  const scoreVals=rows.map(r=>+r.score).filter(Number.isFinite);
  const avgFav=average(rows,'favorites'),avgMem=average(rows,'members'),avgSc=scoreVals.length?scoreVals.reduce((a,b)=>a+b,0)/scoreVals.length:0;
  const count=document.querySelector('#matchCount'),fav=document.querySelector('#avgFavorites'),mem=document.querySelector('#avgMembers'),score=document.querySelector('#avgScore');
  if(count)count.textContent=rows.length.toLocaleString();if(fav)fav.textContent=fmtCompact(avgFav);if(mem)mem.textContent=fmtCompact(avgMem);if(score)score.textContent=scoreVals.length?avgSc.toFixed(2):'—';
  const f=getInsightFilters(),parts=[];if(f.genre!=='all')parts.push(f.genre);if(f.season!=='all')parts.push(f.season);if(f.source!=='all')parts.push(f.source);
  const summary=document.querySelector('#filterSummary');if(summary)summary.textContent=rows.length?`${rows.length.toLocaleString()} title${rows.length===1?'':'s'} match ${parts.length?parts.join(' + '):'all filters'}. All cards and charts below use this same cohort.`:`No titles match ${parts.join(' + ')||'the selected filters'}. Try broadening one filter.`;
}
function buildGenreSeries(rows){
  const agg=new Map();
  rows.forEach(r=>r.genres.forEach(g=>{const x=agg.get(g)||{sum:0,count:0};x.sum+=(+r.favorites||0);x.count++;agg.set(g,x)}));
  let arr=[...agg.entries()].map(([genre,x])=>({genre,avg:x.count?x.sum/x.count:0,count:x.count}));
  const chosen=getInsightFilters().genre;
  arr.sort((a,b)=>b.avg-a.avg);
  if(chosen!=='all'){
    const selected=arr.find(x=>x.genre===chosen);const others=arr.filter(x=>x.genre!==chosen).slice(0,7);arr=selected?[selected,...others]:others;
  }else arr=arr.slice(0,8);
  return arr;
}
function updateGenreChart(rows){
  if(!genreChart)return;const series=buildGenreSeries(rows);
  genreChart.data.labels=series.length?series.map(x=>x.genre):['No matching data'];
  genreChart.data.datasets[0].data=series.length?series.map(x=>Math.round(x.avg)):[0];
  genreChart.data.datasets[0].backgroundColor=genreChart.data.labels.map((_,i)=>INSIGHT_COLORS[i%INSIGHT_COLORS.length]);
  genreChart.options.plugins.tooltip.callbacks.afterLabel=(ctx)=>series[ctx.dataIndex]?`Titles in cohort: ${series[ctx.dataIndex].count.toLocaleString()}`:'';
  genreChart.update();
}
function topGenrePairs(rows){
  const pairs=new Map();
  rows.forEach(r=>{const gs=[...new Set(r.genres)].sort();for(let i=0;i<gs.length;i++)for(let j=i+1;j<gs.length;j++){const key=`${gs[i]} + ${gs[j]}`,x=pairs.get(key)||{count:0,sum:0};x.count++;x.sum+=(+r.favorites||0);pairs.set(key,x)}});
  return [...pairs.entries()].map(([name,x])=>({name,count:x.count,avg:x.count?x.sum/x.count:0})).sort((a,b)=>b.count-a.count||b.avg-a.avg).slice(0,4);
}
function updateCombinations(rows){
  const box=document.querySelector('#topCombinations');if(!box)return;const pairs=topGenrePairs(rows);
  if(!pairs.length){box.innerHTML='<div class="genre-row empty"><strong>No multi-genre combinations in this cohort.</strong></div>';return}
  box.innerHTML=pairs.map((p,i)=>`<div class="genre-row"><div class="combo-copy"><strong>${p.name}</strong><span class="combo-meta">${p.count.toLocaleString()} titles · ${fmtCompact(p.avg)} avg favorites</span></div><span class="tier">#${i+1}</span></div>`).join('');
}
function updateTrendChart(rows){
  if(!trendChart)return;const years=Array.from({length:21},(_,i)=>2004+i),totals=new Map(years.map(y=>[y,0]));
  rows.forEach(r=>{if(r.year>=2004&&r.year<=2024)totals.set(r.year,(totals.get(r.year)||0)+(+r.members||0))});
  trendChart.data.labels=years.map(String);trendChart.data.datasets[0].data=years.map(y=>totals.get(y)||0);trendChart.update();
}
function updateInsights(){const rows=filterInsightRecords();updateInsightStats(rows);updateGenreChart(rows);updateCombinations(rows);updateTrendChart(rows)}
async function initInsights(){
  const genreCanvas=document.querySelector('#genreChart'),trendCanvas=document.querySelector('#trendChart');if(!genreCanvas&&!trendCanvas)return;
  if(typeof Chart==='undefined'){const summary=document.querySelector('#filterSummary');if(summary)summary.textContent='Chart.js could not load. Data filters are unavailable.';return}
  genreChart=new Chart(genreCanvas,{type:'bar',data:{labels:[],datasets:[{label:'Avg Favorites',data:[],borderRadius:12,backgroundColor:[]}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>`Avg favorites: ${Math.round(ctx.parsed.y||0).toLocaleString()}`}}},animation:{duration:650,easing:'easeOutQuart'},scales:{x:{grid:{display:false},border:{display:false}},y:{beginAtZero:true,grid:{color:'rgba(17,17,17,.06)'},border:{display:false},ticks:{callback:v=>fmtCompact(v)}}}}});
  trendChart=new Chart(trendCanvas,{type:'line',data:{labels:[],datasets:[{label:'Total Members',data:[],borderColor:'#7f79f2',backgroundColor:'rgba(127,121,242,.13)',fill:true,tension:.38,pointRadius:3,pointHoverRadius:6,pointBackgroundColor:'#111'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>`Members: ${Math.round(ctx.parsed.y||0).toLocaleString()}`}}},animation:{duration:650,easing:'easeOutQuart'},scales:{x:{grid:{display:false},border:{display:false},ticks:{maxRotation:0,autoSkip:true,maxTicksLimit:11}},y:{beginAtZero:true,grid:{color:'rgba(17,17,17,.06)'},border:{display:false},ticks:{callback:v=>fmtCompact(v)}}}}});
  try{
    const data=window.ANIBOMB_INSIGHT_DATA;
    if(!data || !Array.isArray(data.records)) throw new Error('Bundled workbook data is missing');
    insightRecords=data.records;
    populateSelect(document.querySelector('#genreFilter'),data.meta?.genres||[],'All Genres');
    populateSelect(document.querySelector('#seasonFilter'),data.meta?.seasons||['Winter','Spring','Summer','Fall'],'All Seasons');
    populateSelect(document.querySelector('#sourceFilter'),data.meta?.sources||[],'All Sources');
    ['#genreFilter','#seasonFilter','#sourceFilter'].forEach(sel=>document.querySelector(sel)?.addEventListener('change',updateInsights));
    updateInsights();
  }catch(err){
    console.error('Could not load insight data',err);
    const summary=document.querySelector('#filterSummary');
    if(summary)summary.textContent='Workbook data could not be initialized. Confirm static/insight-data.js is present.';
  }
}
document.addEventListener('DOMContentLoaded',()=>{initReveal();initCounters();initHeroParallax();initPredictor();initInsights()});
