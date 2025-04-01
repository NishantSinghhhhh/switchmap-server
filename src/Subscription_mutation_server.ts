import graphene

# I define a GraphQL type to represent a single network node.
class NodeType(graphene.ObjectType):
    id = graphene.String()

# I define a GraphQL type to represent a single network link.
class LinkType(graphene.ObjectType):
    source = graphene.String()
    target = graphene.String()
    localPort = graphene.String()
    remotePort = graphene.String()

# I create a type that encapsulates the paginated network topology data.
class NetworkTopologyPaginated(graphene.ObjectType):
    nodes = graphene.List(NodeType)
    links = graphene.List(LinkType)
    total_nodes = graphene.Int()
    total_links = graphene.Int()
    page = graphene.Int()
    limit = graphene.Int()

# I define my Query class with a paginated field for network topology.
class Query(graphene.ObjectType):
    network_topology = graphene.Field(
        NetworkTopologyPaginated,
        page=graphene.Int(required=False, default_value=1),
        limit=graphene.Int(required=False, default_value=10)
    )

    def resolve_network_topology(self, info, page, limit):
        # I simulate the full network topology data.
        topology_data = {
            "nodes": [
                {"id": "Device-1001"},  # I consider this a local device with ID 1001.
                {"id": "Switch-B"},     # This is a remote device, Switch-B.
                {"id": "Switch-C"},     # Similarly, Switch-C is another remote device.
                {"id": "Device-1002"},  # Another local device with ID 1002.
                {"id": "Switch-D"}      # And here is a remote device, Switch-D.
            ],
            "links": [
                {
                    "source": "Device-1001",
                    "target": "Switch-B",
                    "localPort": "Gig0/1",
                    "remotePort": "Gig0/24"
                },  # I define a connection from Device-1001 to Switch-B.
                {
                    "source": "Device-1001",
                    "target": "Switch-C",
                    "localPort": "Gig0/2",
                    "remotePort": "Gig0/12"
                },  # Here, Device-1001 is also connected to Switch-C.
                {
                    "source": "Device-1002",
                    "target": "Switch-D",
                    "localPort": "Gig1/1",
                    "remotePort": "Gig1/24"
                }   # Lastly, I define a connection from Device-1002 to Switch-D.
            ]
        }
        
        # I extract all nodes and links.
        all_nodes = topology_data["nodes"]
        all_links = topology_data["links"]

        # I calculate total counts for pagination metadata.
        total_nodes = len(all_nodes)
        total_links = len(all_links)

        # I calculate the start and end indices for the paginated nodes.
        start_index = (page - 1) * limit
        end_index = start_index + limit
        paginated_nodes = all_nodes[start_index:end_index]

        # For simplicity, I paginate links the same way.
        # In a real scenario, I might filter links based on the returned nodes.
        paginated_links = all_links[start_index:end_index]

        # I return the paginated topology data.
        return NetworkTopologyPaginated(
            nodes=[NodeType(**node) for node in paginated_nodes],
            links=[LinkType(**link) for link in paginated_links],
            total_nodes=total_nodes,
            total_links=total_links,
            page=page,
            limit=limit
        )

# I create the GraphQL schema with my Query.
schema = graphene.Schema(query=Query)
