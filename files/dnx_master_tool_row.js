/* DNX_MASTER_TOOL_ROW_START */
(function(){
  "use strict";

  if(window.__dnxMasterToolRow) return;
  window.__dnxMasterToolRow=true;

  var ROW_ID="dnx-master-tool-row";

  var TOOLS=[
    {
      id:"dnx-master-yellow",
      label:"Gelb Hover",
      color:"#ffd400",
      textColor:"#000",
      original:"dnx-btn-yellow-line",
      state:function(){
        return !!window.__dnxYellowEnabled;
      }
    },
    {
      id:"dnx-master-green",
      label:"Gruen Tuning",
      color:"#22d94b",
      textColor:"#000",
      original:"dnx-btn-green-line",
      state:function(){
        return !!window.__dnxGreenEnabled;
      }
    },
    {
      id:"dnx-master-status",
      label:"DNX Status",
      color:"#168cff",
      textColor:"#fff",
      original:"dnx-btn-status-toggle",
      state:function(){
        var element=document.getElementById(
          "dnx-live-status"
        );

        return visible(element);
      }
    },
    {
      id:"dnx-master-3d",
      label:"3D Tool",
      color:"#7257ff",
      textColor:"#fff",
      original:"dnx-btn-3d-tool-toggle",
      state:function(){
        return visible(
          document.getElementById("dnx-3d-win") ||
          document.getElementById(
            "dnx-3dtool-window"
          )
        );
      }
    },
    {
      id:"dnx-master-photo",
      label:"noVNC / Foto",
      color:"#1414b8",
      textColor:"#fff",
      original:"dnx-photo-desc-toggle-btn",
      state:function(){
        var element=document.querySelector(
          ".openwebrx-description-container"
        );

        return !!(
          visible(element) &&
          element.classList.contains("expanded")
        );
      }
    },
    {
      id:"dnx-master-remote",
      label:"Remote VIEW",
      color:"#008ca8",
      textColor:"#fff",
      original:"dnx-remote-view-btn",
      state:function(){
        return visible(
          document.getElementById(
            "dnx-source-panel"
          )
        );
      }
    }
  ];

  function visible(element){
    if(!element) return false;

    var style=getComputedStyle(element);

    return (
      style.display!=="none" &&
      style.visibility!=="hidden" &&
      style.opacity!=="0"
    );
  }

  function installStyle(){
    if(
      document.getElementById(
        "dnx-master-tool-row-style"
      )
    ) return;

    var style=document.createElement("style");
    style.id="dnx-master-tool-row-style";

    style.textContent=`
      /*
       * Technische Originalzeile vollständig aus dem Layout
       * entfernen. Originalschalter bleiben per JavaScript
       * anklickbar.
       */
      #dnx-line-toggle-box{
        position:absolute !important;
        left:-100000px !important;
        top:-100000px !important;
        display:block !important;
        width:1px !important;
        height:1px !important;
        min-width:0 !important;
        min-height:0 !important;
        max-width:1px !important;
        max-height:1px !important;
        padding:0 !important;
        margin:0 !important;
        overflow:hidden !important;
        opacity:0 !important;
        visibility:hidden !important;
        pointer-events:none !important;
      }

      #dnx-master-tool-row{
        display:grid !important;
        grid-template-columns:
          repeat(
            auto-fit,
            minmax(108px,1fr)
          ) !important;
        gap:6px !important;
        width:100% !important;
        min-width:0 !important;
        padding:0 !important;
        margin:6px 0 8px !important;
        box-sizing:border-box !important;
        contain:layout !important;
      }

      #dnx-master-tool-row > button{
        position:relative !important;
        inset:auto !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        width:100% !important;
        min-width:0 !important;
        max-width:none !important;
        height:28px !important;
        padding:0 5px !important;
        margin:0 !important;
        border:1px solid #fff !important;
        border-radius:999px !important;
        color:#fff !important;
        font:700 11px/1 Segoe UI,sans-serif !important;
        white-space:nowrap !important;
        overflow:hidden !important;
        text-overflow:ellipsis !important;
        cursor:pointer !important;
        opacity:1 !important;
        filter:none !important;
        transform:none !important;
        transition:none !important;
        animation:none !important;
        box-shadow:none !important;
      }

      #dnx-master-remote{
        grid-column:span 2 !important;
        min-width:150px !important;
      }

      #dnx-master-tool-row > button::before,
      #dnx-master-tool-row > button::after{
        display:none !important;
        content:none !important;
        animation:none !important;
      }

      @media(max-width:430px){
        #dnx-master-tool-row{
          grid-template-columns:
            repeat(2,minmax(0,1fr))
            !important;
        }
      }

      @media(max-width:260px){
        #dnx-master-tool-row{
          grid-template-columns:
            1fr !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function getReceiver(){
    return document.getElementById(
      "openwebrx-panel-receiver"
    );
  }

  function createRow(){
    var receiver=getReceiver();

    if(!receiver) return null;

    var row=document.getElementById(ROW_ID);

    if(row) return row;

    row=document.createElement("div");
    row.id=ROW_ID;

    /*
     * Direkt vor Gelb/Grün beziehungsweise vor der
     * Frequenzanzeige einsetzen.
     */
    var frequency=
      receiver.querySelector(
        ".webrx-actual-freq-holder"
      ) ||
      receiver.querySelector(
        ".webrx-actual-freq"
      );

    var anchor=frequency;

    while(
      anchor &&
      anchor.parentNode &&
      anchor.parentNode!==receiver
    ){
      anchor=anchor.parentNode;
    }

    if(anchor && anchor.parentNode===receiver){
      receiver.insertBefore(row,anchor);
    }else{
      receiver.insertBefore(
        row,
        receiver.firstChild
      );
    }

    TOOLS.forEach(function(tool){
      var button=document.createElement("button");
      button.id=tool.id;
      button.type="button";

      button.addEventListener(
        "click",
        function(event){
          event.preventDefault();
          event.stopPropagation();

          var original=document.getElementById(
            tool.original
          );

          if(original){
            original.click();
          }

          window.setTimeout(paint,80);
          window.setTimeout(paint,300);
        }
      );

      row.appendChild(button);
    });

    return row;
  }

  function paint(){
    installStyle();

    var row=createRow();

    if(!row) return;

    TOOLS.forEach(function(tool){
      var button=document.getElementById(
        tool.id
      );

      if(!button) return;

      var active=false;

      try{
        active=!!tool.state();
      }catch(error){}

      button.textContent=
        tool.label +
        ": " +
        (active ? "On" : "Off");

      button.style.setProperty(
        "background",
        active ? tool.color : "#666666",
        "important"
      );

      button.style.setProperty(
        "color",
        active ? tool.textColor : "#ffffff",
        "important"
      );

      button.style.setProperty(
        "animation",
        "none",
        "important"
      );

      button.style.setProperty(
        "transition",
        "none",
        "important"
      );

      button.style.setProperty(
        "transform",
        "none",
        "important"
      );

      button.style.setProperty(
        "filter",
        "none",
        "important"
      );

      try{
        button.getAnimations().forEach(
          function(animation){
            animation.cancel();
          }
        );
      }catch(error){}
    });
  }

  function boot(){
    installStyle();
    paint();

    /*
     * Nur Farben/Text aktualisieren.
     * Keine Elemente verschieben oder neu erzeugen.
     */
    setInterval(paint,500);
  }

  if(document.readyState==="loading"){
    document.addEventListener(
      "DOMContentLoaded",
      boot,
      {once:true}
    );
  }else{
    boot();
  }

  window.addEventListener("load",paint);
})();
/* DNX_MASTER_TOOL_ROW_END */
