const { ApolloServer, gql, PubSub } = require('apollo-server');
const pubsub = new PubSub();
const BANDWIDTH_UPDATED = 'BANDWIDTH_UPDATED';

let bandwidthDataRecords = []; // In-memory storage for demonstration

const typeDefs = gql`
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
`;

const resolvers = {
  Query: {
    bandwidthUsage: () => {
      // Here, I would query Postgres database.
      return bandwidthDataRecords;
    },
  },
  Mutation: {
    addBandwidthData: (_, args) => {
      const newRecord = { ...args };
      // Inserting the new record into the database (here, just an array).
      bandwidthDataRecords.push(newRecord);

      // Publishing the update for real-time clients.
      pubsub.publish(BANDWIDTH_UPDATED, { bandwidthUpdated: newRecord });
      return newRecord;
    },
  },
  Subscription: {
    bandwidthUpdated: {
      subscribe: () => pubsub.asyncIterator([BANDWIDTH_UPDATED]),
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
