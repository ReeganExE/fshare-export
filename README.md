# `fshare` Export bookmarklet

> Export `fshare` items in a folder

Exporting files/folders links in a folder to a CSV file. Useful for a long list folder. It will automatically visit all the pages of current folder.

## :framed_picture: Usage

Add a bookmark to your browser with the following code. Go to a fshare folder then click the bookmark and wait for a moment. A CSV file should be opened for downloading.

```js
javascript:(()=>{"use strict";var e={6191:(e,n,t)=>{t(720),function(e,n){const t="https://www.fshare.vn";let r="";const i=["folder","file"],s=e,c=[];let l=500;(function e(n=`/v3/files/folder?linkcode=${s}&sort=type%2Cname&per-page=50`){return fetch(`${t}/api${n}`,{referrer:`${t}/folder/${s}`,method:"GET",mode:"cors",credentials:"include"}).then((e=>e.json())).then((n=>{if(r||(r=n.current.name),c.push(...n.items.map((e=>Object.assign(e,{link:`${t}/${i[e.type]}/${e.linkcode}`})))),0==l--)return;const o=n._links.next;return o?(console.log("Getting",o),e(o)):void 0}))})().then((()=>{console.log(c);const e=c.map((e=>[e.link,e.name,...o(e)].join(","))).join("\n");console.save(e,n||`${r}.csv`)}))}(function(){const e=window.angular.element(document.querySelector(".download-folder-container")).scope().folder.breadcumbs;if(e&&e.length)return e[e.length-1].linkcode;return window.location.pathname.split("/folder/")[1]}());function o(e){if(e.beautiSize)return[e.beautiSize,e.beautiSize.split(" ")[0]];const n=(e.size/1048576).toFixed(2);return[`${n} MB`,n]}},720:(e,n)=>{Object.defineProperty(n,"__esModule",{value:!0}),window.console.save=function(e,n){if(!e)return void console.error("Console.save: No data");n||(n="console.json"),"object"==typeof e&&(e=JSON.stringify(e,void 0,2));const t=new Blob([e],{type:"text/json"}),o=document.createEvent("MouseEvents"),r=document.createElement("a");r.download=n,r.href=window.URL.createObjectURL(t),r.dataset.downloadurl=["text/json",r.download,r.href].join(":"),o.initMouseEvent("click",!0,!1,window,0,0,0,0,0,!1,!1,!1,!1,0,null),r.dispatchEvent(o)}}},n={};!function t(o){if(n[o])return n[o].exports;var r=n[o]={exports:{}};return e[o](r,r.exports,t),r.exports}(6191)})();
```

Source code: [fshare-folder.ts](./fshare-folder.ts)  
Uglified: [fshare-folder.js](./fshare-folder.js)  

> :cyclone: This is not a complete project. Just opening a part of it for fun :cupid:.