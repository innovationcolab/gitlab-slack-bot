const slackURL = process.env.SLACK_URL;

const axios = require('axios');

module.exports = {
  handleBuild: handleBuild,
  handleComment: handleComment,
  handleIssue: handleIssue,
  handleMergeRequest: handleMergeRequest,
  handlePush: handlePush,
  handleTagPush: handleTagPush,
};

function handleBuild(body) {
  if (body.build_status !== 'success' && body.build_status !== 'failed') {
    // ignore queueing and pending build events. Too many events overstuff the channel.
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  const repoName = `<${body.repository.homepage}|${body.project_name}>`;
  const isTagged = body.tag;
  const commit = body.commit;
  const user = body.user.name;

  const state = body.build_status === 'success' ? '*PASSED*' : '*FAILED*';
  const statusColor = body.build_status === 'success' ? "#00CF00" : "#CF0000"
  const subject = body.isTagged ? 'Tag' : 'Commit';
  // body.ref can either be the tag name for Tag or the branch name for Commit
  const subjectName = body.isTagged ? body.ref : `<${body.repository.homepage}/commit/${commit.sha}|${commit.sha.substring(0, 7)}> on branch \`${body.ref}\``;
  const buildStage = body.build_status === 'success' ? `\`${body.build_stage}\` stage` : `\`${body.build_stage}\` stage <!channel|@channel>`;
  const deployMsg = body.build_stage === 'deploy' ? 'and is being *deployed* (Hurrah!!) <!channel|@channel>' : '';

  const toSlackMsg = {
    username: "gitlab-bot",
    icon_emoji: ":ghost:",
    attachments: [
      {
        color: statusColor,
        fallback: `${subject} ${subjectName} in ${repoName} ${state} ${buildStage} ${deployMsg}.`,
        pretext: `${subject} ${subjectName} in ${repoName} ${state} ${buildStage} ${deployMsg}.`,
        author_name: commit.author_name,
        title: `Commit: ${commit.sha.substring(0,7)}`,
        title_link: `${body.repository.homepage}/commit/${commit.sha}`,
        text: commit.message,
        mrkdwn_in: ['fallback', 'pretext'],
      },
    ],
  };

  return axios
    .post(slackURL, toSlackMsg);
}

function handlePush(body) {
  const branch = body.ref.split('/').pop();
  const repoName = `<${body.project.homepage}|${body.project.path_with_namespace}>`;
  const commitList = body.commits;
  const user = body.user_name;

  const toSlackMsg = {
    username: "gitlab-bot",
    icon_emoji: ":ghost:",
    attachments: [
      {
        fallback: `${user} pushed to branch \`${branch}\` in ${repoName}.`,
        pretext: `${user} pushed to branch \`${branch}\` in ${repoName}.`,
        mrkdwn_in: ['fallback', 'pretext'],
      },
    ],
  };

  commitList.forEach((elem) => {
    const author = elem.author.name;
    const commitURL = elem.url;
    const commitID = elem.id.substring(0, 7);
    const commitMsg = elem.message;

    toSlackMsg.attachments.push(
      {
        color: "#00FFFF",
        author_name: author,
        title: `Commit: ${commitID}`,
        title_link: commitURL,
        text: commitMsg,
        mrkdwn_in: ['text'],
      }
    );
  });

  return axios
    .post(slackURL, toSlackMsg);
};

function handleTagPush(body) {
  const tag = body.ref.split('/').pop();
  const repoName = `<${body.project.homepage}|${body.project.path_with_namespace}>`;
  const tagLink = `${body.project.homepage}/tags/${tag}`;
  const author = body.user_name;

  const toSlackMsg = {
    username: "gitlab-bot",
    icon_emoji: ":ghost:",
    attachments: [
      {
        fallback: `${author} pushed a new tag to ${repoName}.`,
        pretext: `${author} pushed a new tag to ${repoName}.`,
      },
      {
        color: "#00FFFF",
        title: tag,
        title_link: tagLink,
      }
    ],
  };

  return axios
    .post(slackURL, toSlackMsg);
};

function handleComment(body) {
  const comment = body.object_attributes;
  const repoName = `<${body.project.homepage}|${body.project.path_with_namespace}>`;

  let target = '';
  switch (comment.noteable_type) {
    case 'Commit':
      target = ' to a commit';
      break;
    case 'MergeRequest':
      target = ' to a merge request';
      break;
    case 'Issue':
      target = ' to an issue';
      break;
    case 'Snippet':
      target = ' to a code snippet';
      break;
    default:
      break;
  }

  const toSlackMsg = {
    username: "gitlab-bot",
    icon_emoji: ":ghost:",
    attachments: [
      {
        fallback: `A comment <${comment.url}|(#${comment.id})> is made${target} in ${repoName}.`,
        pretext: `A comment <${comment.url}|(#${comment.id})> is made${target} in ${repoName}.`,
      },
      {
        color: "#00FFFF",
        text: comment.note,
        mrkdwn_in: ['text'],
      }
    ],
  };

  return axios
    .post(slackURL, toSlackMsg);
};

function handleIssue(body) {
  const issue = body.object_attributes;
  const repoName = `<${body.project.homepage}|${body.project.path_with_namespace}>`;

  const toSlackMsg = {
    username: "gitlab-bot",
    icon_emoji: ":ghost:",
    attachments: [
      {
        fallback: `<${issue.url}|Issue #${issue.iid}> is *${issue.state}* in ${repoName}. <!channel|@channel>`,
        pretext: `<${issue.url}|Issue #${issue.iid}> is *${issue.state}* in ${repoName}. <!channel|@channel>`,
        mrkdwn_in: ['fallback', 'pretext'],
      },
      {
        color: "#00FFFF",
        title: `${issue.title}`,
        text: `${issue.description}`,
        mrkdwn_in: ['text'],
      }
    ],
  };

  return axios
    .post(slackURL, toSlackMsg);
};

function handleMergeRequest(body) {
  const mr = body.object_attributes;
  const repoName = `<${mr.target.homepage}|${mr.target.path_with_namespace}>`;

  const toSlackMsg = {
    username: "gitlab-bot",
    icon_emoji: ":ghost:",
    attachments: [
      {
        fallback: `<${mr.url}|Merge Request !${mr.iid}> is *${mr.state}* in ${repoName}.`,
        pretext: `<${mr.url}|Merge Request !${mr.iid}> is *${mr.state}* in ${repoName}.`,
        mrkdwn_in: ['fallback', 'pretext'],
      },
      {
        color: "#00FFFF",
        title: mr.work_in_progress ? `[Work in Progress]: ${mr.title}` : `${mr.title}`,
        text: `${mr.description}`,
        mrkdwn_in: ['text'],
      }
    ],
  };

  return axios
    .post(slackURL, toSlackMsg);
};
