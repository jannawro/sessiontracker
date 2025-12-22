# TTRPG Session Tracker

A Google Apps Script automation that tracks your TTRPG sessions from Google Calendar and logs them to a Google Sheet.

## Features

- Monitors a specific Google Calendar for TTRPG session events
- Parses campaign name, system, players, and session type from event data
- Collects any additional metadata into a single column
- Automatically logs sessions to a Google Sheet
- Runs daily at midnight via trigger

## Event Format

Create calendar events with the following format:

**Event Title:** `Campaign Name: <anything>` (e.g., "Curse of Strahd: #15")

Only the part before the colon is used as the campaign name.

**Event Description** (key-value pairs, one per line):
```
System: D&D 5e
Players: Alice, Bob, Charlie
Type: Player
Location: Roll20
DM: Bob
```

### Canonical Fields

| Field | Description |
|-------|-------------|
| System | The TTRPG system (e.g., D&D 5e, Pathfinder 2e, Call of Cthulhu) |
| Players | Comma-separated list of players |
| Type | One of: `GM`, `Player`, `Solo`, `GMless` |

Any additional key:value pairs (like `Location`, `DM` above) are combined into the "Additional Details" column.

## Sheet Output

| Date | Campaign Name | System | Players | Type | Additional Details |
|------|---------------|--------|---------|------|-------------------|
| 2024-01-15 | Curse of Strahd | D&D 5e | Alice, Bob, Charlie | Player | Location: Roll20; DM: Bob |

## Setup Instructions

### 1. Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Note the Spreadsheet ID from the URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

### 2. Get Your Calendar ID

1. Go to [Google Calendar](https://calendar.google.com)
2. Click the three dots next to your TTRPG calendar > Settings
3. Scroll to "Integrate calendar" and copy the **Calendar ID**
   - For your primary calendar, this is your email address
   - For other calendars, it looks like: `abc123@group.calendar.google.com`

### 3. Create the Apps Script Project

1. Go to [Google Apps Script](https://script.google.com)
2. Click **New Project**
3. Rename the project to "TTRPG Session Tracker"

### 4. Add the Script Files

1. In the script editor, rename the default file to `Main.gs` (or create a new one)
2. Copy the contents of `Main.gs` from this repository into the editor
3. Create a new file: **File > New > Script** and name it `Config`
4. Copy the contents of `Config.gs` into this file

### 5. Configure Your Settings

Edit `Config.gs` and replace the placeholder values:

```javascript
const CALENDAR_ID = 'your-calendar-id@group.calendar.google.com';
const SPREADSHEET_ID = 'your-spreadsheet-id';
const SHEET_NAME = 'Sessions';
```

### 6. Authorize the Script

1. Select `checkTodaySessions` from the function dropdown
2. Click **Run**
3. Click **Review Permissions** when prompted
4. Select your Google account
5. Click **Advanced** > **Go to TTRPG Session Tracker (unsafe)**
6. Click **Allow**

### 7. Set Up the Daily Trigger

1. Select `setupDailyTrigger` from the function dropdown
2. Click **Run**

The script will now run automatically at midnight every day.

## Manual Usage

### Run a Manual Check

1. Select `checkTodaySessions` from the function dropdown
2. Click **Run**

This checks for events on the current day and logs them.

### Test with a Specific Date

1. Edit the `testWithDate` function in `Main.gs` to set your test date
2. Select `testWithDate` from the function dropdown
3. Click **Run**
4. View results in **View > Logs**

### Remove the Daily Trigger

1. Select `removeDailyTrigger` from the function dropdown
2. Click **Run**

## Troubleshooting

### "Calendar not found" Error

- Verify the Calendar ID in `Config.gs` is correct
- Make sure you have access to the calendar

### "Spreadsheet not found" Error

- Verify the Spreadsheet ID in `Config.gs` is correct
- Make sure you have edit access to the spreadsheet

### Events Not Being Logged

- Check that your event description uses key:value format, one per line:
  ```
  System: Your System
  Players: Player1, Player2
  Type: Player
  ```
- Keys are case-insensitive (`system:` and `System:` both work)
- Valid Type values: `GM`, `Player`, `Solo`, `GMless`

### View Execution Logs

1. In Apps Script, go to **View > Executions**
2. Click on any execution to see detailed logs
