const BASE_URL = 'https://hack-or-snooze-v2.herokuapp.com';

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

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

  addStory(userLoggedIn, newStoryData, callback) {
    let obj = {
      token: userLoggedIn.loginToken,
      story: newStoryData
    };

    $.post(`${BASE_URL}/stories`, obj, function() {
      userLoggedIn.retrieveDetails(callback);
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

  static create(username, password, name, probablyDoingDOMStuffInFuture) {
    let obj = { user: { name, username, password } };
    $.post(`${BASE_URL}/signup`, obj, function(response) {
      //  creates a new User class withe the response from the api post and saves it
      //  in a newUser variable
      let newUser = new User(response.user);
      //  takes what is saved in the newUser variable and does dom stuff with it (ie dipslay
      //  on page, locally store)
      newUser.loginToken = response.token; //  whether signed in or logged in, instance will have token
      probablyDoingDOMStuffInFuture(newUser);
    });
  }

  login(callback) {
    let obj = { user: { username: this.username, password: this.password } };
    $.post(`${BASE_URL}/login`, obj, function(response) {
      this.loginToken = response.token;
      callback(this); //  response.user  //  "this" and obj, is the current instance of User
    });
  }

  retrieveDetails(callback) {
    $.get(
      `${BASE_URL}/users/${this.username}?token=${this.loginToken}`,
      function(response) {
        this.favorites = this.favorites.push(response.user.favorites);
        this.ownStories = this.ownStories.push(response.user.stories);
        callback(this);
      }
    );
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
