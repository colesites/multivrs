export const BROWSER_ANALYTICS_SCRIPT = `(()=>{
const tag=document.currentScript;
const analytics=tag?.dataset.analytics==='1';
const speed=tag?.dataset.speed==='1';
const id=(storage,key)=>{try{let value=storage.getItem(key);if(!value){value=crypto.randomUUID();storage.setItem(key,value)}return value}catch{return crypto.randomUUID()}};
const visitorId=id(localStorage,'multivrs.visitor');
const sessionId=id(sessionStorage,'multivrs.session');
document.cookie='multivrs_session='+encodeURIComponent(sessionId)+'; Path=/; Max-Age=1800; SameSite=Lax; Secure';
const device=()=>innerWidth<768?'mobile':innerWidth<1024?'tablet':'desktop';
const browser=()=>{const value=navigator.userAgent;if(value.includes('Edg/'))return'Edge';if(value.includes('Firefox/'))return'Firefox';if(value.includes('Chrome/'))return'Chrome';if(value.includes('Safari/'))return'Safari';return'Other'};
const context=()=>{const query=new URLSearchParams(location.search);let referrer='';try{referrer=document.referrer?new URL(document.referrer).hostname:''}catch{}return{browser:browser(),device:device(),path:location.pathname,referrer,sessionId,utmCampaign:query.get('utm_campaign')||'',utmMedium:query.get('utm_medium')||'',utmSource:query.get('utm_source')||'',visitorId}};
const send=(path,payload)=>navigator.sendBeacon(path,new Blob([JSON.stringify(payload)],{type:'application/json'}));
const page=()=>{if(analytics)send('/_multivrs/events',{kind:'pageview',...context()})};
const track=event=>{if(!analytics||!event||typeof event.name!=='string')return;send('/_multivrs/events',{kind:'custom',...context(),name:event.name,properties:event.properties||{}})};
window.__multivrsAnalytics={page,track};
for(const item of window.multivrsAnalyticsQueue||[]){if(item[0]==='page')page();else if(item[0]==='event')track(item[1])}
window.multivrsAnalyticsQueue=[];
let current=location.href;
const navigation=()=>{if(location.href===current)return;current=location.href;queueMicrotask(page)};
for(const method of ['pushState','replaceState']){const original=history[method];history[method]=function(...args){const result=original.apply(this,args);navigation();return result}}
addEventListener('popstate',navigation);
if(analytics)page();
if(!speed)return;
const vital=(name,value)=>send('/_multivrs/vitals',{...context(),name,value});
let lcp=0,cls=0,inp=0;
try{
new PerformanceObserver(list=>{for(const entry of list.getEntries())lcp=entry.startTime}).observe({type:'largest-contentful-paint',buffered:true});
new PerformanceObserver(list=>{for(const entry of list.getEntries())if(!entry.hadRecentInput)cls+=entry.value}).observe({type:'layout-shift',buffered:true});
new PerformanceObserver(list=>{for(const entry of list.getEntries())inp=Math.max(inp,entry.duration)}).observe({type:'event',buffered:true,durationThreshold:40});
}catch{}
addEventListener('load',()=>{const entry=performance.getEntriesByType('navigation')[0];if(entry)vital('TTFB',entry.responseStart)});
let flushed=false;
const flush=()=>{if(flushed)return;flushed=true;if(lcp)vital('LCP',lcp);vital('CLS',cls);if(inp)vital('INP',inp)};
addEventListener('pagehide',flush,{once:true});
addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush()},{once:true});
})();`;
