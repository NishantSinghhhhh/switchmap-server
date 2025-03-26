import asyncio
from ariadne import (
    gql,
    QueryType,
    MutationType,
    SubscriptionType,
    make_executable_schema
)

# PubSub setup
class PubSub:
    def __init__(self):
        self.subscribers = {}

    async def publish(self, event, payload):
        if event in self.subscribers:
            for queue in self.subscribers[event]:
                await queue.put(payload)

    async def subscribe(self, event):
        queue = asyncio.Queue()
        self.subscribers.setdefault(event, []).append(queue)
        try:
            while True:
                yield await queue.get()
        finally:
            self.subscribers[event].remove(queue)

pubsub = PubSub()
BANDWIDTH_UPDATED = "BANDWIDTH_UPDATED"

# In-memory store (placeholder for PostgreSQL)
bandwidth_data_records = []

# Schema definition
type_defs = gql("""
  type BandwidthData {
    deviceId: String!
    interfaceId: String!
    inRate: Float!
    outRate: Float!
    timestamp: String!
  }

  type Query {
    bandwidthUsage: [BandwidthData!]!
  }

  type Mutation {
    addBandwidthData(
      deviceId: String!
      interfaceId: String!
      inRate: Float!
      outRate: Float!
      timestamp: String!
    ): BandwidthData!
  }

  type Subscription {
    bandwidthUpdated: BandwidthData!
  }
""")

# Resolvers
query = QueryType()
mutation = MutationType()
subscription = SubscriptionType()

@query.field("bandwidthUsage")
def resolve_bandwidth_usage(_, info):
    return bandwidth_data_records

@mutation.field("addBandwidthData")
async def resolve_add_bandwidth_data(_, info, **args):
    bandwidth_data_records.append(args)
    await pubsub.publish(BANDWIDTH_UPDATED, {"bandwidthUpdated": args})
    return args

@subscription.source("bandwidthUpdated")
async def source_bandwidth_updated(_, info):
    async for payload in pubsub.subscribe(BANDWIDTH_UPDATED):
        yield payload

@subscription.field("bandwidthUpdated")
def resolve_bandwidth_updated(event, info):
    return event["bandwidthUpdated"]

schema = make_executable_schema(type_defs, query, mutation, subscription)
