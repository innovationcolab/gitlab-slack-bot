FROM    debian:jessie

RUN     apt-get update
RUN     apt-get install -y curl
RUN     curl -sL https://deb.nodesource.com/setup_5.x | bash -
RUN     apt-get install -y nodejs

COPY    . /src
RUN     cd /src ; npm install

EXPOSE  3000
CMD     ["node", "/src/gitlab2slack.js"]
