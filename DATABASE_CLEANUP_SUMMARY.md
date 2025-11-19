# Database Cleanup Summary

## Overview
The `salon_booking_db.sql` file has been cleaned to remove unused tables and columns that are not referenced in the codebase.

## Removed Tables

The following tables were removed as they are not used anywhere in the backend controllers:

1. **`appointment_status_history`** - Status change tracking (not implemented)
2. **`coverage_requests`** - Shift coverage requests (not implemented)
3. **`performance_reviews`** - Performance review system (not implemented)
4. **`review_ratings`** - Review ratings (not implemented)
5. **`resources`** - Resource management (not implemented)
6. **`resource_bookings`** - Resource bookings (not implemented)
7. **`shift_swaps`** - Shift swap requests (not implemented)
8. **`timeslots`** - Timeslot management (referenced but not actually queried)

## Removed Columns

The following columns were removed from existing tables:

1. **`appointmenthistory.snapshot`** - JSON snapshot field (not used in any queries)

## Kept Tables (All Used)

The following tables are actively used in the codebase and were kept:

1. `appointmenthistory` - Appointment history records
2. `appointments` - Active appointments
3. `appointment_reminders` - Appointment reminder scheduling
4. `certifications` - Staff certifications
5. `changelogs` - System change logging
6. `clients` - Client records
7. `clock_in_out` - Staff clock in/out tracking
8. `leave_balances` - Leave balance tracking
9. `leave_types` - Leave type definitions
10. `notifications` - System notifications
11. `notification_preferences` - Notification preferences
12. `permissions` - Permission definitions
13. `recurring_appointments` - Recurring appointment templates
14. `rolepermissions` - Role-permission mappings
15. `roles` - User roles
16. `services` - Service catalog
17. `sessions` - User session management
18. `skills` - Skill definitions
19. `staff` - Staff member records
20. `staff_availability_overrides` - Staff availability overrides
21. `staff_schedules` - Staff schedule templates
22. `staff_skills` - Staff skill assignments
23. `time_off_requests` - Time off requests
24. `training_records` - Training records
25. `waitlist` - Waitlist management

## Notes

- All foreign key constraints and indexes have been preserved
- All AUTO_INCREMENT settings have been preserved
- The cleaned SQL file is ready for use and will create a database with only the tables and columns actually used by the application

## Next Steps

1. Backup your existing database before applying this schema
2. Drop and recreate the database using the cleaned SQL file
3. Verify all functionality works as expected

