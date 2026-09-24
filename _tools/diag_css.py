# -*- coding: utf-8 -*-
"""找出真正作用在某个 .twod-ds-card 上的所有 CSS 规则。"""
import sys, time, json
sys.path.insert(0, r'C:\Users\Windows\Desktop\diwei\_tools')
from cdp import Cdp

URL = 'file:///C:/Users/Windows/Desktop/diwei/lowdim-database-twod.html'
WAIT = "(function(){return new Promise(function(r){setTimeout(function(){r(1);},600);});})()"
LOGIN = "(function(){var b=document.querySelector('[data-standard-login-submit]');if(b)b.click();return 1;})()"
NAV = "(function(){var n=document.querySelector('.sidebar .nav-btn[data-page=\"lowdim-database-twod\"]');if(n)n.click();return 1;})()"

PROBE = """
(function(){
  var card = document.querySelector('#page-lowdim-database-twod .twod-ds-card');
  if (!card) return 'NO CARD';
  var hits = [];
  var total = 0;
  Array.prototype.forEach.call(document.styleSheets, function(ss){
    var rules;
    try { rules = ss.cssRules; } catch(e) { return; }
    Array.prototype.forEach.call(rules, function(r){
      if (!r.selectorText) { if (r.cssRules) Array.prototype.forEach.call(r.cssRules, function(x){ if(x.selectorText) test(x); }); return; }
      test(r);
      function test(rule){
        total++;
        if (!rule.selectorText) return;
        var parts = rule.selectorText.split(',');
        for (var i=0;i<parts.length;i++){
          try { if (card.matches(parts[i].trim())) { hits.push(rule.selectorText + ' => ' + (rule.style.cssText || '').slice(0,220)); break; } } catch(e){}
        }
      }
    });
  });
  var cs = getComputedStyle(card);
  return JSON.stringify({
    tag: card.tagName, cls: card.className,
    bg: cs.backgroundColor, radius: cs.borderRadius, overflow: cs.overflow,
    borderTop: cs.borderTopWidth + ' ' + cs.borderTopColor,
    margin: cs.margin, boxShadow: cs.boxShadow,
    ruleCount: total, hits: hits
  }, null, 1);
})()
"""

c = Cdp()
try:
    c.open(URL)
    time.sleep(2.0)
    c.evaluate(LOGIN); time.sleep(0.8); c.evaluate(NAV); c.evaluate(WAIT)
    print(c.evaluate(PROBE))
finally:
    c.close()
