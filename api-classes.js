const BASE_URL = 'https://hack-or-snooze-v2.herokuapp.com';

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  // method to get all stories from the stories API on hack-or-snooze
  // API getJSON request asks for all stories from stories endpoint
  // stories const stores map function invoked on response.stories array
  // to assign story data to dynamically created story objs (ES6), which are
  // returned with a new instance of the Story method
  // storyList const for new instance of StoryList class with stories as parameter
  // cb takes storyList const as a parameter
  // callback (method param) only runs once a response has been received from API
  // (i.e. after the success fn has returned).
  static getStories(cb) {
    $.getJSON(`${BASE_URL}/stories`, function(response) {
      const stories = response.stories.map(function(story) {
        const { username, title, author, url, storyId } = story;
        return new Story(username, title, author, url, storyId);
      });
      const storyList = new StoryList(stories);
      return cb(storyList);
    });
  }

  addStory(userLoggedIn, data, callback) {
    $.ajax({
      url: `${BASE_URL}/stories`,
      method: 'POST',
      data: {
        token: userLoggedIn.loginToken,
        story: {
          title: data.title,
          author: data.author,
          url: data.url
        }
      },
      success: response => {
        // push new story to stories array
        const { author, title, url, username, storyId } = response.story;
        const newStory = new Story(author, title, url, username, storyId);
        this.stories.push(newStory);
        // push new story to user ownStories array
        userLoggedIn.retrieveDetails(() => callback(newStory));
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
        // Update this.stories list to reflect response from API
        const storyIndex = this.stories.findIndex(
          story => story.storyId === storyId
        );
        this.stories.splice(storyIndex, 1);

        // Use retrieveData to update ownStories for user instance
        let ownStoriesIndex = user.ownStories.findIndex(
          story => story.storyId === storyId
        );
        this.user.ownStories.storyId.splice(ownStoriesIndex, 1);

        return cb(this);
      }
    });
  }
} //  end of StoryList class

var myList;
StoryList.getStories(function(response) {
  myList = response;
});

class User {
  constructor(username, password, name, loginToken, favorites, ownStories) {
    this.username = username;
    this.password = password;
    this.name = name;
    this.loginToken = '';
    this.favorites = [];
    this.ownStories = [];
  }

  static create(username, password, name, cb) {
    let obj = { user: { username, password, name } };
    console.log(obj);
    $.post(`${BASE_URL}/signup`, obj, function(response) {
      //  creates a new User class with the response from the api post and saves it
      //  in a newUser variable
      let newUser = new User(
        response.user.username,
        password,
        response.user.name,
        response.user.token,
        response.user.favorites,
        response.user.ownStories
      );
      //  takes what is saved in the newUser variable and does dom stuff with it (ie display
      //  on page, locally store)
      newUser.loginToken = response.token; //  whether signed in or logged in, instance will have token
      cb(newUser);
    });
  }

  // login creates a post request for a user login
  // User login accepts login as endpoint, creates obj with this instance of u/n and p/w
  // success function sets value of current this loginToken to the response.token
  // callback(this) is a placeholder to access particular user data later
  login(callback) {
    let obj = { user: { username: this.username, password: this.password } };
    $.post(`${BASE_URL}/login`, obj, response => {
      this.loginToken = response.token;
      callback(this); //  response.user  //  "this" and obj, is the current instance of User
    });
  }

  /*
{
  "user": {
    "username": "test",
    "password": "password"
  }
}
  */

  // get request asks specific user endpoint for user detail, provides token in query string
  // username and token provided dynamically with string literal
  // success fn pushes response data into matching keys in this User instance
  // note: not necessary to use push method. Simple assignment will do
  // callback is placeholder for response data from this instance
  retrieveDetails(callback) {
    $.ajax({
      url: `${BASE_URL}/users/${this.username}`,
      data: { token: this.loginToken },
      success: response => {
        this.name = response.user.name;
        this.favorites = response.user.favorites;
        this.ownStories = response.user.stories.map(
          story =>
            new Story(
              story.author,
              story.title,
              story.url,
              story.userName,
              story.storyId
            )
        );
        this.createdAt = response.user.createdAt;
        this.updatedAt = response.user.updatedAt;
        return callback(this);
      }
    });
  } //  end of retrieveDetails instance method

  // Example retrieveDetails API method
  /*
  retrieveDetails(cb) {
    $.ajax({
      url: `${BASE_URL}/users/${this.username}`,
      data: { token: this.loginToken },
      success: response => {
        this.name = response.user.name;
        this.favorites = response.user.favorites;
        this.ownStories = response.user.stories.map(story => new Story(
          story.author,
          story.title,
          story.url,
          story.username,
          story.storyId
        ));
        this.createdAt = response.user.createdAt;
        this.updatedAt = response.user.updatedAt;
        return cb(this);
      }
    });
  }
  */

  addFavorite(storyId, callback) {
    $.ajax({
      url: `${BASE_URL}/users/${this.username}/favorites/${storyId}`,
      method: 'POST',
      data: {
        token: this.loginToken
      },
      success: response => {
        this.retrieveDetails(() => {
          callback(response.story);
        });
      }
    });
  }

  removeFavorite(storyId, callback) {
    $.ajax({
      url: `${BASE_URL}/users/${this.username}/favorites/${storyId}`,
      method: 'DELETE',
      data: {
        token: this.loginToken
      },
      success: response => {
        this.retrieveDetails(() => {
          callback(response.story);
        });
      }
    });
  }
} //  end of User class

class Story {
  constructor(author, title, url, username, storyId) {
    this.author = author;
    this.title = title;
    this.url = url;
    this.username = username;
    this.storyId = storyId;
  }
}
