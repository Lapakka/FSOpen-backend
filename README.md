<h1>Full Stack Open backend</h1>
<h2>Made for MOO course https://fullstackopen.github.io<br />
Section https://fullstackopen.github.io/tehtävät/#osa-4</h2>

<h3>Structure:</h3>
<strong>controllers</strong>
<ul>
	<li>login.js (login route with validation)</li>
	<li>posts.js (blog post routes)</li>
	<li>users.js (routes for listing and adding users)</li>
</ul>
<strong>models</strong>
<ul>
	<li>blog.js	(Mongoose model for blog)
	<li>user.js (Mongoose model for user)
</ul>
<strong>requests</strong>
<ul>
	<li>(REST requests for VSCode REST Client extension)</li>
</ul>
<strong>tests</strong>
<ul>
	<li>blog_api.test.js (Jest/Supertest tests. TODO: fix POST test by adding a JWT support)
	<li>test_helper.js (Helper functions for tests)
</ul>
<strong>utils</strong>
<ul>
	<li>config.js (handles environment selection in Mongo DB connection)</li>
	<li>middleware.js (middlewares. Only POST auth token extraction at the moment)</li>
</ul>
<p>.env (not included in Git, used to store environment variables)</p>
<p>eslintrc.js (ESLint configuration)</p>
<p>index.js (the main hub. Handles database connection, starting the server and router setup)</p>
<p>package.json (metadata, run scripts and dependencies)</p>
<p>package-lock.json (ensures that the npm installed dependencies are the same everywhere)</p>
