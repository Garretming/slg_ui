#!python
import os,sys

from PIL import Image
from texture import loadpng


PngName = "mainlayer"

def splitImg():
    # 创建同名文件夹，如果已经存在，则无需创建
    if os.path.exists(PngName) == False:
        os.mkdir(PngName)
    im = Image.open(PngName +'.png')
    image_list = loadpng(PngName)
    for img in image_list:
        png_name = img['png']    #每个小图片的名字
        pos = img['pos']         #每个小图片的坐标、长宽、是否旋转信息

        if img['rotated'] == 'true':
            box = ( int(pos['x']), int(pos['y']),  int(pos['x'])+int(pos['h']) ,int(pos['y']) + int(pos['w']) )
        else:
            box = ( int(pos['x']), int(pos['y']), int(pos['x']) + int(pos['w']), int(pos['y'])+int(pos['h']))
        region  = im.crop(box)

        if img['rotated'] == 'true':
            region = region.transpose(Image.ROTATE_90)

        region.save(PngName + '/' + png_name)


if __name__ == '__main__':
    splitImg()