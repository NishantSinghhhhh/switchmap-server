from ariadne import QueryType

# I create an instance of the Query type for my GraphQL API.
query = QueryType()

@query.field("networkTopology")
def resolve_network_topology(_, info):
    # I simulate the network topology data here.
    # In a real-world application, I might replace this with a database query or an external API call.
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
    # I return the simulated topology data so the dashboard can display it.
    return topology_data

# I can now include this query in my overall GraphQL schema.
