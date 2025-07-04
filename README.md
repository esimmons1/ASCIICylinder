ASCII Cylinder Animation
=======================

Made by: Ellis Simmons, May 2025  
Language: JavaScript (HTML/CSS/JS)

---

What this is?
-----------------------------------
Web-based ASCII art animation rendering a 3D cylinder in real time using only text characters. Inspired by classic terminal graphics, fully interactive in browser. Adjust cylinder properties and lighting with sliders, see results instantly. No downloads or dependencies.

---

What it does:
---------------------------------------
- Renders 3D cylinder using ASCII characters in a `<pre>` text block
- Simulates real-time rotation around x and z axes
- Applies dynamic lighting and shading for 3D effect
- Controls:
  - speed (rotation)
  - brightness (lighting intensity)
  - cylinderRadius (width)
  - cylinderHeight
  - viewerDistance (perspective)
- All controls update animation live
- Responsive, dark-themed UI

---

How to run it:
-----------------------------------------------
Open `index.html` in any modern web browser, or visit the website: https://esimmons1.github.io/ASCIICylinder.     
No installation or dependencies needed. Everything runs in browser.

---

How it works:
-------------------------------
- Created initially with Python, rewritten in vanilla JavaScript, HTML, CSS
- Uses parametric equations for 3D cylinder:
  - `x = cylinderRadius * cos(theta)`
  - `y = cylinderRadius * sin(theta)`
  - `z = zc` (zc is height position)
  - theta: 0 to 2π, zc: -cylinderHeight/2 to +cylinderHeight/2
- Rotates cylinder in 3D using rotation matrices:
  - X-axis: `y' = y * cos(a) - z * sin(a)`, `z' = y * sin(a) + z * cos(a)`
  - Z-axis: `x'' = x * cos(b) - y' * sin(b)`, `y'' = x * sin(b) + y' * cos(b)`
- Projects 3D points to 2D screen:
  - `d = 1 / (z + viewerDistance)`
  - `xScreen = centerX + scaleX * d * x3d`
  - `yScreen = centerY + scaleY * d * y3d`
- Surface normal for lighting:
  - `normalX = cos(theta)`
  - `normalY = sin(theta)`
  - `normalZ = 0`
  - Normal is rotated with point
- Rim lighting model:
  - `rim = rimLightStrength * (1 - |normalZRot|)`
  - `luminance = brightnessMultiplier * rim + baseBrightness`
- Z-buffer for depth sorting
- Maps luminance to ASCII characters for shading
- Animation rendered at 60fps using `requestAnimationFrame()`
- All controls are native HTML sliders

---

Math variables and ranges:
-------------------------------------------
```js
// speed: 0.1–2.0 (rotation multiplier)
// brightnessMultiplier: 1.0–20.0 (overall lighting intensity)
// cylinderRadius: 1.0–8.0 (cylinder width)
// cylinderHeight: 3.0–15.0 (cylinder height)
// viewerDistance: 3.0–15.0 (perspective, lower = closer)
// contrastFactor: 0.5–2.0 (contrast between light/dark)
// rimLightStrength: 0.0–10.0 (rim/edge highlight)
// baseBrightness: 0.0–1.0 (minimum brightness)
```

---

Why I made it:
--------------------------------------
Wanted to share ASCII cylinder with friends and people online without downloads or dependencies. Brought retro terminal-style ASCII art to web with modern interactivity and smooth animation. Fun way to combine math, graphics, and UI design.

---

Stuff you can mess with:
-------------------------------------------
```js
// speed: 0.1–2.0
// brightnessMultiplier: 1.0–20.0
// cylinderRadius: 1.0–8.0
// cylinderHeight: 3.0–15.0
// viewerDistance: 3.0–15.0
```

---

Sources & Inspiration:
------------------------------------------------
- ASCII donut animation mainly
- Donut.c and other 3D ASCII art projects
- My own Python terminal animation (original version)
- Math and graphics tutorials on 3D projection and lighting
  - [Donut-shaped C code that generates a 3D spinning donut](https://www.youtube.com/watch?v=DEqXNfs_HhY)
  - [3D ASCII Spinning Donut Tutorial](https://www.youtube.com/watch?v=LqQ-ezbyiW4)
  - [I made a 3D SPINNING ASCII DONUT in SVG](https://www.youtube.com/watch?app=desktop&v=_ILovr-qQmc)
  - [Python/Pygame 3D ASCII Spinning Donut Tutorial](https://www.youtube.com/watch?v=zn4Yvxww58g)

---

If you use or modify this, please credit me. Enjoy the animation and have a nice day. 
