# Avocado Nation API 🥑

## Local development
- clone repo to your desktop via `git clone git@bitbucket.org:270b/avonation-api.git`

- run `yarn` to populate `node_modules` folder and to create your `yarn.lock` file needed

- to start the server locally you'll either need to request the `.env` file from me, or have it connect to the staging environment vis your own `.env` file. that allows us to safely use environment variables with passwords/credentials without fear of it getting exposed to clients/hackers as it is only used locally and not pushed to git.

- once that is setup run the command `npm start` to start the front end. *note: if wanting to run the whole application locally, the frontend: `https://bitbucket.org/270b/avonation-frontend/` needs to be up and running after the api via it's README.

- After running the server, you can navigate to `http://localhost:4000/graphql` where you can test the API using [GraphQL Playground](https://www.apollographql.com/docs/apollo-server/testing/graphql-playground/)

## API deployment to Heroku -- TBD IF FINAL HOST
~~- - Create NodeJS app using [Heroku CLI](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- Add [environment variables](https://devcenter.heroku.com/articles/config-vars) to Heroku from `api/.env` file.
  Replace `FRONTEND_URL=http://localhost:3000` with the deployed frontend url e.g. `FRONTEND_URL=`https://vigorous-chandrasekhar-bbd3e9.netlify.com` that is required because API responds only to that url.~~-

- Finally run `npm  deploy` or `yarn deploy` to deploy the API.

### NOTE: for using playground local or on heroku you need the auth token. please request this from @reesecode or @rorjeremy