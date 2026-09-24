# -*- coding: utf-8 -*-
"""最小 CDP 客户端：无头 Chrome 打开本地 html 并执行 JS 断言。"""
import json, os, subprocess, time, urllib.request, sys
import websocket

CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
PORT = 9333
PROFILE = r'C:\Users\Windows\Desktop\diwei\_tools\_chromeprofile_rw'


class Cdp:
    def __init__(self):
        self.proc = subprocess.Popen([
            CHROME, '--headless=new', '--disable-gpu', '--no-first-run',
            '--remote-debugging-port=%d' % PORT,
            '--user-data-dir=%s' % PROFILE,
            '--allow-file-access-from-files',
            '--remote-allow-origins=*',
            '--window-size=1600,1000',
            'about:blank'
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        self.ws = None
        for _ in range(80):
            try:
                ver = json.load(urllib.request.urlopen('http://127.0.0.1:%d/json/version' % PORT, timeout=1))
                bws = websocket.create_connection(ver['webSocketDebuggerUrl'], timeout=30)
                bws.send(json.dumps({'id': 1, 'method': 'Target.createTarget', 'params': {'url': 'about:blank'}}))
                while True:
                    m = json.loads(bws.recv())
                    if m.get('id') == 1:
                        tid = m['result']['targetId']
                        break
                bws.send(json.dumps({'id': 2, 'method': 'Target.attachToTarget', 'params': {'targetId': tid, 'flatten': True}}))
                while True:
                    m = json.loads(bws.recv())
                    if m.get('id') == 2:
                        sid = m['result']['sessionId']
                        break
                bws.close()
                self.ws = websocket.create_connection(
                    'ws://127.0.0.1:%d/devtools/page/%s' % (PORT, tid), timeout=60)
                self.id = 100
                return
            except Exception as e:
                last = e
                time.sleep(0.4)
        raise RuntimeError('chrome not ready: %r' % (last,))

    def send(self, method, params=None):
        self.id += 1
        self.ws.send(json.dumps({'id': self.id, 'method': method, 'params': params or {}}))
        while True:
            msg = json.loads(self.ws.recv())
            if msg.get('id') == self.id:
                return msg

    def evaluate(self, expr):
        r = self.send('Runtime.evaluate', {'expression': expr, 'awaitPromise': True, 'returnByValue': True})
        res = r.get('result', {})
        if 'exceptionDetails' in r:
            return {'__error__': json.dumps(r['exceptionDetails'], ensure_ascii=False)[:600]}
        return res.get('result', {}).get('value')

    def open(self, url):
        self.send('Page.enable')
        self.send('Runtime.enable')
        self.send('Page.addScriptToEvaluateOnNewDocument', {'source': INIT})
        self.send('Page.navigate', {'url': url})
        time.sleep(4.0)

    def close(self):
        try:
            self.ws.close()
        except Exception:
            pass
        try:
            self.proc.terminate()
        except Exception:
            pass


PROBE = r"""
(function(){
  var errs = window.__cdpErrors || [];
  var active = document.querySelector('.page.active');
  var nav = document.querySelector('.sidebar .nav-btn.active');
  var login = document.getElementById('loginShell');
  var out = {
    errors: errs,
    activePage: active ? active.id : null,
    activeNav: nav ? nav.getAttribute('data-page') : null,
    activeNavLabel: nav ? nav.textContent.trim() : null,
    loginVisible: login ? (getComputedStyle(login).display !== 'none' && !login.hidden) : null,
    sidebarCount: document.querySelectorAll('.sidebar .nav-btn').length,
    pageSections: document.querySelectorAll('section.page').length,
    cssLoaded: !!document.querySelector('link[rel=stylesheet]') &&
               Array.from(document.styleSheets).some(function(ss){ try { return ss.cssRules && ss.cssRules.length > 100; } catch(e){ return false; } }),
    bodyText: (active ? active.innerText.length : 0),
    scrollW: document.body.scrollWidth,
    clientW: document.documentElement.clientWidth,
    title: document.title
  };
  return JSON.stringify(out);
})()
"""

INIT = """
window.__cdpErrors = [];
window.addEventListener('error', function(e){ window.__cdpErrors.push(String(e.message)); }, true);
window.addEventListener('unhandledrejection', function(e){ window.__cdpErrors.push('reject:' + String(e.reason)); });
"""

if __name__ == '__main__':
    urls = sys.argv[1:]
    c = Cdp()
    try:
        for u in urls:
            c.open(u)
            v = c.evaluate(PROBE)
            print('==== ' + u)
            print(v)
    finally:
        c.close()
