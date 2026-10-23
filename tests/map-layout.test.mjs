import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {JSDOM} from 'jsdom';
test('admin and teacher maps keep their full height while the student map shares space with its home button',async()=>{
 const dom=new JSDOM('<style></style><main class="main map-main" id="teacher"><div class="map-page"><div class="map-canvas"></div></div></main><main class="main map-main" id="student"><button class="student-home-return">Accueil</button><div class="map-page"><div class="map-canvas"></div></div></main>',{url:'https://fixture.invalid'});
 try{dom.window.document.querySelector('style').textContent=await readFile('src/style.css','utf8');const style=id=>dom.window.getComputedStyle(dom.window.document.querySelector(id));
  assert.equal(style('#teacher .map-page').height,'100%','a map whose controls are absolutely positioned must retain a non-zero parent height');
  assert.equal(style('#student').display,'flex');assert.equal(style('#student .map-page').flexGrow,'1');assert.equal(style('#student .map-page').height,'auto');
 }finally{dom.window.close();}
});
