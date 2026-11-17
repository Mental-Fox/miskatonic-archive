from pathlib import Path
from math import sin, cos, pi
import re

p=Path('index.html')
html=p.read_text(encoding='utf-8')
old=re.search(r'<svg class="ritual-circle".*?</svg>',html,re.S).group()
base=Path('backups/intro-before-green-seal/index.html').read_text(encoding='utf-8')
glyphs=base[base.index('<g class="rlyeh-glyphs">'):base.index('<g class="ritual-geometry">')]
def polygon(n,r,phase):
    pts=[f'{400+r*cos(phase+2*pi*i/n):.2f},{400+r*sin(phase+2*pi*i/n):.2f}' for i in range(n)]
    return '<polygon points="'+' '.join(pts)+'"/>'
defs='''<defs>
<radialGradient id="ritual-glow"><stop stop-color="#56cb87" stop-opacity=".05"/><stop offset=".6" stop-color="#174d36" stop-opacity="0"/><stop offset=".88" stop-color="#51d88b" stop-opacity=".09"/><stop offset="1" stop-color="#38c387" stop-opacity="0"/></radialGradient>
<linearGradient id="ritual-ink" x2=".7" y2="1"><stop stop-color="#d1f5a2"/><stop offset=".48" stop-color="#72d997"/><stop offset="1" stop-color="#c0f49a"/></linearGradient>
<path id="rlyeh-chant-track" d="M400 41A359 359 0 1 1 400 759A359 359 0 1 1 400 41"/>
<path id="rlyeh-inner-track" d="M400 91A309 309 0 1 0 400 709A309 309 0 1 0 400 91"/>
</defs>'''
rings=''.join(f'<circle cx="400" cy="400" r="{r}" stroke-width="{w}"/>' for r,w in [(385,2),(377,.8),(341,2.3),(329,1),(292,1.7),(280,1),(223,1.8)])
arcs=''.join(f'<path transform="rotate({a} 400 400)" d="M400 11A389 389 0 0 1 675 125 M400 119A281 281 0 0 1 599 201" stroke-width=".8" opacity=".65"/>' for a in [0,90,180,270])
geometry=polygon(3,323,-pi/2+.2)+polygon(3,323,pi/2+.2)+polygon(5,280,-pi/2)
sectors=''.join(f'<path transform="rotate({a} 400 400)" d="M400 59V108 M392 60V68 M408 60V68"/>' for a in range(0,360,45))
seals=''
for a in range(0,360,90):
    seals+=f'''<g transform="rotate({a} 400 400) translate(400 157)" class="ritual-satellite"><circle r="30"/><circle r="24" stroke-width=".8"/><path d="M-13 2H13M3-10 13 2 3 14 M-4-17-9-8-4-3-10 6-5 17 M0-34V-43 M0 34V43"/><circle cx="-17" cy="-12" r="2" fill="currentColor" stroke="none"/></g>'''
svg=f'''<svg class="ritual-circle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" aria-hidden="true">
{defs}<circle cx="400" cy="400" r="398" fill="url(#ritual-glow)" stroke="none"/>
<g class="ritual-outer">{rings}{arcs}{sectors}<text class="rlyeh-circle-text" textLength="2225" lengthAdjust="spacing"><textPath href="#rlyeh-chant-track">✧ Ph’nglui mglw’nafh Cthulhu R’lyeh wgah’nagl fhtagn · Iä! Iä! · Yog-Sothoth · tharanak · kadishtu · nafl’fhtagn · Nyarlathotep · R’lyeh · wgah’nagl ·</textPath></text></g>
<g class="ritual-inner"><g class="ritual-geometry">{geometry}</g>{glyphs}<text class="rlyeh-inner-text" textLength="1890" lengthAdjust="spacing"><textPath href="#rlyeh-inner-track">✧ kadishtu · nilgh’ri · vulgtm · stell’bsna · lloig · orr’e · syha’h · nglui · ahf’ · chtenff · fhtagn · R’lyeh · kadishtu · nilgh’ri · vulgtm ·</textPath></text>{seals}</g></svg>'''
html=html.replace(old,svg).replace('href="intro.css"','href="intro.css?v=green-seal-1"')
p.write_text(html,encoding='utf-8')
Path('art/intro-ritual-seal.svg').write_text(svg.replace('class="ritual-circle"','fill="none" stroke="#a4e69b" stroke-width="1.6"').replace('aria-hidden="true"',''),encoding='utf-8')
print('Green vector seal installed behind the opening book')
