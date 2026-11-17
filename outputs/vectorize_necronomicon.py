from pathlib import Path
import sys, json, zipfile
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw, ImageFont
import numpy as np

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / 'vector-tools'))
import vtracer

OUT = ROOT / 'necronomicon-vector'
OUT.mkdir(exist_ok=True)
(OUT / 'parts').mkdir(exist_ok=True)
(OUT / 'work').mkdir(exist_ok=True)
im = Image.open(ROOT.parent / 'art/Библиотека/necronomicon-occult-seal.webp').convert('RGBA')
W, H = im.size
def poly(points):
    m = Image.new('L', im.size); ImageDraw.Draw(m).polygon(points, fill=255); return np.array(m)>0
def ellipse(box):
    m = Image.new('L', im.size); ImageDraw.Draw(m).ellipse(box, fill=255); return np.array(m)>0

spec = [
 ('01-binding', 'Переплёт', np.ones((H,W), dtype=bool)),
 ('02-pages', 'Блок страниц', poly([(1001,70),(1090,105),(1110,840),(1105,1205),(190,1212),(174,1074),(1000,1041)])),
 ('03-spine', 'Корешок', poly([(193,51),(326,53),(286,1032),(214,1081),(203,1204),(148,1198),(147,1059),(180,557),(179,225)])),
 ('04-cover-relief', 'Рельеф обложки', poly([(384,181),(901,180),(912,915),(349,914)])),
 ('05-ornamental-frame', 'Орнаментальная рамка', poly([(322,90),(968,87),(980,1002),(284,1002)]) & ~poly([(384,181),(901,180),(912,915),(349,914)])),
 ('06-central-seal', 'Центральная печать', ellipse((451,391,800,737))),
 ('07-upper-studs', 'Верхние заклёпки', ellipse((375,173,450,245)) | ellipse((849,173,921,245))),
 ('08-lower-studs', 'Нижние заклёпки', ellipse((354,844,428,918)) | ellipse((849,846,923,919))),
 ('09-upper-clasp', 'Верхняя застёжка', poly([(948,305),(988,306),(1051,319),(1098,324),(1099,410),(1059,407),(1044,393),(952,383),(928,354)])),
 ('10-lower-clasp', 'Нижняя застёжка', poly([(949,750),(992,753),(1052,769),(1099,774),(1105,852),(1059,850),(1043,835),(951,826),(928,799)])),
]
visible = np.array(im.getchannel('A')) > 12
assigned = np.zeros((H,W), dtype=bool)
masks = {}
for slug,label,mask in reversed(spec):
    masks[slug] = mask & visible & ~assigned
    assigned |= mask & visible

NS='http://www.w3.org/2000/svg'
ET.register_namespace('',NS)
INK='http://www.inkscape.org/namespaces/inkscape'
ET.register_namespace('inkscape',INK)
svg=ET.Element(f'{{{NS}}}svg', {'width':str(W),'height':str(H),'viewBox':f'0 0 {W} {H}'})
ET.SubElement(svg,f'{{{NS}}}title').text='Некрономикон — векторная трассировка по деталям'
stats=[]
tiles=[]
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',22)
for slug,label,_ in spec:
    a=np.array(im)
    a[~masks[slug]]=0
    layer=Image.fromarray(a)
    src=OUT/'work'/f'{slug}.png'; layer.save(src)
    dest=OUT/'parts'/f'{slug}.svg'
    vtracer.convert_image_to_svg_py(str(src),str(dest),colormode='color',hierarchical='stacked',mode='spline',filter_speckle=8,color_precision=5,layer_difference=24,corner_threshold=60,length_threshold=4,max_iterations=10,splice_threshold=45,path_precision=2)
    tree=ET.parse(dest); root=tree.getroot()
    group=ET.SubElement(svg,f'{{{NS}}}g',{'id':slug,f'{{{INK}}}groupmode':'layer',f'{{{INK}}}label':label})
    for child in root:
        group.append(child)
    n=len(list(root.iter(f'{{{NS}}}path')))
    stats.append({'file':f'parts/{slug}.svg','layer':label,'paths':n})
    tile=Image.new('RGB',(440,480),'#e9dfcd')
    box=layer.getbbox()
    if box:
        crop=layer.crop(box); crop.thumbnail((400,410))
        tile.paste(crop,((440-crop.width)//2,(420-crop.height)//2),crop)
    ImageDraw.Draw(tile).text((18,438),label,font=font,fill='#39261e')
    tiles.append(tile)
    print(slug,n,flush=True)
ET.ElementTree(svg).write(OUT/'necronomicon-layered.svg',encoding='utf-8',xml_declaration=True)
sheet=Image.new('RGB',(440*5,480*2),'#e9dfcd')
for i,tile in enumerate(tiles): sheet.paste(tile,((i%5)*440,(i//5)*480))
sheet.save(OUT/'parts-overview.jpg',quality=92)
(OUT/'layers.json').write_text(json.dumps(stats,ensure_ascii=False,indent=2),encoding='utf-8')
(OUT/'README.txt').write_text('НЕКРОНОМИКОН: ВЕКТОРНАЯ ВЕРСИЯ\n\nnecronomicon-layered.svg — общий SVG, 10 именованных слоёв.\nparts/ — отдельные детали, все в исходной системе координат 1254 × 1254; при совмещении в точке (0, 0) восстанавливают общую композицию.\nparts-overview.jpg — схема деталей, выполнена из исходных вырезок, а не рендер SVG.\n\nНастоящие векторные контуры без встроенного растра. Автоматическая цветная трассировка с упрощением мелкой фактуры. Разделение относится только к видимым поверхностям: скрытые части под печатью и застёжками не дорисованы. Центральный медальон включает фон внутри его окружности.\nИсходное изображение не изменено.\n',encoding='utf-8')
with zipfile.ZipFile(ROOT/'necronomicon-vector.zip','w',zipfile.ZIP_DEFLATED) as z:
    for p in OUT.rglob('*'):
        if p.is_file() and 'work' not in p.parts:
            z.write(p,p.relative_to(OUT))
print('DONE',flush=True)
