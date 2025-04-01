import graphene

# I define a GraphQL type for a single movement event.
class MovementEvent(graphene.ObjectType):
    ip = graphene.String()
    fromLocation = graphene.String()
    toLocation = graphene.String()
    timestamp = graphene.String()

# I define a type to hold the paginated result including metadata.
class MovementEventsResult(graphene.ObjectType):
    events = graphene.List(MovementEvent)
    totalCount = graphene.Int()
    page = graphene.Int()
    limit = graphene.Int()

# I define my Query class to include a field for fetching movement events.
class Query(graphene.ObjectType):
    movement_events = graphene.Field(
        MovementEventsResult,
        page=graphene.Int(required=False, default_value=1),
        limit=graphene.Int(required=False, default_value=10)
    )

    def resolve_movement_events(self, info, page, limit):
        # I calculate the offset based on the provided page number and limit.
        offset = (page - 1) * limit

        # I fetch a subset of movement events from the database.
        # Here, I assume that _movement.get_events is a helper function that accepts offset and limit.
        events = _movement.get_events(offset=offset, limit=limit)

        # I also retrieve the total count of movement events for pagination metadata.
        total_count = _movement.get_total_events_count()

        # I return the paginated results along with the metadata.
        return MovementEventsResult(
            events=events,
            totalCount=total_count,
            page=page,
            limit=limit
        )

# I create the GraphQL schema with my Query.
schema = graphene.Schema(query=Query)
