import{g as M,E,b as V,s as W,r as v,d as S,t as d,j as u,V as g,C as z,H as G,T as q,e as F,f as P,h as A,i as y,k as U,l as Y,m as $,n as X,o as J,p as K,R as k,_ as w,a as c,q as B}from"./vendors.db22028b.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))t(a);new MutationObserver(a=>{for(const r of a)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&t(i)}).observe(document,{childList:!0,subtree:!0});function n(a){const r={};return a.integrity&&(r.integrity=a.integrity),a.referrerPolicy&&(r.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?r.credentials="include":a.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function t(a){if(a.ep)return;a.ep=!0;const r=n(a);fetch(a.href,r)}})();var Q=`
/* H5 端隐藏 TabBar 空图标（只隐藏没有 src 的图标） */
.weui-tabbar__icon:not([src]),
.weui-tabbar__icon[src=''] {
  display: none !important;
}

.weui-tabbar__item:has(.weui-tabbar__icon:not([src])) .weui-tabbar__label,
.weui-tabbar__item:has(.weui-tabbar__icon[src='']) .weui-tabbar__label {
  margin-top: 0 !important;
}

/* Vite 错误覆盖层无法选择文本的问题 */
vite-error-overlay {
  /* stylelint-disable-next-line property-no-vendor-prefix */
  -webkit-user-select: text !important;
}

vite-error-overlay::part(window) {
  max-width: 90vw;
  padding: 10px;
}

.taro_page {
  overflow: auto;
}

::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* H5 导航栏页面自动添加顶部间距 */
body.h5-navbar-visible .taro_page {
  padding-top: 44px;
}
`,Z=`
/* PC 宽屏适配 - 基础布局 */
@media (min-width: 769px) {
  html {
    font-size: 15px !important;
  }

  body {
    background-color: #f3f4f6 !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    min-height: 100vh !important;
  }
}
`,ee=`
/* PC 宽屏适配 - 手机框样式（有 TabBar 页面） */
@media (min-width: 769px) {
  .taro-tabbar__container {
    width: 375px !important;
    max-width: 375px !important;
    height: calc(100vh - 40px) !important;
    max-height: 900px !important;
    background-color: #fff !important;
    transform: translateX(0) !important;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1) !important;
    border-radius: 20px !important;
    overflow: hidden !important;
    position: relative !important;
  }

  .taro-tabbar__panel {
    height: 100% !important;
    overflow: auto !important;
  }
}

/* PC 宽屏适配 - 手机框样式（无 TabBar 页面，通过 JS 添加 no-tabbar 类） */
@media (min-width: 769px) {
  body.no-tabbar #app {
    width: 375px !important;
    max-width: 375px !important;
    height: calc(100vh - 40px) !important;
    max-height: 900px !important;
    background-color: #fff !important;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1) !important;
    border-radius: 20px !important;
    overflow: hidden !important;
    position: relative !important;
    transform: translateX(0) !important;
  }

  body.no-tabbar #app .taro_router {
    height: 100% !important;
    overflow: auto !important;
  }
}
`;function te(){var o=document.createElement("style");o.innerHTML=Q+Z+ee,document.head.appendChild(o)}function ne(){var o=function(){var t=!!document.querySelector(".taro-tabbar__container");document.body.classList.toggle("no-tabbar",!t)};o();var e=new MutationObserver(o);e.observe(document.body,{childList:!0,subtree:!0})}function ae(){te(),ne()}function re(){var o=M();if(o===E.WEAPP||o===E.TT)try{var e=V(),n=e.miniProgram.envVersion;console.log("[Debug] envVersion:",n),n!=="release"&&W({enableDebug:!0})}catch(t){console.error("[Debug] 开启调试模式失败:",t)}}var ie={visible:!1,title:"",bgColor:"#ffffff",textStyle:"black",navStyle:"default",transparent:"none",leftIcon:"none"},oe=function(){var e,n=F();return(n==null||(e=n.config)===null||e===void 0?void 0:e.window)||{}},ue=function(){var e,n,t=(e=F())===null||e===void 0||(e=e.config)===null||e===void 0?void 0:e.tabBar;return new Set((t==null||(n=t.list)===null||n===void 0?void 0:n.map(function(a){return a.pagePath}))||[])},se=function(e,n,t){if(!e)return"none";var a=e==="pages/index/index"||e==="/pages/index/index",r=n.has(e),i=t>1;return r||a?"none":i?"back":"home"},le=function(){var e=v.useState(ie),n=S(e,2),t=n[0],a=n[1],r=v.useState(0),i=S(r,2),D=i[0],j=i[1],h=v.useCallback(function(){var s=d.getCurrentPages(),l=s[s.length-1],b=(l==null?void 0:l.route)||"",p=(l==null?void 0:l.config)||{},f=oe(),_=ue(),I=b==="pages/index/index"||b==="/pages/index/index",R=_.has(b),T=_.size<=1&&s.length<=1&&(I||R);a({visible:!T,title:p.navigationBarTitleText||f.navigationBarTitleText||"",bgColor:p.navigationBarBackgroundColor||f.navigationBarBackgroundColor||"#ffffff",textStyle:p.navigationBarTextStyle||f.navigationBarTextStyle||"black",navStyle:p.navigationStyle||f.navigationStyle||"default",transparent:p.transparentTitle||f.transparentTitle||"none",leftIcon:T?"none":se(b,_,s.length)})},[]);d.useDidShow(function(){h()}),d.usePageScroll(function(s){var l=s.scrollTop;t.transparent==="auto"&&j(Math.min(l/100,1))}),v.useEffect(function(){var s=document.querySelector("title")||document.head,l=new MutationObserver(function(){return h()});return l.observe(s,{subtree:!0,childList:!0,characterData:!0}),function(){return l.disconnect()}},[h]);var x=t.visible&&t.navStyle!=="custom";if(v.useEffect(function(){x?document.body.classList.add("h5-navbar-visible"):document.body.classList.remove("h5-navbar-visible")},[x]),!x)return u.jsx(u.Fragment,{});var C=t.textStyle==="white"?"#fff":"#333",L=t.textStyle==="white"?"text-white":"text-gray-800",H=function(){return t.transparent==="always"?{backgroundColor:"transparent"}:t.transparent==="auto"?{backgroundColor:t.bgColor,opacity:D}:{backgroundColor:t.bgColor}},N=function(){return d.navigateBack()},O=function(){return d.reLaunch({url:"/pages/index/index"})};return u.jsxs(u.Fragment,{children:[u.jsxs(g,{className:"fixed top-0 left-0 right-0 h-11 flex items-center justify-center z-1000",style:H(),children:[t.leftIcon==="back"&&u.jsx(g,{className:"absolute left-2 top-1_f2 -translate-y-1_f2 p-1 flex items-center justify-center",onClick:N,children:u.jsx(z,{size:24,color:C})}),t.leftIcon==="home"&&u.jsx(g,{className:"absolute left-2 top-1_f2 -translate-y-1_f2 p-1 flex items-center justify-center",onClick:O,children:u.jsx(G,{size:22,color:C})}),u.jsx(q,{className:"text-base font-medium max-w-3_f5 truncate ".concat(L),children:t.title})]}),u.jsx(g,{className:"h-11 shrink-0"})]})},ce=function(e){var n=e.children;return u.jsxs(u.Fragment,{children:[u.jsx(le,{}),n]})},de=function(e){var n=e.children;return d.useLaunch(function(){re(),ae()}),u.jsx(ce,{children:n})},pe=function(e){var n=e.children;return u.jsx(de,{children:n})},m=P.__taroAppConfig={router:{},pages:["pages/index/index","pages/detail/index","pages/statistics/index"],window:{backgroundTextStyle:"light",navigationBarBackgroundColor:"#ffffff",navigationBarTitleText:"活体昆虫库存管理",navigationBarTextStyle:"black"}};m.routes=[Object.assign({path:"pages/index/index",load:function(){var o=w(c().m(function n(t,a){var r;return c().w(function(i){for(;;)switch(i.n){case 0:return i.n=1,B(()=>import("./index.30d57eab.js"),["js/index.30d57eab.js","js/vendors.db22028b.js","css/vendors.8886af03.css","js/common.a6b9d69a.js","css/index.e3b0c442.css"]);case 1:return r=i.v,i.a(2,[r,t,a])}},n)}));function e(n,t){return o.apply(this,arguments)}return e}()},{navigationBarTitleText:"首页"}),Object.assign({path:"pages/detail/index",load:function(){var o=w(c().m(function n(t,a){var r;return c().w(function(i){for(;;)switch(i.n){case 0:return i.n=1,B(()=>import("./index.cfad0fa9.js"),["js/index.cfad0fa9.js","js/vendors.db22028b.js","css/vendors.8886af03.css"]);case 1:return r=i.v,i.a(2,[r,t,a])}},n)}));function e(n,t){return o.apply(this,arguments)}return e}()},{navigationBarTitleText:"昆虫详情",navigationBarBackgroundColor:"#ffffff",navigationBarTextStyle:"black"}),Object.assign({path:"pages/statistics/index",load:function(){var o=w(c().m(function n(t,a){var r;return c().w(function(i){for(;;)switch(i.n){case 0:return i.n=1,B(()=>import("./index.dd09c3c1.js"),["js/index.dd09c3c1.js","js/vendors.db22028b.js","css/vendors.8886af03.css","js/common.a6b9d69a.js","css/index.684166aa.css"]);case 1:return r=i.v,i.a(2,[r,t,a])}},n)}));function e(n,t){return o.apply(this,arguments)}return e}()},{navigationBarTitleText:"数据统计"})];Object.assign(A,{findDOMNode:y.findDOMNode,render:y.render,unstable_batchedUpdates:y.unstable_batchedUpdates});U();var fe=Y(pe,k,A,m),ve=$({window:P});X(m);J(ve,fe,m,k);K({designWidth:750,deviceRatio:{375:2,640:1.17,750:1,828:.905},baseFontSize:20,unitPrecision:void 0,targetUnit:void 0});
