(function () {
  'use strict';

  function isMobile() {
    return location.pathname.indexOf('/k/m/') === 0;
  }
  function getAppId() {
    try {
      if (isMobile() && kintone.mobile && kintone.mobile.app) {
        return kintone.mobile.app.getId();
      }
      if (kintone.app && kintone.app.getId) {
        return kintone.app.getId();
      }
    } catch (e) {}
    return null;
  }
  function goEdit(recordId) {
    var appId = getAppId();
    if (!appId || !recordId) return;
    var base = isMobile() ? '/k/m/' : '/k/';
    location.href =
      location.origin + base + appId + '/show#record=' + recordId + '&mode=edit';
  }
  // e.target から祖先方向に record id を探索
  function findRecordId(el) {
    var cur = el;
    while (cur && cur !== document.documentElement) {
      if (cur.dataset) {
        if (cur.dataset.recordId) return cur.dataset.recordId;
        if (cur.dataset.eventId)  return cur.dataset.eventId;
        if (cur.dataset.id)       return cur.dataset.id;
        for (var k in cur.dataset) {
          if (/record[_-]?id|^id$/i.test(k) && cur.dataset[k]) {
            return cur.dataset[k];
          }
        }
      }
      var href = cur.getAttribute && cur.getAttribute('href');
      if (href) {
        var m = href.match(/record=(\d+)/);
        if (m) return m[1];
      }
      var oc = cur.getAttribute && cur.getAttribute('onclick');
      if (oc) {
        var m2 = oc.match(/record=(\d+)/);
        if (m2) return m2[1];
      }
      // 子要素を最後に一応見る
      if (cur.querySelector) {
        var child = cur.querySelector('[data-record-id],[data-event-id]');
        if (child && child.dataset) {
          if (child.dataset.recordId) return child.dataset.recordId;
          if (child.dataset.eventId)  return child.dataset.eventId;
        }
      }
      cur = cur.parentNode;
    }
    return null;
  }

  // (A) ページ全体のクリックを capture で先取り
  document.addEventListener(
    'click',
    function (e) {
      var recId = findRecordId(e.target);
      if (!recId) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      goEdit(recId);
    },
    true
  );

  // (B) 動的に出てくる詳細ポップアップの編集リンクURLを補正
  var observer = new MutationObserver(function () {
    var nodes = document.querySelectorAll(
      'a[href*="/show#record="]:not([data-edit-ok])'
    );
    for (var i = 0; i < nodes.length; i++) {
      var a = nodes[i];
      var h = a.getAttribute('href');
      if (!h || h.indexOf('mode=edit') >= 0) continue;
      a.setAttribute('href', h + '&mode=edit');
      a.setAttribute('data-edit-ok', '1');
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // kintone 標準イベント（ダミー、PC/sp両対応）
  kintone.events.on(
    ['app.record.index.show', 'mobile.app.record.index.show'],
    function (e) { return e; }
  );
})();
