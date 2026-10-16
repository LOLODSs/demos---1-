from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageFilter
root=Path(__file__).resolve().parent.parent
for pet in ['cat','dog']:
    image=Image.open(root/f'public/images/visit-{pet}-illustration.webp').convert('RGB')
    rgb=np.array(image)
    paper=((rgb.min(axis=2)>228)&((rgb.max(axis=2).astype(int)-rgb.min(axis=2))<28)).astype('uint8')
    _,labels=cv2.connectedComponents(paper,connectivity=8)
    outer=np.unique(np.concatenate([labels[0],labels[-1],labels[:,0],labels[:,-1]]));outer=outer[outer!=0]
    outside=np.isin(labels,outer)
    alpha=Image.fromarray((~outside).astype('uint8')*255).filter(ImageFilter.GaussianBlur(1.2))
    image.putalpha(alpha)
    image.save(root/f'public/images/visit-{pet}-illustration-cutout.webp','WEBP',quality=94,method=6)
    print(pet, 'transparent exterior:',round(outside.mean()*100,1),'%')
