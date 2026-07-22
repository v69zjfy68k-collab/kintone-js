(function () {
  'use strict';

  // 予定をタップした時に「編集画面」へ直接飛ばすカスタマイズ
  // PC・モバイル両対応

  var BOUND = false;

  function isMobilePath() {
    return location.pathname.indexOf('/k/m/') === 0;
  }

  function getAppId() {
    try {
      if (isMobilePath() && kintone.mobile && kintone.mobile.app) {
        return kintone.mobile.app.getId();
      }
      if (kintone.app && kintone.app.getId) {
        return kintone.app.getId();
      }
    } catch (e) {}
    return null;
  }

  function goToEdit(recordId) {
    var appId = getAppId();
    if (!appId || !recordId) {
      return;
    }
    var base = isMobilePath() ? '/k/m/' : '/k/';
    location.href =
      location.origin + base + appId + '/show#record=' + recordId + '&mode=edit';
  }

  // カレンダー上の各予定要素を監視し、クリックをフックする
  function hookCalendarClicks() {
    document.addEventListener(
      'click',
      function (e) {
        var el = e.target;
        if (!el) return;

        // fullcalendar系の予定要素を辿る
        var eventEl = el.closest
          ? el.closest('.fc-event, .fc-daygrid-event, .fc-timegrid-event, a.fc-event')
          : null;

        if (!eventEl) return;

        // data 属性 or href からレコードIDを抽出
        var recordId = null;

        // 1) data-record-id
        if (eventEl.dataset && eventEl.dataset.recordId) {
          recordId = eventEl.dataset.recordId;
        }

        // 2) href="....#record=123"
        if (!recordId) {
          var href = eventEl.getAttribute && eventEl.getAttribute('href');
          if (href) {
            var m = href.match(/record=(\d+)/);
            if (m) recordId = m[1];
          }
        }

        // 3) 子要素の data 属性を探す
        if (!recordId) {
          var withData = eventEl.querySelector && eventEl.querySelector('[data-record-id]');
          if (withData) recordId = withData.getAttribute('data-record-id');
        }

        if (!recordId) return;

        // 標準の遷移を止めて編集画面へ
        e.preventDefault();
        e.stopPropagation();
        goToEdit(recordId);
      },
      true
    );

    BOUND = true;
  }

  kintone.events.on(
    ['app.record.index.show', 'mobile.app.record.index.show'],
    function (event) {
      if (!BOUND) {
        hookCalendarClicks();
      }
      return event;
    }
  );
})();
