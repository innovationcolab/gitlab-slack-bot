# The GitLab to Slack Bot

This is a bot that posts to slack group whenever a new commit has been made in a gitlab project. Bot is written in node.js.

## Get started

### Using Docker (recommended)

https://hub.docker.com/r/victorxw/gitlab-slack-bot/

Feed the slack incoming webhook url to the environment variable `SLACK_URL`, and run the container.

```bash
docker run -d --name [app name] -e "SLACK_URL=[incoming webhook url]" -p [host port]:3000 --restart=always victorxw/gitlab-slack-bot
```

The container listens by default on port `3000`. If you'd like to run multiple instances of this bot (to post to different slack teams), or you'd like the bot to listen on a different port on the host, use the `-p` options to run the container.

### Using Plain Node.js
To get the bot running on your server, make sure you have **node.js** installed.

Run
```bash
git clone git@gitlab.oit.duke.edu:colab/gitlab2slack-autobot.git
```
to clone the repo to your server, then run
```bash
npm install
```
to install all the dependencies.

Then run
```bash
node gitlab2slack.js
```
to start the autobot.

To run the auto bot as a service, look into [forever](https://github.com/foreverjs/forever) and [forever-service](https://github.com/zapty/forever-service).

## Author
* Victor Wang ([xw72@duke.edu](mailto:xw72@duke.edu))
