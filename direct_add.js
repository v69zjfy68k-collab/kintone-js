(function () {
  'use strict';

  var BUTTON_ID = 'direct-add-button';

  function addButton() {
    if (document.getElementById(BUTTON_ID)) {
      return;
    }

    var space = kintone.mobile.app.getHeaderSpaceElement();
    if (!space) {
      return;
    }

    var box = document.createElement('div');
    box.style.padding = '10px';
    box.style.background = '#ffffff';

    var btn = document.createElement('button');
    btn.id = BUTTON_ID;
    btn.textContent = '＋ 予定を追加';
    btn.style.width = '100%';
    btn.style.padding = '14px';
    btn.style.fontSize = '17px';
    btn.style.fontWeight = 'bold';
    btn.style.border = 'none';
    btn.style.borderRadius = '10px';
    btn.style.background = '#1976d2';
    btn.style.color = '#ffffff';

    btn.onclick = function () {
      var appId = kintone.mobile.app.getId();
      location.href = location.origin + '/k/m/' + appId + '/edit';
    };

    box.appendChild(btn);
    space.appendChild(box);
  }

  kintone.events.on('mobile.app.record.index.show', function (event) {
    addButton();
    return event;
  });
})();
