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
        // DOM elements (move these to the top!)
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
        this.chaosSlider = document.getElementById('chaosSlider');
        this.chaosValue = document.getElementById('chaosValue');
        this.turboModeBtn = document.getElementById('turboModeBtn');
        this.turboValue = document.getElementById('turboValue');

        this.A = 0.0;  // Rotation around x-axis
        this.B = 0.0;  // Rotation around z-axis
        this.isRunning = true;
        this.speedMultiplier = 1.0;
        this.turboMode = false;
        this.turboAcceleration = 0.0;
        this.chaosLevel = 0.3; // Default chaos level
        
        // Random rotation variables for chaotic movement
        this.randomA = 0.0;
        this.randomB = 0.0;
        this.randomTimer = 0;
        this.randomInterval = 30; // Change random direction every 30 frames
        // Projection constants
        this.scaleX = 30.0;       // X-axis scaling factor
        this.scaleY = 15.0;       // Y-axis scaling factor
        // Get screen dimensions
        this.updateScreenSize();
        window.addEventListener('resize', () => this.updateScreenSize());
        // Character buffer and z-buffer for front and back surfaces
        this.z_front = new Array(this.screenWidth * this.screenHeight).fill(-Infinity);
        this.idx_front = new Array(this.screenWidth * this.screenHeight).fill(null);
        this.z_back = new Array(this.screenWidth * this.screenHeight).fill(Infinity);
        this.idx_back = new Array(this.screenWidth * this.screenHeight).fill(null);
        // Luminance characters - extended for smoother shading
        this.luminanceChars = charList.split('').reverse();
        this.charLen = this.luminanceChars.length;
        this.setupEventListeners();
        
        // Ensure turbo mode starts unchecked
        this.turboModeBtn.checked = false;
        this.turboValue.textContent = 'OFF';
        
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
            
            this.chaosSlider.value = 0.3;
            this.chaosLevel = 0.3;
            this.chaosValue.textContent = '0.3';
            
            // Reset turbo mode
            this.turboMode = false;
            this.turboAcceleration = 0.0;
            this.turboModeBtn.checked = false;
            this.turboValue.textContent = 'OFF';
            
            // Reset random rotation
            this.randomA = 0.0;
            this.randomB = 0.0;
            this.randomTimer = 0;
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
        
        this.chaosSlider.addEventListener('input', (e) => {
            this.chaosLevel = parseFloat(e.target.value);
            this.chaosValue.textContent = this.chaosLevel.toFixed(1);
        });
        
        this.turboModeBtn.addEventListener('change', (e) => {
            this.turboMode = e.target.checked;
            this.turboValue.textContent = this.turboMode ? 'ON' : 'OFF';
            
            if (!this.turboMode) {
                // Reset acceleration when turbo is turned off
                this.turboAcceleration = 0.0;
                this.speedMultiplier = 1.0;
                this.speedSlider.value = 1.0;
                this.speedValue.textContent = '1.0x';
            }
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
        this.updateScreenSize();
        if (this.screenWidth < 5 || this.screenHeight < 5) {
            this.asciiOutput.textContent = '';
            return;
        }
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
            
            // Apply turbo acceleration if enabled
            if (this.turboMode) {
                this.turboAcceleration += 0.01; // Gradually increase acceleration
                this.speedMultiplier = 1.0 + this.turboAcceleration;
                
                // Update the speed slider and display to show current speed
                this.speedSlider.value = this.speedMultiplier;
                this.speedValue.textContent = this.speedMultiplier.toFixed(1) + 'x';
            }
            
            // Update random rotation directions periodically
            this.randomTimer++;
            if (this.randomTimer >= this.randomInterval) {
                this.randomTimer = 0;
                // Generate new random rotation speeds with chaos level variation
                const chaosMultiplier = this.chaosLevel * 0.2; // Scale chaos effect
                this.randomA = (Math.random() - 0.5) * chaosMultiplier;
                this.randomB = (Math.random() - 0.5) * chaosMultiplier * 0.75;
            }
            
            // Apply base rotation plus random variation
            const baseSpeedA = 0.04 * this.speedMultiplier;
            const baseSpeedB = 0.02 * this.speedMultiplier;
            
            this.A += baseSpeedA + this.randomA;
            this.B += baseSpeedB + this.randomB;
        }
        
        requestAnimationFrame(() => this.animate());
    }

    updateScreenSize() {
        // Get the asciiOutput element's size in pixels
        const pre = this.asciiOutput;
        if (!pre) return;
        // Get computed font size and line height
        const style = window.getComputedStyle(pre);
        const fontWidth = this.getFontWidth(pre, style);
        const fontHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize);
        // Get the pre's width and height in pixels
        const rect = pre.getBoundingClientRect();
        // Calculate how many characters fit
        this.screenWidth = Math.max(10, Math.floor(rect.width / fontWidth));
        this.screenHeight = Math.max(5, Math.floor(rect.height / fontHeight));
        // Recreate buffers
        this.z_front = new Array(this.screenWidth * this.screenHeight).fill(-Infinity);
        this.idx_front = new Array(this.screenWidth * this.screenHeight).fill(null);
        this.z_back = new Array(this.screenWidth * this.screenHeight).fill(Infinity);
        this.idx_back = new Array(this.screenWidth * this.screenHeight).fill(null);
    }

    getFontWidth(pre, style) {
        // Create a span to measure monospace character width
        const span = document.createElement('span');
        span.textContent = 'M';
        span.style.fontFamily = style.fontFamily;
        span.style.fontSize = style.fontSize;
        span.style.visibility = 'hidden';
        pre.appendChild(span);
        const width = span.getBoundingClientRect().width;
        pre.removeChild(span);
        return width;
    }
}

// Initialize the animation when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CylinderAnimation();
}); 