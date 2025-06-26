import math
import os
import time
import sys
import msvcrt
import ctypes
from ctypes import wintypes
from typing import List, Optional

# ===== LIGHTING & SHADING SETTINGS =====
brightnessMultiplier = 16.0    # Scales the overall brightness of the cylinder, 1.0 – 20.0
contrastFactor = 1.2           # Adjusts the contrast between light and dark areas, 0.5 – 2.0
topBrightnessBoost = 1.0      # Extra brightness for the top surface, 1.0 – 3.0
sideBrightnessBoost = 1.2     # Extra brightness for the sides, 1.0 – 3.0
baseBrightness = 1.0           # Minimum brightness for the darkest parts, 0.0 – 1.0
rimLightStrength = 5.0        # Strength of the bright rim/edge highlight, 0.0 – 10.0

# ===== CYLINDER DIMENSIONS =====
cylinderRadius = 3.0         # Radius of the cylinder (width)
cylinderHeight = 9.0          # Height of the cylinder
# ===================================

charList = ('@#%MW&8$B0QOZmwqpdbkhao*+xjt/|()1{}[]?-_=~<>!Il;:^",.`')

kernel32 = ctypes.windll.kernel32
handle = kernel32.GetStdHandle(-11)
def gotoxy(x, y):
    kernel32.SetConsoleCursorPosition(handle, wintypes._COORD(x, y))

def get_terminal_size():
    try:
        return os.get_terminal_size()
    except:
        # Fallback to default size if terminal size cannot be determined
        return os.terminal_size((80, 24))

def check_for_quit():
    return msvcrt.kbhit() and msvcrt.getch().decode('utf-8').lower() == 'q'

def main():
    A = 0.0  # Rotation around x-axis
    B = 0.0  # Rotation around z-axis

    # Cylinder parameters
    radius = cylinderRadius
    height = cylinderHeight

    # Projection constants
    K2 = 7.0 # Viewer distance for projection
    scaleX = 30.0       # X-axis scaling factor
    scaleY = 15.0       # Y-axis scaling factor

    # Get actual terminal size and center the animation
    terminal_size = get_terminal_size()
    screenWidth = terminal_size.columns
    screenHeight = terminal_size.lines - 2  # Leave space for status line

    # Character buffer and z-buffer for front and back surfaces
    b_front: List[str] = [' '] * (screenWidth * screenHeight)
    z_front: List[float] = [float('-inf')] * (screenWidth * screenHeight)
    idx_front: List[Optional[int]] = [None] * (screenWidth * screenHeight)
    z_back: List[float] = [float('inf')] * (screenWidth * screenHeight)
    idx_back: List[Optional[int]] = [None] * (screenWidth * screenHeight)

    # Luminance characters - extended for smoother shading
    luminanceChars = charList[::-1]
    charLen = len(luminanceChars)

    # Pre-calculate some constants
    inv_contrast = 1.0 / contrastFactor
    base_brightness_scaled = baseBrightness * brightnessMultiplier
    rim_strength_scaled = rimLightStrength * brightnessMultiplier

    # Clear screen once at the beginning
    os.system('cls')

    print(f"Terminal size: {screenWidth}x{screenHeight}")
    print("Press 'q' to quit the animation...")
    print(f"Brightness: {brightnessMultiplier}, Contrast: {contrastFactor}, Top Boost: {topBrightnessBoost}")
    time.sleep(0.5)  # Give user time to see the message

    # Pre-allocate frame string buffer
    frame_buffer = [' '] * (screenWidth * screenHeight + screenHeight)  # +screenHeight for newlines

    while True:
        if check_for_quit():
            break
            
        # Reset buffers more efficiently
        for i in range(screenWidth * screenHeight):
            b_front[i] = ' '
            z_front[i] = float('-inf')
            idx_front[i] = None
            z_back[i] = float('inf')
            idx_back[i] = None

        # Pre-calculate rotation matrices
        cosA = math.cos(A)
        sinA = math.sin(A)
        cosB = math.cos(B)
        sinB = math.sin(B)

        # Optimize loop ranges
        t_step = 7
        z_step = 2
        t_max = int(2 * math.pi * 100)
        z_max = int(height * 50)

        for tval in range(0, t_max, t_step):
            t = tval / 100.0
            ct = math.cos(t)
            st = math.sin(t)
            
            for zval in range(-z_max, z_max, z_step):
                zc = zval / 100.0
                x = radius * ct
                y = radius * st
                z3d = zc
                
                # Optimized rotation calculations
                yx = y * cosA - z3d * sinA
                zx = y * sinA + z3d * cosA
                xr = x * cosB - yx * sinB
                yr = x * sinB + yx * cosB
                zr = zx
                
                D = 1 / (zr + K2)
                xp = int(screenWidth / 2 + scaleX * D * xr)
                yp = int(screenHeight / 2 + scaleY * D * yr)
                
                # Optimized lighting calculation
                normalYRot = st * cosA
                normalZRot = st * sinA
                rim = rim_strength_scaled * (1.0 - abs(normalZRot))
                N = rim + base_brightness_scaled
                
                if N > 0:
                    N = N ** inv_contrast
                else:
                    N = -((-N) ** inv_contrast)
                
                idx = max(0, min(charLen - 1, int(N) if N > 0 else 0))
                idx = (charLen - 1) - idx
                
                if 0 <= xp < screenWidth and 0 <= yp < screenHeight:
                    offset = xp + screenWidth * yp
                    # Front surface: largest D (closest to viewer)
                    if D > z_front[offset]:
                        z_front[offset] = D
                        idx_front[offset] = idx
                    # Back surface: smallest D (farthest from viewer)
                    if D < z_back[offset]:
                        z_back[offset] = D
                        idx_back[offset] = idx

        # Build frame string more efficiently
        frame_idx = 0
        for k in range(screenWidth * screenHeight):
            front_idx = idx_front[k]
            back_idx = idx_back[k]
            
            if front_idx is not None and back_idx is not None:
                # Blend front and back indices for transparency
                blend_idx = (front_idx + back_idx) // 2
                frame_buffer[frame_idx] = luminanceChars[blend_idx]
            elif front_idx is not None:
                frame_buffer[frame_idx] = luminanceChars[front_idx]
            elif back_idx is not None:
                frame_buffer[frame_idx] = luminanceChars[back_idx]
            else:
                frame_buffer[frame_idx] = ' '
            
            frame_idx += 1
            
            if k % screenWidth == screenWidth - 1:
                frame_buffer[frame_idx] = '\n'
                frame_idx += 1

        # Print frame
        gotoxy(0, 0)
        sys.stdout.write(''.join(frame_buffer[:frame_idx]))
        sys.stdout.flush()
        
        A += 0.04
        B += 0.02
        time.sleep(0.05)
    
    print("\nAnimation stopped. Goodbye!")

if __name__ == "__main__":
    main()