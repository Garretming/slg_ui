#!python

from PIL import Image
try: 
    import xml.etree.cElementTree as ET 
except ImportError: 
    import xml.etree.ElementTree as ET 
import re
import sys

png_list = []
def loadpng(PngName):
    tree = ET.parse(PngName+ '.plist')
    root = tree.getroot()

    for kk in root.findall('dict'):
        for i in range(len(kk)):
            if kk[i].text == "frames":
                pngv = kk[i+1]

                for j in  range(len(pngv)):
                    png_dict = {}
                    if pngv[j].tag == 'key':
                        # 把图片名称加入 dict
                        png_dict['png'] = pngv[j].text
                        png_list.append(png_dict)

                        frame = pngv[j+1]
                        for k in range(len(frame)):
                            if frame[k].text == 'frame':
                                # 把图片 坐标和 宽高加入 dict
                                png_dict['pos'] = frame[k+1].text
                            if frame[k].text == 'rotated':
                                # 图片 是否旋转
                                png_dict['rotated'] = frame[k+1].tag
    return splitpng()

def splitpng():
    # 过滤掉 位置字符串中的｛｝
    m = re.compile(u'[^{}]+')
    image_list = []

    for d in png_list:
        tmp = {}
        tmp['png'] = d['png']
        tmp['rotated'] = d['rotated']
        pos = d['pos'].split(',')
        pos_dict = {}
        for i in range(len(pos)):
            cn = m.findall(pos[i] )
            if i == 0:
                pos_dict['x'] = cn[0]
            elif i == 1:
                pos_dict['y'] = cn[0]
            elif i == 2:
                pos_dict['w'] = cn[0]
            elif i == 3:
                pos_dict['h'] = cn[0]
        tmp['pos'] = pos_dict
        image_list.append(tmp)

    return image_list

# texture.py文件用于获取小图片的名称、坐标、宽高和旋转信息的dict
