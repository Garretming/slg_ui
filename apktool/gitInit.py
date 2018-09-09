#!/usr/bin/evn python3
#coding=utf-8
import os
import sys

def parseArgument():
    for i in range(0,len(sys.argv)):
         print(sys.argv[i])
         argu = sys.argv[i]
    return argu

if __name__ == '__main__':
    argu = parseArgument()
    os.system('rm -rf .git')
    os.system('git init')
    os.system('git remote add origin git@gitlab.com:Clark8/apktool.git')
   
   
    os.system('git add .')
    # os.system('git pull --rebase')
    os.system('git commit -m ' + '\"' + argu + '\"')
    # os.system('git stash')
    os.system('git push -u origin master')





