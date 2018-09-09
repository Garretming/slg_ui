#!/usr/bin/env bash

cd $(dirname $0)
target=$(basename $(pwd))

../build.sh $target --max-size 2048 --disable-rotation

# rsync ../imgs/cards.* ../../niu/res/CCS/publish/imgs/