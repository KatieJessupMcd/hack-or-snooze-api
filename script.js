let stories;
let currentUser;

let token = localStorage.getItem('token');
let username = localStorage.getItem('username');

if (token && username) {
  let loggedInUser = new User(username);
  loggedInUser.loginToken = token;
  loggedInUser.retrieveDetails(userWithAllDetails => {
    //  think need to fix this line
    currentUser = userWithAllDetails;
    showNavForLoggedInUser();
  });
}

//  add check for user and token at the beginning

$(function() {
  StoryList.getStories(function(storyList) {
    stories = storyList;
    $('#all-articles-list').empty();
    storyList.stories.forEach(function(story) {
      //  stringify more html to include star - toggle between the two stars
      $('#all-articles-list').append(
        `<li><span id=${story.storyId} class="far fa-star"></span>${
          story.title
        } ${story.url}</li>`
      );
    });
    console.log(storyList);
  });

  //  when you get to the page, at least 10 stories displayed
  $('#all-articles-list').on('click', '.fa-star', function(e) {
    // how do you know which method to use? -- addFavorite vs. removeFavorite??
    console.log(e.target);

    if ($(e.target).hasClass('far')) {
      currentUser.addFavorite($(e.target).attr('id'), function() {
        $(e.target).addClass('fas');
        $(e.target).removeClass('far');
      });
    } else {
      currentUser.removeFavorite($(e.target).attr('id'), function() {
        $(e.target).removeClass('fas');
        $(e.target).addClass('far');
      });
    }
    //  $(e.target).hasClass("banana") <-- return true or false
    // does the event target have far as a class? if not, add it as fav

    //  make an ajax request to add or remove fav - use the story id from the story span
  });
  //  As a user, I can click on the link in the
  //  navbar to open sign up /log in - unhide form section class - account-form
  $('#nav-login').on('click', function() {
    //  remove class of hidden from the login/signup forms
    $('.account-form').removeClass('hidden');
  });

  //  As a user, I can login or signup for an
  //  account on the homepage.
  $('#signup').on('click', function(e) {
    e.preventDefault(); // anytime you have a form & not reload page on click
    let newAccountName = $('#create-account-name').val();
    let newUserName = $('#create-account-username').val();
    let newPassword = $('#create-account-password').val();
    User.create(newUserName, newPassword, newAccountName, function(newUser) {
      currentUser = newUser;
      showNavForLoggedInUser();
    });
  });

  $('#login').on('click', function(e) {
    e.preventDefault(); // anytime you have a form & not reload page on click
    let currentUserName = $('#login-username').val();
    let currentPassword = $('#login-password').val();

    currentUser = new User(currentUserName, currentPassword);
    currentUser.login(function loginAndSubmitForm(updatedUser) {
      currentUser = updatedUser;
      currentUser.retrieveDetails(() => {
        token = currentUser.loginToken;
        $('#login-form').hide();
        $('#create-account-form').hide();
        showNavForLoggedInUser();
        //  ***QUESTION - how to set this item in local storage?
        localStorage.setItem('token', currentUser.loginToken);
        localStorage.setItem('username', currentUser.username);
      });
    });

    //  { user: { username: this.username, password: this.password } }
  });

  //  on the login, will need to store the token and the
  //  currentUser

  //  As a logged in user, I can create a new story.

  //  user fills out each field
  //  we grab each input value
  //  when user click on submit BUTTON, post the form input

  $('#nav-submit').on('click', function() {
    $('#submit-form').removeClass('hidden');
  });

  $('#newStory').on('click', function(e) {
    //e.preventDefault(); // anytime you have a form & not reload page on click
    let author = $('#author').val();
    let title = $('#title').val();
    let url = $('#url').val();
    stories.addStory(currentUser, { title, author, url }, function(newStory) {
      console.log(newStory);
    });
  });
}); //  end of window

//  business logic-y - still in global scope
function showNavForLoggedInUser() {
  $('#nav-login').hide();
  $('#user-profile').hide();
  $('.main-nav-links, #user-profile').toggleClass('hidden');
  $('#nav-welcome').show();
  $('#nav-logout').show();
}
