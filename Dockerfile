FROM centos:7.6.1810

MAINTAINER tak-solder

# node用リポジトリ追加
RUN curl --silent --location https://rpm.nodesource.com/setup_8.x | bash - \
    && curl -sL https://dl.yarnpkg.com/rpm/yarn.repo > /etc/yum.repos.d/yarn.repo \
    && yum install -y epel-release \
    && yum clean all

# chrome用リポジトリ追加
COPY chrome.repo /etc/yum.repos.d/

RUN yum install -y curl wget zip unzip git nodejs yarn \
    ipa-gothic-fonts ipa-pgothic-fonts libappindicator-gtk3 google-chrome-stable \
    && yum clean all

# Work dir
RUN mkdir -p /app
WORKDIR /app
COPY . /app/

RUN npm install
CMD node app.js
