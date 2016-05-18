/**
  * The gitlab2slack autobot
  * author: Victor Wang (xw72@duke.edu)
  *
  * This is a autobot that catches gitlab event webhook and generates a formatted message to post in designated slack channel.
  *
  * To get started, simply replace the value in slackURL with your slack incoming webhook url.
  */

// Rollbar Token
const POST_SERVER_ITEM_ACCESS_TOKEN = process.env.POST_SERVER_ITEM_ACCESS_TOKEN;
const isProd = process.env.NODE_ENV === 'production' ? true : false;

const express = require('express');
const bodyParser = require('body-parser');
const debug = require('debug')('gitlab2slack');
const rollbar = isProd ? require('rollbar') : () => {};

const app = express();
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// production error handling
if (isProd) {
  rollbar.init(POST_SERVER_ITEM_ACCESS_TOKEN, {
    environment: process.env.NODE_ENV,
  });
  app.use(rollbar.errorHandler(POST_SERVER_ITEM_ACCESS_TOKEN)); // for expressjs error handler
  rollbar.handleUncaughtExceptions(POST_SERVER_ITEM_ACCESS_TOKEN, {
    exitOnUncaughtException: true,
  });
}


app.get(['/', '/msg.json'], function (req, res) {
  res.send('GitLab to Slack auto-posting service is running');
});

// handlers
const { handleComment, handleIssue, handleMergeRequest, handlePush, handleTagPush } = require('./handlers.js');

app.post('/msg.json', function (req, res) {
  const eventType = req.body.object_kind;
  switch(eventType) {
    case 'push':
      handlePush(req.body)
        .then((response) => {
          res.send("ok");
        })
        .catch((error) => {
          if (isProd) {
            rollbar.reportMessageWithPayloadData("Push event error", error);
          } else {
            console.error(error);
          }
        });
      break;
    case 'tag_push':
      handleTagPush(req.body)
        .then((response) => {
          res.send("ok");
        })
        .catch((error) => {
          if (isProd) {
            rollbar.reportMessageWithPayloadData("Tag Push event error", error);
          } else {
            console.error(error);
          }
        });
      break;
    case 'issue':
      handleIssue(req.body)
        .then((response) => {
          res.send("ok");
        })
        .catch((error) => {
          if (isProd) {
            rollbar.reportMessageWithPayloadData("Issue event error", error);
          } else {
            console.error(error);
          }
        });
      break;
    case 'note':
      handleComment(req.body)
        .then((response) => {
          res.send("ok");
        })
        .catch((error) => {
          if (isProd) {
            rollbar.reportMessageWithPayloadData("Comment event error", error);
          } else {
            console.error(error);
          }
        });
      break;
    case 'merge_request':
      handleMergeRequest(req.body)
        .then((response) => {
          res.send("ok");
        })
        .catch((error) => {
          if (isProd) {
            rollbar.reportMessageWithPayloadData("Merge Request event error", error);
          } else {
            console.error(error);
          }
        });
      break;
    default:
      if (isProd) {
        rollbar.reportMessage("Unsupported event", error);
      } else {
        console.error(error);
      }
  }
});

const server = app.listen(3000, () => {
  const host = server.address().address;
  const port = server.address().port;

  if (isProd) {
    rollbar.reportMessage(`Gitlab to Slack post service listening at http://${host}:${port}`, "info");
  } else {
    console.log(`Gitlab to Slack post service listening at http://${host}:${port}`);
  }
});
