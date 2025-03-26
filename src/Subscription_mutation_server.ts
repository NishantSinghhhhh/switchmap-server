import asyncio
from ariadne import SubscriptionType
from typing import AsyncGenerator, Dict, List

class SimplePubSub:
    def __init__(self):
        self.subscribers: Dict[str, List[asyncio.Queue]] = {}

    async def publish(self, event_name: str, payload: dict):
        queues = self.subscribers.get(event_name, [])
        for queue in queues:
            await queue.put(payload)

    async def subscribe(self, event_name: str) -> AsyncGenerator[dict, None]:
        queue = asyncio.Queue()
        if event_name not in self.subscribers:
            self.subscribers[event_name] = []
        self.subscribers[event_name].append(queue)
        try:
            while True:
                yield await queue.get()
        finally:
            self.subscribers[event_name].remove(queue)

# Creating PubSub instance
pubsub = SimplePubSub()
TOPOLOGY_UPDATED = "TOPOLOGY_UPDATED"

# SubscriptionType resolver
subscription = SubscriptionType()

@subscription.source("topologyUpdated")
async def source_topology_updated(_, info):
    async for payload in pubsub.subscribe(TOPOLOGY_UPDATED):
        yield payload

@subscription.field("topologyUpdated")
def resolve_topology_updated(event, info):
    return event["topologyUpdated"]
