This code is made for MOO course https://fullstackopen.github.io
Section https://fullstackopen.github.io/tehtävät/#osa-4

Structure:
controllers
	login.js (login route with validation)
	posts.js (blog post routes)
	users.js (routes for listing and adding users)
models
	blog.js	(Mongoose model for blog)
	user.js (Mongoose model for user)
requests (REST requests for VSCode REST Client extension)
tests
	blog_api.test.js (Jest/Supertest tests. TODO: fix POST test by adding a JWT support)
	test_helper.js (Helper functions for tests)
utils
	config.js (handles environment selection in Mongo DB connection)
	middleware.js (middlewares. Only POST auth token extraction at the moment)
.env (not included in Git, used to store environment variables)
eslintrc.js (ESLint configuration)
index.js (the main hub. Handles database connection, starting the server and router setup)
package.json (metadata, run scripts and dependencies)
package-lock.json (ensures that the installed dependencies are the same everywhere)