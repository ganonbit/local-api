import {} from 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import bugsnag from '@bugsnag/js'
import bugsnagExpress from '@bugsnag/plugin-express'
import models from './models';
import schema from './schema';
import resolvers from './resolvers';
import { createApolloServer } from './utils/apollo-server';

const bugsnagClient = bugsnag('fdc898bef17ba822e019223b10abf4aa');
bugsnagClient.use(bugsnagExpress);

// Connect to database
mongoose
  .connect(process.env.MONGO_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log('DB connected'))
  .catch(err => console.error('DB Connection error: ' + err));

// Initializes application
const app = express();
const path = '/graphql';

// Enable cors
const corsOptions = {
  origin: '*',
  credentials: true,
};
app.use(bugsnagClient.getPlugin('express').requestHandler);
app.use(cors(corsOptions));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.get('/', function(req, res) {
	res.redirect('/graphql');
});

app.use(bugsnagClient.getPlugin('express').errorHandler);

// Create a Apollo Server
const server = createApolloServer(schema, resolvers, models);
server.applyMiddleware({ app, path, cors: false });

// Create http server and add subscriptions to it
const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer);

// Listen to HTTP and WebSocket server
const PORT = process.env.PORT || 4000;
httpServer.listen({ port: PORT }, () => {
  console.log(`server ready at http://localhost:${PORT}${server.graphqlPath}`);
  console.log(
    `Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`
  );
});
