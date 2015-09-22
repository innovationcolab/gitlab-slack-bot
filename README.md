# The GitLab to Slack Autobot
This is a bot that posts to slack group whenever a new commit has been made in a gitlab project. Bot is written in node.js.

## Get started
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

## Run the autobot as a service
To run the auto bot as a service, look into [forever](https://github.com/foreverjs/forever) and [forever-service](https://github.com/zapty/forever-service).

## Author
* Victor Wang ([xw72@duke.edu](mailto:xw72@duke.edu))
