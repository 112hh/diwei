(function(){
  var fields = window.__rwDbg.fields();
  var ok = 0;
  fields.forEach(function (f) {
    var el = document.querySelector('#rwEntryMask [data-rw-ef="' + f.key + '"]');
    if (!el) return;
    var v;
    if (f.type === 'select') { el.selectedIndex = 0; el.dispatchEvent(new Event('change', {bubbles: true})); ok++; return; }
    if (f.rule === 'formula') v = 'H2O';
    else if (f.rule === 'coord') v = 'X 0.10 0.20 0.30';
    else if (f.rule === 'gap') v = '1.68';
    else if (f.rule === 'fe') v = '-1.20';
    else if (f.rule === 'pos' || f.rule === 'num') v = '1.50';
    else if (f.rule === 'range') v = (f.min != null ? String((Number(f.min) + (Number(f.max != null ? f.max : f.min + 10)) ) / 2) : '1');
    else v = '示例体系-' + f.key;
    el.value = v;
    el.dispatchEvent(new Event('input', {bubbles: true}));
    el.dispatchEvent(new Event('change', {bubbles: true}));
    ok++;
  });
  return ok;
})()