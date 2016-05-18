const slackURL = process.env.SLACK_URL;

const axios = require('axios');

module.exports = {
  handleComment: handleComment,
  handleIssue: handleIssue,
  handleMergeRequest: handleMergeRequest,
  handlePush: handlePush,
  handleTagPush: handleTagPush,
};

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
        fallback: `${user} pushed to branch ${branch} in ${repoName}.`,
        pretext: `${user} pushed to branch ${branch} in ${repoName}.`,
      },
    ],
  };

  commitList.reverse().forEach((elem) => {
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
        fields: [
          {
            value: commitMsg,
            short: false,
          },
        ],
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
        fields: [
          {
            value: `${comment.note}`,
            short: false,
          },
        ],
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
        fallback: `<${issue.url}|Issue #${issue.iid}> is ${issue.state} in ${repoName}. <!channel|@channel>`,
        pretext: `<${issue.url}|Issue #${issue.iid}> is ${issue.state} in ${repoName}. <!channel|@channel>`,
      },
      {
        color: "#00FFFF",
        fields: [
          {
            title: `${issue.title}`,
            value: `${issue.description}`,
            short: false,
          },
        ],
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
        fallback: `<${mr.url}|Merge Request !${mr.iid}> is ${mr.state} in ${repoName}.`,
        pretext: `<${mr.url}|Merge Request !${mr.iid}> is ${mr.state} in ${repoName}.`,
      },
      {
        color: "#00FFFF",
        fields: [
          {
            title: mr.work_in_progress ? `[Work in Progress]: ${mr.title}` : `${mr.title}`,
            value: `${mr.description}`,
            short: false,
          },
        ],
      }
    ],
  };

  return axios
    .post(slackURL, toSlackMsg);
};
