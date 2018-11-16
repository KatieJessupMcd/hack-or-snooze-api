let stories;
let user;

$(function() {
  //  start by checking storage for token and username
  //  if(localStorage.getItem('token'){}

  //  As a user, I can see at least 10 latest stories
  //  on the homepage which link to the actual stories.

  StoryList.getStories(function(storyList) {
    stories = storyList;
    $('#all-articles-list').empty();
    storyList.stories.forEach(function(story) {
      $('#all-articles-list').append(`<li>${story.title} ${story.url}</li>`);
    });
    console.log(storyList);
  });

  //  when you get to the page, at least 10 stories displayed

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
      user = newUser;
    });
  });

  $('#login').on('click', function(e) {
    e.preventDefault(); // anytime you have a form & not reload page on click
    let loginUserName = $('#login-username').val();
    let loginPassword = $('#login-password').val();
    this.login(function(newUser) {});
  });

  //  As a logged in user, I can create a new story.

  //  user fills out each field
  //  we grab each input value
  //  when user click on submit BUTTON, post the form input

  $('#nav-submit').on('click', function() {
    $('#submit-form').removeClass('hidden');
  });

  $('#newStory').on('click', function(e) {
    e.preventDefault(); // anytime you have a form & not reload page on click
    let author = $('#author').val();
    let title = $('#title').val();
    let url = $('#url').val();
    stories.addStory(user, { title, author, url }, function(newStory) {
      console.log(newStory);
    });
  });
}); //  end of window
