import { PrismaClient } from '@prisma/client';
import { PubSub } from 'graphql-subscriptions';

const prisma = new PrismaClient();
const pubsub = new PubSub();
const TOPOLOGY_UPDATED = 'TOPOLOGY_UPDATED';

const resolvers = {
  Mutation: {
    // I handle adding new topology data sent from the Poller/Core
    addTopology: async (_: any, args: { nodes: string[], links: any[] }) => {
      try {
        // First, I insert nodes into the database (upserting to avoid duplicates)
        for (const nodeId of args.nodes) {
          await prisma.node.upsert({
            where: { id: nodeId },
            update: {},
            create: { id: nodeId },
          });
        }

        // Now I add the connections (links) between the nodes
        for (const link of args.links) {
          await prisma.link.create({
            data: {
              sourceId: link.source,
              targetId: link.target,
              localPort: link.localPort,
              remotePort: link.remotePort,
            },
          });
        }

        // Once data insertion is successful, I fetch the updated topology data
        const updatedNodes = await prisma.node.findMany();
        const updatedLinks = await prisma.link.findMany();

        // Finally, I notify all subscribed frontend clients about this update
        pubsub.publish(TOPOLOGY_UPDATED, {
          topologyUpdated: { nodes: updatedNodes, links: updatedLinks },
        });

        return { success: true, message: 'Topology added successfully' };
      },
  },

  Subscription: {
    // I manage subscriptions, notifying frontend components whenever topology data changes
    topologyUpdated: {
      subscribe: () => pubsub.asyncIterator([TOPOLOGY_UPDATED]),
    },
  },
};

export default resolvers;
