from pathlib import Path

out=Path('art/bookmarks/vector'); out.mkdir(parents=True,exist_ok=True)
shapes=[
 'M9 8 Q47 5 80 7 L280 5 L280 78 Q176 76 98 78 L11 75 Q5 67 7 52 L5 28 Z',
 'M20 6 L84 8 Q151 4 280 7 L280 77 L12 76 Q8 64 10 48 L7 26 Z',
 'M13 7 L75 5 L280 8 L280 77 L10 76 L7 68 L10 63 L4 60 L11 53 L3 50 L16 42 L8 40 L13 35 L4 30 L9 26 L6 16 Z',
 'M11 10 Q40 6 65 8 Q116 4 166 7 L280 7 L280 75 Q216 80 163 76 Q111 80 64 76 L9 78 Q5 60 8 46 Q4 30 11 10 Z',
 'M17 8 Q77 5 140 8 L280 6 L280 77 L11 75 Q8 61 10 45 L7 22 Z',
 'M9 8 L62 6 Q172 9 280 6 L280 77 L38 78 L34 73 L30 77 L25 69 L22 75 L18 67 L13 72 L11 65 L5 66 L9 58 L5 54 L7 37 L5 18 Z',
 'M10 7 Q45 4 87 7 L280 5 L280 78 Q134 75 50 78 L9 75 L6 56 Q9 43 6 30 Z',
 'M14 7 L75 6 Q185 9 280 6 L280 77 L12 75 L7 63 L9 46 L6 22 Z',
 'M11 8 L74 6 L280 7 L280 77 L29 77 Q15 71 8 60 L6 32 Z'
]
colors=[('#786447','#4b3b2b'),('#687360','#344a3c'),('#66747c','#344953'),('#807050','#51452f'),('#647364','#334b42'),('#7b6450','#4e3d30'),('#777389','#47465e'),('#78677a','#493d53'),('#73715a','#464734')]
sigils=[
 '<path d="M0-15 -4-3 -14 1 -3 4 0 16 4 4 14 0 4-3Z M0-19V19 M-19 0H19"/>',
 '<path d="M-12 10 0-14 13 10Z M0-14V17 M-14-5 14 5 M-14 5 14-5"/><circle r="6"/>',
 '<path d="M-17 0Q0-18 17 0Q0 18-17 0Z M0-19V-12 M0 12V19 M-19-12-13-8 M13 8 19 12"/><circle r="6"/>',
 '<path d="M0 17V-16 M0-3-12-12 M0 5 12-6 M-12-12V-19 M12-6V-14 M-7 18-7 10 M7 18V11"/><circle cy="-17" r="3"/>',
 '<path d="M-13 12 0-16 13 12Z M-17-5 17-5 0 17Z M-7 1H7"/><circle r="19"/>',
 '<path d="M0-17V16 M-12-10 12 10 M12-10-12 10 M-12-10-13-17 M12-10 13-17 M-12 10-13 17 M12 10 13 17"/><circle r="7"/>',
 '<path d="M-16-8 0 17 16-8Z M-16 8 0-17 16 8Z M-7 0Q0-9 7 0Q0 9-7 0Z"/><circle r="3"/>',
 '<path d="M0 0C12-12 21 5 10 12C-4 23-24 3-12-11C1-28 26-11 19 6 M-20-18-14-12 M-20 18-13 12"/>',
 '<path d="M-14 14V-13 L-5-3 0-16 5-3 14-13V14 M-14 4H14 M-5 4V17 M5 4V17"/>'
]
for i,(shape,(light,dark),sigil) in enumerate(zip(shapes,colors,sigils),1):
    folds=''
    if i in (2,5):
        folds='<path d="M8 27 22 8 21 27Z" fill="#0c0a08" opacity=".45"/><path d="M8 25Q16 24 22 7L24 25Q16 22 8 25Z" fill="url(#reverse)" stroke="#c0ad88" stroke-width=".6"/><path d="M9 27 23 26" stroke="#15140f" opacity=".65"/>'
    if i==9:
        folds='<path d="M7 57Q18 63 31 77L13 79Z" fill="#0d0b08" opacity=".6"/><path d="M7 57Q19 65 30 76Q20 72 12 75Q15 65 7 57Z" fill="url(#reverse)" stroke="#c1aa84" stroke-width=".7"/><path d="M12 75Q21 70 30 76" fill="none" stroke="#4c3c26" stroke-width=".8"/>'
    creases=''
    if i==4:
        creases='''<path d="M8 53Q43 46 78 30T162 8 M31 9Q39 34 47 76 M46 46Q87 59 117 75 M77 31Q109 43 143 38" fill="none" stroke="#1e1a12" stroke-width="3" opacity=".18"/><path d="M8 51Q43 44 78 28T162 6 M29 9Q37 34 45 76 M46 44Q87 57 117 73 M77 29Q109 41 143 36" fill="none" stroke="#dbc9a2" stroke-width=".8" opacity=".35"/><path d="M9 54Q46 47 76 31 M48 48 50 75 M83 28Q123 20 155 10" fill="none" stroke="#efe1b8" stroke-width=".4" opacity=".25"/>'''
    if i in (1,7,8):
        creases+='<path d="M16 72Q89 68 158 73 M14 13Q72 10 114 12" fill="none" stroke="#c8b38b" stroke-width=".5" opacity=".26"/>'
    fibers=''.join(f'<path d="M{x} {y}l{2+(j%5)} {-1 if j%2 else 1}"/>' for j,(x,y) in enumerate([(9,18),(8,31),(11,64),(16,72),(21,9),(36,7),(52,77),(78,6),(103,76),(136,7),(151,77),(176,6),(201,76),(243,7)]))
    # Each inscription is a set of vector strokes, independent of installed fonts.
    glyphs=''.join(f'<g transform="translate({64+j*15} 69)"><path d="{["M0 5V-5L5-1 0 2 M-3 0H3","M-4-3 0-5 4-3 0 5Z","M0 5V-5 M-4-1 0-4 4-1 M0 2 4 0","M-4-4 0 5 4-4 M-3 0H3"][j%4]}"/></g>' for j in range(8))
    svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 84" preserveAspectRatio="none">
<defs>
 <linearGradient id="paper" x2=".2" y2="1"><stop stop-color="{light}"/><stop offset=".48" stop-color="{dark}"/><stop offset="1" stop-color="{light}"/></linearGradient>
 <linearGradient id="shade"><stop stop-color="#090907" stop-opacity=".12"/><stop offset=".65" stop-color="#080706" stop-opacity="0"/><stop offset="1" stop-color="#080605" stop-opacity=".8"/></linearGradient>
 <linearGradient id="reverse" x2=".8" y2="1"><stop stop-color="#d7c39a"/><stop offset=".5" stop-color="#a38e68"/><stop offset="1" stop-color="#6c593c"/></linearGradient>
 <pattern id="grain" width="23" height="17" patternUnits="userSpaceOnUse"><path d="M2 4l6-1M15 12l4 1M6 14l2-1" fill="none" stroke="#e4d1a5" stroke-width=".35" opacity=".16"/><circle cx="18" cy="3" r=".6" fill="#160f09" opacity=".19"/><circle cx="4" cy="10" r=".4" fill="#ddc79f" opacity=".2"/></pattern>
 <clipPath id="edge"><path d="{shape}"/></clipPath>
</defs>
<path d="{shape}" fill="url(#paper)" stroke="#ad9871" stroke-opacity=".65" stroke-width="1.1"/>
<g clip-path="url(#edge)"><path d="{shape}" fill="url(#grain)"/>
<path d="M17 15Q111 11 264 14 M18 68Q107 72 267 69" fill="none" stroke="#c7b18a" stroke-width=".6" opacity=".32"/>
<path d="M13 16V32 M13 56V65 M19 11H38 M19 73H39" fill="none" stroke="#cab78d" stroke-width=".7" opacity=".33"/>
<g fill="none" stroke="#c5af7f" stroke-width=".65" opacity=".32">{glyphs}</g>
<g transform="translate(222 42)" fill="none" stroke="#d6c194" stroke-width=".85"><circle r="25" opacity=".16"/><circle r="22" stroke-dasharray="1 4" opacity=".55"/><circle r="19.5" opacity=".25"/>{sigil}<path d="M-27-5V5 M27-5V5 M-5-27H5 M-5 27H5" opacity=".6"/></g>
<path d="M13 22q8 10 0 25 M255 10q-8 17 3 48" stroke="#110d09" stroke-width="8" opacity=".1" fill="none"/>
{creases}<path d="{shape}" fill="url(#shade)"/>
<g fill="none" stroke="#d7c098" stroke-width=".65" opacity=".6">{fibers}</g></g>
{folds}</svg>'''
    (out/f'tab-{i}.svg').write_text(svg,encoding='utf-8')
print('Created 9 editable SVG bookmarks')
