const { ApolloServer, gql, PubSub } = require('apollo-server');

const pubsub = new PubSub();
const MOVEMENT_OCCURRED = 'MOVEMENT_OCCURRED';

//the GraphQL schema
const typeDefs = gql`
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
    # Returns all device movement logs
    deviceMovements: [DeviceMovement!]!
  }

  type Mutation {
    # Inserts a new device movement event and returns it
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
    # Publishes real-time updates whenever a new movement event occurs
    movementOccurred: DeviceMovement!
  }
`;

// For demonstration, I use an in-memory array to store events.
// In production, We will perform INSERT/UPDATE operations on our Postgres database.
let deviceMovements = [];
let idCounter = 1;

const resolvers = {
  Query: {
    deviceMovements: () => {
      // Here I am  querying our Postgres DB.
      return deviceMovements;
    },
  },
  Mutation: {
    addDeviceMovement: (_, args) => {
      // Creating a new movement event record.
      const newMovement = { id: idCounter++, ...args };
      
      // In production, I will insert this record into our Postgres database.
      deviceMovements.push(newMovement);

      // Publish this event for any subscribers (real-time dashboard updates).
      pubsub.publish(MOVEMENT_OCCURRED, { movementOccurred: newMovement });

      return newMovement;
    },
  },
  Subscription: {
    movementOccurred: {
      subscribe: () => pubsub.asyncIterator([MOVEMENT_OCCURRED]),
    },
  },
};

