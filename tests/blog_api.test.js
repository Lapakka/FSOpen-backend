const supertest = require('supertest');
const { app, server } = require('../index');
const api = supertest(app);
const Blog = require('../models/blog');
const { initialBlogs, blogsInDb, nonExistingId, noIdFormat, usersInDb, createTestUser } = require('./test_helper');

describe('When there are already some blog items', async () => {
  beforeAll(async () => {
    await Blog.remove({});
    const blogObjects = initialBlogs.map(b => new Blog(b));
    await Promise.all(blogObjects.map(b => b.save()));
  });

  test('GET /api/blogs return all blog items as json', async () => {
    const dbBlogs = await blogsInDb();

    const res = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(res.body.length).toBe(initialBlogs.length);

    const returnedBlogs = res.body.map(b => b.title);
    dbBlogs.forEach(blog => {
      expect(returnedBlogs).toContain(blog.title);        // check if all the titles are present
    });
  });

  test('GET /api/blogs/:id returns individual blog items with valid existing id', async () => {
    const dbBlogs = await blogsInDb();
    const blogItem = dbBlogs[0];
    const res = await api
      .get(`/api/blogs/${blogItem.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(res.body.title).toBe(blogItem.title);
  });

  test('GET /api/blogs/:id with valid nonexisting id returns 404', async () => {
    const validNonexistingId = await nonExistingId();

    await api
      .get(`/api/blogs/${validNonexistingId}`)
      .expect(404);
  });

  test('GET /api/blogs/:id with invalid id returns 400', async () => {
    const invalidId = '5555555555xxxxxxxxxx';

    await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400);
  });

  describe('Adding items', async () => {

    beforeAll(async () => {
      const testuser = await createTestUser();
      // TODO, JWT login
    });

    test('POST /api/blogs succeeds with valid data', async () => {
      const blogsAtStart = await blogsInDb();
      const newBlog = {
        title: 'New Test Add',
        author: 'Bob',
        url: 'https://www.altavista.com',
        likes: 0
      };

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      const blogsAfterOperation = await blogsInDb();

      expect(blogsAfterOperation.length).toBe(blogsAtStart.length + 1);
      const contents = blogsAfterOperation.map(b => noIdFormat(b));   // drop IDs
      expect(contents).toContainEqual(newBlog);
    });

    test('POST api/blogs fails with 400 if URL or title are not present', async () => {
      const blogsAtStart = await blogsInDb();
      const newBlog = {
        author: 'Ralphy'
      };

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400);

      const blogsAfterOperation = await blogsInDb();

      expect(blogsAfterOperation.length).toBe(blogsAtStart.length);
    });

    test('POST api/blogs without a value for likes gets set to 0 likes', async () => {
      const blogsAtStart = await blogsInDb();
      const newBlog = {
        title: 'No likes',
        author: 'Pedro',
        url: 'https://www.askjeeves.com'
      };

      const response = await api
        .post('/api/blogs')
        .send(newBlog);

      expect(response.body.likes).toBe(0);

      const blogsAfterOperation = await blogsInDb();
      expect(blogsAfterOperation.length).toBe(blogsAtStart.length + 1);
    });
  });

  describe('Deleting items', async () => {
    let addedBlog;

    beforeAll(async () => {
      addedBlog = new Blog({
        title: 'Freudian Slip',
        author: 'Sigmund Freud',
        url: 'https://www.delethis.com',
        likes: 0
      });
      await addedBlog.save();                 // save the item to DB so we can remove it later
    });

    test('DELETE api/blogs/:id removes the item', async () => {
      const blogsAtStart = await blogsInDb();
      await api
        .delete(`/api/blogs/${addedBlog._id}`)
        .expect(204);

      const blogsAfterOperation = await blogsInDb();
      const contents = blogsAfterOperation.map(b => noIdFormat(b));

      expect(contents).not.toContainEqual(addedBlog);
      expect(blogsAfterOperation.length).toBe(blogsAtStart.length - 1);
    });
  });

  describe('Updating items', async () => {
    test('PUT api/blogs/:id updates like count', async () => {
      const blogsAtStart = await blogsInDb();
      const blogItem = blogsAtStart[0];
      const newLikes = {
        likes: 6
      };

      await api
        .put(`/api/blogs/${blogItem.id}`)
        .send(newLikes)
        .expect(200);

      const blogsAfterOperation = await blogsInDb();
      expect(blogsAfterOperation[0].likes).toBe(6);
    });

    test('PUT /api/blogs/:id with invalid id returns 400', async () => {
      const invalidId = '5555555555xxxxxxxxxx';
      const blogsAtStart = await blogsInDb();
      const newLikes = {
        likes: 4
      };

      await api
        .put(`/api/blogs/${invalidId}`)
        .send(newLikes)
        .expect(400);

      const blogsAfterOperation = await blogsInDb();
      expect(blogsAfterOperation).toEqual(blogsAtStart);
    });
  });
});

describe('When there is at least one user already', async () => {
  let testuser;   // declare so that it is in the scope for the tests
  beforeAll(async () => {   // Create existing test user
    testuser = await createTestUser();
  });

  test('POST /api/users succeeds with unique username and sufficient password', async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: 'testman',
      name: 'Testo Man',
      password: 'megastrong',
      adult: false
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const usersAfterOperation = await usersInDb();
    expect(usersAfterOperation.length).toBe(usersAtStart.length + 1);
    const usernames = usersAfterOperation.map(u => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test('POST /api/users fails if the username has been taken', async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: testuser.username,
      name: 'Uuno Original',
      password: 'snake',
      adult: true
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body).toEqual({ error: 'Username must be unique' });
    const usersAfterOperation = await usersInDb();
    expect(usersAfterOperation.length).toBe(usersAtStart.length);
  });

  test('POST /api/users fails if the password is less than 3 characters', async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: 'passwordking3000',
      name: 'Digi Natiivi',
      password: 'gg',
      adult: true
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body).toEqual({ error: 'Password has to be over 3 characters long' });
    const usersAfterOperation = await usersInDb();
    expect(usersAfterOperation.length).toBe(usersAtStart.length);
  });

  test('POST /api/users value for adult gets set as true if no value is provided', async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: 'babyface',
      name: 'Niki Datiivi',
      password: 'password123',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(result.body.adult).toBeTruthy();

    const usersAfterOperation = await usersInDb();
    expect(usersAfterOperation.length).toBe(usersAtStart.length + 1);
  });
});

afterAll(() => {
  server.close();
});

