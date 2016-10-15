#!/bin/bash
echo $PWD
PAT='*.js;*.html;*.css;*.json'
watchmedo shell-command --patterns=$PAT --recursive --command='echo "Changed file:${watch_src_path}";killall nw;nohup nw .' $PWD
