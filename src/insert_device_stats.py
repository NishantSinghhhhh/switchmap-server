from operator import attrgetter
from datetime import datetime

def insert_device_stats(devices, test=False):
    """Insert CPU and memory stats into the device_stats DB table.

    Args:
        devices: List of device objects with SNMP access details.
        test: If True, insert rows sequentially for deterministic primary key values.

    Returns:
        None
    """
    rows = []

    # Normalize single device to list
    if not isinstance(devices, list):
        devices = [devices]

    for device in devices:
        # Get SNMP data using HostResourcesQuery
        hr_query = HostResourcesQuery(device.snmp_object)
        cpu_percent = hr_query.cpu_load()
        mem_used, mem_total = hr_query.memory_usage()  # You'd define this too

        # Skip devices with no useful data
        if cpu_percent is None or mem_used is None or mem_total is None:
            continue

        # Prepare the row
        row = DeviceStats(
            device_id=device.id,
            timestamp=datetime.utcnow(),
            cpu_usage_percent=cpu_percent,
            mem_used_bytes=mem_used,
            mem_total_bytes=mem_total
        )
        rows.append(row)

    # Insert into DB
    if not test:
        _device_stats.insert_row(rows)
    else:
        sorted_rows = sorted(rows, key=attrgetter("device_id", "timestamp"))
        _device_stats.insert_row(sorted_rows)
