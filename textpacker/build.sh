#!/usr/bin/env bash

# TexturePacker --data main-hd.plist --format cocos2d --sheet main-hd.png ngame

function gen() {
	target=$1
	if [[ -z $target || ! -d $target ]]; then
		return 1
	fi
	echo ">>>>> $target"
	TexturePacker --data "imgs/$target.plist" --format cocos2d --sheet "imgs/$target.png" $*
}

cd $(dirname $0)
target=$1
ROOT="niu_tp"
niu_tp=$(basename $(pwd))


if [[ "$niu_tp" != "$ROOT" ]]; then
	target=$niu_tp
	cd ..
	niu_tp=$(basename $(pwd))
	if [[ "$niu_tp" != "$ROOT" ]]; then
		echo "脚本路径错误"
		exit 1
	fi
else
	shift
fi

echo $(pwd) $target $*
echo '------------------------------------'


if [[ -z $target ]]; then
	targets=$(ls .)
else
	targets=($target)
fi

for dir in $targets; do
	if [[ -d $dir && ! "(imgs tps)" =~ $dir ]]; then
		gen $dir $*
	fi
done	

