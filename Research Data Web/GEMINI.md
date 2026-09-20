# Database Schema Changes Rule

Going forward, whenever a fix requires a database schema change (new column, new table, new policy), do NOT just update the frontend code to reference it. 
Instead, explicitly output the exact SQL required to run the migration in the Supabase SQL Editor, and wait for the user to confirm they have run it before considering that part of the fix complete.
Do not report a task involving a schema change as fully fixed until the user confirms the SQL was actually executed.
