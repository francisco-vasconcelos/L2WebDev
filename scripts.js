function loadThread(id){
  $.ajax({
    url: "/forum/" + id,
    dataType: "json",
    success: function(data){
      var threadHTML = ""; //html to be inserted into div with id=threadID
      var dataList = [];
      var threadTitle = data.title;
      var posts = data.posts;
      for (i=0; i<posts.length; i++){
        var post = posts[i];
        var posterUsername = post.poster.username;
        var content = post.content;
        var postDate = new Date(post.timePosted); //reformat unix timestamp to date
        var href = window.location.href;
        //reformatted data parameter for mustache, object with all info needed in template
        var postData = {
          posterUsername: posterUsername,
          postDate: postDate,
          postContent: content,
          href: href
        };
        dataList.push(postData);
      }
      var target = $("#thread" + id); // div to output into
      $.Mustache.load('./templates.htm').done(function () {
        $(target).mustache('post-template', dataList, { method: 'html' });
        $(target).mustache('postUI-template', id);
        $(target).append(threadInterface);
      });
    }
  });
}

function loadForum(){
  console.log("loadForum called");
  $.ajax({
    url: "/forum",
    dataType: "json",
    success: function(data){
      var dataList = [];
      //go through threadList adding to dataList
      for (i=0; i<data.length; i++){
        var threadID = data[i].id;
        var threadTitle = data[i].title;
        var creator =  data[i].creator.username;
        var dateCreated = new Date(data[i].dateCreated);
        var updater = data[i].updater.username;
        var dateUpdated = new Date(data[i].dateUpdated);
        var info = {
          threadID: threadID,
          threadTitle: threadTitle,
          creator: creator,
          dateCreated: dateCreated,
          updater: updater,
          dateUpdated: dateUpdated
        };
        dataList.push(info);
        console.log(dataList);
      }
      $.Mustache.load('./templates.htm')
       .done(function () {
          $('#threadList').mustache('thread-template', dataList);
        });
      }
  });
}
