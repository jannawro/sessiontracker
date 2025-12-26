/**
 * Configuration for TTRPG Session Tracker
 *
 * Update these values with your own Calendar ID and Spreadsheet ID
 */

// The ID of the Google Calendar to monitor for TTRPG sessions
// Find this in Calendar Settings > Integrate calendar > Calendar ID
const CALENDAR_ID = 'your-calendar-id@group.calendar.google.com';

// The ID of the Google Spreadsheet to log sessions to
// Find this in the spreadsheet URL: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
const SPREADSHEET_ID = 'your-spreadsheet-id';

// The name of the sheet tab within the spreadsheet
const SHEET_NAME = 'Sessions';

// Optional prefix to filter calendar events
// Only events with titles starting with this prefix will be tracked
// The prefix will be stripped from the campaign name
// Set to empty string '' to track all events (no filtering)
const EVENT_PREFIX = '';
