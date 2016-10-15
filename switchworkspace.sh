#!/bin/bash
while true; do
sleep 0.05;
wmctrl -r "Devmsc" -t 1;
wmctrl -r "Developer" -t 1;
done
