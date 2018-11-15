const BASE_URL = 'https://hack-or-snooze-v2.herokuapp.com';

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  static getStories(cb) {
    $.getJSON(`${BASE_URL}/stories`, function(response) {
      const stories = response.stories.map(function(val) {
        const { username, title, author, url, storyId } = val;
        return new Story(username, title, author, url, storyId);
      });
      const storyList = new StoryList(stories);
      return cb(storyList);
    });
  }

  addStory(user, data, cb) {
    $.ajax({
      method: 'POST',
      url: `${BASE_URL}/stories`,
      data: {
        token: user.loginToken,
        story: {
          title: data.title,
          author: data.author,
          url: data.url
        }
      },
      success: response => {
        // modify user stories as well as list of stories
        const { author, title, url, username, storyId } = response.story;
        const newStory = new Story(author, title, url, username, storyId);
        this.stories.push(newStory);
        user.retrieveDetails(() => cb(newStory));
      }
    });
  }

  removeStory(user, storyId, cb) {
    $.ajax({
      url: `${BASE_URL}/stories/${storyId}`,
      method: 'DELETE',
      data: {
        token: user.loginToken
      },
      success: () => {
        const storyIndex = this.stories.findIndex(
          story => story.storyId === storyId
        );
        this.stories.splice(storyIndex, 1);
        user.retrieveDetails(() => cb(this));
      }
    });
  }
}

class User {
  constructor(username, password, name, createdAt, updatedAt) {
    this.username = username;
    this.password = password;
    this.name = name;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.loginToken = '';
    this.favorites = [];
    this.ownStories = [];
  }

  static create(username, password, name, cb) {
    $.post(
      `${BASE_URL}/signup`,
      {
        user: {
          username,
          password,
          name
        }
      },
      function(response) {
        const { username, name } = response.user;
        const newUser = new User(username, password, name);
        localStorage.setItem('HOSJWT', response.token);
        newUser.token = response.token;
        return cb(newUser);
      }
    );
  }

  login(cb) {
    $.post(
      `${BASE_URL}/login`,
      {
        user: {
          username: this.username,
          password: this.password
        }
      },
      response => {
        const token = response.token;
        localStorage.setItem('HOSJWT', token);
        this.loginToken = token;
        return cb(this);
      }
    );
  }

  retrieveDetails(cb) {
    $.ajax({
      url: `${BASE_URL}/users/${this.username}`,
      data: { token: this.loginToken },
      success: response => {
        this.name = response.user.name;
        this.favorites = response.user.favorites;
        this.ownStories = response.user.stories;
        this.createdAt = response.user.createdAt;
        this.updatedAt = response.user.updatedAt;
        return cb(this);
      }
    });
  }

  addFavorite(storyId, cb) {
    return this._toggleFavorite(storyId, true, cb);
  }

  removeFavorite(storyId, cb) {
    return this._toggleFavorite(storyId, false, cb);
  }

  _toggleFavorite(storyId, isAdding, cb) {
    const HTTPVerb = isAdding ? 'POST' : 'DELETE';
    $.ajax({
      url: `${BASE_URL}/users/${this.username}/favorites/${storyId}`,
      method: HTTPVerb,
      data: {
        token: this.loginToken
      },
      success: () => {
        this.retrieveDetails(() => cb(this));
      }
    });
  }

  update(userData, cb) {
    $.ajax({
      url: `${BASE_URL}/users/${this.username}`,
      method: 'PATCH',
      data: {
        user: userData,
        token: this.loginToken
      },
      success: response => {
        this.name = response.user.name;
        return cb(this);
      }
    });
  }

  remove(cb) {
    $.ajax({
      url: `${BASE_URL}/users/${this.username}`,
      method: 'DELETE',
      data: {
        token: this.loginToken
      },
      success: cb
    });
  }
}

class Story {
  constructor(author, title, url, username, storyId) {
    this.author = author;
    this.title = title;
    this.url = url;
    this.username = username;
    this.storyId = storyId;
  }

  update(user, storyData, cb) {
    $.ajax({
      url: `${BASE_URL}/stories/${this.storyId}`,
      method: 'PATCH',
      data: {
        token: user.loginToken,
        story: storyData
      },
      success: response => {
        const { author, title, url } = response.story;
        this.author = author;
        this.title = title;
        this.url = url;
        return cb(this);
      }
    });
  }
}
