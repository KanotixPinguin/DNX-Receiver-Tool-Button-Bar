#!/usr/bin/env bash
set -Eeuo pipefail
CMD=${1:-install};C=${CONTAINER:-owrx-8013};HERE=$(cd "$(dirname "$0")"&&pwd);BACK=/opt/dnx-tool-button-bar-backups
paths(){ S=$(docker inspect "$C" --format '{{range .Mounts}}{{if eq .Destination "/usr/lib/python3/dist-packages/htdocs/plugins"}}{{.Source}}{{end}}{{end}}');I="$S/receiver/init.js";D="$S/receiver/dnx_master_tool_row";[[ -f $I ]]||exit 1;}
remove(){ python3 - "$I" <<'PY'
from pathlib import Path
import sys
p=Path(sys.argv[1]);t=p.read_text();a='/* DNX_MASTER_TOOL_ROW_LOADER_START */';b='/* DNX_MASTER_TOOL_ROW_LOADER_END */'
if a in t and b in t:x,y=t.split(a,1);_,z=y.split(b,1);p.write_text(x+z)
PY
}
install(){ [[ $EUID -eq 0 ]]||exit 1;paths;T=$(date +%F-%H%M%S);mkdir -p "$BACK/$T" "$D";cp -a "$I" "$BACK/$T/init.js";cp "$HERE/files/dnx_master_tool_row.js" "$D/";remove;cat >>"$I" <<'JS'
/* DNX_MASTER_TOOL_ROW_LOADER_START */
(function(){if(window.__dnxMasterRowReleaseLoader)return;window.__dnxMasterRowReleaseLoader=true;var s=document.createElement('script');s.src='/static/plugins/receiver/dnx_master_tool_row/dnx_master_tool_row.js';document.head.appendChild(s)})();
/* DNX_MASTER_TOOL_ROW_LOADER_END */
JS
docker restart "$C";echo 'Installiert. 60–90 Sekunden warten.';}
uninstall(){ [[ $EUID -eq 0 ]]||exit 1;paths;remove;rm -rf "$D";docker restart "$C";}
status(){ paths;grep -q DNX_MASTER_TOOL_ROW_LOADER_START "$I"&&echo installiert||echo fehlt;}
case "$CMD" in install|update)install;;uninstall)uninstall;;status)status;;*)echo 'install | update | status | uninstall';;esac
