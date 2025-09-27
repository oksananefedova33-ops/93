// /editor/assets/resize-stage.js — вертикальная ручка для изменения высоты окна редактора (сцены)
(function(){
  'use strict';
  const LS_KEY = 'zerro.stage.height';

  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }
  function getMinHeightPx(el){
    const v = parseFloat(getComputedStyle(el).minHeight || '0');
    return isFinite(v) ? v : 0;
  }

  function install(){
    const frame = document.querySelector('.device-frame');
    const stage = document.getElementById('stage');
    if (!frame || !stage) return;

    // ручка
    const res = document.createElement('div');
    res.className = 'stage-resizer';
    frame.appendChild(res);

    // восстановление сохранённой высоты
    try{
      const saved = parseInt(localStorage.getItem(LS_KEY)||'', 10);
      if (isFinite(saved) && saved>0){
        stage.style.height = saved + 'px';
        window.stageUserResized = true;   // выключаем авто‑подстройку
        window.stageAutoGrownOnce = true; // и считаем, что она уже была
      }
    }catch(e){}

    let dragging = false;
    let startY = 0, startH = 0;
    const minH = Math.max(getMinHeightPx(stage) || 720, 400);

    const onMove = (e)=>{
      if(!dragging) return;
      const dy = e.clientY - startY;
      const h = clamp(Math.round(startH + dy), minH, 10000);
      stage.style.height = h + 'px';
    };
    const stop = ()=>{
      if(!dragging) return;
      dragging = false;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', stop, true);
      document.body.classList.remove('stage-resize-active');
      window.stageUserResized = true;
      window.stageAutoGrownOnce = true;
      try{ localStorage.setItem(LS_KEY, String(Math.round(stage.getBoundingClientRect().height))); }catch(e){}
    };
    res.addEventListener('pointerdown', (e)=>{
      dragging = true;
      startY = e.clientY;
      startH = Math.round(stage.getBoundingClientRect().height);
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', stop, true);
      document.body.classList.add('stage-resize-active');
      try{ res.setPointerCapture(e.pointerId); }catch(e){}
      e.preventDefault();
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }
})();
