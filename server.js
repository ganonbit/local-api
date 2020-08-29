import {} from 'dotenv/config';
import compression from 'compression';
import express from 'express';
import { createServer } from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import bugsnag from '@bugsnag/js'
import bugsnagPluginExpress from '@bugsnag/plugin-express'
import models from './models';
import schema from './schema';
import resolvers from './resolvers';
import { createApolloServer } from './utils/apollo-server';

const { BUGSNAG_API_KEY, MONGO_URL, PORT } = process.env;


bugsnag.start({
  apiKey: BUGSNAG_API_KEY,
  plugins: [bugsnagPluginExpress]
})

const bugsnagClient = bugsnag.getPlugin('express');

// Connect to database
mongoose
  .connect(MONGO_URL, {
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
app.use(bugsnagClient.requestHandler);
app.use(cors(corsOptions));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(compression());

app.get('/', function(req, res) {
	res.redirect('/graphql');
});

app.use(bugsnagClient.errorHandler);

// Create a Apollo Server
const server = createApolloServer(schema, resolvers, models);
server.applyMiddleware({ app, path, cors: false });

// Create http server and add subscriptions to it
const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer);

// Listen to HTTP and WebSocket server
const apiPort = PORT || 4000;
httpServer.listen({ port: apiPort }, () => {
  console.log(`server ready at http://localhost:${apiPort}${server.graphqlPath}`);
  console.log(
    `Subscriptions ready at ws://localhost:${apiPort}${server.subscriptionsPath}`
  );
});
