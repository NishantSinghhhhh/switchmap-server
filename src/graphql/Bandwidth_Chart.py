import graphene

# I define a GraphQL type to represent a single bandwidth data record.
class BandwidthData(graphene.ObjectType):
    in_mbps = graphene.Float()
    out_mbps = graphene.Float()
    timestamp = graphene.String()
    interface = graphene.String()

# I create a type to encapsulate the paginated result, including metadata.
class BandwidthPaginated(graphene.ObjectType):
    records = graphene.List(BandwidthData)
    total_count = graphene.Int()
    page = graphene.Int()
    limit = graphene.Int()

# I define my Query class with a field for fetching paginated bandwidth data.
class Query(graphene.ObjectType):
    bandwidth_data = graphene.Field(
        BandwidthPaginated,
        page=graphene.Int(required=False, default_value=1),
        limit=graphene.Int(required=False, default_value=10)
    )

    def resolve_bandwidth_data(self, info, page, limit):
        # I calculate the offset based on the current page and limit.
        offset = (page - 1) * limit

        # I fetch a subset of bandwidth records from the database.
        # I assume _bandwidth.get_data is a helper function that takes offset and limit.
        records = _bandwidth.get_data(offset=offset, limit=limit)

        # I also retrieve the total count of bandwidth records for pagination metadata.
        total_count = _bandwidth.get_total_count()

        # I transform each raw record into my BandwidthData type.
        bandwidth_records = [
            BandwidthData(
                in_mbps=record.in_mbps,
                out_mbps=record.out_mbps,
                timestamp=record.timestamp,
                interface=record.interface
            )
            for record in records
        ]

        # I return the paginated result including the records and pagination metadata.
        return BandwidthPaginated(
            records=bandwidth_records,
            total_count=total_count,
            page=page,
            limit=limit
        )

# I create the GraphQL schema with my Query.
schema = graphene.Schema(query=Query)
