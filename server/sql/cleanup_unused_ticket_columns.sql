/*
  Cleanup script for unused columns in dbo.Tickets.

  Verified against the current codebase on 2026-04-08:
  Unused columns:
  - Type
  - SubCategoryId
  - Priority

  Still-used columns that must be kept:
  - Id
  - CategoryId
  - FactoryId
  - StatusId
  - Code
  - Title
  - Description
  - EquipmentCode
  - Area
  - RequestedBy
  - AssignedTo
  - AssignedTeam
  - OrderCode
  - CreatedAt
  - UpdatedAt
  - DueDate
  - IsDeleted
  - MaintenanceTypeId

  Review in a backup/staging database first.
*/

BEGIN TRANSACTION;

IF EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID('dbo.Tickets')
      AND name = 'IX_Tickets_Type'
)
BEGIN
    DROP INDEX [IX_Tickets_Type] ON dbo.Tickets;
END;

IF EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE parent_object_id = OBJECT_ID('dbo.Tickets')
      AND name = 'FK__Tickets__SubCate__48CFD27E'
)
BEGIN
    ALTER TABLE dbo.Tickets DROP CONSTRAINT [FK__Tickets__SubCate__48CFD27E];
END;

IF COL_LENGTH('dbo.Tickets', 'Type') IS NOT NULL
BEGIN
    ALTER TABLE dbo.Tickets DROP COLUMN [Type];
END;

IF COL_LENGTH('dbo.Tickets', 'SubCategoryId') IS NOT NULL
BEGIN
    ALTER TABLE dbo.Tickets DROP COLUMN [SubCategoryId];
END;

IF COL_LENGTH('dbo.Tickets', 'Priority') IS NOT NULL
BEGIN
    ALTER TABLE dbo.Tickets DROP COLUMN [Priority];
END;

COMMIT TRANSACTION;
