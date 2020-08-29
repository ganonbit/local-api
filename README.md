# Local Social API 🐧

## Local development

- clone repo to your desktop via `git clone git@github.com:hyliancoder/local-api.git`

- run `yarn` to populate `node_modules` folder and to create your `yarn.lock` file needed

- rename/copy `.env.sample` to `.env` and update with your environment variables.

- once that is setup run the command `yarn start` to start the front end. \*note: if wanting to run the whole application locally, the frontend: `https://github.com/hyliancoder/local-frontend/` needs to be up and running after the api via it's README.

- After running the server, you can navigate to `http://localhost:4000/graphql` where you can test the API using [GraphQL Playground](https://www.apollographql.com/docs/apollo-server/testing/graphql-playground/)

## API deployment to Heroku

- Create NodeJS app using [Heroku CLI](https://devcenter.heroku.com/articles/getting-started-with-nodejs)

- Add [environment variables](https://devcenter.heroku.com/articles/config-vars) to Heroku from `.env` file.
  Replace `FRONTEND_URL=http://localhost:8888` with the deployed frontend url e.g. `FRONTEND_URL=https://vigorous-chandrasekhar-bbd3e9.netlify.app` that is required because API responds only to that url.-

- Finally run `yarn deploy` to deploy the API.

### NOTE: for using playground local or on heroku you need the JWT admin user auth token.

## Extra commands

### yarn deploy

- as used above, a quick command to deploy to heroku. this command expects you to be logged in to the heroku-cli which allows a git push to heroku master

### yarn seedUsers

- Used to quickly populate fake users via Faker. To utilize this you must make sure the associated Faker fields in the User model are uncommented.

### yarn seedPosts

- Used to quickly populate fake users via Faker. To utilize this you must make sure the associated Faker fields in the User model are uncommented.

### yarn syncAlgoliaUsers

- quick command to sync atlas users to Algolia so they are populated in the instant search. NOTE: this is a TBD to be automatically done so its not a optimal solution.

### yarn syncAlgoliaPosts

- quick command to sync atlas posts to Algolia so they are populated in the instant search. NOTE: this is a TBD to be automatically done so its not a optimal solution.

### yarn format

- quick command to run prettier on all files for consistency. prettier settings are set inside of package.json if you'd like to change to your own tastes.
