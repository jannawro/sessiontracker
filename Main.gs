/**
 * TTRPG Session Tracker
 *
 * Automatically logs TTRPG sessions from Google Calendar to a Google Sheet.
 * Run checkTodaySessions() manually or set up a daily trigger.
 */

/**
 * Main function - checks for TTRPG sessions today and logs them to the sheet.
 * Set this up with a daily trigger at midnight.
 */
function checkTodaySessions() {
  const today = new Date();
  const events = getCalendarEvents(today);

  if (events.length === 0) {
    Logger.log('No sessions found today.');
    return;
  }

  Logger.log(`Found ${events.length} event(s) today.`);

  // Filter events by prefix if configured
  const filteredEvents = filterEventsByPrefix(events);

  if (filteredEvents.length === 0) {
    Logger.log('No matching sessions found after prefix filtering.');
    return;
  }

  Logger.log(`${filteredEvents.length} session(s) match the prefix filter.`);

  filteredEvents.forEach(event => {
    const title = stripPrefix(event.getTitle());
    const sessionData = {
      date: formatDate(today),
      campaignName: parseCampaignName(title),
      ...parseEventDescription(event.getDescription())
    };

    writeToSheet(sessionData);
    Logger.log(`Logged session: ${sessionData.campaignName}`);
  });
}

/**
 * Parses campaign name from event title.
 * Returns only the part before the colon, discarding the rest.
 */
function parseCampaignName(title) {
  if (!title) return '';

  const colonIndex = title.indexOf(':');
  if (colonIndex === -1) {
    return title.trim();
  }

  return title.substring(0, colonIndex).trim();
}

/**
 * Fetches all events from the configured calendar for a given date.
 */
function getCalendarEvents(date) {
  const calendar = CalendarApp.getCalendarById(CALENDAR_ID);

  if (!calendar) {
    throw new Error(`Calendar not found: ${CALENDAR_ID}. Check your CALENDAR_ID in Config.gs`);
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return calendar.getEvents(startOfDay, endOfDay);
}

/**
 * Filters events by the configured prefix.
 * If EVENT_PREFIX is empty, returns all events.
 */
function filterEventsByPrefix(events) {
  if (!EVENT_PREFIX) {
    return events;
  }

  return events.filter(event => {
    const title = event.getTitle() || '';
    return title.startsWith(EVENT_PREFIX);
  });
}

/**
 * Strips the configured prefix from a title.
 * If EVENT_PREFIX is empty, returns the title unchanged.
 */
function stripPrefix(title) {
  if (!EVENT_PREFIX || !title) {
    return title || '';
  }

  if (title.startsWith(EVENT_PREFIX)) {
    return title.substring(EVENT_PREFIX.length).trim();
  }

  return title;
}

// Canonical fields parsed from description
const CANONICAL_FIELDS = ['system', 'players', 'type'];

// Valid values for Type field
const VALID_TYPES = ['GM', 'Player', 'Solo', 'GMless'];

/**
 * Parses key-value pairs from the event description.
 * Canonical fields (System, Players, Type) are extracted separately.
 * All other key:value pairs go into additionalDetails.
 */
function parseEventDescription(description) {
  const result = {
    system: '',
    players: '',
    type: '',
    additionalDetails: ''
  };

  if (!description) {
    return result;
  }

  // Remove HTML tags if present (Google Calendar sometimes adds them)
  const cleanDescription = description.replace(/<[^>]*>/g, '\n').trim();

  const lines = cleanDescription.split('\n');
  const extras = [];

  lines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;

    const key = line.substring(0, colonIndex).trim();
    const keyLower = key.toLowerCase();
    const value = line.substring(colonIndex + 1).trim();

    if (!key || !value) return;

    if (keyLower === 'system') {
      result.system = value;
    } else if (keyLower === 'players') {
      result.players = value;
    } else if (keyLower === 'type') {
      result.type = validateType(value);
    } else {
      extras.push(`${key}: ${value}`);
    }
  });

  result.additionalDetails = extras.join('; ');
  return result;
}

/**
 * Validates and normalizes the Type field.
 * Returns the value if valid, empty string otherwise.
 */
function validateType(value) {
  const normalized = VALID_TYPES.find(t => t.toLowerCase() === value.toLowerCase());
  if (normalized) {
    return normalized;
  }
  Logger.log(`Warning: Invalid type "${value}". Valid types: ${VALID_TYPES.join(', ')}`);
  return value;
}

/**
 * Writes session data to the Google Sheet.
 */
function writeToSheet(sessionData) {
  const sheet = getOrCreateSheet();

  const row = [
    sessionData.date,
    sessionData.campaignName,
    sessionData.system,
    sessionData.players,
    sessionData.type,
    sessionData.additionalDetails
  ];

  sheet.appendRow(row);
}

/**
 * Gets the target sheet, creating it with canonical headers if it doesn't exist.
 */
function getOrCreateSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);

  if (!spreadsheet) {
    throw new Error(`Spreadsheet not found: ${SPREADSHEET_ID}. Check your SPREADSHEET_ID in Config.gs`);
  }

  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow(['Date', 'Campaign Name', 'System', 'Players', 'Type', 'Additional Details']);
    sheet.getRange('1:1').setFontWeight('bold');
    Logger.log(`Created new sheet: ${SHEET_NAME}`);
  }

  return sheet;
}

/**
 * Formats a date as YYYY-MM-DD.
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Sets up a daily trigger to run at midnight.
 * Run this function once to enable automatic daily checks.
 */
function setupDailyTrigger() {
  // Remove any existing triggers for this function
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'checkTodaySessions') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create new daily trigger at midnight
  ScriptApp.newTrigger('checkTodaySessions')
    .timeBased()
    .atHour(0)
    .everyDays(1)
    .create();

  Logger.log('Daily trigger set up successfully. Will run at midnight.');
}

/**
 * Removes the daily trigger.
 * Run this if you want to stop automatic daily checks.
 */
function removeDailyTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  let removed = 0;

  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'checkTodaySessions') {
      ScriptApp.deleteTrigger(trigger);
      removed++;
    }
  });

  Logger.log(`Removed ${removed} trigger(s).`);
}

/**
 * Test function - runs the check for a specific date.
 * Useful for testing with past events.
 */
function testWithDate() {
  const testDate = new Date('2024-01-15'); // Change to a date with known events
  const events = getCalendarEvents(testDate);

  Logger.log(`Found ${events.length} event(s) on ${formatDate(testDate)}:`);
  events.forEach(event => {
    Logger.log(`- ${event.getTitle()}`);
    Logger.log(`  Description: ${event.getDescription()}`);
  });
}
