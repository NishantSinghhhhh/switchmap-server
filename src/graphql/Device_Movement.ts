import asyncio
from ariadne import gql, QueryType, MutationType, SubscriptionType, make_executable_schema

# Schema definition
type_defs = gql("""
  type DeviceMovement {
    id: ID!
    deviceId: String!
    deviceName: String!
    fromSwitch: String!
    fromPort: String!
    toSwitch: String!
    toPort: String!
    timestamp: String!
  }

  type Query {
    deviceMovements: [DeviceMovement!]!
  }

  type Mutation {
    addDeviceMovement(
      deviceId: String!
      deviceName: String!
      fromSwitch: String!
      fromPort: String!
      toSwitch: String!
      toPort: String!
      timestamp: String!
    ): DeviceMovement!
  }

  type Subscription {
    movementOccurred: DeviceMovement!
  }
""")

# Simple in-memory store and pubsub
device_movements = []
id_counter = 1
MOVEMENT_OCCURRED = "MOVEMENT_OCCURRED"

class PubSub:
    def __init__(self):
        self.subscribers = {}

    async def publish(self, event, data):
        if event in self.subscribers:
            for queue in self.subscribers[event]:
                await queue.put(data)

    async def subscribe(self, event):
        queue = asyncio.Queue()
        self.subscribers.setdefault(event, []).append(queue)
        try:
            while True:
                yield await queue.get()
        finally:
            self.subscribers[event].remove(queue)

pubsub = PubSub()

# Resolvers
query = QueryType()
mutation = MutationType()
subscription = SubscriptionType()

@query.field("deviceMovements")
def resolve_device_movements(_, info):
    return device_movements

@mutation.field("addDeviceMovement")
async def resolve_add_device_movement(_, info, **args):
    global id_counter
    new_movement = { "id": id_counter, **args }
    id_counter += 1
    device_movements.append(new_movement)
    await pubsub.publish(MOVEMENT_OCCURRED, { "movementOccurred": new_movement })
    return new_movement

@subscription.source("movementOccurred")
async def source_movement_occurred(_, info):
    async for event in pubsub.subscribe(MOVEMENT_OCCURRED):
        yield event

@subscription.field("movementOccurred")
def resolve_movement_occurred(event, info):
    return event["movementOccurred"]

schema = make_executable_schema(type_defs, query, mutation, subscription)
