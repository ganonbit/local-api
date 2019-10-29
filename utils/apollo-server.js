import jwt from 'jsonwebtoken';
import { ApolloServer } from 'apollo-server-express';
import { PubSub } from 'apollo-server';

// Export pubSub instance for publishing events
export const pubSub = new PubSub();

/**
 * Checks if client is authenticated by checking authorization key from req headers
 *
 * @param {obj} req
 */
const checkAuthorization = token => {
  return new Promise(async (resolve, reject) => {
    const authUser = await jwt.verify(token, process.env.SECRET);

    if (authUser) {
      resolve(authUser);
      console.log('if resolve authUser' + token);
    } else {
      reject("Couldn't authenticate user");
      console.log('if fail authUser' + token);
    }
  });
};

/**
 * Creates an Apollo server and identifies if user is authenticated or not
 *
 * @param {obj} schema GraphQL Schema
 * @param {array} resolvers GraphQL Resolvers
 * @param {obj} models Mongoose Models
 */
export const createApolloServer = (schema, resolvers, models) => {
  return new ApolloServer({
    typeDefs: schema,
    resolvers, 
    context: async ({ req }) => {
      let authUser;
      const token = req.headers['x-access-token'];
      if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

      if (req.headers.authorization !== 'null') {
        const user = await checkAuthorization(req.headers['authorization']);
        if (user) {
          authUser = user;
        }
      }

      return Object.assign({ authUser }, models);
    },
    playground: true,
    introspection: true,
    subscriptions: {
      onConnect: async (connectionParams, webSocket) => {
        console.log('*** User has connected to WebSocket server ***');
      },
      onDisconnect: (webSocket, context) => {
        console.log('*** User has been disconnected from WebSocket server ***');
      },
    },
  });
};
