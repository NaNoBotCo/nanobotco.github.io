CREATE TABLE IF NOT EXISTS workspace (id INTEGER PRIMARY KEY CHECK(id=1), revision INTEGER NOT NULL DEFAULT 0, state_json TEXT NOT NULL DEFAULT 'null', updated_at TEXT NOT NULL DEFAULT(datetime('now')), updated_by TEXT NOT NULL DEFAULT 'migration');
INSERT OR IGNORE INTO workspace(id,revision,state_json,updated_by) VALUES (1,0,'null','migration');
CREATE TABLE IF NOT EXISTS audit_log (revision INTEGER PRIMARY KEY, actor TEXT NOT NULL, changed_at TEXT NOT NULL);
CREATE TRIGGER IF NOT EXISTS audit_workspace_revision AFTER UPDATE OF state_json ON workspace FOR EACH ROW WHEN NEW.revision > OLD.revision BEGIN INSERT INTO audit_log(revision,actor,changed_at) VALUES (NEW.revision,NEW.updated_by,NEW.updated_at); END;
