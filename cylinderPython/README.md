3D Cylinder Animation
====================

Made by: Ellis Simmons – June 2025  
Languages: Python (ctypes, msvcrt, math, os, sys, time)

What is this?
-------------
- This is a command-line ASCII art animation that renders a 3D cylinder in real time in the Windows terminal.
- I based it on the classic ASCII Donut program, but adapted the math and rendering for a cylinder instead of a torus.
- The animation uses 3D rotation, perspective projection, and dynamic rim lighting for a cool effect.

What it does:
-------------
- Renders a rotating 3D cylinder using only ASCII characters.
- Simulates lighting and shading for a more realistic look.
- Uses a z-buffer for proper depth sorting.
- Lets you quit at any time by pressing 'q'.
- Lets you tweak cylinder size, brightness, and lighting in the code.

How it works:
-------------
- Calculates 3D points on a cylinder using parametric equations.
- Rotates the cylinder in 3D using rotation matrices.
- Projects 3D points to 2D screen coordinates with perspective math.
- Computes surface normals and applies a rim lighting model.
- Uses a z-buffer to keep closer points in front.
- Maps brightness to ASCII characters for shading.

Math behind it:
---------------
- I use a 3D Cartesian coordinate system, where each point has (x, y, z) coordinates.
- The cylinder's surface is generated using parametric equations:
  - `x = radius × cos(θ)`
  - `y = radius × sin(θ)`
  - `z = height_position`
  - Here, θ goes from 0 to 2π around the cylinder, and height_position goes from -height/2 to +height/2 along the axis.
- To animate the cylinder, I rotate it in 3D using rotation matrices:
  - For rotation around the X-axis by angle A:
    - y' = y × cos(A) - z × sin(A)
    - z' = y × sin(A) + z × cos(A)
  - For rotation around the Z-axis by angle B:
    - x'' = x × cos(B) - y' × sin(B)
    - y'' = x × sin(B) + y' × cos(B)
  - This lets me spin the cylinder smoothly in space.
- I project the 3D points onto the 2D terminal screen using perspective projection:
  - `D = 1 / (z + K2)` (K2 is a constant for viewer distance)
  - `x_screen = center_x + scale_x × D × x_3d`
  - `y_screen = center_y + scale_y × D × y_3d`
  - This makes closer points appear larger, giving a 3D effect.
- For lighting, I calculate the surface normal at each point (which for a cylinder is always perpendicular to the axis):
  - `normal_x = cos(θ)`
  - `normal_y = sin(θ)`
  - `normal_z = 0`
  - I rotate the normal just like the point itself.
- I use a rim lighting model, which makes the edges of the cylinder glow more:
  - `rim = rim_strength × (1 - |normal_z_rotated|)`
  - `luminance = brightness × rim + base_brightness`
  - This highlights the silhouette and gives a more dramatic look.
- I use a z-buffer to keep track of which points are closest to the viewer at each screen position, so the cylinder doesn't draw over itself incorrectly.
- Finally, I map the calculated luminance to an ASCII character for shading, so brighter spots use denser characters.
- All of this is adapted from the classic ASCII Donut program, but with the torus math swapped for a cylinder and the lighting tweaked for a more striking effect.

How to use it:
--------------
- Download or clone this repo.
- Make sure you have Python 3 on Windows.
- Open a terminal, navigate to the file, and run:  
  `python cylinder.py`
- Press 'q' to quit the animation.
- You can tweak the constants at the top of the file to change the look.

Why I made it:
--------------
- I wanted to see if I could adapt the classic ASCII Donut to render a cylinder instead.
- It was a fun way to practice 3D math, graphics, and terminal tricks in Python.

Stuff you can tweak:
--------------------
- Change the cylinder's radius, height, or rotation speed.
- Adjust the lighting and brightness for different effects.
- Try different ASCII character sets for shading.
- Port it to other platforms or add color if you want.

---
If you use or modify this, please credit me. Enjoy the animation and have a nice day.