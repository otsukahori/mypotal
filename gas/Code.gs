// ── HTMLページを配信 ──
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('MyPortal')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ── Gmail 未読5件取得 ──
function getGmailMessages() {
  try {
    const threads = GmailApp.search('is:unread in:inbox', 0, 5);
    return threads.map(function(thread) {
      const msg = thread.getMessages()[0];
      const from = msg.getFrom();
      const fromName = from.replace(/\s*<[^>]+>/, '').trim() || from;
      const body = msg.getPlainBody() || '';
      return {
        from: fromName,
        subject: msg.getSubject() || '(件名なし)',
        snippet: body.replace(/\s+/g, ' ').slice(0, 120),
        date: Utilities.formatDate(msg.getDate(), Session.getScriptTimeZone(), 'M/d HH:mm')
      };
    });
  } catch(e) {
    return { error: e.message };
  }
}

// ── 今日のカレンダー予定取得 ──
function getCalendarEvents() {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const events = CalendarApp.getDefaultCalendar().getEvents(start, end);
    return events.map(function(ev) {
      const isAllDay = ev.isAllDayEvent();
      const startTime = isAllDay ? '終日' : Utilities.formatDate(ev.getStartTime(), Session.getScriptTimeZone(), 'HH:mm');
      const endTime   = isAllDay ? ''    : Utilities.formatDate(ev.getEndTime(),   Session.getScriptTimeZone(), 'HH:mm');
      return {
        title:    ev.getTitle() || '(タイトルなし)',
        start:    startTime,
        end:      endTime,
        isAllDay: isAllDay,
        location: ev.getLocation() || ''
      };
    });
  } catch(e) {
    return { error: e.message };
  }
}
