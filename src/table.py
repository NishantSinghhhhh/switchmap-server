CREATE TABLE device_stats (
    id SERIAL PRIMARY KEY,
    device_id INTEGER NOT NULL REFERENCES device(id),
    timestamp TIMESTAMPTZ NOT NULL,
    cpu_usage_percent REAL,
    mem_used_bytes BIGINT,
    mem_total_bytes BIGINT
);
