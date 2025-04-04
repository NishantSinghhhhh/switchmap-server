Table: interfacestats  
Columns:  
- id             SERIAL PRIMARY KEY  
- device_id      INTEGER NOT NULL REFERENCES device(id)  
- ifindex        INTEGER NOT NULL           -- Matches SNMP ifIndex  
- timestamp      TIMESTAMP NOT NULL         -- Polling time  
- in_octets      BIGINT                     -- Total inbound bytes  
- out_octets     BIGINT                     -- Total outbound bytes  
- in_errors      INTEGER                    -- Packets with inbound errors  
- out_errors     INTEGER                    -- Packets with outbound errors  
- in_discards    INTEGER                    -- Inbound packets dropped  
- out_discards   INTEGER                    -- Outbound packets dropped  
