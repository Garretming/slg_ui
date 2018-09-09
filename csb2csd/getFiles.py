#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
@author: clark
"""
 
import os, re, plistlib
import sys
 
def parseArgument():
    argus = []
    for i in range(0,len(sys.argv)):
        #  print(sys.argv[i])
         argus.append(sys.argv[i])
    return argus

def traverse(f,l,n):
    fs = os.listdir(f)
    for f1 in fs:
        tmp_path = os.path.join(f,f1)
        if not os.path.isdir(tmp_path):
            # print('文件: %s'%tmp_path)
             # 文件名
            name = os.path.basename(tmp_path)
            # filename = re.match(r'(.*)\.csb$', name).group(1)
            # filename = re.search(r'(.*)\.csb$', tmp_path).group(1)
            # print('文件: %s'%name)
           
            if l==0:
                os.system('lua lily.lua '+ n +'/' + name)
            else:
                
                os.system('lua lily.lua '+'' + Lname +'/'+ n +'/' + name)
        else:
            # print('文件夹：%s'%tmp_path)
            fname = os.path.basename(tmp_path)
            # print('文件夹：%s'%fname)
            # print("l:%s"%l)
            if l==0:
                b = './out/'+ Lname +'/'+fname
                if  not os.path.exists(b):
                    # print("=======")
                    os.makedirs(b)

            traverse(tmp_path,l+1,fname)


             

 

def test(path):
    for fpathe,dirs,fs in os.walk(path):
        for f in fs:
            print(os.path.join(fpathe,f))


#             返回的是一个三元tupple(dirpath, dirnames, filenames),
# 其中第一个为起始路径，第二个为起始路径下的文件夹,第三个是起始路径下的文件。
# dirpath是一个string，代表目录的路径，
# dirnames是一个list，包含了dirpath下所有子目录的名字，
# filenames是一个list，包含了非目录文件的名字，这些名字不包含路径信息。如果需要得到全路径,需要使用 os.path.join(dirpath, name)。
Lname = ""
if __name__ == '__main__': 
    argus = parseArgument()
    # print(argus)
    path = os.getcwd() + "/" + argus[1]

   

    Lname = os.path.basename(path)
    
    a = './out/'+ Lname 
    if  not os.path.exists(a):
            os.makedirs(a)
    
    # print('文件夹 : %s'%name)
    traverse(path,0,Lname)
    # test(path)


# os.chdir(os.path.dirname(os.path.realpath(__file__)))

# OUTPUT1 = '''local plists = {'''
# OUTPUT2 = '''
#     {0} = "{1}"'''
# OUTPUT3 = '''
# }
# return plists'''
# def output(files):
#     lines = []
#     for prefix, file in files.items():
#         lines.append(OUTPUT2.format(prefix, file))
#     lines.sort()
#     text = OUTPUT1 + ','.join(lines) + OUTPUT3
#     with open('./src/app/scenes/plists.lua', 'w') as f:
#         f.write(text)



# if __name__ == '__main__':
#     files = {}
#     DIR = 'test/'
#     for file in filter(lambda f: re.match(r'.*csb$', f), os.listdir(DIR)):
#         plist = plistlib.readPlist(os.path.join(DIR, file))
#         filename = re.match(r'(.*)\.plist$', file).group(1)
#         frames = plist.get('frames')
#         if frames is None:
#             continue
#         for frameName in frames:
#             result = re.match(r'([\w]*?)[-_]', frameName)
#             if not result:
#                 continue
#             assert result, ['图片名称有问题: ', frameName]
#             prefix = result.group(1)
#             found = files.get(prefix)
#             if found == None:
#                 files[prefix] = filename
#             else:
#                 if found != filename:
#                     print("'{}' 不能同时出现在'{}'和'{}'图集中".format(frameName, filename, found))
#                 assert found == filename, '同一个前缀不能出现在不同图集中'
#     output(files)
