// ===== LIGHTING & SHADING SETTINGS =====
let brightnessMultiplier = 16.0;    // Scales the overall brightness of the cylinder, 1.0 – 20.0
const contrastFactor = 1.2;           // Adjusts the contrast between light and dark areas, 0.5 – 2.0
const topBrightnessBoost = 1.0;      // Extra brightness for the top surface, 1.0 – 3.0
const sideBrightnessBoost = 1.2;     // Extra brightness for the sides, 1.0 – 3.0
const baseBrightness = 1.0;           // Minimum brightness for the darkest parts, 0.0 – 1.0
const rimLightStrength = 5.0;        // Strength of the bright rim/edge highlight, 0.0 – 10.0

// ===== CYLINDER DIMENSIONS =====
let cylinderRadius = 3.0;         // Radius of the cylinder (width)
let cylinderHeight = 9.0;          // Height of the cylinder
let viewerDistance = 7.0;          // Distance from viewer for projection
// ===================================

const charList = '@#%MW&8$B0QOZmwqpdbkhao*+xjt/|()1{}[]?-_=~<>!Il;:^",.`';

class CylinderAnimation {
    constructor() {
        this.A = 0.0;  // Rotation around x-axis
        this.B = 0.0;  // Rotation around z-axis
        this.isRunning = true;
        this.speedMultiplier = 1.0;
        
        // Projection constants
        this.scaleX = 30.0;       // X-axis scaling factor
        this.scaleY = 15.0;       // Y-axis scaling factor
        
        // Get screen dimensions
        this.screenWidth = 120;
        this.screenHeight = 60; // Sets height for animation dimensions
        
        // Character buffer and z-buffer for front and back surfaces
        this.z_front = new Array(this.screenWidth * this.screenHeight).fill(-Infinity);
        this.idx_front = new Array(this.screenWidth * this.screenHeight).fill(null);
        this.z_back = new Array(this.screenWidth * this.screenHeight).fill(Infinity);
        this.idx_back = new Array(this.screenWidth * this.screenHeight).fill(null);
        
        // Luminance characters - extended for smoother shading
        this.luminanceChars = charList.split('').reverse();
        this.charLen = this.luminanceChars.length;
        
        // DOM elements
        this.asciiOutput = document.getElementById('asciiOutput');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.speedSlider = document.getElementById('speedSlider');
        this.speedValue = document.getElementById('speedValue');
        this.brightnessSlider = document.getElementById('brightnessSlider');
        this.brightnessValue = document.getElementById('brightnessValue');
        this.radiusSlider = document.getElementById('radiusSlider');
        this.radiusValue = document.getElementById('radiusValue');
        this.heightSlider = document.getElementById('heightSlider');
        this.heightValue = document.getElementById('heightValue');
        this.distanceSlider = document.getElementById('distanceSlider');
        this.distanceValue = document.getElementById('distanceValue');
        
        this.setupEventListeners();
        this.animate();
    }
    
    setupEventListeners() {
        this.playPauseBtn.addEventListener('click', () => {
            this.isRunning = !this.isRunning;
            this.playPauseBtn.textContent = this.isRunning ? 'Pause' : 'Play';
        });
        
        this.resetBtn.addEventListener('click', () => {
            // Reset rotation
            this.A = 0.0;
            this.B = 0.0;
            
            // Reset all sliders to default values
            this.speedSlider.value = 1.0;
            this.speedMultiplier = 1.0;
            this.speedValue.textContent = '1.0x';
            
            this.brightnessSlider.value = 16.0;
            brightnessMultiplier = 16.0;
            this.brightnessValue.textContent = '16.0';
            
            this.radiusSlider.value = 3.0;
            cylinderRadius = 3.0;
            this.radiusValue.textContent = '3.0';
            
            this.heightSlider.value = 9.0;
            cylinderHeight = 9.0;
            this.heightValue.textContent = '9.0';
            
            this.distanceSlider.value = 7.0;
            viewerDistance = 7.0;
            this.distanceValue.textContent = '7.0';
        });
        
        this.speedSlider.addEventListener('input', (e) => {
            this.speedMultiplier = parseFloat(e.target.value);
            this.speedValue.textContent = this.speedMultiplier.toFixed(1) + 'x';
        });
        
        this.brightnessSlider.addEventListener('input', (e) => {
            brightnessMultiplier = parseFloat(e.target.value);
            this.brightnessValue.textContent = brightnessMultiplier.toFixed(1);
        });
        
        this.radiusSlider.addEventListener('input', (e) => {
            cylinderRadius = parseFloat(e.target.value);
            this.radiusValue.textContent = cylinderRadius.toFixed(1);
        });
        
        this.heightSlider.addEventListener('input', (e) => {
            cylinderHeight = parseFloat(e.target.value);
            this.heightValue.textContent = cylinderHeight.toFixed(1);
        });
        
        this.distanceSlider.addEventListener('input', (e) => {
            viewerDistance = parseFloat(e.target.value);
            this.distanceValue.textContent = viewerDistance.toFixed(1);
        });
    }
    
    resetBuffers() {
        for (let i = 0; i < this.screenWidth * this.screenHeight; i++) {
            this.z_front[i] = -Infinity;
            this.idx_front[i] = null;
            this.z_back[i] = Infinity;
            this.idx_back[i] = null;
        }
    }
    
    renderFrame() {
        this.resetBuffers();
        
        // Pre-calculate rotation matrices
        const cosA = Math.cos(this.A);
        const sinA = Math.sin(this.A);
        const cosB = Math.cos(this.B);
        const sinB = Math.sin(this.B);
        
        // Pre-calculate some constants
        const inv_contrast = 1.0 / contrastFactor;
        // Invert brightness: higher slider = brighter
        const brightnessFactor = brightnessMultiplier / 16.0; // 1.0 = default
        const base_brightness_scaled = baseBrightness * brightnessFactor * 16.0;
        const rim_strength_scaled = rimLightStrength * brightnessFactor * 16.0;
        
        // Optimize loop ranges
        const t_step = 7;
        const z_step = 2;
        const t_max = Math.floor(2 * Math.PI * 100);
        const z_max = Math.floor(cylinderHeight * 50);
        
        for (let tval = 0; tval < t_max; tval += t_step) {
            const t = tval / 100.0;
            const ct = Math.cos(t);
            const st = Math.sin(t);
            
            for (let zval = -z_max; zval < z_max; zval += z_step) {
                const zc = zval / 100.0;
                const x = cylinderRadius * ct;
                const y = cylinderRadius * st;
                const z3d = zc;
                
                // Optimized rotation calculations
                const yx = y * cosA - z3d * sinA;
                const zx = y * sinA + z3d * cosA;
                const xr = x * cosB - yx * sinB;
                const yr = x * sinB + yx * cosB;
                const zr = zx;
                
                const D = 1 / (zr + viewerDistance);
                const xp = Math.floor(this.screenWidth / 2 + this.scaleX * D * xr);
                const yp = Math.floor(this.screenHeight / 2 + this.scaleY * D * yr);
                
                // Optimized lighting calculation
                const normalYRot = st * cosA;
                const normalZRot = st * sinA;
                const rim = rim_strength_scaled * (1.0 - Math.abs(normalZRot));
                let N = rim + base_brightness_scaled;
                
                if (N > 0) {
                    N = Math.pow(N, inv_contrast);
                } else {
                    N = -Math.pow(-N, inv_contrast);
                }
                
                let idx = Math.max(0, Math.min(this.charLen - 1, N > 0 ? Math.floor(N) : 0));
                idx = (this.charLen - 1) - idx;
                
                if (xp >= 0 && xp < this.screenWidth && yp >= 0 && yp < this.screenHeight) {
                    const offset = xp + this.screenWidth * yp;
                    // Front surface: largest D (closest to viewer)
                    if (D > this.z_front[offset]) {
                        this.z_front[offset] = D;
                        this.idx_front[offset] = idx;
                    }
                    // Back surface: smallest D (farthest from viewer)
                    if (D < this.z_back[offset]) {
                        this.z_back[offset] = D;
                        this.idx_back[offset] = idx;
                    }
                }
            }
        }
        
        // Build frame string
        let frameString = '';
        for (let y = 0; y < this.screenHeight; y++) {
            for (let x = 0; x < this.screenWidth; x++) {
                const k = x + this.screenWidth * y;
                const front_idx = this.idx_front[k];
                const back_idx = this.idx_back[k];
                
                if (front_idx !== null && back_idx !== null) {
                    // Blend front and back indices for transparency
                    const blend_idx = Math.floor((front_idx + back_idx) / 2);
                    frameString += this.luminanceChars[blend_idx];
                } else if (front_idx !== null) {
                    frameString += this.luminanceChars[front_idx];
                } else if (back_idx !== null) {
                    frameString += this.luminanceChars[back_idx];
                } else {
                    frameString += ' ';
                }
            }
            frameString += '\n';
        }
        
        this.asciiOutput.textContent = frameString;
    }
    
    animate() {
        if (this.isRunning) {
            this.renderFrame();
            this.A += 0.04 * this.speedMultiplier;
            this.B += 0.02 * this.speedMultiplier;
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize the animation when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CylinderAnimation();
}); 
