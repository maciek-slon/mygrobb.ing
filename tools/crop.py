from PIL import Image
import sys

img = Image.open(sys.argv[1])
box = (4, 13, 28, 37)
img2 = img.crop(box)
img2.save(sys.argv[1])

# PS: ls -file | % {python ..\..\..\tools\crop.py $_.name}