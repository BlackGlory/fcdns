--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

-- 在WAL模式下, better-sqlite3可充分发挥性能
PRAGMA journal_mode = WAL;

CREATE TABLE hostname (
  hostname      TEXT NOT NULL UNIQUE
, route_result  INTEGER
, poison_test_result INTEGER
) STRICT;

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

PRAGMA journal_mode = DELETE;

DROP TABLE hostname
