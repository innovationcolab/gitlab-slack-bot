/**
  * The gitlab2slack autobot
  * author: Victor Wang (xw72@duke.edu)
  *
  * This is a autobot that catches gitlab push event webhook and generates a formatted message to post in designated slack group.
  * 
  * To get started, simply replace the value in slackURL with your slack incoming webhook url.
  */

var slackURL = "replace this placeholder with your slack incoming webhook url";

var express = require('express');
var app = express();

var bodyParser = require('body-parser');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get(['/', '/msg.json'], function (req, res) {
  res.send('GitLab to Slack auto-posting service is running');
});

app.post('/msg.json', function (req, res) {

  var author = req.body.commits[0].author.name;
  var branch = req.body.ref.split('/').pop();
  var repoName = "<" + req.body.repository.homepage + "|" + req.body.repository.git_ssh_url.split(':').pop() + ">";
  var commitURL = req.body.commits[0].url;
  var commitID = "<" + req.body.commits[0].url + "|" + req.body.checkout_sha.substring(0, 7) + ">";
  var commitMsg = req.body.commits[0].message;


  var toSlackMsg = {
    username: "gitlab-bot",
    "icon_emoji": ":ghost:",
    "attachments": [
      {
        "fallback": author + " pushed to branch " + branch + " at " + repoName + ". Commit SHA: " + commitID,
        "pretext": author + " pushed to branch " + branch + " at " + repoName + ". Commit SHA: " + commitID,
        "color": "#00FFFF",
        "fields": [
          {
            "title": "Commit: " + req.body.checkout_sha.substring(0, 7) + " by " + author,
            "value": commitMsg,
            "short": false
          }
        ]
      }
    ]

  };

  // TODO: implement first push in a branch
  var firstInBranch = false;
  if (req.body.before === '0000000000000000000000000000000000000000') {
    firstInBranch = true;
  }

  var request = require('request');

  var options = {
    uri:slackURL,
    method: 'POST',
    json: toSlackMsg
  };

  request.post(options, function (err, response, body) {
    if (err) {
      console.err(err);
    }
    else {
      console.log(body);
    }
  });

  res.send("ok");
});

var server = app.listen(9000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Gitlab to Slack post service listening at http://%s:%s', host, port);
});
