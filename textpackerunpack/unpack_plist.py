#!/usr/bin/evn python3
#coding=utf-8
import os,sys, re, plistlib
from xml.etree import ElementTree
from PIL import Image
def tree_to_dict(tree):
    d = {}
    for index, item in enumerate(tree):
        if item.tag == 'key':
            if tree[index+1].tag == 'string':
                d[item.text] = tree[index + 1].text
            elif tree[index + 1].tag == 'true':
                d[item.text] = True
            elif tree[index + 1].tag == 'false':
                d[item.text] = False
            elif tree[index+1].tag == 'dict':
                d[item.text] = tree_to_dict(tree[index+1])
    return d
 
def gen_png_from_plist(plist_filename, png_filename):
    file_path = plist_filename.replace('.plist', '')
    big_image = Image.open(png_filename)
    root = ElementTree.fromstring(open(plist_filename, 'r').read())
    plist_dict = tree_to_dict(root[0])
    to_list = lambda x: x.replace('{','').replace('}','').split(',')
    for k,v in plist_dict['frames'].items():
        rectlist = to_list(v['frame'])
        width = int( rectlist[3] if v['rotated'] else rectlist[2] )
        height = int( rectlist[2] if v['rotated'] else rectlist[3] )
        box=( 
            int(rectlist[0]),
            int(rectlist[1]),
            int(rectlist[0]) + width,
            int(rectlist[1]) + height,
            )
        sizelist = [ int(x) for x in to_list(v['sourceSize'])]
        rect_on_big = big_image.crop(box)
 
        if v['rotated']:
            rect_on_big = rect_on_big.rotate(90)
 
        result_image = Image.new('RGBA', sizelist, (0,0,0,0))
        if v['rotated']:
            result_box=(
                ( sizelist[0] - height )/2,
                ( sizelist[1] - width )/2,
                ( sizelist[0] + height )/2,
                ( sizelist[1] + width )/2
                )
        else:
            result_box=(
                ( sizelist[0] - width )/2,
                ( sizelist[1] - height )/2,
                ( sizelist[0] + width )/2,
                ( sizelist[1] + height )/2
                )
        result_image.paste(rect_on_big, result_box, mask=0)
 
        if not os.path.isdir(file_path):
            os.mkdir(file_path)
        outfile = (file_path+'/' + k).replace('gift_', '')
        print outfile, "generated"
        result_image.save(outfile)

#  命令行： python unpack_plist.py  plist文件名称 
# 例子： python unpack_plist.py  common      ## plist文件全名为 common.plist
if __name__ == '__main__':
    argus = parseArgument()
    # print(argus)
    path = os.getcwd() + "/" + argus[1]
    Lname = os.path.basename(path)
    a = './plist/'+ Lname 
    if  not os.path.exists(a):
            os.makedirs(a)
    checkplist(Lname+'/')
    # print('文件夹 : %s'%name)
    traverse(path,0,Lname)

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
           
            # if l==0:
            #     # os.system('lua lily.lua '+ n +'/' + name)
            #     unpack("",n,name)
            # else:
                
            #     # os.system('lua lily.lua '+'' + Lname +'/'+ n +'/' + name)
            #     unpack(Lname,n,name)
        else:
            # print('文件夹：%s'%tmp_path)
            fname = os.path.basename(tmp_path)
            # print('文件夹：%s'%fname)
            # print("l:%s"%l)
            if l==0:

                b = './plist/'+ Lname +'/'+fname
                if  not os.path.exists(b):
                    # print("=======")
                    os.makedirs(b)
                
                checkplist(Lname +'/'+fname)
                

            traverse(tmp_path,l+1,fname)

def checkplist(DIR):
    files = {}
    for file in filter(lambda f: re.match(r'.*plist$', f), os.listdir(DIR)):
        plist = plistlib.readPlist(os.path.join(DIR, file))
        filename = re.match(r'(.*)\.plist$', file).group(1)
        frames = plist.get('frames')
        if frames is None:
            continue
        for frameName in frames:
            result = re.match(r'([\w]*?)[-_]', frameName)
            if not result:
                continue
            assert result, ['图片名称有问题: ', frameName]
            prefix = result.group(1)
            found = files.get(prefix)
            if found == None:
                files[prefix] = filename
            else:
                if found != filename:
                    print("'{}' 不能同时出现在'{}'和'{}'图集中".format(frameName, filename, found))
                assert found == filename, '同一个前缀不能出现在不同图集中'
    output(files)

def unpack(parent,n,name):
    filename =""
    if parent == "" :
        filename = n +'/' + name
    else:
        filename = parent + '/' + n +'/' + name
   
    
    # plist_filename = + filename + '.plist'
    # png_filename = parent + n + filename + '.png'
    # if (os.path.exists(plist_filename) and os.path.exists(png_filename)):
    #     gen_png_from_plist( plist_filename, png_filename )
    # else:
    #     print "make sure you have boith plist and png files in the same directory"





OUTPUT1 = '''local plists = {'''
OUTPUT2 = '''
    {0} = "{1}"'''
OUTPUT3 = '''
}
return plists'''
def output(files):
    lines = []
    for prefix, file in files.items():
        lines.append(OUTPUT2.format(prefix, file))
    lines.sort()
    text = OUTPUT1 + ','.join(lines) + OUTPUT3
    with open('./plist/plists.lua', 'w') as f:
        f.write(text)





   



