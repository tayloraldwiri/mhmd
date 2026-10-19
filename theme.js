// Load the preference before page content is painted.
(()=>{
 const key='al-homsi-theme-v2';
 let theme='light';
 try{if(localStorage.getItem(key)==='dark')theme='dark'}catch{}
 const root=document.documentElement;
 function applyTheme(){
  root.dataset.theme=theme;
  root.style.colorScheme='dark';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#060c09':'#101c19');
  const control=document.querySelector('.theme-switch');
  if(control){
   control.setAttribute('aria-pressed',String(theme==='dark'));
   // The page localisation layer translates this canonical Arabic label.
   control.setAttribute('aria-label',theme==='dark'?'تفعيل الوضع الفاتح':'تفعيل الوضع الداكن');
  }
 }
 applyTheme();
 function initialise(){
  applyTheme();
  document.querySelector('.theme-switch')?.addEventListener('click',()=>{
   theme=theme==='dark'?'light':'dark';
   try{localStorage.setItem(key,theme)}catch{}
   applyTheme();
  });
  window.addEventListener('storage',event=>{
   if(event.key===key){theme=event.newValue==='dark'?'dark':'light';applyTheme()}
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialise,{once:true});else initialise();
})();
