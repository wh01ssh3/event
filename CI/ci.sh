#!/usr/bin/bash
PATH=/sbin:/bin:/usr/bin:/usr/local/bin

cd /root/aspirityjstemplate
STATUS=`git pull | grep 'Fast-forward'`;
if [ "$STATUS" = 'Fast-forward' ]; then
    echo "Building the project" `date` >> ci.log
    pm2 stop AspirityJSTemplate >> ci.log 2>&1
    npm run build >> ci.log 2>&1
    pm2 start AspirityJSTemplate >> ci.log 2>&1
    echo "Project has been built" `date` >> ci.log
else
    echo "Nothing to do" `date` >> ci.log
fi