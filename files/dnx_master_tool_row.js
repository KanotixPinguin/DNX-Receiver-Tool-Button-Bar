/* DNX_MASTER_TOOL_ROW_START */
(function(){
  "use strict";
  if(window.__dnxMasterToolRow) return;
  window.__dnxMasterToolRow=true;

  var ROW_ID="dnx-master-tool-row";
  var ORDER_KEY="dnx.toolrow.order.v1";
  var POS_KEY="dnx.toolrow.pos.v1";

  var TOOLS=[
    { id:"dnx-master-yellow", label:"Gelb Hover", color:"#ffd400", textColor:"#000", original:"dnx-btn-yellow-line", state:function(){ return !!window.__dnxYellowEnabled; } },
    { id:"dnx-master-green", label:"Gruen Tuning", color:"#22d94b", textColor:"#000", original:"dnx-btn-green-line", state:function(){ return !!window.__dnxGreenEnabled; } },
    { id:"dnx-master-status", label:"DNX Status", color:"#168cff", textColor:"#fff", original:"dnx-btn-status-toggle", state:function(){ return visible(document.getElementById("dnx-live-status")); } },
    { id:"dnx-master-3d", label:"3D Tool", color:"#7257ff", textColor:"#fff", original:"dnx-btn-3d-tool-toggle", state:function(){ return visible(document.getElementById("dnx-3d-win") || document.getElementById("dnx-3dtool-window")); } },
    { id:"dnx-master-photo", label:"noVNC / Foto", color:"#1414b8", textColor:"#fff", original:"dnx-photo-desc-toggle-btn", state:function(){ var el=document.querySelector(".openwebrx-description-container"); return !!(visible(el) && el.classList.contains("expanded")); } },
    { id:"dnx-master-remote", label:"Remote VIEW", color:"#008ca8", textColor:"#fff", original:"dnx-remote-view-btn", state:function(){ return visible(document.getElementById("dnx-source-panel")); } }
  ];

  function visible(el){ if(!el) return false; var st=getComputedStyle(el); return (st.display!=="none" && st.visibility!=="hidden" && st.opacity!=="0"); }
  function loadOrder(){ try{ var a=JSON.parse(localStorage.getItem(ORDER_KEY)||"[]"); return Array.isArray(a)?a:[]; }catch(e){return [];} }
  function saveOrder(row){ try{ localStorage.setItem(ORDER_KEY,JSON.stringify([].slice.call(row.querySelectorAll("button[data-tool-id]")).map(function(b){return b.id;}))); }catch(e){} }
  function loadPos(){ try{ var p=JSON.parse(localStorage.getItem(POS_KEY)||"null"); return (p&&isFinite(p.left)&&isFinite(p.top))?p:null; }catch(e){return null;} }
  function savePos(p){ try{ if(p) localStorage.setItem(POS_KEY,JSON.stringify(p)); else localStorage.removeItem(POS_KEY); }catch(e){} }

  function applyBarPos(row){
    var p=loadPos();
    if(p){
      if(row.parentNode!==document.body) document.body.appendChild(row);
      row.classList.add("dnx-row-floating");
      row.style.setProperty("position","fixed","important");
      row.style.setProperty("left",Math.max(4,Math.min(window.innerWidth-220,Math.round(p.left)))+"px","important");
      row.style.setProperty("top",Math.max(4,Math.min(window.innerHeight-60,Math.round(p.top)))+"px","important");
      row.style.setProperty("width","310px","important");
      row.style.setProperty("z-index","1000640","important");
    } else {
      row.classList.remove("dnx-row-floating");
      ["position","left","top","width","z-index"].forEach(function(k){row.style.removeProperty(k);});
    }
  }

  function installStyle(){
    if(document.getElementById("dnx-master-tool-row-style")) return;
    var style=document.createElement("style"); style.id="dnx-master-tool-row-style";
    style.textContent=`
      #dnx-line-toggle-box{position:absolute !important;left:-100000px !important;top:-100000px !important;width:1px !important;height:1px !important;overflow:hidden !important;opacity:0 !important;visibility:hidden !important;pointer-events:none !important;}
      #dnx-master-tool-row{display:grid !important;grid-template-columns:repeat(auto-fit,minmax(108px,1fr)) !important;gap:6px !important;margin:6px 0 8px 0 !important;padding:4px !important;border-radius:10px !important;background:rgba(10,18,26,.55) !important;border:1px solid rgba(255,255,255,.16) !important;}
      #dnx-master-tool-row.dnx-row-floating{background:rgba(8,14,22,.92) !important;box-shadow:0 8px 26px rgba(0,0,0,.6) !important;border:1px solid rgba(119,234,255,.55) !important;}
      #dnx-master-row-grip{grid-column:1 / -1 !important;display:flex !important;align-items:center !important;justify-content:space-between !important;font:700 10px/1.2 'Segoe UI',sans-serif !important;color:#9cc7dc !important;padding:2px 6px !important;cursor:grab !important;user-select:none !important;touch-action:none !important;}
      #dnx-master-tool-row > button{height:28px !important;padding:0 8px !important;border-radius:999px !important;border:1px solid #fff !important;font:700 11.5px/1 'Segoe UI',sans-serif !important;white-space:nowrap !important;overflow:hidden !important;text-overflow:ellipsis !important;cursor:grab !important;opacity:1 !important;filter:none !important;transform:none !important;transition:none !important;animation:none !important;box-shadow:none !important;touch-action:none !important;}
      #dnx-master-tool-row > button.dnx-btn-dragging{outline:2px dashed #ffcf40 !important;opacity:.82 !important;}
      #dnx-master-tool-row > button::before,#dnx-master-tool-row > button::after{display:none !important;content:none !important;animation:none !important;}
      @media(max-width:430px){#dnx-master-tool-row{grid-template-columns:repeat(2,minmax(0,1fr)) !important;}}
    `;
    document.head.appendChild(style);
  }
  function getReceiver(){ return document.getElementById("openwebrx-panel-receiver"); }
  function attachRowDrag(grip, row){
    if(grip.__dnxGripInit) return; grip.__dnxGripInit = true;
    var dragging=false,sx=0,sy=0,ol=0,ot=0,moved=false;
    grip.addEventListener("pointerdown",function(e){
      if(e.button!==undefined && e.button!==0) return;
      dragging=true;moved=false;var r=row.getBoundingClientRect();sx=e.clientX;sy=e.clientY;ol=r.left;ot=r.top;
      grip.style.cursor="grabbing";try{grip.setPointerCapture(e.pointerId);}catch(err){}e.preventDefault();
    });
    grip.addEventListener("pointermove",function(e){
      if(!dragging) return;
      var dx=e.clientX-sx,dy=e.clientY-sy;
      if(!moved && Math.abs(dx)+Math.abs(dy)<=5) return;
      moved=true;
      if(row.parentNode!==document.body) document.body.appendChild(row);
      row.classList.add("dnx-row-floating");
      row.style.setProperty("position","fixed","important");
      row.style.setProperty("width","310px","important");
      row.style.setProperty("z-index","1000640","important");
      row.style.setProperty("left",Math.max(4,Math.min(window.innerWidth-314,Math.round(ol+dx)))+"px","important");
      row.style.setProperty("top",Math.max(4,Math.min(window.innerHeight-80,Math.round(ot+dy)))+"px","important");
    });
    function endGrip(e){
      if(!dragging) return; dragging=false; grip.style.cursor="grab";
      try{if(grip.releasePointerCapture)grip.releasePointerCapture(e.pointerId);}catch(err){}
      if(moved){ var r=row.getBoundingClientRect(); savePos({left:Math.round(r.left),top:Math.round(r.top)}); }
    }
    grip.addEventListener("pointerup",endGrip); grip.addEventListener("pointercancel",endGrip);
    grip.addEventListener("dblclick",function(e){
      e.preventDefault();e.stopPropagation();savePos(null);
      try{localStorage.removeItem(ORDER_KEY);}catch(err){}
      var rec=getReceiver();
      if(rec){
        var freq=rec.querySelector(".webrx-actual-freq-holder")||rec.querySelector(".webrx-actual-freq");
        var anc=freq;while(anc&&anc.parentNode&&anc.parentNode!==rec)anc=anc.parentNode;
        if(anc&&anc.parentNode===rec)rec.insertBefore(row,anc);else rec.insertBefore(row,rec.firstChild);
      }
      TOOLS.forEach(function(t){var el=document.getElementById(t.id);if(el)row.appendChild(el);});
      applyBarPos(row);
    });
  }
  function attachBtnReorder(button, row){
    if(button.__dnxBtnReorder) return; button.__dnxBtnReorder=true;
    var down=false,moved=false,sx=0,sy=0;
    button.addEventListener("pointerdown",function(e){ if(e.button!==undefined&&e.button!==0) return; down=true;moved=false;sx=e.clientX;sy=e.clientY;try{button.setPointerCapture(e.pointerId);}catch(err){} });
    button.addEventListener("pointermove",function(e){
      if(!down) return;
      if(!moved && Math.abs(e.clientX-sx)+Math.abs(e.clientY-sy)<=8) return;
      moved=true; button.classList.add("dnx-btn-dragging");
      var under=[].slice.call(row.querySelectorAll("button[data-tool-id]")).find(function(other){
        if(other===button) return false;
        var r=other.getBoundingClientRect();
        return e.clientX>=r.left && e.clientX<=r.right && e.clientY>=r.top && e.clientY<=r.bottom;
      });
      if(under){
        var kids=[].slice.call(row.children);
        if(kids.indexOf(button)<kids.indexOf(under)) row.insertBefore(button,under.nextSibling); else row.insertBefore(button,under);
        saveOrder(row);
      }
    });
    function up(e){
      if(!down) return; down=false; button.classList.remove("dnx-btn-dragging");
      try{if(button.releasePointerCapture)button.releasePointerCapture(e.pointerId);}catch(err){}
      if(moved){ button.dataset.dnxSuppress="1"; setTimeout(function(){delete button.dataset.dnxSuppress;},220); }
    }
    button.addEventListener("pointerup",up); button.addEventListener("pointercancel",up);
  }
  function createRow(){
    var receiver=getReceiver(); if(!receiver && !loadPos()) return null;
    var row=document.getElementById(ROW_ID); if(row) return row;
    row=document.createElement("div"); row.id=ROW_ID;
    var grip=document.createElement("div"); grip.id="dnx-master-row-grip";
    grip.innerHTML='<span>⠿ Werkzeuge (Buttons ziehen = sortieren)</span><span>Doppelklick = Reset</span>';
    row.appendChild(grip); attachRowDrag(grip, row);
    var order=loadOrder(), map={}; TOOLS.forEach(function(t){map[t.id]=t;});
    var ordered=[]; order.forEach(function(id){if(map[id]){ordered.push(map[id]);delete map[id];}}); TOOLS.forEach(function(t){if(map[t.id])ordered.push(t);});
    ordered.forEach(function(tool){
      var button=document.createElement("button"); button.id=tool.id; button.setAttribute("data-tool-id",tool.id); button.type="button";
      button.title="Klick = Umschalten · Ziehen über anderen Button = Reihenfolge ändern";
      button.addEventListener("click",function(event){
        event.preventDefault();event.stopPropagation(); if(button.dataset.dnxSuppress) return;
        var original=document.getElementById(tool.original); if(original) original.click();
        window.setTimeout(paint,80); window.setTimeout(paint,300);
      });
      attachBtnReorder(button,row); row.appendChild(button);
    });
    if(loadPos()){ document.body.appendChild(row); applyBarPos(row); }
    else if(receiver){
      var freq=receiver.querySelector(".webrx-actual-freq-holder")||receiver.querySelector(".webrx-actual-freq");
      var anc=freq;while(anc&&anc.parentNode&&anc.parentNode!==receiver) anc=anc.parentNode;
      if(anc&&anc.parentNode===receiver) receiver.insertBefore(row,anc); else receiver.insertBefore(row,receiver.firstChild);
    }
    return row;
  }
  function paint(){
    installStyle(); var row=createRow(); if(!row) return;
    TOOLS.forEach(function(tool){
      var button=document.getElementById(tool.id); if(!button) return;
      var active=false; try{active=!!tool.state();}catch(error){}
      button.textContent=tool.label+": "+(active?"On":"Off");
      button.style.setProperty("background",active?tool.color:"#666666","important");
      button.style.setProperty("color",active?tool.textColor:"#ffffff","important");
      ["animation","transition","transform","filter"].forEach(function(k){button.style.setProperty(k,"none","important");});
    });
  }
  function boot(){ installStyle(); paint(); setInterval(paint,500); }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot,{once:true}); else boot();
  window.addEventListener("load",paint);
})();
/* DNX_MASTER_TOOL_ROW_END */
