import graphene

# I define the GraphQL type for a single device stat entry.
class DeviceStatType(graphene.ObjectType):
    id = graphene.Int()
    device_id = graphene.Int()
    timestamp = graphene.DateTime()
    cpu_usage_percent = graphene.Float()
    mem_used_bytes = graphene.Float()
    mem_total_bytes = graphene.Float()

# This type wraps the paginated response.
class DeviceStatsPaginated(graphene.ObjectType):
    records = graphene.List(DeviceStatType)
    total = graphene.Int()
    page = graphene.Int()
    limit = graphene.Int()

# I expose the paginated device_stats query here.
class Query(graphene.ObjectType):
    device_stats = graphene.Field(
        DeviceStatsPaginated,
        page=graphene.Int(required=False, default_value=1),
        limit=graphene.Int(required=False, default_value=10)
    )

    def resolve_device_stats(self, info, page, limit):
        # I mock 50 records for testing purposes.
        all_stats = [
            {
                "id": i,
                "device_id": 101,
                "timestamp": "2025-04-04T10:00:00Z",
                "cpu_usage_percent": 35.5 + i,
                "mem_used_bytes": 1024 * i,
                "mem_total_bytes": 8192 * i
            }
            for i in range(1, 51)
        ]

        total = len(all_stats)
        start = (page - 1) * limit
        end = start + limit
        page_data = all_stats[start:end]

        return DeviceStatsPaginated(
            records=[DeviceStatType(**stat) for stat in page_data],
            total=total,
            page=page,
            limit=limit
        )

# I attach the schema here.
schema = graphene.Schema(query=Query)
